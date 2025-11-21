import mongoose, { Schema, model, Types, Document } from 'mongoose';

export interface IMessage extends Document {
  _id: Types.ObjectId;
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  senderModel: 'User' | 'Business';
  text: string; 
  readBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  conversation: { 
    type: Schema.Types.ObjectId, 
    ref: 'Conversation', 
    required: true,
    index: true
  },
  
  sender: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel'
  },

  senderModel: {
    type: String,
    required: true,
    enum: ['User', 'Business'] 
  },

  text: { 
    type: String, 
    required: true 
  },
  
  readBy: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }]
}, {
  timestamps: true,
  versionKey: false
});

export const Message = model<IMessage>('Message', messageSchema);
export default Message;