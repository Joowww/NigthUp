import { Router } from 'express';
import {
  createUser,
  loginUser,
  getAllUsers,
  getAllUsersWithInactive,
  getUserByIdentifier,
  updateUserByIdentifier,
  disableUserByIdentifier,
  reactivateUserByIdentifier,
  makeUserAdminByIdentifier,
  removeUserAdminByIdentifier,
  deleteUserByIdentifier,
  addEventToUser,
  getUserStats,
  makeUserManagerByIdentifier,
  removeUserManagerByIdentifier
} from '../controller/userController';
import { requireAdmin } from '../controller/eventController';

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
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
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
 *     UserStats:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Total de usuarios en el sistema
 *         active:
 *           type: integer
 *           description: Usuarios activos
 *         inactive:
 *           type: integer
 *           description: Usuarios inactivos
 *         newCount:
 *           type: integer
 *           description: Nuevos usuarios en los últimos 7 días
 *         lastUpdated:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 */

// ==================== POST ====================

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
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Incorrect credentials or user inactive
 *       500:
 *         description: Login error
 */
router.post('/auth/login', loginUser);

/**
 * @swagger
 * /api/user/{identifier}/events:
 *   post:
 *     summary: Add event to a user by ID, username or email
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID, username or email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventIdentifier
 *             properties:
 *               eventIdentifier:
 *                 type: string
 *                 description: Event ID or event name
 *     responses:
 *       200:
 *         description: Event added to user successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing eventIdentifier or event not found
 *       404:
 *         description: User not found
 */
router.post('/:identifier/events', addEventToUser);

// ==================== GET ====================

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
 *           default: 0
 *         description: Number of records to skip (pagination)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
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
 * /api/user/number-of-users:
 *   get:
 *     summary: Get number of users statistics
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserStats'
 *       500:
 *         description: Failed to retrieve statistics
 */
router.get('/number-of-users', getUserStats);

/**
 * @swagger
 * /api/user/with-inactive:
 *   get:
 *     summary: Get all users including inactive ones (paginated)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip (pagination)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records to return (pagination)
 *     responses:
 *       200:
 *         description: List of all users obtained successfully
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
router.get('/with-inactive', getAllUsersWithInactive);

/**
 * @swagger
 * /api/user/{identifier}:
 *   get:
 *     summary: Get a user by ID, username or email
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID, username or email
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
router.get('/:identifier', getUserByIdentifier);

// ==================== ADMINISTRATION - USERS ====================

/**
 * @swagger
 * /api/user/{identifier}:
 *   patch:
 *     summary: 'Update any user field by ID, username or email (Admin only)'
 *     tags: [Administration - Users]
 *     security:
 *       - userRole: []
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID, username or email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "newUsername"
 *               email:
 *                 type: string
 *                 example: "newemail@example.com"
 *               birthday:
 *                 type: string
 *                 format: date
 *                 example: "2000-01-01"
 *               role:
 *                 type: string
 *                 enum: [admin, manager, user]
 *                 example: "manager"
 *               active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *         description: Invalid data or password update attempted
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: User not found
 */
router.patch('/:identifier', requireAdmin, updateUserByIdentifier);

/**
 * @swagger
 * /api/user/{identifier}/disable:
 *   patch:
 *     summary: 'Disable a user by ID, username or email'
 *     tags: [Administration - Users]
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID, username or email
 *     responses:
 *       200:
 *         description: User disabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.patch('/:identifier/disable', disableUserByIdentifier);

/**
 * @swagger
 * /api/user/{identifier}/reactivate:
 *   patch:
 *     summary: 'Reactivate a user by ID, username or email'
 *     tags: [Administration - Users]
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID, username or email
 *     responses:
 *       200:
 *         description: User reactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.patch('/:identifier/reactivate', reactivateUserByIdentifier);

/**
 * @swagger
 * /api/user/{identifier}/make-admin:
 *   patch:
 *     summary: 'Convert user to administrator by ID, username or email'
 *     tags: [Administration - Users]
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID, username or email
 *     responses:
 *       200:
 *         description: User converted to administrator successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.patch('/:identifier/make-admin', makeUserAdminByIdentifier);

/**
 * @swagger
 * /api/user/{identifier}/remove-admin:
 *   patch:
 *     summary: 'Remove administrator permissions by ID, username or email'
 *     tags: [Administration - Users]
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID, username or email
 *     responses:
 *       200:
 *         description: Administrator permissions removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.patch('/:identifier/remove-admin', removeUserAdminByIdentifier);

/**
 * @swagger
 * /api/user/{identifier}/make-manager:
 *   patch:
 *     summary: 'Convert user to manager by ID, username or email (Admin only)'
 *     tags: [Administration - Users]
 *     security:
 *       - userRole: []
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID, username or email
 *     responses:
 *       200:
 *         description: User converted to manager successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: User not found
 */
router.patch('/:identifier/make-manager', requireAdmin, makeUserManagerByIdentifier);

/**
 * @swagger
 * /api/user/{identifier}/remove-manager:
 *   patch:
 *     summary: 'Remove manager permissions by ID, username or email (Admin only)'
 *     tags: [Administration - Users]
 *     security:
 *       - userRole: []
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID, username or email
 *     responses:
 *       200:
 *         description: Manager permissions removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: User not found
 */
router.patch('/:identifier/remove-manager', requireAdmin, removeUserManagerByIdentifier);

// ==================== DELETE ====================

/**
 * @swagger
 * /api/user/hard/{identifier}:
 *   delete:
 *     summary: 'Permanently delete a user by ID, username or email'
 *     tags: [Administration - Users]
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID, username or email
 *     responses:
 *       200:
 *         description: User permanently deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.delete('/hard/:identifier', deleteUserByIdentifier);

export default router;