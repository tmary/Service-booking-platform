"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const notificationSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ['BOOKING', 'SYSTEM', 'UPDATE'],
        default: 'SYSTEM'
    },
    relatedId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        refPath: 'type'
    }
}, {
    timestamps: true
});
exports.Notification = mongoose_1.default.model('Notification', notificationSchema);
