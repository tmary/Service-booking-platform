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
const express_1 = __importDefault(require("express"));
const RegistrationRequest_1 = require("../models/RegistrationRequest");
const router = express_1.default.Router();
// Endpoint to create a registration request
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, businessName, description, documents } = req.body;
        // Create new registration request
        const request = new RegistrationRequest_1.RegistrationRequest({
            name,
            email,
            businessName,
            description,
            documents, // File paths or metadata for uploaded files
            status: 'pending', // Default status
        });
        const savedRequest = yield request.save();
        res.status(201).json({ message: 'Registration request created', request: savedRequest });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Error creating registration request:', error.message);
            res.status(400).json({ message: error.message });
        }
        else {
            console.error('Unexpected error:', error);
            res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
}));
// Endpoint for admin to fetch all pending registration requests
router.get('/pending', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pendingRequests = yield RegistrationRequest_1.RegistrationRequest.find({ status: 'pending' });
        res.json(pendingRequests);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching pending requests:', error.message);
            res.status(500).json({ message: error.message });
        }
        else {
            console.error('Unexpected error:', error);
            res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
}));
// Endpoint to update request status (e.g., approve or reject)
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.body;
        const updatedRequest = yield RegistrationRequest_1.RegistrationRequest.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true });
        if (!updatedRequest) {
            res.status(404).json({ message: 'Registration request not found' });
            return;
        }
        res.json(updatedRequest);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Error updating registration request:', error.message);
            res.status(400).json({ message: error.message });
        }
        else {
            console.error('Unexpected error:', error);
            res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
}));
exports.default = router;
