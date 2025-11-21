import mongoose, { Schema, model, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  birthday: Date;
  events: Types.ObjectId[];
  active: boolean;
  role: string;
  googleId?: string;
  googleProfile?: {
    name?: string;
    picture?: string;
    locale?: string;
  };
  authProvider: 'local' | 'google';
  
  isOnline: boolean;
  lastSeen: Date;
  emergencyContacts: string[];
  location?: {
    type: string;
    coordinates: [number, number];
  };
  isVisibleOnMap: boolean;
  lastLocationUpdate?: Date;
  profilePicture?: string;
  bio?: string;
  
  comparePassword(candidatePassword: string): Promise<boolean>;
  isModified(path: string): boolean;
  createdAt?: Date;
  updatedAt?: Date;
  avatar?: string;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  birthday: { type: Date, required: true },
  events: [{ type: Schema.Types.ObjectId, ref: 'Event', default: [] }],
  active: { type: Boolean, default: true },
  role: { type: String, required: true, enum: ['admin', 'manager', 'user'], default: 'user' },
  avatar: { type: String, default: '' },
  googleId: {
    type: String,
    sparse: true
  },
  googleProfile: {
    name: String,
    picture: String,
    locale: String
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  emergencyContacts: [{ type: String, default: [] }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  isVisibleOnMap: { type: Boolean, default: true },
  lastLocationUpdate: { type: Date },
  profilePicture: { type: String },
  bio: { type: String, maxlength: 500 }
}, {
  timestamps: true,
  versionKey: false
});

userSchema.index({ location: '2dsphere' });

userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  console.log('  Hasheando contraseña...');
  const salt = await bcrypt.genSalt();
  const hash = await bcrypt.hash(this.password, salt);
  this.password = hash;
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = model<IUser>('User', userSchema);
export default User;