"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationRequest = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const registrationRequestSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    businessName: { type: String, required: true },
    description: { type: String, required: true },
    documents: { type: [String], required: true }, // Array of document paths
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });
exports.RegistrationRequest = mongoose_1.default.model('RegistrationRequest', registrationRequestSchema);
