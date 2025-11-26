import { Conversation, IConversation } from '../models/conversation';
import { Message, IMessage } from '../models/message';
import User from '../models/user';
import Business from '../models/business';
import mongoose, { Types } from 'mongoose';

export class ChatService {
    
  async getConversationsForUser(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const conversations = await Conversation.find({
      "participants.participant": userObjectId
    })
    .populate({
      path: 'lastMessage',
      model: 'Message',
      populate: { path: 'sender', select: 'name username' }
    })
    .populate({
      path: 'participants.participant',
      select: 'name username avatar email role' 
    })
    .sort({ updatedAt: -1 });

    const formattedConversations = conversations.map(convo => {
      const otherParticipantObj = convo.participants.find(p => {
          return p.participant && (p.participant as any)._id.toString() !== userId;
      });

      const otherParticipant = otherParticipantObj?.participant;

      if (!otherParticipant) {
          return `Error: Chat ID ${convo._id} corrupto o usuario eliminado.`;
      }

      const pData = otherParticipant as any;
      const mySettings = convo.settings.find(s => s.user.toString() === userId);

      return {
        id: convo._id,
        participantId: pData._id,
        name: pData.name || pData.username || 'Sin Nombre',
        avatar: pData.avatar || 'https://via.placeholder.com/150',
        type: pData.role ? 'user' : 'venue',
        lastMessage: (convo.lastMessage as any)?.text || '',
        lastMessageTime: (convo.lastMessage as any)?.createdAt || convo.updatedAt,
        unreadCount: 0,
        isPinned: mySettings?.isPinned || false,
      };
    });

    return formattedConversations;
  }

  async getMessagesForConversation(conversationId: string, userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 'asc' });

    await Message.updateMany(
      { 
        conversation: conversationId,
        sender: { $ne: userObjectId },
        readBy: { $nin: [userObjectId] }
      },
      { $addToSet: { readBy: userObjectId } }
    );

    return messages.map(msg => ({
      id: msg._id,
      senderId: msg.sender.toString(),
      text: msg.text,
      timestamp: msg.createdAt,
      read: msg.readBy.length > 0
    }));
  }

  async findOrCreateConversation(
    participant1Id: string, 
    participant1Model: 'User' | 'Business',
    participant2Id: string, 
    participant2Model: 'User' | 'Business'
  ): Promise<IConversation> {
    
    const p1Id = new mongoose.Types.ObjectId(participant1Id);
    const p2Id = new mongoose.Types.ObjectId(participant2Id);

    let conversation = await Conversation.findOne({
      $and: [
        { "participants": { $elemMatch: { participant: p1Id, participantModel: participant1Model } } },
        { "participants": { $elemMatch: { participant: p2Id, participantModel: participant2Model } } },
        { "participants": { $size: 2 } }
      ]
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [
          { participant: p1Id, participantModel: participant1Model },
          { participant: p2Id, participantModel: participant2Model }
        ],
        settings: []
      });
      await conversation.save();
    }
    return conversation;
  }

  async createMessage(
    conversationId: string, 
    senderId: string, 
    senderModel: 'User' | 'Business', 
    text: string
  ) {
    try {
      if (!mongoose.Types.ObjectId.isValid(conversationId)) {
          throw new Error('Invalid conversationId');
      }

      const newMessage = new Message({
        conversation: conversationId,
        sender: senderId,
        senderModel: senderModel,
        text: text,
        readBy: [senderId]
      });

      await newMessage.save(); 
      await Conversation.findByIdAndUpdate(
        conversationId,
        { 
          lastMessage: newMessage._id, 
          $set: { updatedAt: new Date() } 
        }
      );

      const populatedMessage = await Message.findById(newMessage._id)
        .populate({
          path: 'sender',
          model: senderModel,
          select: 'username name avatar'
        });
        
      return populatedMessage;

    } catch (error) {
      throw new Error(`Error creating message: ${(error as Error).message}`);
    }
  }
}