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
const mongoose_1 = __importDefault(require("mongoose"));
const Provider_1 = require("../models/Provider");
const router = express_1.default.Router();
// Get provider by email
router.get('/by-email', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, populate } = req.query;
        if (!email) {
            res.status(400).json({
                success: false,
                message: 'Email parameter is required'
            });
            return;
        }
        let query = Provider_1.Provider.findOne({ email: email.toString() })
            .select('_id name businessName description services rating location category');
        // Populate services if requested
        if (populate === 'services') {
            query = query.populate({
                path: 'services',
                select: '_id title description price availability'
            });
        }
        const provider = yield query.lean();
        if (!provider) {
            res.status(404).json({
                success: false,
                message: 'Provider not found'
            });
            return;
        }
        // Clean and format the data
        const cleanProvider = {
            _id: provider._id.toString(),
            name: provider.name || '',
            businessName: provider.businessName || '',
            description: provider.description || '',
            rating: provider.rating || 0,
            location: provider.location || '',
            category: provider.category || '',
            services: (provider.services || []).map((service) => ({
                _id: service._id.toString(),
                title: service.title || '',
                description: service.description || '',
                price: service.price || 0,
                availability: service.availability || []
            }))
        };
        // Set response headers
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        // Send the response
        res.send(JSON.stringify(cleanProvider, null, 2));
    }
    catch (error) {
        console.error('Error in GET /api/providers/by-email:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
}));
// Get all providers
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const providers = yield Provider_1.Provider.find()
            .select('_id name businessName description services rating location category')
            .populate({
            path: 'services',
            select: '_id title description price availability'
        })
            .lean();
        // Clean and format the data
        const cleanProviders = providers.map(provider => {
            const cleanProvider = {
                _id: provider._id.toString(),
                name: provider.name || '',
                businessName: provider.businessName || '',
                description: provider.description || '',
                rating: provider.rating || 0,
                location: provider.location || '',
                category: provider.category || '',
                services: (provider.services || []).map((service) => ({
                    _id: service._id.toString(),
                    title: service.title || '',
                    description: service.description || '',
                    price: service.price || 0,
                    availability: service.availability || []
                }))
            };
            return cleanProvider;
        });
        // Set response headers
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        // Send the response
        res.send(JSON.stringify(cleanProviders, null, 2));
    }
    catch (error) {
        console.error('Error in GET /api/providers:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
}));
// Get specific provider with their services
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({
                success: false,
                message: 'Invalid provider ID format'
            });
            return;
        }
        const provider = yield Provider_1.Provider.findById(req.params.id)
            .select('_id name businessName description services rating location category')
            .populate({
            path: 'services',
            select: '_id title description price availability'
        })
            .lean();
        if (!provider) {
            res.status(404).json({
                success: false,
                message: 'Provider not found'
            });
            return;
        }
        // Clean and format the data
        const cleanProvider = {
            _id: provider._id.toString(),
            name: provider.name || '',
            businessName: provider.businessName || '',
            description: provider.description || '',
            rating: provider.rating || 0,
            location: provider.location || '',
            category: provider.category || '',
            services: (provider.services || []).map((service) => ({
                _id: service._id.toString(),
                title: service.title || '',
                description: service.description || '',
                price: service.price || 0,
                availability: service.availability || []
            }))
        };
        // Set response headers
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        // Send the response
        res.send(JSON.stringify(cleanProvider, null, 2));
    }
    catch (error) {
        console.error('Provider fetch error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
}));
// Add service to provider
router.put('/:providerId/services/:serviceId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.providerId) || !mongoose_1.default.Types.ObjectId.isValid(req.params.serviceId)) {
            res.status(400).json({
                success: false,
                message: 'Invalid ID format'
            });
            return;
        }
        const provider = yield Provider_1.Provider.findById(req.params.providerId);
        if (!provider) {
            res.status(404).json({
                success: false,
                message: 'Provider not found'
            });
            return;
        }
        // Check if service is already added
        if (provider.services.includes(new mongoose_1.default.Types.ObjectId(req.params.serviceId))) {
            res.status(400).json({
                success: false,
                message: 'Service already added to provider'
            });
            return;
        }
        // Add service to provider's services array
        provider.services.push(new mongoose_1.default.Types.ObjectId(req.params.serviceId));
        yield provider.save();
        // Return updated provider with populated services
        const updatedProvider = yield Provider_1.Provider.findById(req.params.providerId)
            .select('_id name businessName description services rating location category')
            .populate({
            path: 'services',
            select: '_id title description price availability'
        })
            .lean();
        res.json({
            success: true,
            data: updatedProvider
        });
    }
    catch (error) {
        console.error('Error adding service to provider:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
}));
// Remove service from provider
router.delete('/:providerId/services/:serviceId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.providerId) || !mongoose_1.default.Types.ObjectId.isValid(req.params.serviceId)) {
            res.status(400).json({
                success: false,
                message: 'Invalid ID format'
            });
            return;
        }
        const provider = yield Provider_1.Provider.findById(req.params.providerId);
        if (!provider) {
            res.status(404).json({
                success: false,
                message: 'Provider not found'
            });
            return;
        }
        // Remove service from provider's services array
        provider.services = provider.services.filter(id => id.toString() !== req.params.serviceId);
        yield provider.save();
        // Return updated provider with populated services
        const updatedProvider = yield Provider_1.Provider.findById(req.params.providerId)
            .select('_id name businessName description services rating location category')
            .populate({
            path: 'services',
            select: '_id title description price availability'
        })
            .lean();
        res.json({
            success: true,
            data: updatedProvider
        });
    }
    catch (error) {
        console.error('Error removing service from provider:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
}));
exports.default = router;
