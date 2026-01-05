import { Schema, model, Types } from 'mongoose';

export const DEFAULT_EVENT_IMAGE = '/default-images/default-event.jpg';


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
    city: string;
    capacity: number;
    price: number;
    participants: Types.ObjectId[];
    likes: number;
    likedBy: Types.ObjectId[];
    active: boolean;
    image: string;
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
    city: { type: String, required: false, default: '' },
    capacity: { type: Number, required: true },
    price: { type: Number, required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    likes: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    active: { type: Boolean, default: true },
    image: {
        type: String,
        default: DEFAULT_EVENT_IMAGE
    }
}, {
    timestamps: true,
    versionKey: false
});

eventSchema.index({ location: '2dsphere' });

export const Event = model<IEvent>('Event', eventSchema);
export default Event;