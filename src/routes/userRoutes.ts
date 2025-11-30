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
    makeUserAdminByIdentifier,
    removeUserAdminByIdentifier,
    deleteUserByIdentifier,
    addEventToUser,
    getUserStats,
    makeUserManagerByIdentifier,
    removeUserManagerByIdentifier,
    getMyProfile,
    updateMyProfile,
    verifyTokenHandler,
    getSecurityQuestions,
    setSecurityQuestion,
    forgotPassword,
    verifySecurityAnswer,
    resetPasswordWithToken,
    completeOnboardingHandler
} from '../controller/userController';

import { googleAuth, connectGoogleAccount } from '../controller/googleAuthController';
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
 *         - phoneNumber
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
 *         phoneNumber:
 *           type: string
 *           example: "+34 612 345 678"
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
 *         securityQuestion:
 *           type: string
 *           description: Clave de la pregunta de seguridad
 *           example: "security.question.pet_name"
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
 *         - phoneNumber
 *         - securityQuestionKey
 *         - securityAnswer
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
 *         phoneNumber:
 *           type: string
 *           description: Número de teléfono - mínimo 9 dígitos
 *           example: "+34 612 345 678"
 *         role:
 *           type: string
 *           enum: [manager, user]
 *           example: "user"
 *         securityQuestionKey:
 *           type: string
 *           description: Clave de pregunta de seguridad 
 *           example: "security.question.pet_name"
 *         securityAnswer:
 *           type: string
 *           description: Respuesta de seguridad 
 *           example: "Fluffy"
 *     SecurityQuestionRequest:
 *       type: object
 *       required:
 *         - securityQuestionKey
 *         - securityAnswer
 *         - currentPassword
 *       properties:
 *         securityQuestionKey:
 *           type: string
 *           description: Clave de la pregunta de seguridad
 *           example: "security.question.pet_name"
 *         securityAnswer:
 *           type: string
 *           description: Respuesta a la pregunta de seguridad
 *           example: "Fluffy"
 *         currentPassword:
 *           type: string
 *           description: Contraseña actual del usuario
 *           example: "currentPass123"
 *     ForgotPasswordRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *     VerifySecurityAnswerRequest:
 *       type: object
 *       required:
 *         - email
 *         - securityAnswer
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         securityAnswer:
 *           type: string
 *           description: Respuesta a la pregunta de seguridad
 *           example: "Fluffy"
 *     ResetPasswordRequest:
 *       type: object
 *       required:
 *         - resetToken
 *         - newPassword
 *       properties:
 *         resetToken:
 *           type: string
 *           description: Token de reseteo obtenido tras verificar la respuesta de seguridad
 *         newPassword:
 *           type: string
 *           description: Nueva contraseña
 *           example: "newSecurePass123"
 */

// --- RUTAS PÚBLICAS ---
/**
 * @swagger
 * /api/user:
 *   post:
 *     summary: Create a new user (security question and answer required)
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing required fields (security question/answer required) or invalid data
 *       403:
 *         description: Cannot create admin user from this route
 *       500:
 *         description: Failed to create user
 */
router.post('/', createUser);

/**
 * @swagger
 * /api/user/complete-onboarding:
 *   patch:
 *     summary: Completar onboarding del usuario actual (establece comunidad e intereses)
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
 *               - comunidad
 *               - intereses
 *             properties:
 *               comunidad:
 *                 type: string
 *                 description: Identificador o nombre de la comunidad seleccionada por el usuario
 *                 example: "comunidad_madrid"
 *               intereses:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de intereses seleccionados por el usuario
 *                 example: ["musica", "tecnologia", "deportes"]
 *     responses:
 *       200:
 *         description: Onboarding completado con éxito. Devuelve el usuario actualizado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Onboarding completado con éxito"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Datos inválidos (faltan comunidad o intereses)
 *       401:
 *         description: Usuario no autenticado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.patch('/complete-onboarding',authenticateToken,completeOnboardingHandler);

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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Incorrect credentials
 *       500:
 *         description: Login error
 */
router.post('/auth/login', loginUser);

/**
 * @swagger
 * /api/user/auth/google:
 *   post:
 *     summary: Authenticate with Google
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Google authentication successful
 *       400:
 *         description: Invalid Google token
 *       500:
 *         description: Google authentication failed
 */
router.post('/auth/google', googleAuth);

/**
 * @swagger
 * /api/user/security-questions:
 *   get:
 *     summary: Get available security questions
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: List of security question keys
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 securityQuestionKeys:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: [
 *                     "security.question.pet_name",
 *                     "security.question.birth_city",
 *                     "security.question.mother_maiden_name"
 *                   ]
 *                 fallbackTexts:
 *                   type: object
 *                   description: Textos de fallback (solo en desarrollo)
 */
router.get('/security-questions', getSecurityQuestions);

/**
 * @swagger
 * /api/user/forgot-password:
 *   post:
 *     summary: Iniciar proceso de recuperación de contraseña
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: Si el email existe, se muestra la clave de la pregunta de seguridad
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 securityQuestionKey:
 *                   type: string
 *                   example: "security.question.pet_name"
 *                 email:
 *                   type: string
 *       400:
 *         description: Email no proporcionado o usuario sin pregunta de seguridad
 *       500:
 *         description: Error del servidor
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /api/user/verify-security-answer:
 *   post:
 *     summary: Verificar respuesta de seguridad
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifySecurityAnswerRequest'
 *     responses:
 *       200:
 *         description: Respuesta correcta, token de reseteo generado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 resetToken:
 *                   type: string
 *       400:
 *         description: Respuesta incorrecta o datos faltantes
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.post('/verify-security-answer', verifySecurityAnswer);

/**
 * @swagger
 * /api/user/reset-password:
 *   post:
 *     summary: Resetear contraseña con token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Contraseña reseteada exitosamente
 *       400:
 *         description: Token inválido o contraseña débil
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.post('/reset-password', resetPasswordWithToken);

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
 *             type: object
 *             required:
 *               - refreshToken
 *               - userId
 *             properties:
 *               refreshToken:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: New token generated
 *       401:
 *         description: Invalid refresh token
 */
router.post('/auth/refresh', authenticateRefreshToken, refreshAccessToken);

// ===== RUTAS AUTENTICADAS =====

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
 *         description: User profile retrieved
 *       401:
 *         description: Unauthorized
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
 *         description: Profile updated
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 */
router.patch('/me', authenticateToken, updateMyProfile);

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
 *         description: Password changed
 *       400:
 *         description: Invalid password
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
 *         description: Email changed
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 */
router.post('/change-email', authenticateToken, changeEmail);

/**
 * @swagger
 * /api/user/security-question:
 *   post:
 *     summary: Establecer pregunta y respuesta de seguridad
 *     tags: [Users - Authenticated]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SecurityQuestionRequest'
 *     responses:
 *       200:
 *         description: Pregunta de seguridad establecida
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.post('/security-question', authenticateToken, setSecurityQuestion);

/**
 * @swagger
 * /api/user/connect/google:
 *   post:
 *     summary: Connect Google account
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
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Google account connected
 *       400:
 *         description: Invalid token
 *       401:
 *         description: Unauthorized
 */
router.post('/connect/google', authenticateToken, connectGoogleAccount);

// ===== RUTAS ADMIN =====

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Get all active users (paginated)
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
router.get('/', authenticateToken, getAllUsers);

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