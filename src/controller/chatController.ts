import { Request, Response } from 'express';
import { ChatService } from '../services/chatServices';
import { Conversation } from '../models/conversation';
import mongoose from 'mongoose';

const chatService = new ChatService();

interface AuthenticatedRequest extends Request {
  user?: { id: string; role?: string };
}

// ==================== GET CONVERSACIONES ====================

export async function httpGetConversations(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const conversations = await chatService.getConversationsForUser(req.user.id);
    return res.status(200).json(conversations);
  } catch (e: any) {
    console.error('Error in httpGetConversations:', e);
    return res.status(500).json({ error: 'Failed to get conversations', details: e.message });
  }
}

// ==================== GET MENSAJES ====================

export async function httpGetMessages(req: AuthenticatedRequest, res: Response) {
  try {
    const { conversationId } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      'participants.participant': new mongoose.Types.ObjectId(req.user.id)
    });

    if (!conversation) {
      return res.status(403).json({ error: 'You do not have access to this conversation' });
    }

    const messages = await chatService.getMessagesForConversation(conversationId, req.user.id);
    return res.status(200).json(messages);
  } catch (e: any) {
    console.error('Error in httpGetMessages:', e);
    return res.status(500).json({ error: 'Failed to get messages', details: e.message });
  }
}

// ==================== CREAR CONVERSACIÓN PRIVADA ====================

export async function httpCreateConversation(req: AuthenticatedRequest, res: Response) {
  try {
    const { recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ error: 'recipientId is required' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const conversation = await chatService.findOrCreateConversation(req.user.id, recipientId);

    return res.status(201).json({
      conversationId: conversation._id,
      message: 'Conversation ready'
    });
  } catch (e: any) {
    console.error('Error in httpCreateConversation:', e);
    return res.status(500).json({ error: 'Failed to create conversation', details: e.message });
  }
}

// ==================== CREAR GRUPO ====================

export async function httpCreateGroup(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, participants } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!name || !participants || !Array.isArray(participants)) {
      return res.status(400).json({ error: 'name and participants array are required' });
    }

    if (participants.length < 1) {
      return res.status(400).json({ error: 'Group must have at least 2 participants' });
    }

    const group = await chatService.createGroup(req.user.id, name, participants);

    return res.status(201).json({
      groupId: group._id,
      name: group.groupName,
      participants: group.participants,
      createdAt: group.createdAt
    });
  } catch (error: any) {
    console.error('Error in httpCreateGroup:', error);
    return res.status(500).json({ error: 'Failed to create group', details: error.message });
  }
}