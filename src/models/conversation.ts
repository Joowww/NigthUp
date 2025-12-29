// conversation.ts
import mongoose, { Schema, model, Types, Document } from 'mongoose';

export interface IGroupPollOption {
  text: string;
  voters: Types.ObjectId[];
}

export interface IGroupPoll {
  _id: Types.ObjectId;
  question: string;
  options: IGroupPollOption[];
  creator: Types.ObjectId;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
}

export interface IGroupParticipant {
  participant: Types.ObjectId;
  participantModel: 'User';
  role: 'creator' | 'member';
  joinedAt?: Date;
}

export interface IConversation extends Document {
  question: any;
  options: any;
  creator: any;
  _id: Types.ObjectId;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  groupAdmins?: Types.ObjectId[];
  groupDescription?: string;
  groupImage?: string;
  groupPolls?: IGroupPoll[];
  participants: IGroupParticipant[];
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
      required: function (this: IConversation) {
        return this.isGroup;
      }
    },
    groupAvatar: {
      type: String,
      default: 'https://via.placeholder.com/150'
    },
    groupAdmins: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: []
    }],
    groupDescription: { type: String, default: '' },
    groupImage: { type: String, default: '' },
    groupPolls: [
      {
        _id: { type: Schema.Types.ObjectId, required: true },
        question: { type: String, required: true },
        options: [
          {
            text: { type: String, required: true },
            voters: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }]
          }
        ],
        creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        isActive: { type: Boolean, default: true },
        expiresAt: { type: Date },
        createdAt: { type: Date, required: true }
      }
    ],
    participants: [
      {
        participant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        participantModel: { type: String, enum: ['User'], required: true },
        role: { type: String, enum: ['creator', 'member'], required: true },
        joinedAt: { type: Date }
      }
    ],
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
