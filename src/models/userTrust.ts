import { Schema, model, Types } from 'mongoose';

export interface IUserTrust {
  _id: Types.ObjectId;
  rater: Types.ObjectId;        // Usuario que califica
  rated: Types.ObjectId;        // Usuario calificado
  score: number;               // Puntuación de confianza (1-5)
  comment?: string;            // Comentario opcional
  context: string;             // Contexto de la interacción (evento, transacción, etc.)
  createdAt?: Date;
  updatedAt?: Date;
}

const userTrustSchema = new Schema<IUserTrust>(
  {
    rater: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rated: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      default: ''
    },
    context: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Índice compuesto para evitar valoraciones duplicadas
userTrustSchema.index({ rater: 1, rated: 1, context: 1 }, { unique: true });

export const UserTrust = model<IUserTrust>('UserTrust', userTrustSchema);
export default UserTrust;