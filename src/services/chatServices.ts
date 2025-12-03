import { Conversation } from '../models/conversation';
import { Message } from '../models/message';
import mongoose from 'mongoose';

export class ChatService {
    
  async getConversationsForUser(userId: string) {
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
        // Buscar el otro participante
        const otherParticipant = convo.participants.find(
          (p: any) => p.participant && p.participant._id.toString() !== userId
        ) as any;
        
        if (otherParticipant && otherParticipant.participant) {
          name = otherParticipant.participant.name || 
                 otherParticipant.participant.username || 
                 'Usuario Desconocido';
          avatar = otherParticipant.participant.avatar || 
                   'https://via.placeholder.com/150';
        } else {
          // Si no encontramos al otro participante, mostramos información genérica
          name = 'Usuario Desconocido';
          avatar = 'https://via.placeholder.com/150';
        }
      }

      // Obtener el último mensaje
      const lastMessage = await Message.findOne({ 
        conversation: convo._id 
      })
      .sort({ createdAt: -1 })
      .populate('sender', 'name username');

      let previewText = '';
      let lastMessageTime = convo.updatedAt;

      if (lastMessage) {
        previewText = lastMessage.isDeleted ? '🚫 Mensaje eliminado' : lastMessage.text;
        lastMessageTime = lastMessage.createdAt;
      }

      const unreadCount = await Message.countDocuments({
        conversation: convo._id,
        readBy: { $ne: userId }
      });

      return {
        id: convo._id,
        isGroup,
        name,
        avatar,
        unreadCount,
        lastMessage: previewText,
        lastMessageTime,
        isPinned: false, // o tu lógica de pinned
        
        participants: convo.participants.map(p => p.participant),
      };
    }));

    return formattedConversations;
  }

  async getMessagesForConversation(conversationId: string, userId: string) {
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name username avatar')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'name username' }
      })
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

    if (!conversation) {
      // Crear nueva conversación
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
    }
    return conversation;
  }

  async createGroup(creatorId: string, name: string, participants: string[]) {
    const allParticipants = Array.from(new Set([creatorId, ...participants]));
    
    const participantsArray = allParticipants.map(id => ({
      participant: new mongoose.Types.ObjectId(id),
      participantModel: 'User',
      role: id === creatorId ? 'creator' : 'member',
      joinedAt: new Date()
    }));

    const group = new Conversation({
      isGroup: true,
      groupName: name,
      groupAdmins: [new mongoose.Types.ObjectId(creatorId)],
      participants: participantsArray,
      settings: []
    });
    
    await group.save();
    
    // Poblar los participantes después de guardar
    return await Conversation.findById(group._id)
      .populate('participants.participant', 'name username avatar email');
  }

  async sendMessage(
    conversationId: string, 
    senderId: string, 
    text: string, 
    replyToId?: string
  ) {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      throw new Error('Invalid conversation ID');
    }

    const newMessage = new Message({
      conversation: conversationId,
      sender: new mongoose.Types.ObjectId(senderId),
      text: text,
      readBy: [senderId],
      replyTo: replyToId ? new mongoose.Types.ObjectId(replyToId) : undefined
    });

    await newMessage.save();

    // Actualizar la conversación con el último mensaje
    await Conversation.findByIdAndUpdate(conversationId, { 
      lastMessage: {
        message: text,
        senderId: new mongoose.Types.ObjectId(senderId),
        createdAt: newMessage.createdAt
      },
      updatedAt: new Date() 
    });

    return await Message.findById(newMessage._id)
      .populate('sender', 'name username avatar')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'name username' }
      });
  }

  async deleteMessage(messageId: string, userId: string) {
     const msg = await Message.findOne({ 
       _id: messageId, 
       sender: new mongoose.Types.ObjectId(userId) 
     });
     if (!msg) throw new Error("No encontrado o no autorizado");
     msg.isDeleted = true;
     await msg.save();
     return msg;
  }

  async editMessage(messageId: string, userId: string, text: string) {
      const msg = await Message.findOne({ 
        _id: messageId, 
        sender: new mongoose.Types.ObjectId(userId) 
      });
      if (!msg || msg.isDeleted) throw new Error("Error editando mensaje");
      msg.text = text;
      msg.isEdited = true;
      await msg.save();
      return msg;
  }

  async reactToMessage(messageId: string, userId: string, emoji: string) {
      const msg = await Message.findById(messageId);
      if (!msg) throw new Error("Mensaje no encontrado");
      
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const idx = msg.reactions.findIndex(r => 
        r.user.toString() === userId && r.emoji === emoji
      );
      
      if (idx > -1) {
        msg.reactions.splice(idx, 1); 
      } else {
        msg.reactions.push({ user: userObjectId, emoji }); 
      }
      
      await msg.save();
      return msg;
  }
}