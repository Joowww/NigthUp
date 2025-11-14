// src/socket/socketHandler.ts
import { Server, Socket } from 'socket.io';
import { ChatService } from '../services/chatServices';
import { Conversation } from '../models/conversation'; // Importar el modelo

// Asumimos que tu JWT se pasa en la conexión
// Veremos cómo hacer esto en el frontend
interface SocketAuth {
  token: string;
  userId: string;
  userRole: string; 
  // Podríamos usar jwt.verify(token) aquí para más seguridad
}

const chatService = new ChatService();

export function initializeSocket(io: Server) {

  console.log('🔌 Socket.io inicializado');

  io.on('connection', (socket: Socket) => {
    
    // El frontend debe enviar esto al conectarse
    // Esto es CLAVE para la autenticación
    const { userId, userRole, token } = socket.handshake.auth as SocketAuth;
    
    if (!userId) {
      console.log("🔴 Conexión rechazada: No userId en auth.");
      socket.disconnect();
      return;
    }

    console.log(`🟢 Un usuario se ha conectado: ${socket.id} (UserID: ${userId})`);

    // --- Unir al usuario a sus propias salas ---
    
    // 1. Unir al usuario a una sala "personal" con su ID.
    // Esto nos permite enviarle notificaciones (ej. "te ha llegado un nuevo msg")
    // aunque no esté mirando ese chat.
    socket.join(userId);

    // --- Manejadores de eventos ---

    /**
     * Evento: 'joinRoom'
     * El frontend lo emite cuando el usuario abre un chat específico.
     */
    socket.on('joinRoom', (conversationId: string) => {
      console.log(`[${userId}] se unió a la sala: ${conversationId}`);
      socket.join(conversationId);
      // Aquí podrías emitir un evento 'markAsRead'
    });

    /**
     * Evento: 'leaveRoom'
     * El frontend lo emite cuando el usuario cierra un chat.
     */
    socket.on('leaveRoom', (conversationId: string) => {
      console.log(`[${userId}] salió de la sala: ${conversationId}`);
      socket.leave(conversationId);
    });

    /**
     * Evento: 'sendMessage'
     * El frontend lo emite cuando se envía un mensaje nuevo.
     */
    socket.on('sendMessage', async (data) => {
      const { conversationId, text } = data;
      
      const senderId = userId;
      // TODO: Determinar si el que envía es 'User' o 'Business'
      // Por ahora, asumimos que siempre es 'User'
      const senderModel = 'User'; 

      try {
        // 1. Guardar en BBDD
        const newMessage = await chatService.createMessage(
          conversationId,
          senderId,
          senderModel,
          text
        );
        
        // 2. Emitir a todos en la sala (incluido el emisor)
        // Esto hace que el mensaje aparezca instantáneamente
        io.to(conversationId).emit('newMessage', newMessage);

        // 3. Emitir notificación a los otros participantes (para actualizar su lista de chats)
        const conversation = await Conversation.findById(conversationId).select('participants');
        conversation?.participants.forEach(p => {
          const participantId = p.participant.toString();
          if (participantId !== senderId) {
            // Emite a la "sala personal" del otro usuario
            io.to(participantId).emit('newConversationUpdate', {
               conversationId: conversationId,
               lastMessage: newMessage // Envía el mensaje completo
            });
          }
        });

      } catch (error) {
        console.error('Error al enviar mensaje:', error);
        // Opcional: emitir un error de vuelta al emisor
        socket.emit('sendMessageError', { error: (error as Error).message });
      }
    });

    /**
     * Evento: 'disconnect'
     */
    socket.on('disconnect', () => {
      console.log(`🔴 Un usuario se ha desconectado: ${socket.id} (UserID: ${userId})`);
    });
  });
}