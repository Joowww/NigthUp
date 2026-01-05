import mongoose, { Schema, Document } from 'mongoose';

export interface IReaction {
  user: mongoose.Types.ObjectId;
  emoji: string;
}

export interface IMessage extends Document {
  conversation: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  text: string;
  messageType: 'text' | 'image' | 'audio';
  imageUrl?: string;
  audioUrl?: string;
  readBy: mongoose.Types.ObjectId[];
  isEdited: boolean;
  isDeleted: boolean;
  replyTo?: mongoose.Types.ObjectId;
  reactions: IReaction[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    text: {
      type: String,
      default: '',
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'audio'],
      default: 'text',
    },
    imageUrl: {
      type: String,
    },
    audioUrl: {
      type: String,
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    reactions: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        emoji: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

MessageSchema.index({ conversation: 1, createdAt: -1 });


export default mongoose.model<IMessage>('Message', MessageSchema);