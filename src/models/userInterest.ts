import { Schema, model, Types, Document } from 'mongoose';

export interface IUserInterest extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  tagId: Types.ObjectId;
  score: number;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const userInterestSchema = new Schema<IUserInterest>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  tagId: {
    type: Schema.Types.ObjectId,
    ref: 'Tag',
    required: true,
    index: true
  },
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 1
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índice compuesto único para evitar duplicados
userInterestSchema.index({ userId: 1, tagId: 1 }, { unique: true });

export const UserInterest = model<IUserInterest>('UserInterest', userInterestSchema);
export default UserInterest;