// src/entities/Comment.entity.ts

import { Entity, PrimaryGeneratedColumn, JoinColumn ,Column, ManyToOne } from 'typeorm';
import { User } from './User.entity';
import { Post } from './Post.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  message!: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' }) // Change to datetime
  timestamp!: Date;

  @ManyToOne(() => User, user => user.comments)
  @JoinColumn({ name: 'userId' }) // Use 'userId' as the foreign key column
  user!: User;

  @ManyToOne(() => Post, post => post.comments)
  @JoinColumn({ name: 'postId' }) // Use 'postId' as the foreign key column
  post!: Post;

  @Column({ type: 'int' }) // Add a column for userId
  userId!: number;

  @Column({ type: 'int' }) // Add a column for postId
  postId!: number;
}
