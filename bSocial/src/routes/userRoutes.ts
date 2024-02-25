import express from 'express';
import UserController from '../controllers/UserController';
import { authenticateUser } from '../middleware/authMiddleware';
import { registerValidator, loginValidator } from '../validators/authValidators';

const router = express.Router();

router.use(authenticateUser);

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user and return a JWT token.
 *     tags: [Authentication]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: User's first name
 *               lastName:
 *                 type: string
 *                 description: User's last name
 *               username:
 *                 type: string
 *                 description: User's username
 *               email:
 *                 type: string
 *                 description: User's email
 *               password:
 *                 type: string
 *                 description: User's password
 *             required:
 *               - firstName
 *               - lastName
 *               - username
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: User registered successfully
 *       500:
 *         description: Internal Server Error
 */
router.post('/register', registerValidator, UserController.register);


/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login with username and password
 *     description: Login with a registered username(or email) and password and return a JWT token. 
 *     tags: [Authentication]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: User's username
 *               password:
 *                 type: string
 *                 description: User's password
 *             required:
 *               - username
 *               - password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Login successful message
 *                 token:
 *                   type: string
 *                   description: JWT token
 *       401:
 *         description: Invalid username or password
 *       500:
 *         description: Internal Server Error
 */
router.post('/login', loginValidator, UserController.login);

/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Logout user
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: User logged out successfully
 *       500:
 *         description: Internal Server Error
 */
router.post('/logout', UserController.logout);

/**
 * @swagger
 * /users/follow:
 *   post:
 *     summary: Follow another user
 *     tags:
 *       - User
 *     security:
 *       - JWT: []
 *     requestBody:
 *       description: User ID to follow
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userIdToFollow:
 *                 type: integer
 *     responses:
 *       200:
 *         description: User followed successfully
 *       400:
 *         description: Bad Request - User is already being followed
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.post('/follow', authenticateUser, UserController.followUser);

export default router;
