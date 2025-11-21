import { Schema, model, Types } from 'mongoose';

export interface IPoll {
  _id: Types.ObjectId;
  creator: Types.ObjectId;
  question: string;
  options: {
    text: string;
    voters: Types.ObjectId[];
  }[];
  isActive: boolean;
  isPublic: boolean;
  allowedVoters?: Types.ObjectId[];
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const pollSchema = new Schema<IPoll>(
  {
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: String, required: true },
    options: [
      {
        text: { type: String, required: true },
        voters: [{ type: Schema.Types.ObjectId, ref: 'User' }]
      }
    ],
    isActive: { type: Boolean, default: true },
    isPublic: { type: Boolean, default: true },
    allowedVoters: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    expiresAt: { type: Date }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const Poll = model<IPoll>('Poll', pollSchema);
export default Poll;