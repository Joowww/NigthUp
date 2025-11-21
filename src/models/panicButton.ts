import { Schema, model, Types } from 'mongoose';

export interface IPanicButton {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  location: {
    type: string;
    coordinates: [number, number];
  };
  activatedAt: Date;
  emergencyContacts: string[];
  message?: string;
}

const panicButtonSchema = new Schema<IPanicButton>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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
  activatedAt: { type: Date, default: Date.now },
  emergencyContacts: [{ type: String }], // Teléfonos de emergencia
  message: { type: String, default: '¡Necesito ayuda!' }
});

panicButtonSchema.index({ location: '2dsphere' });

export const PanicButton = model<IPanicButton>('PanicButton', panicButtonSchema);
export default PanicButton;