import { Server, Socket } from 'socket.io';
import { ChatService } from '../services/chatServices';
import { Conversation } from '../models/conversation';

interface SocketAuth {
  userId: string;
}

const chatService = new ChatService();

export function initializeSocket(io: Server) {
  console.log('🔌 Socket.io inicializado');

  io.on('connection', (socket: Socket) => {
    const { userId } = socket.handshake.auth as SocketAuth;
    
    if (!userId) {
      console.log('❌ Conexión rechazada: sin userId');
      socket.disconnect();
      return;
    }

    console.log(`✅ Usuario conectado: ${userId}`);
    socket.join(userId);
    // Crear grupo
    socket.on('createGroup', async (data) => {
      const { name, participants } = data;
      
      if (!name || !participants || !Array.isArray(participants)) {
        socket.emit('error', { message: 'name y participants array son requeridos' });
        return;
      }

      try {
        const group = await chatService.createGroup(userId, name, participants);
        
        // ✅ Notificar a todos los participantes del grupo
        const allParticipants = [userId, ...participants];
        allParticipants.forEach((participantId) => {
          io.to(participantId).emit('newGroup', {
            groupId: group._id,
            groupName: group.groupName,
            groupAvatar: group.groupAvatar,
            participants: group.participants,
            createdAt: group.createdAt
          });
        });
        
        // Confirmar al creador
        socket.emit('groupCreated', { 
          groupId: group._id,
          name: group.groupName 
        });
        
        console.log(`✅ Grupo creado: ${group.groupName} por ${userId}`);
        
      } catch (error: any) {
        console.error('❌ Error al crear grupo:', error);
        socket.emit('error', { message: 'Error al crear grupo', details: error.message });
      }
    });

    // Unirse a una sala de conversación
    socket.on('joinRoom', (conversationId: string) => {
      socket.join(conversationId);
      console.log(`👤 ${userId} se unió a la sala ${conversationId}`);
    });

    // Salir de una sala
    socket.on('leaveRoom', (conversationId: string) => {
      socket.leave(conversationId);
      console.log(`👤 ${userId} salió de la sala ${conversationId}`);
    });

    // Enviar mensaje (funciona para chats 1v1 y grupos)
    socket.on('sendMessage', async (data) => {
      const { conversationId, text, replyTo } = data;
      
      if (!conversationId || !text) {
        socket.emit('error', { message: 'conversationId y text son requeridos' });
        return;
      }

      try {
        // ✅ Verificar que el usuario pertenece a la conversación/grupo
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: userId // ✅ Simplificado para arrays directos
        });

        if (!conversation) {
          socket.emit('error', { message: 'No tienes acceso a esta conversación' });
          return;
        }

        // Crear el mensaje
        const newMessage = await chatService.sendMessage(
          conversationId,
          userId,
          'User',
          text
        );
        
        // ✅ Emitir mensaje a todos en la sala (chat o grupo)
        io.to(conversationId).emit('newMessage', newMessage);

        // Notificar a participantes offline
        conversation.participants.forEach((participantId: any) => {
          const pId = participantId.toString();
          
          if (pId !== userId) {
            io.to(pId).emit('newConversationUpdate', {
              conversationId: conversationId,
              isGroup: conversation.isGroup,
              groupName: conversation.groupName,
              lastMessage: {
                text: text,
                senderId: userId,
                createdAt: new Date()
              }
            });
          }
        });

      } catch (error: any) {
        console.error('❌ Socket error al enviar mensaje:', error);
        socket.emit('error', { message: 'Error al enviar mensaje', details: error.message });
      }
    });

    // Editar mensaje
    socket.on('editMessage', async (data) => {
      const { messageId, text } = data;
      
      try {
        const editedMessage = await chatService.editMessage(messageId, userId, text);
        
        const conversationId = editedMessage.conversation.toString();
        io.to(conversationId).emit('messageEdited', editedMessage);
        
      } catch (error: any) {
        socket.emit('error', { message: 'Error al editar mensaje', details: error.message });
      }
    });

    // Eliminar mensaje
    socket.on('deleteMessage', async (data) => {
      const { messageId } = data;
      
      try {
        const deletedMessage = await chatService.deleteMessage(messageId, userId);
        
        const conversationId = deletedMessage.conversation.toString();
        io.to(conversationId).emit('messageDeleted', { messageId });
        
      } catch (error: any) {
        socket.emit('error', { message: 'Error al eliminar mensaje', details: error.message });
      }
    });

    // Reaccionar a mensaje
    socket.on('reactToMessage', async (data) => {
      const { messageId, emoji } = data;
      
      try {
        const message = await chatService.reactToMessage(messageId, userId, emoji);
        
        const conversationId = message.conversation.toString();
        io.to(conversationId).emit('messageReacted', {
          messageId,
          reactions: message.reactions
        });
        
      } catch (error: any) {
        socket.emit('error', { message: 'Error al reaccionar', details: error.message });
      }
    });

    // Usuario escribiendo
    socket.on('typing', (data) => {
      const { conversationId } = data;
      socket.to(conversationId).emit('userTyping', { userId });
    });

    socket.on('stopTyping', (data) => {
      const { conversationId } = data;
      socket.to(conversationId).emit('userStoppedTyping', { userId });
    });

    // Desconexión
    socket.on('disconnect', () => {
      console.log(`❌ Usuario desconectado: ${userId}`);
    });
  });
}

export default initializeSocket;