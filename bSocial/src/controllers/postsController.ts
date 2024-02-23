import { Request, Response } from 'express';
import { getRepository, FindManyOptions, In  } from 'typeorm';
import { Post } from '../entities/Post.entity';
import { User } from '../entities/User.entity';
import { authenticateUser } from '../middleware/authMiddleware';
import { AuthenticatedRequest } from '../customTypes';
import KafkaProducer from '../services/kafkaProducer';

class PostsController {
  static async getPosts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const currentUserId = req.user.userId;

      // Find the current user
      const currentUser = await getRepository(User).findOne({
        where: { id: currentUserId },
        relations: ['following'],
      });

      if (!currentUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Extract user IDs of the current user and their followers
      const userIds = [currentUserId, ...(currentUser.following?.map((user) => user.id) || [])];

      // Pagination parameters
      const limit = parseInt(req.query.limit as string, 10) || 10; // Default limit to 10 if not provided
      const page = parseInt(req.query.page as string, 10) || 1; // Default page to 1 if not provided

      // Calculate the offset based on the limit and page
      const offset = (page - 1) * limit;

      // Find posts with pagination
      const options: FindManyOptions<Post> = {
        where: { userId: In(userIds) },
        relations: ['user', 'comments'],
        take: limit,
        skip: offset,
      };

      const posts = await getRepository(Post).find(options);

      res.json(posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }


    static async createPost(req: AuthenticatedRequest, res: Response): Promise<void> {
      try {
        const { message } = req.body;
        const user = req.user;
  
        // Authorization check
        if (!user) {
          res.status(401).json({ error: 'Unauthorized' });
          return;
        }
  
        const post = new Post();
        post.message = message;
        post.userId = user.userId;
  
        // Set timestamp to the current date and time
        post.timestamp = new Date();
  
        await getRepository(Post).save(post);

        const currentUser = await getRepository(User).findOne({
          where: { id: user.userId }
        });
  
        const kafkaMessage = {
          username: currentUser?.username,
          email: currentUser?.email,
          userId: currentUser?.id,
          timestamp: post.timestamp,
          postId: post.id,
          message: post.message,
        };
  
        KafkaProducer.sendMessage('postTopic', JSON.stringify(kafkaMessage));
  
        res.status(201).json({ message: 'Post created successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }

      async deletePost(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const postId = parseInt(req.params.postId, 10);

            if (isNaN(postId)) {
              // Handle the case where postId is not a valid integer
              res.status(400).json({ error: 'Invalid postId' });
              return;
            }
            
          const user = req.user;
    
          if (!user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
          }
    
          const postRepository = getRepository(Post);
          const post = await postRepository.findOne({
            where: { id: postId },
            relations: ['user'],
          });
    
          if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
          }
    
          // Check if the logged-in user is the owner of the post
          if (post.user.id !== user.id) {
            res.status(403).json({ error: 'Forbidden' });
            return;
          }
    
          await postRepository.remove(post);
    
          res.json({ message: 'Post deleted successfully' });
        } catch (error) {
          console.error('Error deleting post:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }
    
      // Apply authentication middleware to protect certain routes
      applyAuthMiddleware(app: any): void {
        app.use('/posts', authenticateUser);
      }
    }
   
    export default PostsController;