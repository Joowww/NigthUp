import { Router } from 'express';
import {
  activatePanicButton,
  getPanicButtonHistory,
  addEmergencyContact,
  removeEmergencyContact
} from '../controller/panicButtonController';
import { authenticateToken } from '../auth/middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PanicActivation:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único de la activación
 *         userId:
 *           type: string
 *           description: ID del usuario que activó el botón
 *         location:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               example: "Point"
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *               example: [-74.0060, 40.7128]
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Momento de la activación
 *         resolved:
 *           type: boolean
 *           description: Si la emergencia fue resuelta
 *         resolvedAt:
 *           type: string
 *           format: date-time
 *           description: Momento en que se resolvió
 *     EmergencyContact:
 *       type: object
 *       required:
 *         - name
 *         - phone
 *       properties:
 *         name:
 *           type: string
 *           example: "Juan Pérez"
 *           description: Nombre del contacto de emergencia
 *         phone:
 *           type: string
 *           example: "+1234567890"
 *           description: Número de teléfono del contacto
 *         email:
 *           type: string
 *           format: email
 *           example: "juan@example.com"
 *           description: Email del contacto (opcional)
 *     RemoveContact:
 *       type: object
 *       required:
 *         - phone
 *       properties:
 *         phone:
 *           type: string
 *           example: "+1234567890"
 *           description: Número de teléfono del contacto a eliminar
 */

/**
 * @swagger
 * /api/panic/activate:
 *   post:
 *     summary: Activate panic button
 *     tags: [Panic Button]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Panic button activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Botón de pánico activado. Se han notificado los contactos de emergencia."
 *                 panicId:
 *                   type: string
 *                   description: ID de la activación del pánico
 *                 location:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       example: "Point"
 *                     coordinates:
 *                       type: array
 *                       items:
 *                         type: number
 *                 contactsNotified:
 *                   type: number
 *                   description: Número de contactos notificados
 *       400:
 *         description: Error al activar el botón de pánico
 *       401:
 *         description: Unauthorized - Token required
 */
router.post('/activate', authenticateToken, activatePanicButton);

/**
 * @swagger
 * /api/panic/history:
 *   get:
 *     summary: Get panic button activation history
 *     tags: [Panic Button]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *         description: Number of records to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: number
 *           default: 0
 *         description: Number of records to skip
 *     responses:
 *       200:
 *         description: Panic button history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 history:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PanicActivation'
 *                 total:
 *                   type: number
 *                   description: Total number of activations
 *       401:
 *         description: Unauthorized - Token required
 *       404:
 *         description: No panic button history found
 */
router.get('/history', authenticateToken, getPanicButtonHistory);

/**
 * @swagger
 * /api/panic/emergency-contact:
 *   post:
 *     summary: Add emergency contact
 *     tags: [Panic Button]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmergencyContact'
 *     responses:
 *       201:
 *         description: Emergency contact added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contacto de emergencia añadido correctamente"
 *                 contact:
 *                   $ref: '#/components/schemas/EmergencyContact'
 *                 totalContacts:
 *                   type: number
 *                   description: Total number of emergency contacts
 *       400:
 *         description: Invalid contact data or contact already exists
 *       401:
 *         description: Unauthorized - Token required
 */
router.post('/emergency-contact', authenticateToken, addEmergencyContact);

/**
 * @swagger
 * /api/panic/emergency-contact:
 *   delete:
 *     summary: Remove emergency contact
 *     tags: [Panic Button]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RemoveContact'
 *     responses:
 *       200:
 *         description: Emergency contact removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contacto de emergencia eliminado correctamente"
 *                 totalContacts:
 *                   type: number
 *                   description: Remaining number of emergency contacts
 *       400:
 *         description: Contact not found
 *       401:
 *         description: Unauthorized - Token required
 *       404:
 *         description: Contact not found in emergency contacts list
 */
router.delete('/emergency-contact', authenticateToken, removeEmergencyContact);

export default router;