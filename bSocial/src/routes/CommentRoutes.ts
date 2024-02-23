import express from 'express';
import CommentController from '../controllers/CommentController';
import { authenticateUser } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticateUser);

/**
 * @swagger
 * /comments/{postId}:
 *   get:
 *     summary: Get comments for a specific post
 *     tags:
 *       - Comments
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         description: ID of the post
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Comment ID
 *                   message:
 *                     type: string
 *                     description: Comment message
 *                   userId:
 *                     type: integer
 *                     description: User ID associated with the comment
 *                   post:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Post ID
 *                       message:
 *                         type: string
 *                         description: Post message
 *                       userId:
 *                         type: integer
 *                         description: User ID associated with the post
 *                     required:
 *                       - id
 *                       - message
 *                       - userId
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                     description: Timestamp of the comment
 *             example:
 *               - id: 1
 *                 message: "Great comment!"
 *                 userId: 123
 *                 post:
 *                   id: 456
 *                   message: "Interesting post"
 *                   userId: 789
 *                 timestamp: "2024-02-20T12:00:00Z"
 *               - id: 2
 *                 message: "Another comment!"
 *                 userId: 456
 *                 post:
 *                   id: 789
 *                   message: "Another post"
 *                   userId: 123
 *                 timestamp: "2024-02-20T13:00:00Z"
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               error: "Unauthorized"
 */
router.get('/:postId', authenticateUser, CommentController.getCommentsForPost);


/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a new comment
 *     tags:
 *       - Comments
 *     security:
 *       - JWT: []
 *     requestBody:
 *       description: Comment details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: integer
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal Server Error
 */
router.post('/', authenticateUser, CommentController.createComment);

export default router;
