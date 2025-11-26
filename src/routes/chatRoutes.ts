import { Router } from 'express';
import { 
    httpGetConversations, 
    httpGetMessages,
    httpCreateConversation,
    httpCreateGroup,
    httpSendMessage,
    httpEditMessage,
    httpDeleteMessage,
    httpReactToMessage
} from '../controller/chatController';
import { authenticateToken } from '../auth/middleware';

const router = Router();

/**
 * @swagger
 * /api/chat:
 *   get:
 *     summary: 📋 Obtener todas mis conversaciones
 *     description: Lista todas las conversaciones donde participo (chats privados y grupos)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
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
 *                     example: "650c1f1e8a9b..."
 *                   isGroup:
 *                     type: boolean
 *                     example: false
 *                   name:
 *                     type: string
 *                     example: "John Doe"
 *                   avatar:
 *                     type: string
 *                     example: "https://via.placeholder.com/150"
 *                   lastMessage:
 *                     type: string
 *                     example: "Hola, ¿cómo estás?"
 *                   lastMessageTime:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: No autorizado
 */
router.get('/', authenticateToken, httpGetConversations);

/**
 * @swagger
 * /api/chat/conversation:
 *   post:
 *     summary: 💬 Iniciar chat privado (1 a 1)
 *     description: Crea o encuentra una conversación privada con otro usuario
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
 *             properties:
 *               recipientId:
 *                 type: string
 *                 description: ID del destinatario
 *                 example: "690aac54af3cc26097338d6e"
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
 *                   example: "691f3e5d57c98c4236367f91"
 *                 message:
 *                   type: string
 *                   example: "Conversation ready"
 *       400:
 *         description: recipientId es requerido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "recipientId is required"
 *       401:
 *         description: No autorizado
 */
router.post('/conversation', authenticateToken, httpCreateConversation);

/**
 * @swagger
 * /api/chat/group:
 *   post:
 *     summary: 👥 Crear grupo
 *     description: Crea un nuevo chat grupal con múltiples participantes
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
 *               - name
 *               - participants
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del grupo
 *                 example: "Equipo de Fútbol"
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs de usuarios a añadir (sin incluirte)
 *                 example: ["690aac54af3cc26097338d6e", "690bbc65bg4dd37108449e7f"]
 *     responses:
 *       201:
 *         description: Grupo creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 groupId:
 *                   type: string
 *                   example: "691f3e5d57c98c4236367f91"
 *                 name:
 *                   type: string
 *                   example: "Equipo de Fútbol"
 *                 participants:
 *                   type: array
 *                   items:
 *                     type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/group', authenticateToken, httpCreateGroup);

/**
 * @swagger
 * /api/chat/{conversationId}/messages:
 *   get:
 *     summary: 📜 Ver historial de mensajes
 *     description: Obtiene todos los mensajes de una conversación específica
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
 *         example: "691f3e5d57c98c4236367f91"
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
 *                   id:
 *                     type: string
 *                     example: "691f3e5d57c98c4236367f92"
 *                   sender:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       username:
 *                         type: string
 *                       avatar:
 *                         type: string
 *                   text:
 *                     type: string
 *                     example: "Hola, ¿qué tal?"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   isEdited:
 *                     type: boolean
 *                   isDeleted:
 *                     type: boolean
 *                   reactions:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         user:
 *                           type: string
 *                         emoji:
 *                           type: string
 *                   read:
 *                     type: boolean
 *       403:
 *         description: No tienes acceso a esta conversación
 *       404:
 *         description: Conversación no encontrada
 */
router.get('/:conversationId/messages', authenticateToken, httpGetMessages);

/**
 * @swagger
 * /api/chat/message:
 *   post:
 *     summary: ✉️ Enviar mensaje
 *     description: Envía un nuevo mensaje a una conversación
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
 *                 description: ID de la conversación
 *                 example: "691f3e5d57c98c4236367f91"
 *               text:
 *                 type: string
 *                 description: Contenido del mensaje
 *                 example: "Hola, ¿cómo estás?"
 *               replyTo:
 *                 type: string
 *                 description: (Opcional) ID del mensaje a responder
 *                 example: "691f3e5d57c98c4236367f92"
 *     responses:
 *       201:
 *         description: Mensaje enviado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 conversation:
 *                   type: string
 *                 sender:
 *                   type: object
 *                 text:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 isEdited:
 *                   type: boolean
 *                 isDeleted:
 *                   type: boolean
 *       400:
 *         description: Datos faltantes
 *       403:
 *         description: No tienes acceso a esta conversación
 */
router.post('/message', authenticateToken, httpSendMessage);

/**
 * @swagger
 * /api/chat/message/{messageId}:
 *   put:
 *     summary: ✏️ Editar mensaje
 *     description: Modifica el texto de un mensaje propio
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         example: "691f3e5d57c98c4236367f92"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: Nuevo texto
 *                 example: "Mensaje corregido"
 *     responses:
 *       200:
 *         description: Mensaje editado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 text:
 *                   type: string
 *                 isEdited:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Error al editar
 *       403:
 *         description: No eres el autor
 */
router.put('/message/:messageId', authenticateToken, httpEditMessage);

/**
 * @swagger
 * /api/chat/message/{messageId}:
 *   delete:
 *     summary: 🗑️ Eliminar mensaje
 *     description: Marca el mensaje como eliminado (soft delete)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         example: "691f3e5d57c98c4236367f92"
 *     responses:
 *       200:
 *         description: Mensaje eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Message deleted"
 *                 messageId:
 *                   type: string
 *       400:
 *         description: Error al eliminar
 *       403:
 *         description: No autorizado
 */
router.delete('/message/:messageId', authenticateToken, httpDeleteMessage);

/**
 * @swagger
 * /api/chat/message/{messageId}/react:
 *   post:
 *     summary: 👍 Reaccionar a mensaje
 *     description: Añade o quita una reacción emoji
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         example: "691f3e5d57c98c4236367f92"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emoji
 *             properties:
 *               emoji:
 *                 type: string
 *                 description: Emoji a usar
 *                 example: "👍"
 *     responses:
 *       200:
 *         description: Reacción actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messageId:
 *                   type: string
 *                 reactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user:
 *                         type: string
 *                       emoji:
 *                         type: string
 *       400:
 *         description: emoji es requerido
 */
router.post('/message/:messageId/react', authenticateToken, httpReactToMessage);

export default router;