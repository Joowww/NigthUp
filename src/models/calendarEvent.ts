import { Schema, model, Types } from 'mongoose';

export interface ICalendarEvent {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay: boolean;
  type: 'personal' | 'event' | 'business' | 'shared';
  relatedEvent?: Types.ObjectId;
  location?: string;
  reminders: Date[];
  
  // NUEVO: Para eventos compartidos
  sharedWith: {
    userId: Types.ObjectId;
    permission: 'view' | 'edit';
    status: 'pending' | 'accepted' | 'declined';
  }[];
  isPublic: boolean;
  color?: string;
  
  createdAt?: Date;
  updatedAt?: Date;
}

const calendarEventSchema = new Schema<ICalendarEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    allDay: { type: Boolean, default: false },
    type: { type: String, enum: ['personal', 'event', 'business', 'shared'], required: true },
    relatedEvent: { type: Schema.Types.ObjectId, ref: 'Event' },
    location: { type: String },
    reminders: [{ type: Date }],
    
    // NUEVO: Para eventos compartidos
    sharedWith: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      permission: { type: String, enum: ['view', 'edit'], default: 'view' },
      status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' }
    }],
    isPublic: { type: Boolean, default: false },
    color: { type: String, default: '#3b82f6' }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const CalendarEvent = model<ICalendarEvent>('CalendarEvent', calendarEventSchema);
export default CalendarEvent;