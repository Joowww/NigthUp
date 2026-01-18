import { Server, Socket } from 'socket.io';
import { ChatService } from '../services/chatServices';
import { GroupService } from '../services/groupServices';
import { User } from '../models/user';
import { NotificationService } from '../services/notificationServices';

interface SocketAuth {
  userId: string;
}

const groupService = new GroupService();
const notificationService = new NotificationService();
const chatService = new ChatService();

/**
 * 🌍 ESTADO GLOBAL DE PRESENCIA
 * userId -> Set de socketIds activos
 */
const onlineUsers = new Map<string, Set<string>>();

export function initializeSocket(io: Server) {
  console.log('🔌 [Socket] Sistema de Socket.IO Inicializado');

  io.on('connection', async (socket: Socket) => {
    const rawUserId = (socket.handshake.auth as SocketAuth).userId;
    const userId = rawUserId?.toString();

    if (!userId) {
      console.log('❌ [Socket] Conexión rechazada: userId inválido o ausente');
      socket.disconnect();
      return;
    }

    console.log(`✅ [Socket] Nueva conexión: ${userId} (SocketID: ${socket.id})`);

    // 1️⃣ GESTIÓN DE ENTRADA
    let isFirstConnection = false;
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
      isFirstConnection = true;
    }
    onlineUsers.get(userId)?.add(socket.id);

    // Unir al socket a su propia sala privada para eventos dirigidos
    socket.join(userId);

    // 2️⃣ ACTUALIZACIÓN DE BASE DE DATOS Y BROADCAST (Solo si es la primera pestaña)
    if (isFirstConnection) {
      console.log(`📡 [Socket] Usuario ${userId} ahora está ONLINE globalmente`);
      try {
        await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });

        // Notificar a TODOS que este usuario se ha conectado
        io.emit('userStatusChanged', { userId, isOnline: true });
      } catch (err) {
        console.error('❌ [Socket] Error actualizando DB (online):', err);
      }
    }

    // 3️⃣ SINCRONIZACIÓN INICIAL PARA EL NUEVO USUARIO
    const currentOnlineIds = Array.from(onlineUsers.keys());
    socket.emit('onlineUsers', currentOnlineIds);

    if (isFirstConnection) {
      io.emit('onlineUsers', currentOnlineIds);
    }

    // 4️⃣ UNIRSE A SALAS DE CHAT EXISTENTES
    try {
      const conversations = await chatService.getConversationsForUser(userId);
      conversations.forEach(c => socket.join(c.id.toString()));
      console.log(`💬 [Socket] Usuario ${userId} unido a ${conversations.length} salas de chat`);
    } catch (err) {
      console.error('❌ [Socket] Error al unir a salas:', err);
    }

    // ============================================
    // MANEJADORES DE EVENTOS (MEJORADOS)
    // ============================================

    socket.on('joinRoom', (conversationId: string) => {
      socket.join(conversationId);
      socket.to(conversationId).emit('userJoined', { userId, conversationId });
    });

    socket.on('leaveRoom', (conversationId: string) => {
      socket.leave(conversationId);
    });

    socket.on('sendMessage', async (data: any) => {
      const { conversationId, text } = data;
      if (!conversationId) {
        console.error('❌ [Socket] Error: No conversationId provided');
        return;
      }

      try {
        // Asegurarse de que el socket esté unido a la sala si aún no lo está
        socket.join(conversationId);

        const newMessage = await chatService.sendMessage({
          ...data,
          senderId: userId
        });

        if (newMessage) {
          // Asegurarse de que sea un objeto plano para evitar problemas con Mongoose
          const formattedMessage = JSON.parse(JSON.stringify(newMessage));

          // 1. Emitir a la sala de la conversación (para los que ya están dentro)
          io.to(conversationId).emit('newMessage', formattedMessage);
          console.log(`📤 [Socket] Mensaje enviado a sala ${conversationId}`);

          // 2. 🔥 REFUERZO DE REACTIVIDAD: Emitir a las salas privadas de los participantes
          // Esto soluciona el problema de "no veo el mensaje hasta que refresco" en nuevos chats
          const participants = await chatService.getConversationParticipants(conversationId);
          participants.forEach(pId => {
            const participantId = pId.toString();
            if (participantId !== userId) {
              io.to(participantId).emit('newMessage', formattedMessage);
              console.log(`📡 [Socket] Refuerzo enviado a sala privada de ${participantId}`);
            }
          });
        }
      } catch (err) {
        console.error('❌ [Socket] Error enviando mensaje:', err);
        socket.emit('error', { message: 'Error al enviar mensaje', details: err instanceof Error ? err.message : String(err) });
      }
    });

    socket.on('getOnlineUsers', () => {
      socket.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });

    socket.on('typing', (data: any) => {
      if (data.conversationId) socket.to(data.conversationId).emit('userTyping', { userId, ...data });
    });

    socket.on('stopTyping', (data: any) => {
      if (data.conversationId) socket.to(data.conversationId).emit('userStoppedTyping', { userId, ...data });
    });

    // ============================================
    // GESTIÓN DE AMISTAD (CONFIABLE)
    // ============================================

    socket.on('friendRequestSent', async (data: any) => {
      console.log(`📤 [Socket] Solicitud de ${userId} para ${data.recipientId}`);
      const sender = await User.findById(userId).select('username avatar firstName lastName').lean();

      // Notificar al destinatario
      if (onlineUsers.has(data.recipientId)) {
        io.to(data.recipientId).emit('friendRequestReceived', { sender, friendshipId: data.friendshipId, timestamp: new Date() });
      } else {
        await notificationService.createNotification({ recipient: data.recipientId, sender: userId, type: 'friend_request', friendshipId: data.friendshipId });
      }

      // Sync otras tabs del emisor
      io.to(userId).emit('friendRequestSentConfirmation', {
        recipientId: data.recipientId,
        friendshipId: data.friendshipId,
        timestamp: new Date()
      });
    });

    socket.on('friendRequestAccepted', async (data: any) => {
      console.log(`🤝 [Socket] ${userId} aceptó a ${data.requesterId}`);
      const accepter = await User.findById(userId).select('username avatar firstName lastName').lean();

      if (onlineUsers.has(data.requesterId)) {
        io.to(data.requesterId).emit('friendRequestAcceptedNotification', { friendshipId: data.friendshipId, accepter, timestamp: new Date() });
      }
      await notificationService.createNotification({ recipient: data.requesterId, sender: userId, type: 'friend_accepted', friendshipId: data.friendshipId });

      // Sync otras tabs del emisor
      io.to(userId).emit('friendRequestAcceptedConfirmation', {
        requesterId: data.requesterId,
        friendshipId: data.friendshipId,
        timestamp: new Date()
      });
    });

    socket.on('friendRequestCancelled', (data: any) => {
      console.log(`❌ [Socket] ${userId} canceló/rechazó solicitud con ${data.recipientId}`);
      if (onlineUsers.has(data.recipientId)) {
        io.to(data.recipientId).emit('friendRequestCancelledNotification', {
          friendshipId: data.friendshipId,
          senderId: userId,
          timestamp: new Date()
        });
      }
      // Sync otras tabs
      io.to(userId).emit('friendRequestCancelledConfirmation', {
        targetId: data.recipientId,
        friendshipId: data.friendshipId
      });
    });

    socket.on('friendRemoved', async (data: any) => {
      console.log(`🗑️ [Socket] ${userId} eliminó a ${data.friendId}`);
      if (onlineUsers.has(data.friendId)) {
        const remover = await User.findById(userId).select('username avatar firstName lastName').lean();
        io.to(data.friendId).emit('friendRemovedNotification', {
          friendshipId: data.friendshipId,
          removedBy: remover,
          timestamp: new Date()
        });
      }
      // Sync otras tabs
      io.to(userId).emit('friendRemovedConfirmation', {
        friendId: data.friendId,
        friendshipId: data.friendshipId
      });
    });

    // ============================================
    // 🔴 DESCONEXIÓN (CRÍTICA)
    // ============================================

    socket.on('disconnect', async (reason) => {
      console.log(`🔌 [Socket] Conexión cerrada: ${socket.id} de ${userId} (Razón: ${reason})`);

      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);

        if (userSockets.size === 0) {
          // 🚫 ÚLTIMA CONEXIÓN CERRADA -> El usuario está OFFLINE
          onlineUsers.delete(userId);
          console.log(`🔴 [Socket] Usuario ${userId} ahora está OFFLINE globalmente`);

          try {
            // 1. Actualizar base de datos
            await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });

            // 2. Emitir eventos de desconexión
            io.emit('userDisconnected', { userId });
            io.emit('userStatusChanged', { userId, isOnline: false });

            // 3. Emitir lista actualizada para sincronización total
            const updatedOnlineIds = Array.from(onlineUsers.keys());
            io.emit('onlineUsers', updatedOnlineIds);

            console.log(`📢 [Socket] Broadcast de desconexión enviado para ${userId}. Usuarios online: ${updatedOnlineIds.length}`);
          } catch (err) {
            console.error(`❌ [Socket] Error en proceso de desconexión para ${userId}:`, err);
          }
        } else {
          console.log(`📢 [Socket] ${userId} sigue online (${userSockets.size} pestañas restantes)`);
        }
      }
    });

  });
}

export default initializeSocket;