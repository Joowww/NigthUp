import { Router } from 'express';
import {
    createBusiness,
    getAllBusinesses,
    getAllBusinessesWithInactive,
    getBusinessById,
    disableBusinessById,
    reactivateBusinessById,
    deleteBusinessById,
    addEventToBusiness,
    removeEventFromBusiness,
    addManagerToBusiness,
    removeManagerFromBusiness,
    updateBusiness,
    assignManager
} from '../controller/businessController';
import { authenticateToken } from '../auth/middleware';
import { requireAdmin, requireAdminOrManager } from '../middleware/roleMiddleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Business:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único del negocio
 *         name:
 *           type: string
 *           example: "Bar Central"
 *         address:
 *           type: string
 *           example: "Calle Mayor 1"
 *         phone:
 *           type: string
 *           example: "666777888"
 *         email:
 *           type: string
 *           example: "bar@central.com"
 *         events:
 *           type: array
 *           items:
 *             type: string
 *           description: Array de IDs de eventos
 *         managers:
 *           type: array
 *           items:
 *             type: string
 *           description: Array de IDs de managers
 *         active:
 *           type: boolean
 *           example: true
 *     BusinessCreate:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: "Bar Central"
 *         address:
 *           type: string
 *           example: "Calle Mayor 1"
 *         phone:
 *           type: string
 *           example: "666777888"
 *         email:
 *           type: string
 *           example: "bar@central.com"
 */

/**
 * @swagger
 * /api/business/assign-manager:
 *   post:
 *     summary: Asignar un usuario como manager de un negocio
 *     tags: [Business - Public]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - businessId
 *             properties:
 *               userId:
 *                 type: string
 *               businessId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Manager asignado correctamente
 *       400:
 *         description: Datos faltantes
 *       404:
 *         description: Negocio o usuario no encontrado
 */
router.post('/assign-manager', assignManager);

/**
 * @swagger
 * /api/business:
 *   get:
 *     summary: Obtener todos los negocios activos
 *     tags: [Business - Public]
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Número de elementos a saltar
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número máximo de elementos a retornar
 *     responses:
 *       200:
 *         description: Lista de negocios activos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 businesses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Business'
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
router.get('/', getAllBusinesses);

/**
 * @swagger
 * /api/business/{id}:
 *   get:
 *     summary: Obtener negocio por ID
 *     tags: [Business - Public]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Negocio encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Business'
 *       404:
 *         description: Negocio no encontrado
 */
router.get('/:id', getBusinessById);

/**
 * @swagger
 * /api/business:
 *   post:
 *     summary: Crear un nuevo negocio
 *     tags: [Business - Admin Only]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BusinessCreate'
 *     responses:
 *       201:
 *         description: Negocio creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Business'
 *       400:
 *         description: Error en los datos de entrada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Privilegios de administrador requeridos
 *       500:
 *         description: Error del servidor
 */
router.post('/', createBusiness);

/**
 * @swagger
 * /api/business/all/inactive-included:
 *   get:
 *     summary: Obtener todos los negocios (incluyendo inactivos)
 *     tags: [Business - Admin Only]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Número de elementos a saltar
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número máximo de elementos a retornar
 *     responses:
 *       200:
 *         description: Lista de todos los negocios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 businesses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Business'
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
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Privilegios de administrador requeridos
 */
router.get('/all/inactive-included', requireAdmin, getAllBusinessesWithInactive);

/**
 * @swagger
 * /api/business/{id}/disable:
 *   patch:
 *     summary: Desactivar negocio por ID
 *     tags: [Business - Admin Only]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Negocio desactivado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Business'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Privilegios de administrador requeridos
 *       404:
 *         description: Negocio no encontrado
 */
router.patch('/:id/disable', authenticateToken, requireAdmin, disableBusinessById);

/**
 * @swagger
 * /api/business/{id}/reactivate:
 *   patch:
 *     summary: Reactivar negocio por ID
 *     tags: [Business - Admin Only]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Negocio reactivado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Business'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Privilegios de administrador requeridos
 *       404:
 *         description: Negocio no encontrado
 */
router.patch('/:id/reactivate', authenticateToken, requireAdmin, reactivateBusinessById);

/**
 * @swagger
 * /api/business/hard/{id}:
 *   delete:
 *     summary: Eliminar negocio por ID
 *     tags: [Business - Admin Only]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Negocio eliminado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Business'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Privilegios de administrador requeridos
 *       404:
 *         description: Negocio no encontrado
 */
router.delete('/hard/:id', authenticateToken, requireAdmin, deleteBusinessById);

/**
 * @swagger
 * /api/business/{businessId}/manager/{managerId}:
 *   put:
 *     summary: Agregar manager a un negocio
 *     tags: [Business - Admin Only]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: managerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Manager agregado al negocio
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Business'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Privilegios de administrador requeridos
 *       404:
 *         description: Negocio no encontrado
 */
router.put('/:businessId/manager/:managerId', authenticateToken, requireAdmin, addManagerToBusiness);

/**
 * @swagger
 * /api/business/{businessId}/manager/{managerId}:
 *   delete:
 *     summary: Remover manager de un negocio
 *     tags: [Business - Admin Only]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: managerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Manager removido del negocio
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Business'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Privilegios de administrador requeridos
 *       404:
 *         description: Negocio no encontrado
 */
router.delete('/:businessId/manager/:managerId', authenticateToken, requireAdmin, removeManagerFromBusiness);

/**
 * @swagger
 * /api/business/{id}:
 *   put:
 *     summary: Actualizar negocio por ID
 *     tags: [Business - Admin/Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BusinessCreate'
 *     responses:
 *       200:
 *         description: Negocio actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Business'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Privilegios de administrador o manager requeridos
 *       404:
 *         description: Negocio no encontrado
 */
router.put('/:id', authenticateToken, requireAdminOrManager, updateBusiness);

/**
 * @swagger
 * /api/business/{businessId}/event/{eventId}:
 *   put:
 *     summary: Agregar evento a un negocio
 *     tags: [Business - Admin/Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Evento agregado al negocio
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Business'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Privilegios de administrador o manager requeridos
 *       404:
 *         description: Negocio no encontrado
 */
router.put('/:businessId/event/:eventId', authenticateToken, requireAdminOrManager, addEventToBusiness);

/**
 * @swagger
 * /api/business/{businessId}/event/{eventId}:
 *   delete:
 *     summary: Remover evento de un negocio
 *     tags: [Business - Admin/Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Evento removido del negocio
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Business'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Privilegios de administrador o manager requeridos
 *       404:
 *         description: Negocio no encontrado
 */
router.delete('/:businessId/event/:eventId', authenticateToken, requireAdminOrManager, removeEventFromBusiness);

export default router;