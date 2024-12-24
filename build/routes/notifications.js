"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = void 0;
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const Notification_1 = require("../models/Notification");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all notifications for the authenticated user
router.get('/', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const notifications = yield Notification_1.Notification.find({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId })
            .sort({ createdAt: -1 }); // Sort by newest first
        res.json({ data: notifications });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Get unread count for the authenticated user
router.get('/unread-count', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const count = yield Notification_1.Notification.countDocuments({
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
            read: false
        });
        res.json({ data: count });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Mark a notification as read
router.patch('/:id/read', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const notification = yield Notification_1.Notification.findOneAndUpdate({ _id: req.params.id, userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId }, { read: true }, { new: true });
        if (!notification) {
            res.status(404).json({ message: 'Notification not found' });
            return;
        }
        res.json({ data: notification });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
router.patch('/read-all', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // Update notifications
        const updated = yield Notification_1.Notification.updateMany({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId, read: false }, { read: true });
        if (updated.matchedCount === 0) {
            res.status(404).json({ message: 'No unread notifications found' });
            return;
        }
        // Fetch updated notifications
        const notifications = yield Notification_1.Notification.find({ userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId })
            .sort({ createdAt: -1 });
        res.json({ data: notifications });
    }
    catch (error) {
        console.error('Error marking notifications as read:', error);
        res.status(500).json({ message: 'Failed to update notifications' });
        return;
    }
}));
// Create a booking notification
router.post('/booking', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { message } = req.body;
        if (!message) {
            res.status(400).json({ message: 'Message is required' });
            return;
        }
        const notificationData = {
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
            message,
            type: 'BOOKING',
            read: false
        };
        // Only add relatedId if it's provided and valid
        if (req.body.relatedId && mongoose_1.default.Types.ObjectId.isValid(req.body.relatedId)) {
            Object.assign(notificationData, {
                relatedId: new mongoose_1.default.Types.ObjectId(req.body.relatedId)
            });
        }
        const notification = new Notification_1.Notification(notificationData);
        const savedNotification = yield notification.save();
        res.status(201).json({
            success: true,
            data: savedNotification
        });
    }
    catch (error) {
        console.error('Notification creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create notification',
            error: error.message
        });
    }
}));
// Delete a notification
router.delete('/:id', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const notification = yield Notification_1.Notification.findOneAndDelete({
            _id: req.params.id,
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId
        });
        if (!notification) {
            res.status(404).json({ message: 'Notification not found' });
            return;
        }
        res.json({ message: 'Notification deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Create a notification (internal use only, not exposed as API)
const createNotification = (userId_1, message_1, ...args_1) => __awaiter(void 0, [userId_1, message_1, ...args_1], void 0, function* (userId, message, type = 'SYSTEM', relatedId) {
    try {
        const notification = new Notification_1.Notification({
            userId,
            message,
            type,
            relatedId
        });
        yield notification.save();
    }
    catch (error) {
        console.error('Failed to create notification:', error);
    }
});
exports.createNotification = createNotification;
exports.default = router;
