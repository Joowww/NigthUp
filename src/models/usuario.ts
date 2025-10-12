import mongoose, { Schema, model, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUsuario {
  _id: Types.ObjectId;
  username: string;
  gmail: string;
  password: string;
  birthday: Date;
  eventos: Types.ObjectId[];
  active: boolean;
  admin: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isModified(path: string): boolean;
}

const usuarioSchema = new Schema<IUsuario>({
  username: { type: String, required: true, unique: true },
  gmail: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  birthday: { type: Date, required: true },
  eventos: [{ type: Schema.Types.ObjectId, ref: 'Evento', default: [] }],
  active: { type: Boolean, default: true },
  admin: { type: Boolean, default: false }
}, {
  timestamps: false,
  versionKey: false
});

usuarioSchema.pre<IUsuario>('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt();
  const hash = await bcrypt.hash(this.password, salt);
  this.password = hash;
  next();
});

usuarioSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const Usuario = model<IUsuario>('Usuario', usuarioSchema);
export default Usuario;