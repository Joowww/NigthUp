import { Router } from 'express';
import {
  createUser,
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
  deleteUserById,
  deleteUserByUsername,
  addEventToUser,
  loginUser,           
  createAdminUser      
} from '../controller/usuarioController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       required:
 *         - username
 *         - gmail
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: ID generado por MongoDB
 *         username:
 *           type: string
 *         gmail:
 *           type: string
 *         password:
 *           type: string
 *         birthday:
 *           type: string
 *           format: date
 *         active:
 *           type: boolean
 *           description: Indica si el usuario está activo
 *       example:
 *         username: "usuarioEjemplo"
 *         gmail: "usuario@ejemplo.com"
 *         password: "123456"
 *         birthday: "2000-01-01"
 *         active: true
 */

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Obtener todos los usuarios activos (paginated)
 *     tags: [Usuarios]
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Número de registros a saltar (paginación)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número de registros a devolver (paginación)
 *     responses:
 *       200:
 *         description: Lista de usuarios activos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Usuario'
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
 */
router.get('/', getAllUsers);

/**
 * @swagger
 * /api/user/all/inactive-included:
 *   get:
 *     summary: Obtener todos los usuarios incluyendo inactivos (paginated) - Solo admin
 *     tags: [Usuarios]
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Número de registros a saltar (paginación)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número de registros a devolver (paginación)
 *     responses:
 *       200:
 *         description: Lista de todos los usuarios obtenida exitosamente
 */
router.get('/all/inactive-included', getAllUsersWithInactive);

/**
 * @swagger
 * /api/user:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Error en los datos del usuario
 */
router.post('/', createUser);

/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     summary: Obtener un usuario activo por ID
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:id', getUserById);

/**
 * @swagger
 * /api/user/username/{username}:
 *   get:
 *     summary: Obtener un usuario activo por nombre de usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/username/:username', getUserByUsername);

/**
 * @swagger
 * /api/user/{id}:
 *   put:
 *     summary: Actualizar un usuario activo por ID
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:id', updateUserById);

/**
 * @swagger
 * /api/user/username/{username}:
 *   put:
 *     summary: Actualizar un usuario activo por nombre de usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/username/:username', updateUserByUsername);

/**
 * @swagger
 * /api/user/{id}:
 *   delete:
 *     summary: Deshabilitar un usuario por ID (Soft Delete)
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario deshabilitado exitosamente
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:id', disableUserById);

/**
 * @swagger
 * /api/user/username/{username}:
 *   delete:
 *     summary: Deshabilitar un usuario por nombre de usuario (Soft Delete)
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de usuario
 *     responses:
 *       200:
 *         description: Usuario deshabilitado exitosamente
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/username/:username', disableUserByUsername);

/**
 * @swagger
 * /api/user/{id}/reactivate:
 *   put:
 *     summary: Reactivar un usuario por ID
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario reactivado exitosamente
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:id/reactivate', reactivateUserById);

/**
 * @swagger
 * /api/user/username/{username}/reactivate:
 *   put:
 *     summary: Reactivar un usuario por nombre de usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de usuario
 *     responses:
 *       200:
 *         description: Usuario reactivado exitosamente
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/username/:username/reactivate', reactivateUserByUsername);

/**
 * @swagger
 * /api/user/hard/{id}:
 *   delete:
 *     summary: Eliminar permanentemente un usuario por ID (Hard Delete) - Solo admin
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado permanentemente
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/hard/:id', deleteUserById);

/**
 * @swagger
 * /api/user/hard/username/{username}:
 *   delete:
 *     summary: Eliminar permanentemente un usuario por nombre de usuario (Hard Delete) - Solo admin
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado permanentemente
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/hard/username/:username', deleteUserByUsername);

/**
 * @swagger
 * /api/user/{id}/addEvent:
 *   put:
 *     summary: Añadir evento a un usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Evento añadido al usuario exitosamente
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:id/addEvent', addEventToUser);

/**
 * @swagger
 * /api/user/auth/login:
 *   post:
 *     summary: Iniciar sesión de usuario (solo usuarios activos)
 *     tags: [Autenticación]
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
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: Credenciales incorrectas o usuario deshabilitado
 */
router.post('/auth/login', loginUser);

/**
 * @swagger
 * /api/user/auth/create-admin:
 *   post:
 *     summary: Crear usuario admin (solo desarrollo)
 *     tags: [Autenticación]
 *     responses:
 *       200:
 *         description: Usuario admin creado/verificado
 */
router.post('/auth/create-admin', createAdminUser);

export default router;