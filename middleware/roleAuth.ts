import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const requireRole = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        try {
            if (!req.user || !req.user.role) {
                res.status(403).json({ message: 'Access denied: No role specified' });
                return;
            }

            if (!allowedRoles.includes(req.user.role)) {
                res.status(403).json({ message: 'Access denied: Insufficient permissions' });
                return;
            }

            next();
        } catch (error) {
            res.status(403).json({ message: 'Access denied' });
        }
    };
};
