import { Router } from 'express';
import {
    httpGetConversations,
    httpGetMessages,
    httpCreateConversation,
    httpCreateGroup
} from '../controller/chatController';
import { authenticateToken } from '../auth/middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Conversation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID de la conversación
 *           example: "650c1f1e8a9b2c3d4e5f6789"
 *         isGroup:
 *           type: boolean
 *           description: Indica si es un grupo o chat privado
 *           example: false
 *         name:
 *           type: string
 *           description: Nombre del usuario o grupo
 *           example: "John Doe"
 *         avatar:
 *           type: string
 *           description: URL del avatar
 *           example: "https://via.placeholder.com/150"
 *         lastMessage:
 *           type: string
 *           description: Último mensaje enviado
 *           example: "Hola, ¿cómo estás?"
 *         lastMessageTime:
 *           type: string
 *           format: date-time
 *           description: Fecha del último mensaje
 *           example: "2024-01-15T10:30:00Z"
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *           description: IDs de los participantes
 *           example: ["650c1f1e8a9b2c3d4e5f6789", "650c1f1e8a9b2c3d4e5f6790"]
 *         unreadCount:
 *           type: integer
 *           description: Cantidad de mensajes no leídos
 *           example: 3
 * 
 *     Message:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID del mensaje
 *           example: "650c1f1e8a9b2c3d4e5f6791"
 *         conversation:
 *           type: string
 *           description: ID de la conversación
 *           example: "650c1f1e8a9b2c3d4e5f6789"
 *         sender:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             username:
 *               type: string
 *             avatar:
 *               type: string
 *           description: Información del remitente
 *         text:
 *           type: string
 *           description: Contenido del mensaje
 *           example: "Hola, ¿qué tal?"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *         isEdited:
 *           type: boolean
 *           description: Indica si el mensaje fue editado
 *           example: false
 *         isDeleted:
 *           type: boolean
 *           description: Indica si el mensaje fue eliminado
 *           example: false
 *         replyTo:
 *           type: object
 *           nullable: true
 *           description: Mensaje al que se está respondiendo
 *         reactions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *               emoji:
 *                 type: string
 *           description: Reacciones del mensaje
 *           example: [{ "user": "650c1f1e8a9b2c3d4e5f6789", "emoji": "👍" }]
 *         readBy:
 *           type: array
 *           items:
 *             type: string
 *           description: IDs de usuarios que leyeron el mensaje
 *           example: ["650c1f1e8a9b2c3d4e5f6789"]
 * 
 *     Group:
 *       type: object
 *       properties:
 *         groupId:
 *           type: string
 *           description: ID del grupo
 *           example: "650c1f1e8a9b2c3d4e5f6792"
 *         name:
 *           type: string
 *           description: Nombre del grupo
 *           example: "Equipo de Fútbol"
 *         participants:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               participant:
 *                 type: string
 *               participantModel:
 *                 type: string
 *               role:
 *                 type: string
 *           description: Lista de participantes
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del grupo
 * 
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: API de mensajería y conversaciones
 */

/**
 * @swagger
 * /api/chat:
 *   get:
 *     summary: Obtener todas mis conversaciones
 *     description: |
 *       Retorna la lista completa de conversaciones (chats privados y grupos) 
 *       donde el usuario autenticado es participante. Incluye información del 
 *       último mensaje, cantidad de no leídos y datos de los participantes.
 *       
 *       **Nota:** Esta es una ruta HTTP para cargar datos históricos. 
 *       Para recibir mensajes en tiempo real, usa WebSocket.
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de conversaciones obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Conversation'
 *             example:
 *               - id: "650c1f1e8a9b2c3d4e5f6789"
 *                 isGroup: false
 *                 name: "John Doe"
 *                 avatar: "https://via.placeholder.com/150"
 *                 lastMessage: "Hola, ¿cómo estás?"
 *                 lastMessageTime: "2024-01-15T10:30:00Z"
 *                 participants: ["650c1f1e8a9b2c3d4e5f6789", "650c1f1e8a9b2c3d4e5f6790"]
 *                 unreadCount: 3
 *               - id: "650c1f1e8a9b2c3d4e5f6793"
 *                 isGroup: true
 *                 name: "Equipo de Trabajo"
 *                 avatar: "https://via.placeholder.com/150"
 *                 lastMessage: "¿Nos vemos mañana?"
 *                 lastMessageTime: "2024-01-15T09:15:00Z"
 *                 participants: ["650c1f1e8a9b2c3d4e5f6789", "650c1f1e8a9b2c3d4e5f6790", "650c1f1e8a9b2c3d4e5f6791"]
 *                 unreadCount: 0
 *       401:
 *         description: No autorizado - Token inválido o no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to get conversations"
 *                 details:
 *                   type: string
 *                   example: "Database connection error"
 */
