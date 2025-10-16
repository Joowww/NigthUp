import { Schema, model, Types } from 'mongoose';

export interface IBusiness {
  _id: Types.ObjectId;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  events: Types.ObjectId[];
  managers: Types.ObjectId[];
  active: boolean;
}

const businessSchema = new Schema<IBusiness>({
  name: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
  email: { type: String },
  events: [{ type: Schema.Types.ObjectId, ref: 'Event', default: [] }],
  managers: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  active: { type: Boolean, default: true } 
}, { 
  timestamps: false, 
  versionKey: false 
});

export const Business = model<IBusiness>('Business', businessSchema);
export default Business;