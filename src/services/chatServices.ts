import { Conversation } from '../models/conversation';
import Message, { IMessage } from '../models/message'; // ✅ CORRECCIÓN: default import + IMessage
import mongoose from 'mongoose';

export class ChatService {

  // ==================== OBTENER CONVERSACIONES ====================

  /**
   * Obtiene todas las conversaciones de un usuario con información formateada
   * @param userId - ID del usuario
   * @returns Array de conversaciones con datos formateados
   */
  async getConversationsForUser(userId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const conversations = await Conversation.find({
      'participants.participant': userObjectId
    })
      .populate({
        path: 'participants.participant',
        select: 'name username avatar email'
      })
      .sort({ updatedAt: -1 });

    const formattedConversations = await Promise.all(conversations.map(async (convo) => {
      const isGroup = convo.isGroup;
      let name, avatar;

      if (isGroup) {
        name = convo.groupName || 'Grupo';
        avatar = convo.groupAvatar || 'https://via.placeholder.com/150';
      } else {
        const otherParticipant = convo.participants.find(
          (p: any) => p.participant && p.participant._id.toString() !== userId
        ) as any;

        if (otherParticipant && otherParticipant.participant) {
          name = otherParticipant.participant.username ||
            otherParticipant.participant.name ||
            'Usuario';
          avatar = otherParticipant.participant.avatar ||
            'https://via.placeholder.com/150';
        } else {
          name = 'Usuario';
          avatar = 'https://via.placeholder.com/150';
        }
      }

      // Obtener último mensaje
      const lastMessage = await Message.findOne({
        conversation: convo._id
      })
        .sort({ createdAt: -1 })
        .populate('sender', 'name username');

      let previewText = '';
      let lastMessageTime = convo.updatedAt;

      if (lastMessage) {
        previewText = lastMessage.isDeleted ? 'Mensaje eliminado' : lastMessage.text;
        lastMessageTime = lastMessage.createdAt;
      }

      // Contar mensajes no leídos
      const unreadCount = await Message.countDocuments({
        conversation: convo._id,
        sender: { $ne: userObjectId },
        readBy: { $ne: userObjectId }
      });

      return {
        id: convo._id,
        isGroup,
        name,
        avatar,
        lastMessage: previewText,
        lastMessageTime,
        participants: convo.participants.map((p: any) => p.participant._id.toString()),
        unreadCount
      };
    }));

    return formattedConversations;
  }

  // ==================== OBTENER MENSAJES ====================

