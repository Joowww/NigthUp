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
  console.log(">>> [httpGetConversations] Iniciando petición...");
  try {
    if (!req.user) {
      console.log(">>> [httpGetConversations] Error: No user in req (Unauthorized)");
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const userId = req.user.id;
    console.log(`>>> [httpGetConversations] User ID: ${userId}`);

    const conversations = await chatService.getConversationsForUser(userId);
    console.log(`>>> [httpGetConversations] Conversaciones encontradas: ${conversations ? conversations.length : 0}`);
    
    return res.status(200).json(conversations);
  } catch (error) {
    console.error(">>> [httpGetConversations] Error CRÍTICO:", error);
    return res.status(500).json({ error: 'Failed to get conversations', details: (error as Error).message });
  }
}

export async function httpGetMessages(req: AuthenticatedRequest, res: Response) {
  console.log(">>> [httpGetMessages] Iniciando petición...");
  try {
    if (!req.user) {
      console.log(">>> [httpGetMessages] Error: No user in req (Unauthorized)");
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.id;
    const { conversationId } = req.params;
    console.log(`>>> [httpGetMessages] User ID: ${userId}, Conversation ID: ${conversationId}`);

    const messages = await chatService.getMessagesForConversation(conversationId, userId);
    console.log(`>>> [httpGetMessages] Mensajes recuperados: ${messages ? messages.length : 0}`);

    return res.status(200).json(messages);
  } catch (error) {
    console.error(">>> [httpGetMessages] Error CRÍTICO:", error);
    return res.status(500).json({ error: 'Failed to get messages', details: (error as Error).message });
  }
}

export async function httpCreateConversation(req: AuthenticatedRequest, res: Response) {
    console.log(">>> [httpCreateConversation] Iniciando petición...");
    try {
        if (!req.user) {
            console.log(">>> [httpCreateConversation] Error: No user in req (Unauthorized)");
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const senderId = req.user.id;
        const senderModel = (req.user.role === 'business' || req.user.type === 'business') ? 'Business' : 'User';
        
        console.log(`>>> [httpCreateConversation] Sender Info -> ID: ${senderId}, Model: ${senderModel}`);
        console.log(">>> [httpCreateConversation] Body recibido:", req.body);

        const { recipientId, recipientModel } = req.body;

        if (!recipientId || !recipientModel) {
            console.log(">>> [httpCreateConversation] Error: Faltan recipientId o recipientModel");
            return res.status(400).json({ error: 'recipientId and recipientModel are required' });
        }

        if (recipientModel !== 'User' && recipientModel !== 'Business') {
             console.log(`>>> [httpCreateConversation] Error: recipientModel inválido (${recipientModel})`);
             return res.status(400).json({ error: 'Invalid recipientModel. Must be "User" or "Business".' });
        }
        
        if (senderId === recipientId && senderModel === recipientModel) {
            console.log(">>> [httpCreateConversation] Error: Intento de crear conversación con uno mismo");
            return res.status(400).json({ error: 'Cannot create a conversation with yourself' });
        }

        console.log(">>> [httpCreateConversation] Llamando al servicio findOrCreateConversation...");
        const conversation = await chatService.findOrCreateConversation(
            senderId,
            senderModel,
            recipientId,
            recipientModel
        );
        
        console.log(`>>> [httpCreateConversation] Conversación creada/encontrada ID: ${conversation?._id}`);
        return res.status(201).json({ conversationId: conversation._id });

    } catch (error) {
        console.error(">>> [httpCreateConversation] Error CRÍTICO:", error);
        return res.status(500).json({ error: 'Failed to create conversation', details: (error as Error).message });
    }
} 

export const httpSendMessage = async (req: Request, res: Response) => {
  console.log(">>> [httpSendMessage] Iniciando petición...");
  try {
    const userReq = req as AuthenticatedRequest; 

    if (!userReq.user) {
        console.log(">>> [httpSendMessage] Error: No user in req (Unauthorized)");
        return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(">>> [httpSendMessage] Body recibido:", req.body);

    const { conversationId, text } = req.body;
    
    if (!conversationId || !text) {
      console.log(">>> [httpSendMessage] Error: Faltan conversationId o text");
      return res.status(400).json({ error: 'conversationId and text are required' });
    }

    const userId = userReq.user.id;
    const userModel = (userReq.user.role === 'business' || userReq.user.type === 'business') ? 'Business' : 'User';

    console.log(`>>> [httpSendMessage] Datos procesados -> UserID: ${userId}, Model: ${userModel}, ConvID: ${conversationId}`);
    console.log(">>> [httpSendMessage] Llamando a chatService.createMessage...");

    const message = await chatService.createMessage(
      conversationId.trim(), 
      userId,
      userModel,  
      text
    );

    console.log(">>> [httpSendMessage] Mensaje creado exitosamente:", message);
    return res.status(201).json(message);

  } catch (error: any) {
    console.error('>>> [httpSendMessage] Error CRÍTICO:', error);
    return res.status(500).json({ 
      error: 'Failed to send message', 
      details: error.message || 'Unknown error'
    });
  }
};