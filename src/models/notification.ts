import { Schema, model, Types } from 'mongoose';

export interface INotification {
  _id: Types.ObjectId;
  recipient: Types.ObjectId;
  sender: Types.ObjectId;
  type: 'friend_request' | 'friend_accepted' | 'friend_rejected';
  friendshipId: Types.ObjectId;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['friend_request', 'friend_accepted', 'friend_rejected'],
      required: true
    },
    friendshipId: { type: Schema.Types.ObjectId, ref: 'Friendship', required: true },
    read: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ friendshipId: 1 });

export const Notification = model<INotification>('Notification', notificationSchema);