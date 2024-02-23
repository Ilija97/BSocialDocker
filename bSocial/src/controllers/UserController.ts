import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getRepository, FindOneOptions } from 'typeorm';
import { User } from '../entities/User.entity';
import { Producer, KafkaClient, Message } from 'kafka-node';
import { Post } from '../entities/Post.entity';
import { Comment } from '../entities/Comment.entity';
import { AuthenticatedRequest } from '../customTypes';
import KafkaProducer from '../services/kafkaProducer';


class UserController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { firstName, lastName, username, email, password, passwordConfirmation } = req.body;

      // Validation

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = new User(
        firstName,
        lastName,
        username,
        email,
        hashedPassword,
      );

      // Save user to SQL database
      await getRepository(User).save(user);

      // Create JWT token
      const token = jwt.sign({ userId: user.id, username: user.username }, 'your_secret_key', {
        expiresIn: '12h', // Adjust the expiration time as needed
      });

      const kafkaMessage = {
        firstName: user?.firstName,
        lastName: user?.lastName,
        username: user?.username,
        email: user?.email,
        timestamp: new Date(),
      };

      KafkaProducer.sendMessage('userRegistrationTopic', JSON.stringify(kafkaMessage));

      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }


  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      const user = await getRepository(User).findOne({
        where: { username }, // Ensure that username is a property in your User entity
      } as FindOneOptions<User>);
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401).json({ error: 'Invalid username or password' });
        return;
      }

      // Create JWT token
      const token = jwt.sign({ userId: user.id, username: user.username }, 'your_secret_key', {
        expiresIn: '1h', // Adjust the expiration time as needed
      });

      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }


  static async logout(req: Request, res: Response): Promise<void> {
    try {
      // Your logout logic here
      res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  
  static async followUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userIdToFollow } = req.body;
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const userId = req.user.userId; // Assuming you have authentication middleware setting the user in the request

      const userRepository = getRepository(User);

      // Find the users
      const userToFollow = await userRepository.findOne({
        where: { id: userIdToFollow }
      });

      const currentUser = await userRepository.findOne({
        where: { id: userId },
        relations: ['following'],
      });
      
      if (!userToFollow || !currentUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Check if the user is already following
      const isAlreadyFollowing = currentUser.following?.some(user => user.id === userToFollow.id);

      if (isAlreadyFollowing) {
        res.status(400).json({ error: 'User is already being followed' });
        return;
      }

      // Add the user to follow to the current user's following list
      currentUser.following?.push(userToFollow);
      await userRepository.save(currentUser);

      res.status(200).json({ message: 'User followed successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default UserController;
