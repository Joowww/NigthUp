import { Conversation } from '../models/conversation';
import Message, { IMessage } from '../models/message';
import mongoose from 'mongoose';

export class ChatService {
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
      .populate({
        path: 'groupPolls',
        populate: {
          path: 'creator',
          select: 'username email avatar'
        }
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

      const unreadCount = await Message.countDocuments({
        conversation: convo._id,
        sender: { $ne: userObjectId },
        readBy: { $ne: userObjectId }
      });

      // const groupPolls = isGroup && convo.groupPolls ? convo.groupPolls.map((poll: any) => ({
      //   id: poll._id.toString(),
      //   question: poll.question,
      //   options: poll.options.map((opt: any) => ({
      //     text: opt.text,
      //     voters: opt.voters.map((v: any) => v.toString())
      //   })),
      //   creator: poll.creator ? {
      //     id: poll.creator._id?.toString() || poll.creator.toString(),
      //     username: poll.creator.username || 'Usuario',
      //     email: poll.creator.email || ''
      //   } : null,
      //   isActive: poll.isActive,
      //   expiresAt: poll.expiresAt,
      //   createdAt: poll.createdAt
      // })) : undefined;

      const groupPolls = isGroup && convo.groupPolls ? convo.groupPolls.map((poll: any) => {
        console.log('🔍 DEBUG chatServices - poll._id:', poll._id);
        console.log('🔍 DEBUG chatServices - typeof poll._id:', typeof poll._id);

        const pollId = poll._id?.toString() || '';
        console.log('🔍 DEBUG chatServices - pollId después de toString():', pollId);
        console.log('🔍 DEBUG chatServices - pollId.length:', pollId.length);

        const result = {
          id: pollId,
          question: poll.question,
          options: poll.options.map((opt: any) => ({
            text: opt.text,
            voters: opt.voters.map((v: any) => v.toString())
          })),
          creator: poll.creator ? {
            id: poll.creator._id?.toString() || poll.creator.toString(),
            username: poll.creator.username || 'Usuario',
            email: poll.creator.email || ''
          } : null,
          isActive: poll.isActive,
          expiresAt: poll.expiresAt,
          createdAt: poll.createdAt
        };

        console.log('🔍 DEBUG chatServices - result.id:', result.id);
        console.log('🔍 DEBUG chatServices - result completo:', JSON.stringify(result, null, 2));

        return result;
      }) : undefined;

      return {
        id: convo._id,
        isGroup,
        name,
        avatar,
        lastMessage: previewText,
        lastMessageTime,
        participants: convo.participants
          .filter((p: any) => p.participant)
          .map((p: any) => p.participant._id.toString()),
        unreadCount,
        ...(isGroup && groupPolls ? { groupPolls } : {})
      };
    }));

    return formattedConversations;
  }

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

    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        readBy: { $ne: userId }
      },
      { $addToSet: { readBy: userId } }
    );

    return messages.map((msg: IMessage) => ({
      _id: msg._id,
      conversation: msg.conversation,
      sender: msg.sender,
      text: msg.isDeleted ? 'Mensaje eliminado' : msg.text,
      messageType: msg.messageType,
      imageUrl: msg.imageUrl,
      audioUrl: msg.audioUrl,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
      isEdited: msg.isEdited,
      isDeleted: msg.isDeleted,
      replyTo: msg.replyTo,
      reactions: msg.reactions,
      readBy: msg.readBy
    }));
  }

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

    let conversation = await Conversation.findOne({
      isGroup: false,
      $and: [
        { 'participants.participant': senderObjectId },
        { 'participants.participant': recipientObjectId }
      ]
    }).populate('participants.participant', 'name username avatar');

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

      conversation = await Conversation.findById(conversation._id)
        .populate('participants.participant', 'name username avatar');

      if (!conversation) {
        throw new Error('Failed to retrieve created conversation');
      }
    }

    return conversation;
  }

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

    for (const participantId of participants) {
      if (!mongoose.Types.ObjectId.isValid(participantId)) {
        throw new Error(`Invalid participant ID: ${participantId}`);
      }
    }

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
      groupAvatar: 'https://via.placeholder.com/150',
      groupAdmins: [new mongoose.Types.ObjectId(creatorId)],
      participants: participantsArray,
      settings: []
    });

    await group.save();

    const populatedGroup = await Conversation.findById(group._id)
      .populate('participants.participant', 'name username avatar email');

    if (!populatedGroup) {
      throw new Error('Failed to retrieve created group');
    }

    return populatedGroup;
  }

  async sendMessage(data: {
    conversationId: string;
    senderId: string;
    text: string;
    imageUrl?: string;
    audioUrl?: string;
    messageType?: 'text' | 'image' | 'audio';
    replyTo?: string;
  }) {
    const conversation = await Conversation.findById(data.conversationId);
    if (!conversation) {
      throw new Error('Conversación no encontrada');
    }

    const hasAccess = await this.hasAccessToConversation(data.conversationId, data.senderId);
    if (!hasAccess) {
      throw new Error('No tienes acceso a esta conversación');
    }

    const bannedWords = [
      'puta', 'mierda', 'cabron', 'cabrón', 'joder', 'gilipollas', 'capullo', 'imbécil',
      'fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy', 'bastard'
    ];

    let cleanText = data.text || '';

    bannedWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      cleanText = cleanText.replace(regex, (match) => {
        return match[0] + '*'.repeat(match.length - 1);
      });
    });

    const message = await Message.create({
      conversation: data.conversationId,
      sender: data.senderId,
      text: cleanText,
      messageType: data.messageType || 'text',
      imageUrl: data.imageUrl,
      audioUrl: data.audioUrl,
      replyTo: data.replyTo,
      readBy: [data.senderId],
    });

    let previewText = message.text;
    if (message.messageType === 'image') previewText = '📸 Imagen';
    if (message.messageType === 'audio') previewText = '🎵 Audio';

    conversation.lastMessage = {
      message: previewText,
      senderId: message.sender,
      createdAt: message.createdAt
    } as any;
    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username email avatar')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'username' },
      })
      .lean();

    return populatedMessage;
  }

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
    const existingReactionIndex = message.reactions.findIndex(r =>
      r.user.toString() === userId && r.emoji === emoji.trim()
    );

    if (existingReactionIndex > -1) {
      message.reactions.splice(existingReactionIndex, 1);
    } else {
      message.reactions.push({ user: userObjectId, emoji: emoji.trim() });
    }

    await message.save();
    return message;
  }

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

    for (const messageId of messageIds) {
      if (!mongoose.Types.ObjectId.isValid(messageId)) {
        throw new Error(`Invalid message ID: ${messageId}`);
      }
    }

    const result = await Message.updateMany(
      {
        _id: { $in: messageIds },
        conversation: conversationId,
        sender: { $ne: userId }
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