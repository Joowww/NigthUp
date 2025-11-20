import { Router } from 'express';
import { 
    httpGetConversations, 
    httpGetMessages,
    httpCreateConversation,
    httpSendMessage
} from '../controller/chatController';
import { authenticateToken } from '../auth/middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Endpoints para gestión del chat entre usuarios y negocios
 */

/**
 * @swagger
 * /api/chat:
 *   get:
 *     summary: Obtener la bandeja de entrada (chats) del usuario
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de conversaciones formateada para la UI
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID de la conversación
 *                   participantId:
 *                     type: string
 *                     description: ID del otro usuario o negocio
 *                   name:
 *                     type: string
 *                     description: Nombre para mostrar
 *                   avatar:
 *                     type: string
 *                     description: URL del avatar
 *                   type:
 *                     type: string
 *                     enum: [user, venue]
 *                     description: Tipo de interlocutor
 *                   lastMessage:
 *                     type: string
 *                     description: Texto del último mensaje
 *                   lastMessageTime:
 *                     type: string
 *                     format: date-time
 *                   unreadCount:
 *                     type: integer
 *       401:
 *         description: Token inválido o no enviado
 */
router.get('/', authenticateToken, httpGetConversations);

/**
 * @swagger
 * /api/chat/messages/{conversationId}:
 *   get:
 *     summary: Obtener historial de mensajes de un chat
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
 *       200:
 *         description: Historial de mensajes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   senderId:
 *                     type: string
 *                   text:
 *                     type: string
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                   read:
 *                     type: boolean
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Conversación no encontrada
 */
router.get('/messages/:conversationId', authenticateToken, httpGetMessages);

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Iniciar un nuevo chat (o obtener uno existente)
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
 *                 description: ID del usuario o negocio con quien quieres hablar
 *                 example: "650c1f1e8a9b..."
 *               recipientModel:
 *                 type: string
 *                 enum: [User, Business]
 *                 description: Indica si el destinatario es un Usuario o un Negocio
 *                 example: "User"
 *     responses:
 *       201:
 *         description: Conversación lista
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conversationId:
 *                   type: string
 *       400:
 *         description: Faltan datos o son incorrectos
 *       401:
 *         description: No autorizado
 */
router.post('/', authenticateToken, httpCreateConversation);

/**
 * @swagger
 * /api/chat/message:
 *   post:
 *     summary: Enviar un mensaje de texto
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
 *               - conversationId
 *               - text
 *             properties:
 *               conversationId:
 *                 type: string
 *                 description: ID de la conversación (obtenido en POST /api/chat)
 *                 example: "650c1f1e8a9b..."
 *               text:
 *                 type: string
 *                 description: El mensaje a enviar
 *                 example: "Hola, ¿qué tal?"
 *     responses:
 *       201:
 *         description: Mensaje enviado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 text:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 sender:
 *                   type: string
 *                 conversation:
 *                   type: string
 *       400:
 *         description: Faltan datos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/message', authenticateToken, httpSendMessage);

export default router;