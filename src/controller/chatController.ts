import { Request, Response } from 'express';
import { ChatService } from '../services/chatServices';

const chatService = new ChatService();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    type?: string;
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
    console.error("Error en httpGetConversations:", error);
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

    const messages = await chatService.getMessagesForConversation(conversationId, userId);
    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error en httpGetMessages:", error);
    return res.status(500).json({ error: 'Failed to get messages', details: (error as Error).message });
  }
}

export async function httpCreateConversation(req: AuthenticatedRequest, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const senderId = req.user.id;
        const senderModel = (req.user.role === 'business' || req.user.type === 'business') ? 'Business' : 'User';

        const { recipientId, recipientModel } = req.body;

        if (!recipientId || !recipientModel) {
            return res.status(400).json({ error: 'recipientId and recipientModel are required' });
        }

        if (recipientModel !== 'User' && recipientModel !== 'Business') {
             return res.status(400).json({ error: 'Invalid recipientModel. Must be "User" or "Business".' });
        }
        
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
        console.error("Error en httpCreateConversation:", error);
        return res.status(500).json({ error: 'Failed to create conversation', details: (error as Error).message });
    }
} 

// --- CORREGIDO: Nombre de función y parámetros ---
export const httpSendMessage = async (req: Request, res: Response) => {
  try {
    // Casting seguro para acceder al usuario
    const userReq = req as AuthenticatedRequest; 

    if (!userReq.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { conversationId, text } = req.body;
    
    if (!conversationId || !text) {
      return res.status(400).json({ error: 'conversationId and text are required' });
    }

    const userId = userReq.user.id;
    // Determinamos si es User o Business (ajusta según tu JWT)
    const userModel = (userReq.user.role === 'business' || userReq.user.type === 'business') ? 'Business' : 'User';

    // Llamada al nombre correcto del servicio: createMessage
    const message = await chatService.createMessage(
      conversationId.trim(), 
      userId,
      userModel,  
      text
    );

    return res.status(201).json(message);
  } catch (error: any) {
    console.error('Error in httpSendMessage:', error);
    return res.status(500).json({ 
      error: 'Failed to send message', 
      details: error.message || 'Unknown error'
    });
  }
};