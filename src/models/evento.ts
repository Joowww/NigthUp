import { Schema, model, Types } from 'mongoose';

export interface IEvento {
  _id: Types.ObjectId;
  name: string;
  schedule: string;
  address?: string;
  participantes: Types.ObjectId[];
}

const eventoSchema = new Schema<IEvento>({
  name: { type: String, required: true },
  schedule: { type: String, required: true },
  address: { type: String },
  participantes: [{ type: Schema.Types.ObjectId, ref: 'Usuario', default: [] }]
}, { timestamps: false, versionKey: false });

export const Evento = model<IEvento>('Evento', eventoSchema);
export default Evento;