router.get('/', authenticateToken, httpGetConversations);

/**
 * @swagger
 * /api/chat/{conversationId}/messages:
 *   get:
 *     summary: Obtener historial de mensajes de una conversación
 *     description: |
 *       Retorna todos los mensajes de una conversación específica ordenados 
 *       cronológicamente. Automáticamente marca los mensajes como leídos 
 *       por el usuario que los solicita.
 *       
 *       **Nota:** Esta es una ruta HTTP para cargar historial. 
 *       Para recibir nuevos mensajes en tiempo real, usa WebSocket con el evento `newMessage`.
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
 *         example: "650c1f1e8a9b2c3d4e5f6789"
 *     responses:
 *       200:
 *         description: Lista de mensajes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *             example:
 *               - _id: "650c1f1e8a9b2c3d4e5f6791"
 *                 conversation: "650c1f1e8a9b2c3d4e5f6789"
 *                 sender:
 *                   _id: "650c1f1e8a9b2c3d4e5f6790"
 *                   name: "John Doe"
 *                   username: "johndoe"
 *                   avatar: "https://via.placeholder.com/150"
 *                 text: "Hola, ¿qué tal?"
 *                 createdAt: "2024-01-15T10:30:00Z"
 *                 updatedAt: "2024-01-15T10:30:00Z"
 *                 isEdited: false
 *                 isDeleted: false
 *                 replyTo: null
 *                 reactions: []
 *                 readBy: ["650c1f1e8a9b2c3d4e5f6789", "650c1f1e8a9b2c3d4e5f6790"]
 *               - _id: "650c1f1e8a9b2c3d4e5f6792"
 *                 conversation: "650c1f1e8a9b2c3d4e5f6789"
 *                 sender:
 *                   _id: "650c1f1e8a9b2c3d4e5f6789"
 *                   name: "Jane Smith"
 *                   username: "janesmith"
 *                   avatar: "https://via.placeholder.com/150"
 *                 text: "¡Todo bien! ¿Y tú?"
 *                 createdAt: "2024-01-15T10:31:00Z"
 *                 updatedAt: "2024-01-15T10:31:00Z"
 *                 isEdited: false
 *                 isDeleted: false
 *                 replyTo:
 *                   _id: "650c1f1e8a9b2c3d4e5f6791"
 *                   sender:
 *                     username: "johndoe"
 *                   text: "Hola, ¿qué tal?"
 *                 reactions:
 *                   - user: "650c1f1e8a9b2c3d4e5f6790"
 *                     emoji: "👍"
 *                 readBy: ["650c1f1e8a9b2c3d4e5f6789"]
 *       401:
 *         description: No autorizado - Token inválido o no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       403:
 *         description: Acceso denegado - No eres participante de esta conversación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "You do not have access to this conversation"
 *       404:
 *         description: Conversación no encontrada
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to get messages"
 *                 details:
 *                   type: string
 */
router.get('/:conversationId/messages', authenticateToken, httpGetMessages);

