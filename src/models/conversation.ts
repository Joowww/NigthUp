import mongoose, { Schema, model, Types, Document } from 'mongoose';
import { IMessage } from './message'; // Importamos la interfaz del mensaje
import { IUser } from './user'; // Importamos la interfaz de usuario

// Interfaz para un participante (que puede ser User o Business)
interface IParticipant {
  participant: Types.ObjectId;
  participantModel: 'User' | 'Business';
}

// Interfaz para las configuraciones por usuario (ej. fijar chat)
interface IConversationSettings {
  user: Types.ObjectId; // El usuario al que pertenece esta config
  isPinned: boolean;
}

// Interfaz para el documento de Conversación
export interface IConversation extends Document {
  _id: Types.ObjectId;
  participants: IParticipant[];
  lastMessage?: Types.ObjectId | IMessage; // Referencia al último mensaje (para la lista de chats)
  settings: IConversationSettings[];
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>({
  participants: [{
    _id: false, // No crear _id para este sub-documento
    participant: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'participants.participantModel' // Referencia dinámica
    },
    participantModel: {
      type: String,
      required: true,
      enum: ['User', 'Business'] // Los participantes pueden ser Usuarios o Negocios
    }
  }],
  
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  
  settings: [{
    _id: false, // No crear _id para este sub-documento
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isPinned: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true, // Añade createdAt y updatedAt
  versionKey: false
});

// Índice para buscar conversaciones por participantes
conversationSchema.index({ "participants.participant": 1 });

export const Conversation = model<IConversation>('Conversation', conversationSchema);
export default Conversation;