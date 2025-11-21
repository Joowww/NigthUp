import { sign, verify } from 'jsonwebtoken';
import { IUser } from '../models/user';

const JWT_SECRET = process.env.JWT_SECRET || 'nightup_secret_key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'nightup_refresh_secret';

export const generateToken = (user: IUser): string => {
  const payload = { 
    id: user._id.toString(), 
    username: user.username,
    role: user.role 
  };
  return sign(payload, JWT_SECRET, { expiresIn: '1h' });
};

export const generateRefreshToken = (user: IUser): string => {
  const payload = { 
    id: user._id.toString(),
    username: user.username,
    role: user.role 
  };
  return sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string) => {
  try {
    return verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (refreshToken: string) => {
  try {
    return verify(refreshToken, JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

export const generateResetToken = (user: IUser): string => {
    const payload = {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        type: 'password_reset'
    };
    return sign(payload, JWT_SECRET, { expiresIn: '1h' });
};