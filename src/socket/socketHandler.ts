import { Server, Socket } from 'socket.io';
import { ChatService } from '../services/chatServices';
import { Conversation } from '../models/conversation';

interface SocketAuth {
  token: string;
  userId: string;
  userRole: string; 
}

const chatService = new ChatService();

export function initializeSocket(io: Server) {
  console.log('🔌 Socket.io inicializado');

  io.on('connection', (socket: Socket) => {
    const { userId, userRole } = socket.handshake.auth as SocketAuth;
    
    if (!userId) {
      console.log("🔴 Conexión rechazada: No userId.");
      socket.disconnect();
      return;
    }

    // Determinar senderModel
    const senderModel = (userRole === 'business') ? 'Business' : 'User';

    socket.join(userId);

    socket.on('joinRoom', (conversationId: string) => socket.join(conversationId));
    socket.on('leaveRoom', (conversationId: string) => socket.leave(conversationId));

    socket.on('sendMessage', async (data) => {
      const { conversationId, text } = data;
      
      try {
        // Llamada unificada a createMessage
        const newMessage = await chatService.createMessage(
          conversationId,
          userId,
          senderModel,
          text
        );
        
        io.to(conversationId).emit('newMessage', newMessage);

        // Notificar actualización de lista de chats
        const conversation = await Conversation.findById(conversationId).select('participants');
        conversation?.participants.forEach(p => {
          const participantId = p.participant.toString();
          if (participantId !== userId) {
            io.to(participantId).emit('newConversationUpdate', {
               conversationId: conversationId,
               lastMessage: newMessage 
            });
          }
        });

      } catch (error) {
        console.error('Error socket sendMessage:', error);
        socket.emit('sendMessageError', { error: (error as Error).message });
      }
    });

    socket.on('disconnect', () => { /* Cleanup */ });
  });
}