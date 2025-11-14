import { Router } from 'express';
import { 
    httpGetConversations, 
    httpGetMessages,
    httpCreateConversation
} from '../controller/chatController';
import { authenticateToken } from '../auth/middleware';

const router = Router();

/**
 * @swagger
 * /api/chat:
 *   get:
 *     summary: Obtener todas las conversaciones del usuario logueado
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de conversaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   avatar:
 *                     type: string
 *                   type:
 *                     type: string
 *                     example: "user"
 *                   lastMessage:
 *                     type: string
 *                   lastMessageTime:
 *                     type: string
 *                     format: date-time
 *                   unreadCount:
 *                     type: integer
 *                   isPinned:
 *                     type: boolean
 *       '401':
 *         description: Unauthorized
 */
router.get('/', authenticateToken, httpGetConversations);

/**
 * @swagger
 * /api/chat/messages/{conversationId}:
 *   get:
 *     summary: Obtener los mensajes de una conversación específica
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la conversación
 *     responses:
 *       '200':
 *         description: Lista de mensajes
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Conversation not found
 */
router.get('/messages/:conversationId', authenticateToken, httpGetMessages);

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Crear o encontrar una conversación con otro usuario o negocio
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipientId:
 *                 type: string
 *                 example: "60c72b2f9b1d8c001f8e4d2a"
 *               recipientModel:
 *                 type: string
 *                 example: "Business"
 *                 description: Puede ser 'User' o 'Business'
 *     responses:
 *       '201':
 *         description: Conversación encontrada o creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conversationId:
 *                   type: string
 *       '400':
 *         description: Faltan parámetros
 *       '401':
 *         description: Unauthorized
 */
router.post('/', authenticateToken, httpCreateConversation);

export default router;
