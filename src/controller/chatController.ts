import { Request, Response } from 'express';
import { ChatService } from '../services/chatServices';
import { Conversation } from '../models/conversation';
import { contentModerationService } from '../services/contentModerationService';
import mongoose from 'mongoose';

const chatService = new ChatService();

interface AuthenticatedRequest extends Request {
  user?: { id: string; role?: string };
}

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
    
    // Verificar que la conversación se creó correctamente
    if (!conversation) {
      throw new Error('Failed to create conversation');
    }
    
    return res.status(201).json({ 
      conversationId: conversation._id,
      message: 'Conversation ready'
    });
  } catch (e: any) {
    console.error('Error in httpCreateConversation:', e);
    return res.status(500).json({ error: 'Failed to create conversation', details: e.message });
  }
}

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
      return res.status(400).json({ error: 'Group must have at least 2 participants (including you)' });
    }

    const group = await chatService.createGroup(req.user.id, name, participants);
    
    // Verificar que el grupo se creó correctamente
    if (!group) {
      throw new Error('Failed to create group');
    }
    
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

export async function httpSendMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const { conversationId, text, replyTo } = req.body;
      
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
  
      if (!conversationId || !text) {
        return res.status(400).json({ error: 'conversationId and text are required' });
      }
  
      const moderationResult = contentModerationService.moderateMessage(text);
      
      if (!moderationResult.isAllowed) {
        return res.status(403).json({
          error: 'Message blocked',
          reason: moderationResult.reason,
          severity: moderationResult.severity,
          detectedWords: moderationResult.detectedWords,
          detectedPatterns: moderationResult.detectedPatterns
        });
      }
  
      const conversation = await Conversation.findOne({
        _id: conversationId,
        'participants.participant': new mongoose.Types.ObjectId(req.user.id)
      });
  
      if (!conversation) {
        return res.status(403).json({ error: 'You do not have access to this conversation' });
      }
  
      const messageText = moderationResult.sanitizedMessage || text;
      const msg = await chatService.sendMessage(
        conversationId, 
        req.user.id,
        messageText,
        replyTo
      );
      
      return res.status(201).json(msg);
    } catch (e: any) {
      console.error('Error in httpSendMessage:', e);
      return res.status(500).json({ error: 'Failed to send message', details: e.message });
    }
  }

export async function httpEditMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const { messageId } = req.params;
      const { text } = req.body;
      
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
  
      if (!text) {
        return res.status(400).json({ error: 'text is required' });
      }
  
      const moderationResult = contentModerationService.moderateMessage(text);
      
      if (!moderationResult.isAllowed) {
        return res.status(403).json({
          error: 'Edit blocked',
          reason: moderationResult.reason,
          severity: moderationResult.severity,
          detectedWords: moderationResult.detectedWords,
          detectedPatterns: moderationResult.detectedPatterns
        });
      }
  
      const messageText = moderationResult.sanitizedMessage || text;
      
      const msg = await chatService.editMessage(messageId, req.user.id, messageText);
      return res.status(200).json(msg);
    } catch (e: any) {
      console.error('Error in httpEditMessage:', e);
      return res.status(400).json({ error: 'Failed to edit message', details: e.message });
    }
  }

export async function httpDeleteMessage(req: AuthenticatedRequest, res: Response) {
  try {
    const { messageId } = req.params;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const msg = await chatService.deleteMessage(messageId, req.user.id);
    return res.status(200).json({ 
      success: true, 
      message: 'Message deleted',
      messageId: msg._id
    });
  } catch (e: any) {
    console.error('Error in httpDeleteMessage:', e);
    return res.status(400).json({ error: 'Failed to delete message', details: e.message });
  }
}

export async function httpReactToMessage(req: AuthenticatedRequest, res: Response) {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!emoji) {
      return res.status(400).json({ error: 'emoji is required' });
    }

    const msg = await chatService.reactToMessage(messageId, req.user.id, emoji);
    return res.status(200).json({
      messageId: msg._id,
      reactions: msg.reactions
    });
  } catch (e: any) {
    console.error('Error in httpReactToMessage:', e);
    return res.status(400).json({ error: 'Failed to react to message', details: e.message });
  }
}