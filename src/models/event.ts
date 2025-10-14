import { Schema, model, Types } from 'mongoose';

export interface IEvent {
  _id: Types.ObjectId;
  name: string;
  schedule: string;
  address?: string;
  participants: Types.ObjectId[];
  active: boolean;
}

const eventSchema = new Schema<IEvent>({
  name: { type: String, required: true },
  schedule: { type: String, required: true },
  address: { type: String },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  active: { type: Boolean, default: true } 
}, { 
  timestamps: false, 
  versionKey: false 
});

export const Event = model<IEvent>('Event', eventSchema);
export default Event;