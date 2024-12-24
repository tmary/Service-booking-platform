"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
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
        }
        catch (error) {
            res.status(403).json({ message: 'Access denied' });
        }
    };
};
exports.requireRole = requireRole;
