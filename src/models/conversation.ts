import mongoose, { Schema, model, Types, Document } from 'mongoose';
import { IMessage } from './message';
import { IUser } from './user';

interface IParticipant {
    participant: Types.ObjectId;
    participantModel: 'User' | 'Business';
    role: 'member' | 'admin' | 'creator';
    joinedAt: Date;
}

interface IConversationSettings {
    user: Types.ObjectId;
    isPinned: boolean;
    muted: boolean;
}

export interface IGroupPoll {
    _id: Types.ObjectId;
    question: string;
    options: {
        text: string;
        voters: Types.ObjectId[];
    }[];
    creator: Types.ObjectId;
    isActive: boolean;
    expiresAt?: Date;
    createdAt: Date;
}

export interface IConversation extends Document {
    _id: Types.ObjectId;
    participants: IParticipant[];
    lastMessage?: Types.ObjectId | IMessage;
    settings: IConversationSettings[];
    isGroup: boolean;
    groupName?: string;
    groupDescription?: string;
    groupImage?: string;
    groupAdmins: Types.ObjectId[];
    groupPolls: IGroupPoll[];
    createdAt: Date;
    updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>({
    participants: [{
        _id: false,
        participant: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: 'participants.participantModel'
        },
        participantModel: {
            type: String,
            required: true,
            enum: ['User', 'Business']
        },
        role: {
            type: String,
            enum: ['member', 'admin', 'creator'],
            default: 'member'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: 'Message',
        default: null
    },
    settings: [{
        _id: false,
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        isPinned: {
            type: Boolean,
            default: false
        },
        muted: {
            type: Boolean,
            default: false
        }
    }],
    isGroup: {
        type: Boolean,
        default: false
    },
    groupName: {
        type: String,
        required: function() { return this.isGroup; }
    },
    groupDescription: {
        type: String
    },
    groupImage: {
        type: String
    },
    groupAdmins: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    groupPolls: [{
        _id: { type: Schema.Types.ObjectId, auto: true },
        question: { type: String, required: true },
        options: [{
            text: { type: String, required: true },
            voters: [{ type: Schema.Types.ObjectId, ref: 'User' }]
        }],
        creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        isActive: { type: Boolean, default: true },
        expiresAt: { type: Date },
        createdAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true,
    versionKey: false
});

conversationSchema.index({ "participants.participant": 1 });
conversationSchema.index({ isGroup: 1, updatedAt: -1 });

export const Conversation = model<IConversation>('Conversation', conversationSchema);
export default Conversation;