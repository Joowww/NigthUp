import { Schema, model, Types } from 'mongoose';

export interface IUserInterest {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  color: string;
  users: Types.ObjectId[];
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const userInterestSchema = new Schema<IUserInterest>({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  description: { 
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#8b5cf6'
  },
  users: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    default: [] 
  }],
  active: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true,
  versionKey: false
});

export const UserInterest = model<IUserInterest>('UserInterest', userInterestSchema);
export default UserInterest;