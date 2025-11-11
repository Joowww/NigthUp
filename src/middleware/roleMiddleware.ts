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
    console.log('[ROLE] User:', user);

    if (!user || user.role !== 'admin') {
        console.log('[ROLE] User is not admin');
        return res.status(403).json({ error: 'Admin privileges required' });
    }
    next();
};

export const requireManager = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    console.log('[ROLE] User:', user);

    if (!user || (user.role !== 'manager' && user.role !== 'admin')) {
        console.log('[ROLE] User is not manager or admin');
        return res.status(403).json({ error: 'Manager or Admin privileges required' });
    }
    next();
};

export const requireAdminOrManager = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    console.log('[ROLE] User:', user);

    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
        console.log('[ROLE] User is not admin or manager');
        return res.status(403).json({ error: 'Admin or Manager privileges required' });
    }
    next();
};

export const requireUser = requireRole(['user', 'manager', 'admin']);