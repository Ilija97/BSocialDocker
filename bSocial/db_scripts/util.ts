import { Post } from '../src/entities/Post.entity';
import { User } from '../src/entities/User.entity';
import * as bcrypt from 'bcrypt';

const createUsers = async (count: number): Promise<User[]> => {
    const users: User[] = [];
    const hashedPassword = await bcrypt.hash('Pa$$w0rd', 10); // Hash the password
  
    for (let i = 1; i <= count; i++) {
        const user: User = new User(
            `user${i}Name`,
            `user${i}Surname`,
            `user${i}`,
            `user${i}@gmail.com`,
            hashedPassword
        );
        users.push(user);
    }
    return users;
}

const createPosts = async (users: User[], count: number): Promise<Post[]> => {
    const posts: Post[] = [];
    for (const user of users) {
        for (let i = 1; i <= 5; i++) {
          const post = new Post();
          post.message = `Post ${i} by ${user.username}`;
          post.userId = user.id
          post.timestamp = new Date();
          posts.push(post);
        }
    }
    return posts;
}
export { createUsers, createPosts };