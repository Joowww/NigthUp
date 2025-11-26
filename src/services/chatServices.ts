import { Conversation } from '../models/conversation';
import { Message } from '../models/message';
import mongoose from 'mongoose';

export class ChatService {
    
  async getConversationsForUser(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const conversations = await Conversation.find({
      participants: { $in: [userObjectId] }
    })
    .populate({
      path: 'lastMessage',
      select: 'text createdAt sender isDeleted',
      populate: { path: 'sender', select: 'name username' }
    })
    .populate('participants', 'name username avatar email')
    .sort({ updatedAt: -1 });

    const formattedConversations = conversations.map(convo => {
      const isGroup = convo.isGroup;
      let name, avatar;

      if (isGroup) {
          name = convo.groupName || 'Grupo';
          avatar = convo.groupAvatar || 'https://via.placeholder.com/150';
      } else {
          const other = convo.participants.find((p: any) => p._id.toString() !== userId) as any;
          name = other?.name || other?.username || 'Usuario Desconocido';
          avatar = other?.avatar || 'https://via.placeholder.com/150';
      }

      const lastMsg = convo.lastMessage as any;
      const previewText = lastMsg?.isDeleted ? '🚫 Mensaje eliminado' : (lastMsg?.text || '');

      return {
        id: convo._id,
        isGroup,
        name,
        avatar,
        lastMessage: previewText,
        lastMessageTime: lastMsg?.createdAt || convo.updatedAt,
      };
    });

    return formattedConversations;
  }

  async getMessagesForConversation(conversationId: string, userId: string) {
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name username avatar')
      .populate('replyTo', 'text sender')
      .sort({ createdAt: 'asc' });

    await Message.updateMany(
      { conversation: conversationId, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );

    return messages.map(msg => ({
      id: msg._id,
      sender: msg.sender,
      text: msg.isDeleted ? 'Mensaje eliminado' : msg.text,
      createdAt: msg.createdAt,
      isEdited: msg.isEdited,
      isDeleted: msg.isDeleted,
      replyTo: msg.replyTo,
      reactions: msg.reactions,
      read: msg.readBy.length > 1
    }));
  }

  async findOrCreateConversation(senderId: string, recipientId: string) {
    let conversation = await Conversation.findOne({
      isGroup: false,
      participants: { $all: [senderId, recipientId], $size: 2 }
    });

    if (!conversation) {
      conversation = new Conversation({
        isGroup: false,
        participants: [senderId, recipientId],
        settings: []
      });
      await conversation.save();
    }
    return conversation;
  }

  async createGroup(creatorId: string, name: string, participants: string[]) {
    const allParticipants = Array.from(new Set([creatorId, ...participants]));
    const group = new Conversation({
        isGroup: true,
        groupName: name,
        groupAdmins: [creatorId],
        participants: allParticipants,
        settings: []
    });
    return await group.save();
  }

  // ✅ RENOMBRADO: sendMessage (en lugar de createMessage)
  async sendMessage(
    conversationId: string, 
    senderId: string, 
    senderModel: 'User' | 'Business', // Añadido para compatibilidad
    text: string, 
    replyToId?: string
  ) {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      throw new Error('Invalid conversation ID');
    }

    const newMessage = new Message({
      conversation: conversationId,
      sender: senderId,
      senderModel: senderModel, // Guardamos el tipo de sender
      text: text,
      readBy: [senderId],
      replyTo: replyToId ? new mongoose.Types.ObjectId(replyToId) : undefined
    });

    await newMessage.save();

    // Actualizar última actividad de la conversación
    await Conversation.findByIdAndUpdate(conversationId, { 
      lastMessage: {
        message: text,
        senderId: new mongoose.Types.ObjectId(senderId),
        createdAt: newMessage.createdAt
      },
      updatedAt: new Date() 
    });

    return await newMessage.populate([
        { path: 'sender', select: 'username name avatar' },
        { path: 'replyTo', select: 'text sender' }
    ]);
  }

  async deleteMessage(messageId: string, userId: string) {
     const msg = await Message.findOne({ _id: messageId, sender: userId });
     if (!msg) throw new Error("No encontrado o no autorizado");
     msg.isDeleted = true;
     await msg.save();
     return msg;
  }

  async editMessage(messageId: string, userId: string, text: string) {
      const msg = await Message.findOne({ _id: messageId, sender: userId });
      if (!msg || msg.isDeleted) throw new Error("Error editando mensaje");
      msg.text = text;
      msg.isEdited = true;
      await msg.save();
      return msg;
  }

  async reactToMessage(messageId: string, userId: string, emoji: string) {
      const msg = await Message.findById(messageId);
      if (!msg) throw new Error("Mensaje no encontrado");
      
      const idx = msg.reactions.findIndex(r => r.user.toString() === userId && r.emoji === emoji);
      if (idx > -1) {
        msg.reactions.splice(idx, 1); // Quitar reacción
      } else {
        msg.reactions.push({ user: new mongoose.Types.ObjectId(userId), emoji }); // Añadir
      }
      
      await msg.save();
      return msg;
  }

  // Alias para compatibilidad con código antiguo
  async createMessage(conversationId: string, senderId: string, text: string, replyToId?: string) {
    return this.sendMessage(conversationId, senderId, 'User', text, replyToId);
  }
}