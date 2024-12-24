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
const Booking_1 = require("../models/Booking");
const auth_1 = require("../middleware/auth");
const notifications_1 = require("./notifications");
const Service_1 = require("../models/Service");
const Provider_1 = require("../models/Provider");
const router = express_1.default.Router();
// Get reserved dates for a service
router.get('/service/:serviceId/reserved-dates', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.serviceId)) {
            res.status(400).json({ message: 'Invalid service ID' });
            return;
        }
        const bookings = yield Booking_1.Booking.find({
            serviceId: req.params.serviceId,
            status: { $in: ['pending', 'accepted'] }
        })
            .select('date')
            .sort({ date: 1 });
        // Extract unique dates that are either pending or accepted
        const reservedDates = [...new Set(bookings.map(booking => booking.date))];
        res.json(reservedDates);
    }
    catch (error) {
        console.error('Error fetching reserved dates:', error);
        res.status(500).json({ message: error.message });
    }
}));
// Get pending bookings for a service (Protected: Service Provider only)
router.get('/pending/:serviceId', [auth_1.auth, auth_1.requireProvider], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.serviceId)) {
            res.status(400).json({ message: 'Invalid service ID' });
            return;
        }
        // Verify the service belongs to the authenticated provider
        const service = yield Service_1.Service.findById(req.params.serviceId);
        if (!service) {
            res.status(404).json({ message: 'Service not found' });
            return;
        }
        // Check if the authenticated user is a provider
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'provider') {
            res.status(403).json({ message: 'Only providers can view bookings' });
            return;
        }
        // Find provider by user ID
        const provider = yield Provider_1.Provider.findById(req.user.userId);
        if (!provider) {
            res.status(404).json({ message: 'Provider not found' });
            return;
        }
        // Check if the service belongs to this provider
        if (!provider.services.some(s => s.toString() === req.params.serviceId)) {
            res.status(403).json({ message: 'Not authorized to view these bookings' });
            return;
        }
        const bookings = yield Booking_1.Booking.find({
            serviceId: req.params.serviceId,
            status: 'pending'
        })
            .populate('userId', 'name email')
            .sort({ date: 1, time: 1 });
        res.json(bookings);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Get bookings by user ID (Protected: Owner only)
router.get('/user/:userId', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.userId)) {
            res.status(400).json({ message: 'Invalid user ID' });
            return;
        }
        // Check if user is requesting their own bookings
        if (req.params.userId !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
            res.status(403).json({ message: 'Not authorized to view these bookings' });
            return;
        }
        const bookings = yield Booking_1.Booking.find({ userId: req.params.userId })
            .populate('userId', 'name email')
            .populate('serviceId')
            .sort({ date: 1, time: 1 });
        res.json(bookings);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Create a new booking (Protected)
router.post('/', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // Fetch the service details using serviceId
        const service = yield Service_1.Service.findById(req.body.serviceId);
        if (!service) {
            res.status(400).json({ message: 'Service not found' });
            return;
        }
        // Create a new booking with the service name dynamically derived
        const booking = new Booking_1.Booking(Object.assign(Object.assign({}, req.body), { service: service.title, userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId, status: 'pending' // Set initial status
         }));
        const savedBooking = yield booking.save();
        // Create notification for the user
        yield (0, notifications_1.createNotification)((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId, `Booking request sent for ${savedBooking.service} on ${savedBooking.date} at ${savedBooking.time}`, 'BOOKING', savedBooking._id.toString());
        // Create notification for the service provider
        const provider = yield Provider_1.Provider.findOne({ services: service._id });
        if (provider) {
            yield (0, notifications_1.createNotification)(provider._id.toString(), `New booking request received for ${savedBooking.service} on ${savedBooking.date} at ${savedBooking.time}`, 'BOOKING', savedBooking._id.toString());
        }
        res.status(201).json(savedBooking);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
// Update booking status (Protected: Service Provider only)
router.patch('/:id/status', [auth_1.auth, auth_1.requireProvider], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid booking ID' });
            return;
        }
        const { status } = req.body;
        if (!status || !['accepted', 'denied'].includes(status)) {
            res.status(400).json({ message: 'Invalid status. Must be "accepted" or "denied"' });
            return;
        }
        const booking = yield Booking_1.Booking.findById(req.params.id).populate('serviceId');
        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }
        // Verify the service belongs to the authenticated provider
        const provider = yield Provider_1.Provider.findOne({ services: booking.serviceId });
        if (!provider || provider._id.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
            res.status(403).json({ message: 'Not authorized to update this booking' });
            return;
        }
        booking.status = status;
        yield booking.save();
        // Notify the client about the booking status change
        yield (0, notifications_1.createNotification)(booking.userId.toString(), `Your booking for ${booking.service} on ${booking.date} at ${booking.time} has been ${status}`, 'BOOKING', booking._id.toString());
        res.json(booking);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Get all bookings (Protected: Admin only)
router.get('/', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookings = yield Booking_1.Booking.find()
            .populate('userId', 'name email')
            .populate('serviceId');
        res.json(bookings);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Get booking by ID (Protected: Owner or Admin only)
router.get('/:id', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid booking ID' });
            return;
        }
        const booking = yield Booking_1.Booking.findById(req.params.id)
            .populate('userId', 'name email')
            .populate('serviceId');
        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }
        // Check if user is authorized to view this booking
        if (booking.userId.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
            res.status(403).json({ message: 'Not authorized to view this booking' });
            return;
        }
        res.json(booking);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Update booking by ID (Protected: Owner only)
router.put('/:id', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid booking ID' });
            return;
        }
        // Check if booking exists and user is authorized
        const existingBooking = yield Booking_1.Booking.findById(req.params.id);
        if (!existingBooking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }
        if (existingBooking.userId.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
            res.status(403).json({ message: 'Not authorized to update this booking' });
            return;
        }
        const booking = yield Booking_1.Booking.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true }).populate('userId', 'name email')
            .populate('serviceId');
        // Create notification for booking update
        yield (0, notifications_1.createNotification)((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId, `Booking updated for ${booking.service} on ${booking.date} at ${booking.time}`, 'BOOKING', booking._id.toString());
        res.json(booking);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
// Delete booking by ID (Protected: Owner only)
router.delete('/:id', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid booking ID' });
            return;
        }
        // Check if booking exists and user is authorized
        const booking = yield Booking_1.Booking.findById(req.params.id);
        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }
        if (booking.userId.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
            res.status(403).json({ message: 'Not authorized to delete this booking' });
            return;
        }
        yield Booking_1.Booking.findByIdAndDelete(req.params.id);
        // Create notification for booking cancellation
        yield (0, notifications_1.createNotification)((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId, `Booking cancelled for ${booking.service} on ${booking.date} at ${booking.time}`, 'BOOKING', booking._id.toString());
        res.json({ message: 'Booking deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
exports.default = router;