/**
 * @swagger
 * /api/chat/conversation:
 *   post:
 *     summary: Crear o encontrar chat privado (1 a 1)
 *     description: |
 *       Crea una nueva conversación privada con otro usuario o retorna una existente 
 *       si ya hay una conversación entre ambos usuarios. Esta es la forma de iniciar 
 *       un chat directo con un amigo.
 *       
 *       **Flujo:**
 *       1. Se busca si ya existe una conversación entre ambos usuarios
 *       2. Si existe, retorna el ID de esa conversación
 *       3. Si no existe, crea una nueva y retorna su ID
 *       
 *       **Después de crear/obtener la conversación:**
 *       - El frontend debe hacer `joinRoom` via WebSocket con el `conversationId`
 *       - Cargar mensajes con `GET /api/chat/{conversationId}/messages`
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
 *                 description: ID del usuario con quien quieres chatear
 *                 example: "650c1f1e8a9b2c3d4e5f6790"
 *           example:
 *             recipientId: "650c1f1e8a9b2c3d4e5f6790"
 *     responses:
 *       201:
 *         description: Conversación creada o encontrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conversationId:
 *                   type: string
 *                   description: ID de la conversación
 *                   example: "650c1f1e8a9b2c3d4e5f6789"
 *                 message:
 *                   type: string
 *                   example: "Conversation ready"
 *             example:
 *               conversationId: "650c1f1e8a9b2c3d4e5f6789"
 *               message: "Conversation ready"
 *       400:
 *         description: Datos faltantes o inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "recipientId is required"
 *       401:
 *         description: No autorizado - Token inválido o no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to create conversation"
 *                 details:
 *                   type: string
 */
router.post('/conversation', authenticateToken, httpCreateConversation);

/**
 * @swagger
 * /api/chat/group:
 *   post:
 *     summary: Crear un nuevo grupo de chat
 *     description: |
 *       Crea un nuevo chat grupal con múltiples participantes. El usuario autenticado 
 *       será automáticamente el creador y administrador del grupo.
 *       
 *       **Características del grupo:**
 *       - El creador se añade automáticamente como participante
 *       - El creador se asigna como administrador (role: 'creator')
 *       - Otros participantes se añaden con role: 'member'
 *       - Se puede personalizar nombre y avatar del grupo
 *       
 *       **Después de crear el grupo:**
 *       - Se emite evento WebSocket `newGroup` a todos los participantes
 *       - El frontend debe hacer `joinRoom` via WebSocket con el `groupId`
 *       - Todos los participantes reciben notificación del nuevo grupo
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
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: "Equipo de Fútbol"
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array de IDs de usuarios a añadir (sin incluir el creador)
 *                 minItems: 1
 *                 example: ["650c1f1e8a9b2c3d4e5f6790", "650c1f1e8a9b2c3d4e5f6791"]
 *           example:
 *             name: "Equipo de Fútbol"
 *             participants: ["650c1f1e8a9b2c3d4e5f6790", "650c1f1e8a9b2c3d4e5f6791", "650c1f1e8a9b2c3d4e5f6792"]
 *     responses:
 *       201:
 *         description: Grupo creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *             example:
 *               groupId: "650c1f1e8a9b2c3d4e5f6793"
 *               name: "Equipo de Fútbol"
 *               participants:
 *                 - participant: "650c1f1e8a9b2c3d4e5f6789"
 *                   participantModel: "User"
 *                   role: "creator"
 *                   joinedAt: "2024-01-15T10:30:00Z"
 *                 - participant: "650c1f1e8a9b2c3d4e5f6790"
 *                   participantModel: "User"
 *                   role: "member"
 *                   joinedAt: "2024-01-15T10:30:00Z"
 *                 - participant: "650c1f1e8a9b2c3d4e5f6791"
 *                   participantModel: "User"
 *                   role: "member"
 *                   joinedAt: "2024-01-15T10:30:00Z"
 *               createdAt: "2024-01-15T10:30:00Z"
 *       400:
 *         description: Datos faltantes o inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             examples:
 *               missing_fields:
 *                 value:
 *                   error: "name and participants array are required"
 *               insufficient_participants:
 *                 value:
 *                   error: "Group must have at least 2 participants"
 *       401:
 *         description: No autorizado - Token inválido o no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to create group"
 *                 details:
 *                   type: string
 */
router.post('/group', authenticateToken, httpCreateGroup);

export default router;