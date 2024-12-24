"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Provider = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const providerSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    businessName: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    services: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Service'
        }],
    reviews: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Review'
        }],
    rating: {
        type: Number,
        min: 0,
        max: 5
    },
    location: {
        type: String
    },
    category: {
        type: String
    }
}, {
    timestamps: true
});
exports.Provider = mongoose_1.default.model('Provider', providerSchema);
