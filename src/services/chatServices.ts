import { Conversation, IConversation } from '../models/conversation';
import { Message, IMessage } from '../models/message';
import User from '../models/user';
import Business from '../models/business';
import mongoose, { Types } from 'mongoose';

export class ChatService {
  async getConversationsForUser(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const conversations = await Conversation.find({
      "participants.participant": userObjectId
    })
    .populate({
      path: 'lastMessage',
      model: 'Message'
    })
    .populate({
      path: 'participants.participant',
      model: 'User' // Popula temporalmente como User
    })
    .populate({
      path: 'participants.participant',
      model: 'Business' // Popula temporalmente como Business
    })
    .sort({ updatedAt: -1 }); // Las más recientes primero

    // Formatear la respuesta para que coincida con la interfaz `Chat` del frontend
    const formattedConversations = conversations.map(convo => {
      // Encontrar al "otro" participante (no soy yo)
      const otherParticipant = convo.participants.find(
        p => p.participant._id.toString() !== userId
      )?.participant;

      // Encontrar mi configuración para este chat (ej. isPinned)
      const mySettings = convo.settings.find(
        s => s.user.toString() === userId
      );

      // Calcular unreadCount (esto es un placeholder, lo implementaremos bien con sockets)
      const unreadCount = 0; // TODO: Implementar lógica de conteo de no leídos

      return {
        id: convo._id,
        // El `otherParticipant` puede ser `User` o `Business`, ambos tienen 'name'
        name: (otherParticipant as any)?.name || (otherParticipant as any)?.username || 'Chat Eliminado',
        // TODO: Añadir un campo 'avatar' a tus modelos User y Business
        avatar: (otherParticipant as any)?.avatar || 'https://via.placeholder.com/150', 
        type: (otherParticipant as any)?.constructor.modelName === 'User' ? 'user' : 'venue',
        lastMessage: (convo.lastMessage as IMessage)?.text,
        lastMessageTime: (convo.lastMessage as IMessage)?.createdAt || convo.updatedAt,
        unreadCount: unreadCount,
        isPinned: mySettings?.isPinned || false,
        // 'messages' no se envía en la lista, solo el último mensaje
      };
    });

    return formattedConversations;
  }

  /**
   * Obtiene todos los mensajes de una conversación específica.
   * Marca los mensajes como leídos por el usuario que los solicita.
   */
  async getMessagesForConversation(conversationId: string, userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1. Encontrar los mensajes
    const messages = await Message.find({
      conversation: conversationId
    })
    .sort({ createdAt: 'asc' }); // Orden cronológico

    // 2. Marcar mensajes como leídos
    // (Esto se puede optimizar, pero es funcional para empezar)
    await Message.updateMany(
      { 
        conversation: conversationId,
        sender: { $ne: userObjectId }, // No marcar mis propios mensajes como leídos por mí
        readBy: { $nin: [userObjectId] } // Solo actualizar si aún no lo he leído
      },
      {
        $addToSet: { readBy: userObjectId }
      }
    );

    // 3. Formatear para que coincida con la interfaz `Message` del frontend
    const formattedMessages = messages.map(msg => ({
      id: msg._id,
      senderId: msg.sender.toString(),
      text: msg.text,
      timestamp: msg.createdAt,
      // La lógica de 'read' del frontend (tick simple/doble) se basará en si
      // el 'senderId' es el 'currentUserId' y el estado de 'readBy'
      read: msg.readBy.length > 0 // Simplificado por ahora
    }));
    
    return formattedMessages;
  }

  /**
   * Encuentra o crea una conversación entre dos participantes.
   * Devuelve el ID de la conversación.
   */
  async findOrCreateConversation(
    participant1Id: string, 
    participant1Model: 'User' | 'Business',
    participant2Id: string, 
    participant2Model: 'User' | 'Business'
  ): Promise<IConversation> {
    
    const p1Id = new mongoose.Types.ObjectId(participant1Id);
    const p2Id = new mongoose.Types.ObjectId(participant2Id);

    // Buscar una conversación existente con ambos participantes
    // Esta consulta es compleja debido a la estructura de participantes
    let conversation = await Conversation.findOne({
      $and: [
        { "participants": { $elemMatch: { participant: p1Id, participantModel: participant1Model } } },
        { "participants": { $elemMatch: { participant: p2Id, participantModel: participant2Model } } },
        { "participants": { $size: 2 } } // Asegura que solo sean ellos dos
      ]
    });

    if (!conversation) {
      // Si no existe, crear una nueva
      conversation = new Conversation({
        participants: [
          { participant: p1Id, participantModel: participant1Model },
          { participant: p2Id, participantModel: participant2Model }
        ],
        settings: [] // Ajustes iniciales vacíos
      });
      await conversation.save();
    }

    return conversation;
  }


  async createMessage(
    conversationId: string, 
    senderId: string, 
    senderModel: 'User' | 'Business', 
    text: string
  ) {
    // Usamos una sesión para asegurar que ambas operaciones (crear msg y actualizar chat)
    // funcionen o fallen juntas.
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // 1. Crear el nuevo mensaje
      const newMessage = new Message({
        conversation: conversationId,
        sender: senderId,
        senderModel: senderModel,
        text: text,
        readBy: [senderId] // El emisor siempre lo ha "leído"
      });
      await newMessage.save({ session });

      // 2. Actualizar la conversación con el último mensaje
      await Conversation.findByIdAndUpdate(
        conversationId,
        { 
          lastMessage: newMessage._id,
          $set: { updatedAt: new Date() } // Forzar actualización del timestamp
        },
        { session }
      );

      // 3. Si todo va bien, confirmar
      await session.commitTransaction();

      // 4. Poblar el emisor para devolver el mensaje completo al socket
      const populatedMessage = await Message.findById(newMessage._id)
        .populate({
          path: 'sender',
          model: senderModel,
          select: 'username name avatar' // Obtener solo los campos necesarios
        });
        
      return populatedMessage;

    } catch (error) {
      // 5. Si algo falla, revertir todo
      await session.abortTransaction();
      throw new Error(`Error creating message: ${(error as Error).message}`);
    } finally {
      // 6. Cerrar la sesión
      session.endSession();
    }
  }

}