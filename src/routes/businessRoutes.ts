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
    removeManagerFromBussines,
    updateBussines
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
 *     summary: Create a new business
 *     tags: [Business]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Business'
 *     responses:
 *       201:
 *         description: Business successfully created
 */
router.post('/', createBussines);

/**
 * @swagger
 * /api/business/all:
 *   get:
 *     summary: Get all active businesses
 *     tags: [Business]
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of items to skip
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of items to return
 *     responses:
 *       200:
 *         description: List of active businesses
 */
router.get('/all', getAllBussines);

/**
 * @swagger
 * /api/business/allInactive:
 *   get:
 *     summary: Get all businesses (including inactive)
 *     tags: [Business]
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of items to skip
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of items to return
 *     responses:
 *       200:
 *         description: List of all businesses
 */
router.get('/allInactive', getAllBussinesWithInactive);

/**
 * @swagger
 * /api/business/get/{id}:
 *   get:
 *     summary: Get business by ID
 *     tags: [Business]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Business found
 *       404:
 *         description: Business not found
 */
router.get('/get/:id', getBussinesById);

/**
 * @swagger
 * /api/business/disable/{id}:
 *   patch:
 *     summary: Disable business by ID
 *     tags: [Business]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Business disabled
 *       404:
 *         description: Business not found
 */
router.patch('/disable/:id', disableBussinesById);

/**
 * @swagger
 * /api/business/reactivate/{id}:
 *   patch:
 *     summary: Reactivate business by ID
 *     tags: [Business]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Business reactivated
 *       404:
 *         description: Business not found
 */
router.patch('/reactivate/:id', reactivateBussinesById);

/**
 * @swagger
 * /api/business/delete/{id}:
 *   delete:
 *     summary: Delete business by ID
 *     tags: [Business]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Business deleted
 *       404:
 *         description: Business not found
 */
router.delete('/delete/:id', deleteBussinesById);

/**
 * @swagger
 * /api/business/{id}/evento/add:
 *   post:
 *     summary: Add event to a business
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
 *         description: Event added to business
 *       404:
 *         description: Business not found
 */
router.put('/:id/evento/add', addEventoToBussines);

/**
 * @swagger
 * /api/business/{id}/evento/remove:
 *   put:
 *     summary: Remove event from a business
 *     tags: [Business]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Business ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventoId:
 *                 type: string
 *                 description: Event ID to remove
 *     responses:
 *       200:
 *         description: Event removed from business
 *       404:
 *         description: Business or event not found
 */
router.put('/:id/evento/remove', removeEventoFromBussines);

/**
 * @swagger
 * /api/business/{bussinessId}/manager/add/{managerId}:
 *   put:
 *     summary: Add manager to a business
 *     tags: [Business]
 *     parameters:
 *       - in: path
 *         name: bussinessId
 *         required: true
 *         schema:
 *           type: string
 *         description: Business ID
 *       - in: path
 *         name: managerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Manager ID to add
 *     responses:
 *       200:
 *         description: Manager added to business
 *       404:
 *         description: Business or manager not found
 */
router.put('/:bussinessId/manager/add/:managerId', addManagerToBussines);

/**
 * @swagger
 * /api/business/{bussinessId}/manager/remove/{managerId}:
 *   put:
 *     summary: Remove manager from a business
 *     tags: [Business]
 *     parameters:
 *       - in: path
 *         name: bussinessId
 *         required: true
 *         schema:
 *           type: string
 *         description: Business ID
 *       - in: path
 *         name: managerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Manager ID to remove
 *     responses:
 *       200:
 *         description: Manager removed from business
 *       404:
 *         description: Business or manager not found
 */
router.put('/:bussinessId/manager/remove/:managerId', removeManagerFromBussines);

router.put('/update/:id', updateBussines);

export default router;

