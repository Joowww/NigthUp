import { Schema, model, Types } from 'mongoose';

export interface IEvent {
  _id: Types.ObjectId;
  name: string;
  schedule: Date;
  location: {
    type: string;
    coordinates: [number, number];
  };
  description: string;
  category: string;
  capacity: number;
  price: number;
  participants: Types.ObjectId[];
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const eventSchema = new Schema<IEvent>({
  name: { type: String, required: true, unique: true },
  schedule: { type: Date, required: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  description: { type: String, required: true },
  category: { type: String, required: true },
  capacity: { type: Number, required: true },
  price: { type: Number, required: true },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  active: { type: Boolean, default: true }
}, {
  timestamps: true,
  versionKey: false
});

eventSchema.index({ location: '2dsphere' });

export const Event = model<IEvent>('Event', eventSchema);
export default Event;