import { Schema, model, Types } from 'mongoose';


export interface IRating {
  _id: Types.ObjectId;
  event: Types.ObjectId;        
  username: string;             
  score: number;               
  comment?: string;            
  createdAt?: Date;
  updatedAt?: Date;
}

const ratingSchema = new Schema<IRating>(
  {
    event: { 
      type: Schema.Types.ObjectId, 
      ref: 'Event', 
      required: true 
    },
    username: { 
      type: String, 
      required: true 
    },
    score: { 
      type: Number, 
      required: true, 
      min: 1, 
      max: 5 
    },
    comment: { 
      type: String, 
      default: '' 
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

ratingSchema.index({ event: 1, username: 1 }, { unique: true });

export const Rating = model<IRating>('Rating', ratingSchema);
export default Rating;