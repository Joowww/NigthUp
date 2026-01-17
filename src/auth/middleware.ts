import { Request, Response, NextFunction } from 'express';
import { verifyToken, verifyRefreshToken } from './token';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  (req as any).user = decoded;
  next();
};

export const authenticateRefreshToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken, userId } = req.body;
    if (!refreshToken || !userId) {
      return res.status(401).json({ error: 'Refresh token y userId requeridos' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({ error: 'Refresh token inválido o expirado' });
    }

    const refreshTokenUserId = (decoded as any).id;
    if (refreshTokenUserId !== userId) {
      return res.status(403).json({ error: 'El userId no coincide con el del token' });
    }

    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Error interno en la verificación del refresh token' });
  }
};