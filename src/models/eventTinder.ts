import { Schema, model, Types } from 'mongoose';

export interface IEventTinder {
  _id: Types.ObjectId;
  eventId: Types.ObjectId;
  participants: {
    userId: Types.ObjectId;
    isParticipating: boolean;
    likes: Types.ObjectId[];
    dislikes: Types.ObjectId[];
    matches: Types.ObjectId[];
  }[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const eventTinderSchema = new Schema<IEventTinder>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    participants: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        isParticipating: { type: Boolean, default: false },
        likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        dislikes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        matches: [{ type: Schema.Types.ObjectId, ref: 'User' }]
      }
    ],
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Índice compuesto para evitar duplicados
eventTinderSchema.index({ eventId: 1, 'participants.userId': 1 }, { unique: true });

export const EventTinder = model<IEventTinder>('EventTinder', eventTinderSchema);
export default EventTinder;