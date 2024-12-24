"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const user_1 = __importDefault(require("./routes/user"));
const service_1 = __importDefault(require("./routes/service"));
const bookings_1 = __importDefault(require("./routes/bookings"));
const registration_1 = __importDefault(require("./routes/registration"));
const provider_1 = __importDefault(require("./routes/provider"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const app = (0, express_1.default)();
require('dotenv').config();
const PORT = process.env.PORT || 5000;
const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/service-platform';
// Connect to MongoDB
mongoose_1.default.connect(dbUrl).then(() => {
    console.log('MongoDB connected successfully');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
    return;
});
// Configure CORS - before any routes
app.use((0, cors_1.default)({
    origin: ['http://localhost:4200', 'http://localhost:5000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Body parser middleware
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Log minimal request info
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
// Routes
app.use('/api/users', user_1.default);
app.use('/api/services', service_1.default);
app.use('/api/bookings', bookings_1.default);
app.use('/api/registration-requests', registration_1.default);
app.use('/api/providers', provider_1.default);
app.use('/api/notifications', notifications_1.default);
// Health check route
app.get('/', (_req, res) => {
    res.json({ message: 'Backend is running!' });
});
// Error handling middleware
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({
        message: err.message || 'Something went wrong!',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('Length:', process.env.JWT_SECRET.length);
exports.default = app;
