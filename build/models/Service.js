"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const serviceSchema = new mongoose_1.default.Schema({
    providerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Provider',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: String,
    price: Number,
    category: String,
    availability: [String],
});
exports.Service = mongoose_1.default.model('Service', serviceSchema);
