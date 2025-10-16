import { Router } from 'express';
import {
  createUser,
  createAdminUser,
  getAllUsers,
  getAllUsersWithInactive,
  getUserById,
  getUserByUsername,
  updateUserById,
  updateUserByUsername,
  disableUserById,
  disableUserByUsername,
  reactivateUserById,
  reactivateUserByUsername,
  makeUserAdmin,
  removeUserAdmin,
  deleteUserById,
  deleteUserByUsername,
  addEventToUser,
  loginUser
} from '../controller/userController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *         - birthday
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único generado por MongoDB
 *         username:
 *           type: string
 *           example: "userExample"
 *         email:
 *           type: string
 *           example: "user@example.com"
 *         birthday:
 *           type: string
 *           format: date
 *           example: "2000-01-01"
 *         events:
 *           type: array
 *           items:
 *             type: string
 *           description: Array de IDs de eventos
 *         active:
 *           type: boolean
 *           example: true
 *         role:
 *           type: string
 *           enum: [admin, manager, user]
 *           example: "user"
 *     UserCreate:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *         - birthday
 *       properties:
 *         username:
 *           type: string
 *           example: "userExample"
 *         email:
 *           type: string
 *           example: "user@example.com"
 *         password:
 *           type: string
 *           example: "123456"
 *         birthday:
 *           type: string
 *           format: date
 *           example: "2000-01-01"
 *         role:
 *           type: string
 *           enum: [manager, user]
 *           example: "user"
 */

/**
 * @swagger
 * /api/user:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreate'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Error in user data
 *       403:
 *         description: Cannot create admin user from this route
 *       500:
 *         description: Failed to create user
 */
router.post('/', createUser);

/**
 * @swagger
 * /api/user/admin/create:
 *   post:
 *     summary: Create admin user
 *     tags: [Administration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - birthday
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               birthday:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Admin user created successfully
 *       400:
 *         description: Error in user data
 *       500:
 *         description: Failed to create admin user
 */
router.post('/admin/create', createAdminUser);

/**
 * @swagger
 * /api/user/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "userExample"
 *               password:
 *                 type: string
 *                 example: "123456"
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
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Incorrect credentials or user disabled
 *       500:
 *         description: Login error
 */
router.post('/auth/login', loginUser);

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Get all active users (paginated)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of records to skip (pagination)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records to return (pagination)
 *     responses:
 *       200:
 *         description: List of active users obtained successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     skip:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     hasMore:
 *                       type: boolean
 *       404:
 *         description: No users found
 */
router.get('/', getAllUsers);

/**
 * @swagger
 * /api/user/all/inactive-included:
 *   get:
 *     summary: Get all users including inactive ones (paginated)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of records to skip (pagination)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records to return (pagination)
 *     responses:
 *       200:
 *         description: List of all users obtained successfully
 *       404:
 *         description: No users found
 */
router.get('/all/inactive-included', getAllUsersWithInactive);

/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     summary: Get an active user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get('/:id', getUserById);

/**
 * @swagger
 * /api/user/username/{username}:
 *   get:
 *     summary: Get an active user by username
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */
router.get('/username/:username', getUserByUsername);

/**
 * @swagger
 * /api/user/{id}:
 *   put:
 *     summary: Update an active user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               birthday:
 *                 type: string
 *                 format: date
 *               role:
 *                 type: string
 *                 enum: [manager, user]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
router.put('/:id', updateUserById);

/**
 * @swagger
 * /api/user/username/{username}:
 *   put:
 *     summary: Update an active user by username
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               birthday:
 *                 type: string
 *                 format: date
 *               role:
 *                 type: string
 *                 enum: [manager, user]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
router.put('/username/:username', updateUserByUsername);

/**
 * @swagger
 * /api/user/{id}/disable:
 *   patch:
 *     summary: Disable a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User disabled successfully
 *       404:
 *         description: User not found
 */
router.patch('/:id/disable', disableUserById);

/**
 * @swagger
 * /api/user/username/{username}/disable:
 *   patch:
 *     summary: Disable a user by username
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username
 *     responses:
 *       200:
 *         description: User disabled successfully
 *       404:
 *         description: User not found
 */
router.patch('/username/:username/disable', disableUserByUsername);

/**
 * @swagger
 * /api/user/{id}/reactivate:
 *   patch:
 *     summary: Reactivate a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User reactivated successfully
 *       404:
 *         description: User not found
 */
router.patch('/:id/reactivate', reactivateUserById);

/**
 * @swagger
 * /api/user/username/{username}/reactivate:
 *   patch:
 *     summary: Reactivate a user by username
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username
 *     responses:
 *       200:
 *         description: User reactivated successfully
 *       404:
 *         description: User not found
 */
router.patch('/username/:username/reactivate', reactivateUserByUsername);

/**
 * @swagger
 * /api/user/{id}/make-admin:
 *   patch:
 *     summary: Convert user to administrator
 *     tags: [Administration]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User converted to administrator successfully
 *       404:
 *         description: User not found
 */
router.patch('/:id/make-admin', makeUserAdmin);

/**
 * @swagger
 * /api/user/{id}/remove-admin:
 *   patch:
 *     summary: Remove administrator permissions
 *     tags: [Administration]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Administrator permissions removed successfully
 *       404:
 *         description: User not found
 */
router.patch('/:id/remove-admin', removeUserAdmin);

/**
 * @swagger
 * /api/user/{id}/addEvent:
 *   put:
 *     summary: Add event to a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *             properties:
 *               eventId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event added to user successfully
 *       400:
 *         description: Missing eventId
 *       404:
 *         description: User not found
 */
router.put('/:id/addEvent', addEventToUser);

/**
 * @swagger
 * /api/user/hard/{id}:
 *   delete:
 *     summary: Permanently delete a user by ID
 *     tags: [Administration]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User permanently deleted
 *       404:
 *         description: User not found
 */
router.delete('/hard/:id', deleteUserById);

/**
 * @swagger
 * /api/user/hard/username/{username}:
 *   delete:
 *     summary: Permanently delete a user by username
 *     tags: [Administration]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username
 *     responses:
 *       200:
 *         description: User permanently deleted
 *       404:
 *         description: User not found
 */
router.delete('/hard/username/:username', deleteUserByUsername);

export default router;