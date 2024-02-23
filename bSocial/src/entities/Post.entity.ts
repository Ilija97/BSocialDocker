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

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' }) // Change to datetime
  timestamp!: Date;

  @Column({ type: 'int' })
  userId!: number; // Store the userId

  @ManyToOne(() => User, user => user.posts)
  @JoinColumn({ name: 'userId' }) // Use 'userId' as the foreign key column
  user!: User;

  @OneToMany(() => Comment, comment => comment.post)
  @JoinColumn() // Add this line
  comments?: Comment[];
}
