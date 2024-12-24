import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: string;
    };
}

// Ensure JWT_SECRET exists
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        let token = req.header('Authorization');
        console.log('Original Auth Header:', token); // Debug log

        // Handle different token formats
        if (token) {
            // Remove 'Bearer ' if present
            token = token.replace(/^Bearer\s+/i, '');
            // Remove any quotes if present
            token = token.replace(/["']/g, '');
            // Trim any whitespace
            token = token.trim();
        }

        if (!token) {
            console.error('No token provided');
            res.status(401).json({ message: 'No token provided' });
            return;
        }

        try {
            // Debug logs
            console.log('Cleaned token:', token);
            console.log('Token length:', token.length);
            console.log('JWT_SECRET length:', JWT_SECRET.length);

            const decoded = jwt.verify(token, JWT_SECRET, {
                algorithms: ['HS256'],
                ignoreExpiration: false // Ensure token hasn't expired
            }) as {
                userId: string;
                email: string;
                role: string;
            };

            // Debug log
            console.log('Decoded token:', decoded);

            req.user = decoded;
            next();
        } catch (error) {
            console.error('Token verification error:', error);
            if (error instanceof jwt.TokenExpiredError) {
                res.status(401).json({ message: 'Token expired' });
            } else if (error instanceof jwt.JsonWebTokenError) {
                res.status(401).json({ 
                    message: 'Invalid token',
                    error: error.message // Include specific error for debugging
                });
            } else {
                res.status(401).json({ 
                    message: 'Authentication failed',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Middleware to check if user is a provider
export const requireProvider = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }

        // Log user info for debugging
        console.log('User in requireProvider:', {
            userId: req.user.userId,
            role: req.user.role
        });

        if (req.user.role !== 'provider') {
            res.status(403).json({ message: 'Provider access required' });
            return;
        }

        next();
    } catch (error) {
        console.error('Provider auth error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Helper function to verify JWT token
export const verifyToken = (token: string): { userId: string; email: string; role: string } => {
    try {
        return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Token expired');
        } else if (error instanceof jwt.JsonWebTokenError) {
            throw new Error('Invalid token');
        }
        throw new Error('Token verification failed');
    }
};
