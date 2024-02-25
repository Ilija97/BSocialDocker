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

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' }) 
  timestamp!: Date;

  @ManyToOne(() => User, user => user.comments)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => Post, post => post.comments)
  @JoinColumn({ name: 'postId' }) 
  post!: Post;

  @Column({ type: 'int' })
  userId!: number;

  @Column({ type: 'int' }) 
  postId!: number;
}
