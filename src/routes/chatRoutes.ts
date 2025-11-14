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
 * tags:
 *   name: Chat
 *   description: Endpoints para gestión del chat entre usuarios
 */

/**
 * @swagger
 * /api/chat:
 *   get:
 *     summary: Obtener todas las conversaciones del usuario autenticado
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de conversaciones del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   participants:
 *                     type: array
 *                     items:
 *                       type: string
 *                   lastMessage:
 *                     type: object
 *                     properties:
 *                       message:
 *                         type: string
 *                       senderId:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                   unreadCount:
 *                     type: integer
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Token inválido o no enviado
 */
router.get('/', authenticateToken, httpGetConversations);

/**
 * @swagger
 * /api/chat/messages/{conversationId}:
 *   get:
 *     summary: Obtener los mensajes de una conversación
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la conversación existente
 *     responses:
 *       200:
 *         description: Lista de mensajes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   conversationId:
 *                     type: string
 *                   senderId:
 *                     type: string
 *                   message:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Conversation not found
 */
router.get('/messages/:conversationId', authenticateToken, httpGetMessages);

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Crear o encontrar una conversación entre el usuario y otro usuario o negocio
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientId
 *               - recipientModel
 *             properties:
 *               recipientId:
 *                 type: string
 *                 example: "60c72b2f9b1d8c001f8e4d2a"
 *               recipientModel:
 *                 type: string
 *                 example: "User"
 *                 enum: [User, Business]
 *                 description: Modelo del destinatario
 *     responses:
 *       201:
 *         description: Conversación encontrada o creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conversationId:
 *                   type: string
 *       400:
 *         description: Parámetros faltantes
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateToken, httpCreateConversation);

export default router;
