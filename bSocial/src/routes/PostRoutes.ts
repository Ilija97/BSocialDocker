import express from 'express';
import PostController from '../controllers/postsController';
import { authenticateUser } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticateUser);

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get posts from the current user and followers
 *     tags:
 *       - Posts
 *     security:
 *       - JWT: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: The page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: The number of posts per page
 *     responses:
 *       200:
 *         description: Successfully retrieved posts
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/', authenticateUser, PostController.getPosts);


/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags:
 *       - Posts
 *     security:
 *       - JWT: []
 *     requestBody:
 *       description: Post details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Post created successfully
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       500:
 *         description: Internal Server Error
 */
router.post('/', authenticateUser, PostController.createPost);

export default router;