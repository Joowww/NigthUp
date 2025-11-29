import { Schema, model, Types } from 'mongoose';

export interface IBusiness {
  _id: Types.ObjectId;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  location: {
        type: string;
        coordinates: [number, number];
    };
  events: Types.ObjectId[];
  managers: Types.ObjectId[];
  active: boolean;
  avatar?: string;
}

const businessSchema = new Schema<IBusiness>({
  name: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
  email: { type: String },
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
  events: [{ type: Schema.Types.ObjectId, ref: 'Event', default: [] }],
  managers: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  active: { type: Boolean, default: true },
  avatar: { type: String, default: '' } 
}, { 
  timestamps: false, 
  versionKey: false 
});

// Añade el índice geoespacial para location
businessSchema.index({ location: '2dsphere' });

export const Business = model<IBusiness>('Business', businessSchema);
export default Business;