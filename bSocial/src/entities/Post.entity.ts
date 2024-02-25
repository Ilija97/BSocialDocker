// src/entities/Post.entity.ts

import { Entity, PrimaryGeneratedColumn,JoinColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './User.entity';
import { Comment } from './Comment.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  message!: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' }) 
  timestamp!: Date;

  @Column({ type: 'int' })
  userId!: number;

  @ManyToOne(() => User, user => user.posts)
  @JoinColumn({ name: 'userId' }) 
  user!: User;

  @OneToMany(() => Comment, comment => comment.post)
  @JoinColumn() 
  comments?: Comment[];
}
