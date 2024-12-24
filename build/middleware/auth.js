"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.requireProvider = exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Ensure JWT_SECRET exists
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}
const auth = (req, res, next) => {
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
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET, {
                algorithms: ['HS256'],
                ignoreExpiration: false // Ensure token hasn't expired
            });
            // Debug log
            console.log('Decoded token:', decoded);
            req.user = decoded;
            next();
        }
        catch (error) {
            console.error('Token verification error:', error);
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                res.status(401).json({ message: 'Token expired' });
            }
            else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                res.status(401).json({
                    message: 'Invalid token',
                    error: error.message // Include specific error for debugging
                });
            }
            else {
                res.status(401).json({
                    message: 'Authentication failed',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.auth = auth;
// Middleware to check if user is a provider
const requireProvider = (req, res, next) => {
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
    }
    catch (error) {
        console.error('Provider auth error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.requireProvider = requireProvider;
// Helper function to verify JWT token
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new Error('Token expired');
        }
        else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new Error('Invalid token');
        }
        throw new Error('Token verification failed');
    }
};
exports.verifyToken = verifyToken;
