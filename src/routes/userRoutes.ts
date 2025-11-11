import { Router } from 'express';
import {
    createUser,
    loginUser,
    refreshAccessToken,
    changePassword,
    changeEmail,
    getAllUsers,
    getAllUsersWithInactive,
    getUserByIdentifier,
    updateUserByIdentifier,
    disableUserByIdentifier,
    reactivateUserByIdentifier,
    forgotPassword,
    makeUserAdminByIdentifier,
    removeUserAdminByIdentifier,
    deleteUserByIdentifier,
    addEventToUser,
    getUserStats,
    makeUserManagerByIdentifier,
    removeUserManagerByIdentifier,
    getMyProfile,
    updateMyProfile,
    verifyTokenHandler
} from '../controller/userController';

import { authenticateToken, authenticateRefreshToken } from '../auth/middleware';
import { requireAdmin, requireAdminOrManager, requireUser } from '../middleware/roleMiddleware';

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
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           example: "userExample"
 *         password:
 *           type: string
 *           example: "123456"
 *     LoginResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *         message:
 *           type: string
 *           example: "LOGIN EXITOSO"
 *         token:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         refreshToken:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     RefreshTokenRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *         - userId
 *       properties:
 *         refreshToken:
 *           type: string
 *         userId:
 *           type: string
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// --- RUTAS PÚBLICAS ---
/**
 * @swagger
 * /api/user:
 *   post:
 *     summary: Create a new user
 *     tags: [Users - Public]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreate'
 *     responses:
 *       201:
 *         description: User created successfully
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
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
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
 * /api/user/forgot-password:
 *   post:
 *     summary: Solicitar restablecimiento de contraseña
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Si el email existe, se envía un enlace de restablecimiento
 *       400:
 *         description: Email no proporcionado
 *       500:
 *         description: Error del servidor
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /api/user/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: New token generated successfully
 *       401:
 *         description: Invalid or expired refresh token
 *       500:
 *         description: Internal server error
 */
router.post('/auth/refresh', authenticateRefreshToken, refreshAccessToken);

/**
 * @swagger
 * /api/user/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Users - Authenticated]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid current password or weak new password
 *       401:
 *         description: Unauthorized
 */
router.post('/change-password', authenticateToken, changePassword);

/**
 * @swagger
 * /api/user/change-email:
 *   post:
 *     summary: Change user email
 *     tags: [Users - Authenticated]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newEmail
 *               - password
 *             properties:
 *               newEmail:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email changed successfully
 *       400:
 *         description: Invalid password or email already in use
 *       401:
 *         description: Unauthorized
 */
router.post('/change-email', authenticateToken, changeEmail);


// --- RUTAS AUTENTICADAS ---
/**
 * @swagger
 * /api/user/auth/verify:
 *   get:
 *     summary: Verify JWT token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *       401:
 *         description: Invalid token
 */
router.get('/auth/verify', authenticateToken, verifyTokenHandler);

/**
 * @swagger
 * /api/user/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users - Authenticated]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized - Token required
 *       404:
 *         description: User not found
 */
router.get('/me', authenticateToken, getMyProfile);

/**
 * @swagger
 * /api/user/me:
 *   patch:
 *     summary: Update current user profile
 *     tags: [Users - Authenticated]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               birthday:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid data or password/role update attempted
 *       401:
 *         description: Unauthorized - Token required
 *       404:
 *         description: User not found
 */
router.patch('/me', authenticateToken, updateMyProfile);

// --- RUTAS ADMIN ---
/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Get all active users (paginated) - Admin only
 *     tags: [Users - Admin]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: No users found
 */
router.get('/', authenticateToken, requireAdmin, getAllUsers);

/**
 * @swagger
 * /api/user/number-of-users:
 *   get:
 *     summary: Get number of users statistics - Admin only
 *     tags: [Users - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Admin privileges required
 *       500:
 *         description: Failed to retrieve statistics
 */
router.get('/number-of-users', authenticateToken, requireAdmin, getUserStats);

/**
 * @swagger
 * /api/user/with-inactive:
 *   get:
 *     summary: Get all users including inactive ones (paginated) - Admin only
 *     tags: [Users - Admin]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: No users found
 */
router.get('/with-inactive', authenticateToken, requireAdmin, getAllUsersWithInactive);

/**
 * @swagger
 * /api/user/{identifier}:
 *   get:
 *     summary: Get a user by ID, username or email - Admin only
 *     tags: [Users - Admin]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: User not found
 */
router.get('/:identifier', authenticateToken, requireAdmin, getUserByIdentifier);

/**
 * @swagger
 * /api/user/{identifier}:
 *   patch:
 *     summary: Update any user field by ID, username or email - Admin only
 *     tags: [Users - Admin]
 *     security:
 *       - bearerAuth: []
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
 *               email:
 *                 type: string
 *               birthday:
 *                 type: string
 *                 format: date
 *               role:
 *                 type: string
 *                 enum: [admin, manager, user]
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid data or password update attempted
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: User not found
 */
router.patch('/:identifier', authenticateToken, requireAdmin, updateUserByIdentifier);

/**
 * @swagger
 * /api/user/{identifier}/disable:
 *   patch:
 *     summary: Disable a user by ID, username or email - Admin only
 *     tags: [Users - Admin]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: User not found
 */
router.patch('/:identifier/disable', authenticateToken, requireAdmin, disableUserByIdentifier);

/**
 * @swagger
 * /api/user/{identifier}/reactivate:
 *   patch:
 *     summary: Reactivate a user by ID, username or email - Admin only
 *     tags: [Users - Admin]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: User not found
 */
router.patch('/:identifier/reactivate', authenticateToken, requireAdmin, reactivateUserByIdentifier);

/**
 * @swagger
 * /api/user/{identifier}/make-admin:
 *   patch:
 *     summary: Convert user to administrator by ID, username or email - Admin only
 *     tags: [Users - Admin]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: User not found
 */
router.patch('/:identifier/make-admin', authenticateToken, requireAdmin, makeUserAdminByIdentifier);

/**
 * @swagger
 * /api/user/{identifier}/remove-admin:
 *   patch:
 *     summary: Remove administrator permissions by ID, username or email - Admin only
 *     tags: [Users - Admin]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: User not found
 */
router.patch('/:identifier/remove-admin', authenticateToken, requireAdmin, removeUserAdminByIdentifier);

/**
 * @swagger
 * /api/user/{identifier}/make-manager:
 *   patch:
 *     summary: Convert user to manager by ID, username or email - Admin only
 *     tags: [Users - Admin]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: User not found
 */
router.patch('/:identifier/make-manager', authenticateToken, requireAdmin, makeUserManagerByIdentifier);

/**
 * @swagger
 * /api/user/{identifier}/remove-manager:
 *   patch:
 *     summary: Remove manager permissions by ID, username or email - Admin only
 *     tags: [Users - Admin]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: User not found
 */
router.patch('/:identifier/remove-manager', authenticateToken, requireAdmin, removeUserManagerByIdentifier);

/**
 * @swagger
 * /api/user/hard/{identifier}:
 *   delete:
 *     summary: Permanently delete a user by ID, username or email - Admin only
 *     tags: [Users - Admin]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Unauthorized - Token required
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: User not found
 */
router.delete('/hard/:identifier', authenticateToken, requireAdmin, deleteUserByIdentifier);

export default router;