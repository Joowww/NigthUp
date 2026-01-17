import { Request, Response, NextFunction } from 'express';

export const requireRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = (req as any).user?.role;

        if (!userRole || !roles.includes(userRole)) {
            return res.status(403).json({
                error: 'Permisos insuficientes para realizar esta acción'
            });
        }

        next();
    };
};


export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin privileges required' });
    }
    next();
};

export const requireManager = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || (user.role !== 'manager' && user.role !== 'admin')) {
        return res.status(403).json({ error: 'Manager or Admin privileges required' });
    }
    next();
};

export const requireAdminOrManager = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
        return res.status(403).json({ error: 'Admin or Manager privileges required' });
    }
    next();
};

export const requireUser = requireRole(['user', 'manager', 'admin']);