  /**
   * Obtiene todos los mensajes de una conversación y los marca como leídos
   * @param conversationId - ID de la conversación
   * @param userId - ID del usuario que solicita los mensajes
   * @returns Array de mensajes formateados
   */
  async getMessagesForConversation(conversationId: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      throw new Error('Invalid conversation ID');
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name username avatar')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'name username avatar' }
      })
      .sort({ createdAt: 'asc' });

    // Marcar mensajes como leídos (excepto los propios)
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        readBy: { $ne: userId }
      },
      { $addToSet: { readBy: userId } }
    );

    // ✅ CORRECCIÓN: Tipar msg como IMessage
    return messages.map((msg: IMessage) => ({
      _id: msg._id,
      conversation: msg.conversation,
      sender: msg.sender,
      text: msg.isDeleted ? 'Mensaje eliminado' : msg.text,
      messageType: msg.messageType,
      imageUrl: msg.imageUrl,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
      isEdited: msg.isEdited,
      isDeleted: msg.isDeleted,
      replyTo: msg.replyTo,
      reactions: msg.reactions,
      readBy: msg.readBy
    }));
  }

  // ==================== CREAR CONVERSACIÓN PRIVADA ====================

  /**
   * Busca una conversación privada existente o crea una nueva
   * @param senderId - ID del usuario que inicia la conversación
   * @param recipientId - ID del usuario destinatario
   * @returns Conversación encontrada o creada
   */
  async findOrCreateConversation(senderId: string, recipientId: string) {
    if (!mongoose.Types.ObjectId.isValid(senderId)) {
      throw new Error('Invalid sender ID');
    }

    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      throw new Error('Invalid recipient ID');
    }

    if (senderId === recipientId) {
      throw new Error('Cannot create conversation with yourself');
    }

    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    const recipientObjectId = new mongoose.Types.ObjectId(recipientId);

    // Buscar conversación existente
    let conversation = await Conversation.findOne({
      isGroup: false,
      $and: [
        { 'participants.participant': senderObjectId },
        { 'participants.participant': recipientObjectId }
      ]
    }).populate('participants.participant', 'name username avatar');

    // Si no existe, crear nueva conversación
    if (!conversation) {
      conversation = new Conversation({
        isGroup: false,
        participants: [
          {
            participant: senderObjectId,
            participantModel: 'User',
            role: 'member'
          },
          {
            participant: recipientObjectId,
            participantModel: 'User',
            role: 'member'
          }
        ],
        settings: []
      });

      await conversation.save();

      // Poblar después de guardar
      conversation = await Conversation.findById(conversation._id)
        .populate('participants.participant', 'name username avatar');

      if (!conversation) {
        throw new Error('Failed to retrieve created conversation');
      }
    }

    return conversation;
  }

  // ==================== CREAR GRUPO ====================

  /**
   * Crea un nuevo grupo de chat
   * @param creatorId - ID del usuario creador
   * @param name - Nombre del grupo
   * @param participants - Array de IDs de participantes (sin incluir creador)
   * @returns Grupo creado con participantes poblados
   */
  async createGroup(creatorId: string, name: string, participants: string[]) {
    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
      throw new Error('Invalid creator ID');
    }

    if (!name || name.trim().length === 0) {
      throw new Error('Group name is required');
    }

    if (!Array.isArray(participants) || participants.length === 0) {
      throw new Error('At least one participant is required');
    }

    // Validar que todos los IDs sean válidos
    for (const participantId of participants) {
      if (!mongoose.Types.ObjectId.isValid(participantId)) {
        throw new Error(`Invalid participant ID: ${participantId}`);
      }
    }

    // Asegurar que el creador está incluido y no hay duplicados
    const allParticipants = Array.from(new Set([creatorId, ...participants]));

    const participantsArray = allParticipants.map(id => ({
      participant: new mongoose.Types.ObjectId(id),
      participantModel: 'User' as const,
      role: id === creatorId ? ('creator' as const) : ('member' as const),
      joinedAt: new Date()
    }));

    const group = new Conversation({
      isGroup: true,
      groupName: name.trim(),
      groupAvatar: 'https://via.placeholder.com/150', // Avatar por defecto
      groupAdmins: [new mongoose.Types.ObjectId(creatorId)],
      participants: participantsArray,
      settings: []
    });

    await group.save();

    // Poblar participantes
    const populatedGroup = await Conversation.findById(group._id)
      .populate('participants.participant', 'name username avatar email');

    if (!populatedGroup) {
      throw new Error('Failed to retrieve created group');
    }

    return populatedGroup;
  }

  // ==================== ENVIAR MENSAJE ====================

  /**
   * Envía un mensaje de texto o imagen a una conversación
   * @param data - Datos del mensaje
   * @returns Mensaje creado con información poblada
   */
  async sendMessage(data: {
    conversationId: string;
    senderId: string;
    text: string;
    imageUrl?: string;
    messageType?: 'text' | 'image';
    replyTo?: string;
  }) {
    const conversation = await Conversation.findById(data.conversationId);
    if (!conversation) {
      throw new Error('Conversación no encontrada');
    }

    // Verificar acceso
    const hasAccess = await this.hasAccessToConversation(data.conversationId, data.senderId);
    if (!hasAccess) {
      throw new Error('No tienes acceso a esta conversación');
    }

    const message = await Message.create({
      conversation: data.conversationId,
      sender: data.senderId,
      text: data.text || '',
      messageType: data.messageType || 'text',
      imageUrl: data.imageUrl,
      replyTo: data.replyTo,
      readBy: [data.senderId],
    });

    // Actualizar último mensaje
    conversation.lastMessage = message._id as any;
    await conversation.save();

    // Poblar información
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username email avatar')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'username' },
      })
      .lean();

    return populatedMessage;
  }

  // ==================== EDITAR MENSAJE ====================

  /**
   * Edita un mensaje existente
   * @param messageId - ID del mensaje
   * @param userId - ID del usuario que edita (debe ser el autor)
   * @param text - Nuevo contenido del mensaje
   * @returns Mensaje editado
   */
  async editMessage(messageId: string, userId: string, text: string) {
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      throw new Error('Invalid message ID');
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    if (!text || text.trim().length === 0) {
      throw new Error('Message text is required');
    }

    const message = await Message.findOne({
      _id: messageId,
      sender: new mongoose.Types.ObjectId(userId)
    });

    if (!message) {
      throw new Error('Message not found or you are not the author');
    }

    if (message.isDeleted) {
      throw new Error('Cannot edit a deleted message');
    }

    message.text = text.trim();
    message.isEdited = true;
    await message.save();

    return message;
  }

  // ==================== ELIMINAR MENSAJE ====================

  /**
   * Elimina un mensaje (soft delete)
   * @param messageId - ID del mensaje
   * @param userId - ID del usuario que elimina (debe ser el autor)
   * @returns Mensaje eliminado
   */
  async deleteMessage(messageId: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      throw new Error('Invalid message ID');
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    const message = await Message.findOne({
      _id: messageId,
      sender: new mongoose.Types.ObjectId(userId)
    });

    if (!message) {
      throw new Error('Message not found or you are not the author');
    }

    if (message.isDeleted) {
      throw new Error('Message is already deleted');
    }

    message.isDeleted = true;
    message.text = 'Mensaje eliminado';
    await message.save();

    return message;
  }

  // ==================== REACCIONAR A MENSAJE ====================

  /**
   * Añade o quita una reacción a un mensaje
   * @param messageId - ID del mensaje
   * @param userId - ID del usuario que reacciona
   * @param emoji - Emoji de la reacción
   * @returns Mensaje con reacciones actualizadas
   */
  async reactToMessage(messageId: string, userId: string, emoji: string) {
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      throw new Error('Invalid message ID');
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    if (!emoji || emoji.trim().length === 0) {
      throw new Error('Emoji is required');
    }

    const message = await Message.findById(messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.isDeleted) {
      throw new Error('Cannot react to a deleted message');
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Buscar si ya existe una reacción del usuario con ese emoji
    const existingReactionIndex = message.reactions.findIndex(r =>
      r.user.toString() === userId && r.emoji === emoji.trim()
    );

    if (existingReactionIndex > -1) {
      // Quitar reacción si ya existe (toggle)
      message.reactions.splice(existingReactionIndex, 1);
    } else {
      // Añadir nueva reacción
      message.reactions.push({ user: userObjectId, emoji: emoji.trim() });
    }

    await message.save();
    return message;
  }

  // ==================== MARCAR COMO LEÍDO ====================

  /**
   * Marca múltiples mensajes como leídos por un usuario
   * @param conversationId - ID de la conversación
   * @param messageIds - Array de IDs de mensajes
   * @param userId - ID del usuario que lee
   */
  async markMessagesAsRead(conversationId: string, messageIds: string[], userId: string) {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      throw new Error('Invalid conversation ID');
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      throw new Error('Message IDs array is required');
    }

    // Validar todos los IDs
    for (const messageId of messageIds) {
      if (!mongoose.Types.ObjectId.isValid(messageId)) {
        throw new Error(`Invalid message ID: ${messageId}`);
      }
    }

    const result = await Message.updateMany(
      {
        _id: { $in: messageIds },
        conversation: conversationId,
        sender: { $ne: userId } // No marcar los propios mensajes
      },
      {
        $addToSet: { readBy: userId }
      }
    );

    return {
      success: true,
      modifiedCount: result.modifiedCount
    };
  }

  // ==================== VERIFICAR ACCESO A CONVERSACIÓN ====================

  /**
   * Verifica si un usuario tiene acceso a una conversación
   * @param conversationId - ID de la conversación
   * @param userId - ID del usuario
   * @returns true si tiene acceso, false si no
   */
  async hasAccessToConversation(conversationId: string, userId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      throw new Error('Invalid conversation ID');
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      'participants.participant': new mongoose.Types.ObjectId(userId)
    });

    return conversation !== null;
  }

  // ==================== OBTENER PARTICIPANTES ====================

  /**
   * Obtiene los IDs de todos los participantes de una conversación
   * @param conversationId - ID de la conversación
   * @returns Array de IDs de participantes
   */
  async getConversationParticipants(conversationId: string): Promise<string[]> {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      throw new Error('Invalid conversation ID');
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return conversation.participants.map(p => p.participant.toString());
  }
}