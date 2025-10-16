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
  updateBusiness
} from '../controller/businessController';

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
 * /api/business:
 *   post:
 *     summary: Crear un nuevo negocio
 *     tags: [Business]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BusinessCreate'
 *     responses:
 *       201:
 *         description: Negocio creado exitosamente
 *       400:
 *         description: Error en los datos de entrada
 *       500:
 *         description: Error del servidor
 */
router.post('/', createBusiness);

/**
 * @swagger
 * /api/business:
 *   get:
 *     summary: Obtener todos los negocios activos
 *     tags: [Business]
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Número de elementos a saltar
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número máximo de elementos a retornar
 *     responses:
 *       200:
 *         description: Lista de negocios activos
 */
router.get('/', getAllBusinesses);

/**
 * @swagger
 * /api/business/all/inactive-included:
 *   get:
 *     summary: Obtener todos los negocios (incluyendo inactivos)
 *     tags: [Business]
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Número de elementos a saltar
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número máximo de elementos a retornar
 *     responses:
 *       200:
 *         description: Lista de todos los negocios
 */
router.get('/all/inactive-included', getAllBusinessesWithInactive);

/**
 * @swagger
 * /api/business/{id}:
 *   get:
 *     summary: Obtener negocio por ID
 *     tags: [Business]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Negocio encontrado
 *       404:
 *         description: Negocio no encontrado
 */
router.get('/:id', getBusinessById);

/**
 * @swagger
 * /api/business/{id}/disable:
 *   patch:
 *     summary: Desactivar negocio por ID
 *     tags: [Business]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Negocio desactivado
 *       404:
 *         description: Negocio no encontrado
 */
router.patch('/:id/disable', disableBusinessById);

/**
 * @swagger
 * /api/business/{id}/reactivate:
 *   patch:
 *     summary: Reactivar negocio por ID
 *     tags: [Business]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Negocio reactivado
 *       404:
 *         description: Negocio no encontrado
 */
router.patch('/:id/reactivate', reactivateBusinessById);

/**
 * @swagger
 * /api/business/hard/{id}:
 *   delete:
 *     summary: Eliminar negocio por ID
 *     tags: [Business]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Negocio eliminado
 *       404:
 *         description: Negocio no encontrado
 */
router.delete('/hard/:id', deleteBusinessById);

/**
 * @swagger
 * /api/business/{businessId}/event/{eventId}:
 *   put:
 *     summary: Agregar evento a un negocio
 *     tags: [Business]
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
 *       404:
 *         description: Negocio no encontrado
 */
router.put('/:businessId/event/:eventId', addEventToBusiness);

/**
 * @swagger
 * /api/business/{businessId}/event/{eventId}:
 *   delete:
 *     summary: Remover evento de un negocio
 *     tags: [Business]
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
 *       404:
 *         description: Negocio no encontrado
 */
router.delete('/:businessId/event/:eventId', removeEventFromBusiness);

/**
 * @swagger
 * /api/business/{businessId}/manager/{managerId}:
 *   put:
 *     summary: Agregar manager a un negocio
 *     tags: [Business]
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
 *       404:
 *         description: Negocio no encontrado
 */
router.put('/:businessId/manager/:managerId', addManagerToBusiness);

/**
 * @swagger
 * /api/business/{businessId}/manager/{managerId}:
 *   delete:
 *     summary: Remover manager de un negocio
 *     tags: [Business]
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
 *       404:
 *         description: Negocio no encontrado
 */
router.delete('/:businessId/manager/:managerId', removeManagerFromBusiness);

/**
 * @swagger
 * /api/business/{id}:
 *   put:
 *     summary: Actualizar negocio por ID
 *     tags: [Business]
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
 *       404:
 *         description: Negocio no encontrado
 */
router.put('/:id', updateBusiness);

export default router;