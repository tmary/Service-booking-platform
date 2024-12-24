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
const Service_1 = require("../models/Service");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// CREATE - Create a new service (Protected: Only authenticated users)
router.post('/', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const service = new Service_1.Service(Object.assign(Object.assign({}, req.body), { providerId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId // Set the current user as the provider
         }));
        const savedService = yield service.save();
        res.status(201).json(savedService);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
// READ - Get all services (Public)
router.get('/', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const services = yield Service_1.Service.find().populate('providerId', 'name email');
        res.json(services);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// READ - Get service by ID (Public)
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid service ID' });
            return;
        }
        const service = yield Service_1.Service.findById(req.params.id).populate('providerId', 'name email');
        if (!service) {
            res.status(404).json({ message: 'Service not found' });
            return;
        }
        res.json(service);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// UPDATE - Update service by ID (Protected: Only service provider)
router.put('/:id', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid service ID' });
            return;
        }
        // Check if user is the service provider
        const service = yield Service_1.Service.findById(req.params.id);
        if (!service) {
            res.status(404).json({ message: 'Service not found' });
            return;
        }
        if (service.providerId.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
            res.status(403).json({ message: 'Not authorized to update this service' });
            return;
        }
        const updatedService = yield Service_1.Service.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true }).populate('providerId', 'name email');
        res.json(updatedService);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
// DELETE - Delete service by ID (Protected: Only service provider)
router.delete('/:id', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid service ID' });
            return;
        }
        // Check if user is the service provider
        const service = yield Service_1.Service.findById(req.params.id);
        if (!service) {
            res.status(404).json({ message: 'Service not found' });
            return;
        }
        if (service.providerId.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
            res.status(403).json({ message: 'Not authorized to delete this service' });
            return;
        }
        yield Service_1.Service.findByIdAndDelete(req.params.id);
        res.json({ message: 'Service deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// READ - Get service with provider details by service ID (Public)
router.get('/:id/with-provider', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate service ID
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid service ID' });
            return;
        }
        // Fetch the service with provider details
        const service = yield Service_1.Service.findById(req.params.id).populate('providerId', 'name email');
        if (!service) {
            res.status(404).json({ message: 'Service not found' });
            return;
        }
        // You can include additional logic if necessary (e.g., enrich provider data)
        res.status(200).json({ service, provider: service.providerId });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
exports.default = router;
