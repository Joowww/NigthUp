import { Schema, model, Types } from 'mongoose';

export interface IFriendship {
  _id: Types.ObjectId;
  requester: Types.ObjectId;
  recipient: Types.ObjectId;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt?: Date;
  updatedAt?: Date;
}

const friendshipSchema = new Schema<IFriendship>(
  {
    requester: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'blocked'], default: 'pending' }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

friendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

export const Friendship = model<IFriendship>('Friendship', friendshipSchema);
export default Friendship;