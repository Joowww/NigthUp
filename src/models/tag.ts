import { Schema, model, Types } from 'mongoose';

export interface ITag {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  color: string;
  events: Types.ObjectId[];
  active: boolean;
  type: 'MusicType' | 'Musician' | 'EventType' | 'ChildhoodIdol'; 
  createdAt?: Date;
  updatedAt?: Date;
}

const tagSchema = new Schema<ITag>({
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
    default: '#3b82f6'
  },
  events: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Event', 
    default: [] 
  }],
  active: { 
    type: Boolean, 
    default: true 
  },
  type: { 
    type: String,
    enum: ['MusicType', 'Musician', 'EventType', 'ChildhoodIdol'],
    required: true
  }
}, {
  timestamps: true,
  versionKey: false
});

export const Tag = model<ITag>('Tag', tagSchema);
export default Tag;