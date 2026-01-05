import { Server, Socket } from 'socket.io';
import { ChatService } from '../services/chatServices';
import { GroupService } from '../services/groupServices';
import mongoose from 'mongoose';

interface SocketAuth {
  userId: string;
}

const chatService = new ChatService();
const groupService = new GroupService();

// Mapa de usuarios conectados: userId -> socketId
const onlineUsers = new Map<string, string>();

export function initializeSocket(io: Server) {
  console.log('🔌 Socket.IO inicializado');

  io.on('connection', (socket: Socket) => {
    const { userId } = socket.handshake.auth as SocketAuth;

    if (!userId) {
      console.log('❌ Conexión rechazada: sin userId');
      socket.disconnect();
      return;
    }

    console.log(`✅ Usuario conectado: ${userId} (socket: ${socket.id})`);

    onlineUsers.set(userId, socket.id);
    socket.join(userId);

    io.emit('onlineUsers', Array.from(onlineUsers.keys()));

    // ==================== UNIRSE/SALIR DE SALAS ====================

    socket.on('joinRoom', (conversationId: string) => {
      socket.join(conversationId);
      console.log(`📥 ${userId} se unió a sala: ${conversationId}`);
      socket.to(conversationId).emit('userJoined', { userId, conversationId });
    });

    socket.on('leaveRoom', (conversationId: string) => {
      socket.leave(conversationId);
      console.log(`📤 ${userId} salió de sala: ${conversationId}`);
    });

    // ==================== ENVIAR MENSAJE ====================

    socket.on('sendMessage', async (data) => {
      console.log('📨 [SOCKET] Intento de envío de mensaje recibido:', JSON.stringify(data, null, 2));
      const { conversationId, text, imageUrl, audioUrl, messageType, replyTo } = data;

      if (!conversationId) {
        socket.emit('error', { message: 'conversationId es requerido' });
        return;
      }

      // Validar que haya texto, imagen o audio
      if (!text && !imageUrl && !audioUrl) {
        socket.emit('error', { message: 'El mensaje debe tener texto, imagen o audio' });
        return;
      }

      try {
        // ✅ CORRECCIÓN: Pasar objeto en lugar de parámetros separados
        const newMessage = await chatService.sendMessage({
          conversationId,
          senderId: userId,
          text: text?.trim() || '',
          imageUrl,
          audioUrl,
          messageType: messageType || 'text',
          replyTo
        });

        if (!newMessage) {
          throw new Error('Failed to create message');
        }

        io.to(conversationId).emit('newMessage', {
          _id: newMessage._id,
          conversation: newMessage.conversation,
          sender: newMessage.sender,
          text: newMessage.text,
          messageType: newMessage.messageType,
          imageUrl: newMessage.imageUrl,
          audioUrl: newMessage.audioUrl,
          replyTo: newMessage.replyTo,
          reactions: newMessage.reactions,
          isEdited: newMessage.isEdited,
          isDeleted: newMessage.isDeleted,
          readBy: newMessage.readBy,
          createdAt: newMessage.createdAt,
          updatedAt: newMessage.updatedAt
        });

        console.log(`📨 Mensaje enviado en ${conversationId} por ${userId}`);
      } catch (error: any) {
        console.error('❌ Error al enviar mensaje:', error);
        socket.emit('error', {
          message: 'Error al enviar mensaje',
          details: error.message
        });
      }
    });

    // ==================== EDITAR MENSAJE ====================

    socket.on('editMessage', async (data) => {
      const { messageId, text } = data;

      if (!messageId || !text) {
        socket.emit('error', { message: 'messageId y text son requeridos' });
        return;
      }

      try {
        const editedMessage = await chatService.editMessage(messageId, userId, text.trim());

        if (!editedMessage) {
          throw new Error('Failed to edit message');
        }

        const conversationId = editedMessage.conversation.toString();

        io.to(conversationId).emit('messageEdited', {
          _id: editedMessage._id,
          conversation: editedMessage.conversation,
          text: editedMessage.text,
          isEdited: editedMessage.isEdited,
          updatedAt: editedMessage.updatedAt
        });

        console.log(`✏️ Mensaje editado: ${messageId}`);
      } catch (error: any) {
        console.error('❌ Error al editar mensaje:', error);
        socket.emit('error', {
          message: 'Error al editar mensaje',
          details: error.message
        });
      }
    });

    // ==================== ELIMINAR MENSAJE ====================

    socket.on('deleteMessage', async (data) => {
      const { messageId } = data;

      if (!messageId) {
        socket.emit('error', { message: 'messageId es requerido' });
        return;
      }

      try {
        const deletedMessage = await chatService.deleteMessage(messageId, userId);

        if (!deletedMessage) {
          throw new Error('Failed to delete message');
        }

        const conversationId = deletedMessage.conversation.toString();

        io.to(conversationId).emit('messageDeleted', {
          messageId: deletedMessage._id,
          conversationId
        });

        console.log(`🗑️ Mensaje eliminado: ${messageId}`);
      } catch (error: any) {
        console.error('❌ Error al eliminar mensaje:', error);
        socket.emit('error', {
          message: 'Error al eliminar mensaje',
          details: error.message
        });
      }
    });

    // ==================== REACCIONAR A MENSAJE ====================

    socket.on('reactToMessage', async (data) => {
      const { messageId, emoji } = data;

      if (!messageId || !emoji) {
        socket.emit('error', { message: 'messageId y emoji son requeridos' });
        return;
      }

      try {
        const message = await chatService.reactToMessage(messageId, userId, emoji);

        if (!message) {
          throw new Error('Failed to react to message');
        }

        const conversationId = message.conversation.toString();

        io.to(conversationId).emit('messageReacted', {
          messageId: message._id,
          reactions: message.reactions,
          userId,
          emoji
        });

        console.log(`👍 Reacción añadida: ${emoji} al mensaje ${messageId}`);
      } catch (error: any) {
        console.error('❌ Error al reaccionar:', error);
        socket.emit('error', {
          message: 'Error al reaccionar',
          details: error.message
        });
      }
    });

    // ==================== INDICADOR DE ESCRITURA ====================

    socket.on('typing', (data) => {
      const { conversationId, username } = data;

      if (!conversationId) return;

      socket.to(conversationId).emit('userTyping', {
        userId,
        username: username || userId,
        conversationId
      });

      console.log(`✍️ ${username || userId} está escribiendo en ${conversationId}`);
    });

    socket.on('stopTyping', (data) => {
      const { conversationId, username } = data;

      if (!conversationId) return;

      socket.to(conversationId).emit('userStoppedTyping', {
        userId,
        username: username || userId,
        conversationId
      });
    });

    // ==================== CREAR GRUPO ====================

    socket.on('createGroup', async (data) => {
      const { name, participants } = data;

      if (!name || !participants || !Array.isArray(participants)) {
        socket.emit('error', { message: 'name y participants son requeridos' });
        return;
      }

      try {
        const group = await chatService.createGroup(userId, name, participants);

        if (!group) {
          throw new Error('Failed to create group');
        }

        // ✅ Emitir a todos los participantes (creador + invitados)
        const allParticipants = [userId, ...participants];

        allParticipants.forEach((participantId) => {
          const participantSocketId = onlineUsers.get(participantId);
          if (participantSocketId) {
            io.to(participantSocketId).emit('newGroup', {
              _id: group._id,
              id: group._id,
              isGroup: true,
              name: group.groupName || name,
              groupName: group.groupName || name,
              avatar: group.groupAvatar || '',
              groupAvatar: group.groupAvatar || '',
              participants: group.participants,
              lastMessage: '',
              lastMessageTime: group.createdAt,
              unreadCount: 0,
              createdAt: group.createdAt
            });
          }
        });

        console.log(`👥 Grupo creado: ${name} por ${userId}`);
      } catch (error: any) {
        console.error('❌ Error al crear grupo:', error);
        socket.emit('error', {
          message: 'Error al crear grupo',
          details: error.message
        });
      }
    });

    // ==================== ENCUESTAS EN GRUPOS ====================

    socket.on('createGroupPoll', async (data) => {
      const { conversationId, question, options } = data;

      if (!conversationId || !question || !options || !Array.isArray(options)) {
        socket.emit('error', {
          message: 'conversationId, question y options son requeridos'
        });
        return;
      }

      try {
        const poll = await groupService.createPoll(
          conversationId,
          userId,
          question,
          options
        );

        if (!poll) {
          throw new Error('Failed to create poll');
        }

        io.to(conversationId).emit('newGroupPoll', {
          _id: poll._id,
          question: poll.question,
          options: poll.options,
          creator: poll.creator,
          conversationId,
          createdAt: poll.createdAt
        });

        console.log(`📊 Encuesta creada en grupo ${conversationId}`);
      } catch (error: any) {
        console.error('❌ Error al crear encuesta:', error);
        socket.emit('error', {
          message: 'Error al crear encuesta',
          details: error.message
        });
      }
    });

    socket.on('voteInGroupPoll', async (data) => {
      const { conversationId, pollId, optionIndex } = data;

      if (!conversationId || !pollId || optionIndex === undefined) {
        socket.emit('error', {
          message: 'conversationId, pollId y optionIndex son requeridos'
        });
        return;
      }

      try {
        const poll = await groupService.voteInPoll(conversationId, pollId, userId, optionIndex);

        if (!poll) {
          throw new Error('Failed to vote in poll');
        }

        io.to(conversationId).emit('groupPollUpdated', {
          _id: poll._id,
          question: poll.question,
          options: poll.options,
          conversationId
        });

        console.log(`🗳️ Voto registrado en encuesta ${pollId} por ${userId}`);
      } catch (error: any) {
        console.error('❌ Error al votar:', error);
        socket.emit('error', {
          message: 'Error al votar',
          details: error.message
        });
      }
    });

    // ==================== MARCAR COMO LEÍDO ====================

    socket.on('markAsRead', async (data) => {
      const { conversationId, messageIds } = data;

      if (!conversationId || !messageIds || !Array.isArray(messageIds)) {
        socket.emit('error', { message: 'conversationId y messageIds son requeridos' });
        return;
      }

      try {
        await chatService.markMessagesAsRead(conversationId, messageIds, userId);

        socket.to(conversationId).emit('messagesRead', {
          conversationId,
          messageIds,
          userId
        });

        console.log(`👁️ ${userId} leyó ${messageIds.length} mensajes en ${conversationId}`);
      } catch (error: any) {
        console.error('❌ Error al marcar como leído:', error);
      }
    });

    // ==================== VIDEOLLAMADAS ====================

    socket.on('callUser', (data) => {
      const { conversationId, recipientId, callType, callerName } = data;

      if (!recipientId || !callType) {
        socket.emit('error', { message: 'recipientId y callType son requeridos' });
        return;
      }

      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('incomingCall', {
          callerId: userId,
          callerName: callerName || 'Usuario',
          conversationId,
          callType // 'video' | 'audio'
        });
        console.log(`📞 Llamada ${callType} de ${userId} a ${recipientId}`);
      } else {
        socket.emit('error', { message: 'El usuario no está conectado' });
      }
    });

    socket.on('answerCall', (data) => {
      const { callerId, accepted } = data;

      if (!callerId || accepted === undefined) {
        socket.emit('error', { message: 'callerId y accepted son requeridos' });
        return;
      }

      const callerSocketId = onlineUsers.get(callerId);
      if (callerSocketId) {
        io.to(callerSocketId).emit('callAnswered', {
          recipientId: userId,
          accepted
        });
        console.log(`📞 Llamada ${accepted ? 'aceptada' : 'rechazada'} por ${userId}`);
      }
    });

    socket.on('endCall', (data) => {
      const { conversationId } = data;

      if (conversationId) {
        socket.to(conversationId).emit('callEnded', { userId });
        console.log(`📞 Llamada finalizada en ${conversationId}`);
      }
    });

    socket.on('iceCandidate', (data) => {
      const { recipientId, candidate } = data;

      if (!recipientId) return;

      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('iceCandidate', {
          senderId: userId,
          candidate
        });
      }
    });

    socket.on('offer', (data) => {
      const { recipientId, offer } = data;

      if (!recipientId) return;

      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('offer', {
          senderId: userId,
          offer
        });
      }
    });

    socket.on('answer', (data) => {
      const { recipientId, answer } = data;

      if (!recipientId) return;

      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('answer', {
          senderId: userId,
          answer
        });
      }
    });

    // ==================== DESCONEXIÓN ====================

    socket.on('disconnect', () => {
      console.log(`❌ Usuario desconectado: ${userId}`);

      onlineUsers.delete(userId);

      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
      io.emit('userDisconnected', { userId });
    });
  });
}

export default initializeSocket;