import { Request, Response } from 'express';
import { ChatService } from '../services/chatServices';

const chatService = new ChatService();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    
  };
}

export async function httpGetConversations(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = req.user.id;
    const conversations = await chatService.getConversationsForUser(userId);
    return res.status(200).json(conversations);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get conversations', details: (error as Error).message });
  }
}

export async function httpGetMessages(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = req.user.id;
    const { conversationId } = req.params;

    // TODO: Deberíamos verificar si el usuario es realmente participante
    // de esta conversación antes de devolver los mensajes.

    const messages = await chatService.getMessagesForConversation(conversationId, userId);
    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get messages', details: (error as Error).message });
  }
}

export async function httpCreateConversation(req: AuthenticatedRequest, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const senderId = req.user.id;
        // Asumimos que un usuario 'User' inicia el chat
        const senderModel = 'User'; 

        // El ID y tipo del destinatario deben venir en el body
        const { recipientId, recipientModel } = req.body;

        if (!recipientId || !recipientModel) {
            return res.status(400).json({ error: 'recipientId and recipientModel are required' });
        }

        if (recipientModel !== 'User' && recipientModel !== 'Business') {
             return res.status(400).json({ error: 'Invalid recipientModel. Must be "User" or "Business".' });
        }
        
        // Evitar que un usuario cree un chat consigo mismo
        if (senderId === recipientId && senderModel === recipientModel) {
            return res.status(400).json({ error: 'Cannot create a conversation with yourself' });
        }

        const conversation = await chatService.findOrCreateConversation(
            senderId,
            senderModel,
            recipientId,
            recipientModel
        );

        return res.status(201).json({ conversationId: conversation._id });

    } catch (error) {
        return res.status(500).json({ error: 'Failed to create conversation', details: (error as Error).message });
    }
}