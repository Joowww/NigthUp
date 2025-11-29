import { Server, Socket } from 'socket.io';
import { ChatService } from '../services/chatServices';
import { Conversation } from '../models/conversation';
import { User } from '../models/user';
import { verifyToken } from '../auth/token';
import { GroupService } from '../services/groupServices';
import Friendship from '../models/friendship';

interface SocketAuth {
  token: string;
  userId: string;
  userRole: string; 
}

interface OnlineUser {
  socketId: string;
  userId: string;
  userRole: string;
  joinedAt: Date;
}

// Almacenamiento en memoria de usuarios conectados
const onlineUsers = new Map<string, OnlineUser>();

const chatService = new ChatService();
const groupService = new GroupService();

export function initializeSocket(io: Server) {
  console.log('🔌 Socket.io inicializado');

  io.on('connection', (socket: Socket) => {
    console.log('🟢 Nuevo cliente conectado:', socket.id);

    const { token, userId, userRole } = socket.handshake.auth as SocketAuth;
    
    // Validación más robusta
    if (!userId || !token) {
      console.log("🔴 Conexión rechazada: Faltan userId o token.");
      socket.emit('connection_error', { error: 'Authentication required' });
      socket.disconnect();
      return;
    }

    // Verificar token JWT
    try {
      const decoded = verifyToken(token);
      if (!decoded || (decoded as any).id !== userId) {
        console.log("🔴 Token inválido para userId:", userId);
        socket.emit('connection_error', { error: 'Invalid token' });
        socket.disconnect();
        return;
      }
    } catch (error) {
      console.log("🔴 Error verificando token:", error);
      socket.emit('connection_error', { error: 'Token verification failed' });
      socket.disconnect();
      return;
    }

    // Determinar senderModel
    const senderModel = (userRole === 'business') ? 'Business' : 'User';

    // Registrar usuario como online
    onlineUsers.set(userId, {
      socketId: socket.id,
      userId,
      userRole,
      joinedAt: new Date()
    });

    // Unir al usuario a sus rooms
    socket.join(userId);
    console.log(`👤 Usuario ${userId} unido a room: ${userId}`);

    // Actualizar estado del usuario en BD
    User.findByIdAndUpdate(userId, { 
      isOnline: true,
      lastSeen: new Date()
    }).catch(console.error);

    // Notificar a amigos que el usuario está online
    notifyFriendsStatusChange(userId, true, io);

    // ==================== EVENTOS DEL CHAT ====================

    socket.on('joinConversation', async (conversationId: string) => {
      try {
        socket.join(conversationId);
        console.log(`💬 Usuario ${userId} unido a conversación: ${conversationId}`);
        
        // Marcar mensajes como leídos
        await markMessagesAsRead(conversationId, userId);
        
        socket.emit('joinedConversation', { conversationId });
      } catch (error) {
        console.error('Error joining conversation:', error);
        socket.emit('joinError', { error: 'Failed to join conversation' });
      }
    });

    socket.on('leaveConversation', (conversationId: string) => {
      socket.leave(conversationId);
      console.log(`💬 Usuario ${userId} salió de conversación: ${conversationId}`);
    });

    socket.on('sendMessage', async (data) => {
      const { conversationId, text } = data;
      
      if (!conversationId || !text?.trim()) {
        socket.emit('sendMessageError', { error: 'Conversation ID and text are required' });
        return;
      }

      try {
        // Llamada unificada a createMessage
        const newMessage = await chatService.createMessage(
          conversationId,
          userId,
          senderModel,
          text.trim()
        );
        
        // Emitir a todos en la conversación
        io.to(conversationId).emit('newMessage', newMessage);
        console.log(`💬 Mensaje enviado en conversación ${conversationId} por ${userId}`);

        // Notificar actualización de lista de chats
        const conversation = await Conversation.findById(conversationId)
          .select('participants isGroup groupName')
          .populate('participants.participant', 'username avatar');

        if (conversation) {
          conversation.participants.forEach(p => {
            const participantId = p.participant.toString();
            if (participantId !== userId) {
              // Notificar a cada participante
              io.to(participantId).emit('conversationUpdated', {
                conversationId: conversationId,
                lastMessage: newMessage,
                unreadCount: 1,
                isGroup: conversation.isGroup,
                groupName: conversation.groupName
              });

              // Emitir notificación si el usuario no está en la conversación
              const participantSocket = onlineUsers.get(participantId);
              if (!participantSocket || !socket.rooms.has(conversationId)) {
                socket.to(participantId).emit('newMessageNotification', {
                  conversationId,
                  message: newMessage,
                  sender: {
                    id: userId,
                    username: (p.participant as any).username,
                    avatar: (p.participant as any).avatar
                  }
                });
              }
            }
          });
        }

      } catch (error) {
        console.error('❌ Error socket sendMessage:', error);
        socket.emit('sendMessageError', { 
          error: 'Failed to send message',
          details: (error as Error).message 
        });
      }
    });

    // ==================== EVENTOS DE GRUPOS ====================

    socket.on('createGroupPoll', async (data) => {
      const { groupId, question, options, expiresAt } = data;
      
      try {
        const updatedGroup = await groupService.createPoll(
          groupId, 
          userId, 
          question, 
          options, 
          expiresAt ? new Date(expiresAt) : undefined
        );

        if (updatedGroup) {
          io.to(groupId).emit('newGroupPoll', {
            groupId,
            poll: updatedGroup.groupPolls[updatedGroup.groupPolls.length - 1]
          });
        }
      } catch (error) {
        console.error('Error creating group poll:', error);
        socket.emit('createPollError', { error: (error as Error).message });
      }
    });

    socket.on('voteInPoll', async (data) => {
      const { groupId, pollId, optionIndex } = data;
      
      try {
        const updatedGroup = await groupService.voteInPoll(groupId, pollId, userId, optionIndex);
        
        if (updatedGroup) {
          io.to(groupId).emit('pollUpdated', {
            groupId,
            pollId,
            poll: updatedGroup.groupPolls.find((poll: any) => poll._id?.toString() === pollId)
          });
        }
      } catch (error) {
        console.error('Error voting in poll:', error);
        socket.emit('voteError', { error: (error as Error).message });
      }
    });

    // ==================== EVENTOS DE ESTADO ====================

    socket.on('typingStart', (data) => {
      const { conversationId } = data;
      socket.to(conversationId).emit('userTyping', {
        userId,
        conversationId,
        isTyping: true
      });
    });

    socket.on('typingStop', (data) => {
      const { conversationId } = data;
      socket.to(conversationId).emit('userTyping', {
        userId,
        conversationId,
        isTyping: false
      });
    });

    socket.on('messageRead', async (data) => {
      const { conversationId, messageId } = data;
      try {
        await markMessageAsRead(conversationId, messageId, userId);
        socket.to(conversationId).emit('messageReadReceipt', {
          messageId,
          readBy: userId,
          readAt: new Date()
        });
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    // ==================== EVENTOS DE USUARIO ====================

    socket.on('getOnlineFriends', () => {
      const onlineFriends = getOnlineFriends(userId);
      socket.emit('onlineFriendsList', onlineFriends);
    });

    // ==================== MANEJO DE DESCONEXIÓN ====================

    socket.on('disconnect', async (reason) => {
      console.log(`🔴 Cliente desconectado: ${socket.id} - Razón: ${reason}`);
      
      // Remover usuario de onlineUsers
      onlineUsers.delete(userId);

      // Actualizar estado en BD
      await User.findByIdAndUpdate(userId, { 
        isOnline: false,
        lastSeen: new Date()
      }).catch(console.error);

      // Notificar a amigos que el usuario está offline
      notifyFriendsStatusChange(userId, false, io);

      // Limpiar rooms
      socket.rooms.forEach(room => {
        if (room !== socket.id) {
          socket.leave(room);
        }
      });
    });

    // ==================== MANEJO DE ERRORES ====================

    socket.on('error', (error) => {
      console.error('❌ Error de socket:', error);
    });

    // Confirmar conexión exitosa
    socket.emit('connected', { 
      message: 'Successfully connected to socket server',
      userId,
      userRole 
    });
  });

  // ==================== FUNCIONES AUXILIARES ====================

  async function markMessagesAsRead(conversationId: string, userId: string) {
    // Implementar lógica para marcar mensajes como leídos
    // Esto depende de tu modelo de Message
    console.log(`📖 Marcando mensajes como leídos para ${userId} en ${conversationId}`);
  }

  async function markMessageAsRead(conversationId: string, messageId: string, userId: string) {
    // Implementar lógica para marcar un mensaje específico como leído
    console.log(`📖 Mensaje ${messageId} marcado como leído por ${userId}`);
  }

  // Notifica a los amigos aceptados que el usuario ha cambiado de estado
  async function notifyFriendsStatusChange(userId: string, isOnline: boolean, io: Server) {
    // Busca todas las amistades aceptadas donde el usuario es requester o recipient
    const friendships = await Friendship.find({
      status: 'accepted',
      $or: [{ requester: userId }, { recipient: userId }]
    });

    // Obtén los IDs de los amigos
    const friendIds = friendships.map(f =>
      f.requester.toString() === userId ? f.recipient.toString() : f.requester.toString()
    );

    // Notifica solo a los amigos que están online
    friendIds.forEach(friendId => {
      const socketId = getUserSocket(friendId);
      if (socketId) {
        io.to(socketId).emit('friend-status-change', {
          userId,
          isOnline
        });
      }
    });
  }

  function getOnlineFriends(userId: string): any[] {
    const onlineFriends: any[] = [];
    // Implementar lógica para obtener amigos online
    // Esto requiere consultar la base de datos
    return onlineFriends;
  }
}

// Función para obtener usuarios online (útil para otros módulos)
export function getOnlineUsers(): OnlineUser[] {
  return Array.from(onlineUsers.values());
}

export function isUserOnline(userId: string): boolean {
  return onlineUsers.has(userId);
}

export function getUserSocket(userId: string): string | undefined {
  return onlineUsers.get(userId)?.socketId;
}