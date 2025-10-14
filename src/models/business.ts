import { Schema, model, Types } from 'mongoose';
import { IEvent } from './event';

export interface IBussines {
  _id: Types.ObjectId;//CIF
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  eventos?: IEvent[];
  managers?: Types.ObjectId[];//id of that users who are managers of the business
  active: boolean;
}
const bussinesSchema = new Schema<IBussines>({
  name: { type: String, required: true },
  address: { type: String },
    phone: { type: String },
    email: { type: String },
    eventos: [{ type: Schema.Types.ObjectId, ref: 'Evento', default: undefined }],
  active: { type: Boolean, default: true } 
}, { 
  timestamps: false, 
  versionKey: false 
});

export const Bussines = model<IBussines>('bussines', bussinesSchema);
export default Bussines;