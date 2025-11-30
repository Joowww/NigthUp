// conversation.ts
import mongoose, { Schema, model, Types, Document } from 'mongoose';

export interface IConversation extends Document {
  _id: Types.ObjectId;
  isGroup: boolean; 
  groupName?: string; 
  groupAvatar?: string; 
  groupAdmins?: Types.ObjectId[]; 
  participants: Types.ObjectId[];
  lastMessage?: {
    message: string;
    senderId: Types.ObjectId;
    createdAt: Date;
  };
  settings: any[];
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    isGroup: {
      type: Boolean,
      default: false 
    },
    groupName: {
      type: String,
      required: function(this: IConversation) {
        return this.isGroup; 
      }
    },
    groupAvatar: {
      type: String,
      default: 'https://via.placeholder.com/150'
    },
    groupAdmins: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    participants: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }],
    lastMessage: {
      type: {
        message: { type: String, required: true },
        senderId: { type: Schema.Types.ObjectId, required: true },
        createdAt: { type: Date, required: true }
      },
      required: false,
      _id: false
    },
    settings: [Schema.Types.Mixed]
  },
  {
    timestamps: true
  }
);

export const Conversation = model<IConversation>('Conversation', conversationSchema);
