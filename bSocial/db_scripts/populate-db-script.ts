import { createConnection, getRepository } from 'typeorm';
import { User } from '../src/entities/User.entity';
import { Post } from '../src/entities/Post.entity';
import { Comment } from '../src/entities/Comment.entity';
import { createUsers, createPosts } from './util';
import { isAwaitExpression } from 'typescript';

const populateDatabase = async () => {
    const connection = await createConnection({
        type: 'sqlite',
        database: 'database.sqlite',
        entities: [User, Post, Comment],
      });
      const commentRepository = getRepository(Comment);
      await commentRepository.clear();
      const postRepository = getRepository(Post);
      await postRepository.clear();   
    const userRepository = getRepository(User);
    await userRepository.clear();

    const users = await createUsers(5);
    await userRepository.save(users);

    const posts = await createPosts(users, 5);
    await postRepository.save(posts);

    await connection.close();
};

populateDatabase().catch((error) => console.error(error));