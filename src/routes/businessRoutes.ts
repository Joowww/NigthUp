import { Router } from 'express';
import { 
    createBussines, 
    getAllBussines, 
    getAllBussinesWithInactive, 
    getBussinesById, 
    disableBussinesById, 
    reactivateBussinesById,
    deleteBussinesById, 
    addEventoToBussines,
    removeEventoFromBussines,
    addManagerToBussines,
    removeManagerFromBussines
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
 *         eventos:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Evento'
 *         active:
 *           type: boolean
 *           example: true
 *     Evento:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         nombre:
 *           type: string
 *           example: "Fiesta de inauguración"
 *         fecha:
 *           type: string
 *           format: date-time
 *           example: "2025-10-12T22:00:00Z"
 *         descripcion:
 *           type: string
 *           example: "Ven a celebrar la apertura con nosotros"
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
 *             $ref: '#/components/schemas/Business'
 *     responses:
 *       201:
 *         description: Negocio creado exitosamente
 */
router.post('/', createBussines);

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
 *         description: Número máximo de elementos a devolver
 *     responses:
 *       200:
 *         description: Lista de negocios activos
 */
router.get('/all', getAllBussines);

/**
 * @swagger
 * /api/business/all:
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
 *         description: Número máximo de elementos a devolver
 *     responses:
 *       200:
 *         description: Lista de todos los negocios
 */
router.get('/allInactive', getAllBussinesWithInactive);

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
router.get('/get/:id', getBussinesById);

/**
 * @swagger
 * /api/business/disable/{id}:
 *   patch:
 *     summary: Deshabilitar negocio por ID
 *     tags: [Business]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Negocio deshabilitado
 *       404:
 *         description: Negocio no encontrado
 */
router.patch('/disable/:id', disableBussinesById);

/**
 * @swagger
 * /api/business/reactivate/{id}:
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
router.patch('/reactivate/:id', reactivateBussinesById);

/**
 * @swagger
 * /api/business/{id}:
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
router.delete('/delete/:id', deleteBussinesById);

/**
 * @swagger
 * /api/business/{id}/evento:
 *   post:
 *     summary: Agregar evento a un negocio
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
 *             $ref: '#/components/schemas/Evento'
 *     responses:
 *       201:
 *         description: Evento agregado al negocio
 *       404:
 *         description: Negocio no encontrado
 */
router.put('/:id/evento/add', addEventoToBussines);

/**
 * @swagger
 * /api/business/{id}/evento/remove:
 *   put:
 *     summary: Quitar evento de un negocio
 *     tags: [Business]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del negocio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventoId:
 *                 type: string
 *                 description: ID del evento a quitar
 *     responses:
 *       200:
 *         description: Evento quitado del negocio
 *       404:
 *         description: Negocio o evento no encontrado
 */
router.put('/:id/evento/remove', removeEventoFromBussines);

/**
 * @swagger
 * /api/business/{bussinessId}/manager/add/{managerId}:
 *   put:
 *     summary: Agregar manager a un negocio
 *     tags: [Business]
 *     parameters:
 *       - in: path
 *         name: bussinessId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del negocio
 *       - in: path
 *         name: managerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del manager a agregar
 *     responses:
 *       200:
 *         description: Manager agregado al negocio
 *       404:
 *         description: Negocio o manager no encontrado
 */
router.put('/:bussinessId/manager/add/:managerId', addManagerToBussines);

/**
 * @swagger
 * /api/business/{bussinessId}/manager/remove/{managerId}:
 *   put:
 *     summary: Quitar manager de un negocio
 *     tags: [Business]
 *     parameters:
 *       - in: path
 *         name: bussinessId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del negocio
 *       - in: path
 *         name: managerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del manager a quitar
 *     responses:
 *       200:
 *         description: Manager quitado del negocio
 *       404:
 *         description: Negocio o manager no encontrado
 */
router.put('/:bussinessId/manager/remove/:managerId', removeManagerFromBussines);

export default router;

