import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Comment } from '../entities/Comment.entity';
import { Post } from '../entities/Post.entity';
import { User } from '../entities/User.entity';
import { AuthenticatedRequest } from '../customTypes';
import KafkaProducer from '../services/kafkaProducer';

class CommentController {
  static async getCommentsForPost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const postId = parseInt(req.params.postId, 10);

      if (isNaN(postId)) {
        res.status(400).json({ error: 'Invalid postId' });
        return;
      }

      const post = await getRepository(Post).findOne({
        where: { id: postId }
      });

      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      const comments = await getRepository(Comment).find({
        where: { postId: postId },
        relations: ['user'], 
        order: { timestamp: 'DESC' } 
      });

      res.json(comments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }


  static async createComment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { postId, message } = req.body;
      const user = req.user;

      if (!user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const post = await getRepository(Post).findOne({
        where: { id: postId }
      });

      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      const comment = new Comment();
      comment.message = message;
      comment.userId = user.userId;
      comment.post = post;

      await getRepository(Comment).save(comment);

      const currentUser = await getRepository(User).findOne({
        where: { id: user.userId }
      });

      const kafkaMessage = {
        senderUsername: currentUser?.username,
        senderEmail: currentUser?.email,
        senderId: currentUser?.id,
        timestamp: comment.timestamp,
        postId: post.id,
        commentId: comment.id,
        comment: comment.message,
        authorId: comment.post.userId, //to whom the notification will be sent
      };

      KafkaProducer.sendMessage('commentTopic', JSON.stringify(kafkaMessage));

      res.status(201).json({ message: 'Comment created successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default CommentController;
