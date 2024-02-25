import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getRepository, FindOneOptions } from 'typeorm';
import { User } from '../entities/User.entity';
import { validationResult } from 'express-validator';
import { AuthenticatedRequest } from '../customTypes';
import KafkaProducer from '../services/kafkaProducer';


class UserController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { firstName, lastName, username, email, password, passwordConfirmation } = req.body;

      // Validation using express-validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          res.status(400).json({ errors: errors.array() });
          return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const existingUser = await getRepository(User).findOne({
        where: { username }, 
      } as FindOneOptions<User>);
      if (existingUser) {
          res.status(400).json({ errors: [{ msg: 'Username is already taken.' }] });
          return;
      }
    
      const existingUser_ = await getRepository(User).findOne({
        where: { email }, 
      } as FindOneOptions<User>);
      if (existingUser_) {
          res.status(400).json({ errors: [{ msg: 'User with this email already exists.' }] });
          return;
      }

      const user = new User(
        firstName,
        lastName,
        username,
        email,
        hashedPassword,
      );

      await getRepository(User).save(user);

      const secretKey = process.env.JWT_SECRET;
      if (!secretKey) {
        throw new Error('JWT secret key is not defined');
      }
      const token = jwt.sign({ userId: user.id, username: user.username }, secretKey, {
        expiresIn: process.env.JWT_EXPIRE, // Adjust the expiration time as needed
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

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          res.status(400).json({ errors: errors.array() });
          return;
      }

      const user = await getRepository(User).findOne({
        where: [{ username }, { email: username }],
      } as FindOneOptions<User>);
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401).json({ error: 'Invalid username or password' });
        return;
      }

      const secretKey = process.env.JWT_SECRET;

      if (!secretKey) {
        throw new Error('JWT secret key is not defined');
      }

      const token = jwt.sign({ userId: user.id, username: user.username }, secretKey, {
        expiresIn: process.env.JWT_EXPIRE, 
      });

      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }


  static async logout(req: Request, res: Response): Promise<void> {
    try {
      // TODO: invalidate JWT

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
      const userId = req.user.userId; 

      const userRepository = getRepository(User);

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

      const isAlreadyFollowing = currentUser.following?.some(user => user.id === userToFollow.id);

      if (isAlreadyFollowing) {
        res.status(400).json({ error: 'User is already being followed' });
        return;
      }

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

