import express from 'express';
import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { Booking, IBooking } from '../models/Booking';
import { auth, AuthRequest, requireProvider } from '../middleware/auth';
import { createNotification } from './notifications';
import { Service } from '../models/Service';
import { Provider } from '../models/Provider';

const router = express.Router();

// Get reserved dates for a service
router.get('/service/:serviceId/reserved-dates', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.serviceId)) {
      res.status(400).json({ message: 'Invalid service ID' });
      return;
    }

    const bookings = await Booking.find({
      serviceId: req.params.serviceId,
      status: { $in: ['pending', 'accepted'] }
    })
    .select('date')
    .sort({ date: 1 });

    // Extract unique dates that are either pending or accepted
    const reservedDates = [...new Set(bookings.map(booking => booking.date))];

    res.json(reservedDates);
  } catch (error: any) {
    console.error('Error fetching reserved dates:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get pending bookings for a service (Protected: Service Provider only)
router.get('/pending/:serviceId', [auth, requireProvider], async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.serviceId)) {
      res.status(400).json({ message: 'Invalid service ID' });
      return;
    }

    // Verify the service belongs to the authenticated provider
    const service = await Service.findById(req.params.serviceId);
    if (!service) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }

    // Check if the authenticated user is a provider
    if (req.user?.role !== 'provider') {
      res.status(403).json({ message: 'Only providers can view bookings' });
      return;
    }

    // Find provider by user ID
    const provider = await Provider.findById(req.user.userId);
    if (!provider) {
      res.status(404).json({ message: 'Provider not found' });
      return;
    }

    // Check if the service belongs to this provider
    if (!provider.services.some(s => s.toString() === req.params.serviceId)) {
      res.status(403).json({ message: 'Not authorized to view these bookings' });
      return;
    }

    const bookings = await Booking.find({ 
      serviceId: req.params.serviceId,
      status: 'pending'
    })
    .populate('userId', 'name email')
    .sort({ date: 1, time: 1 });

    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get bookings by user ID (Protected: Owner only)
router.get('/user/:userId', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }

    // Check if user is requesting their own bookings
    if (req.params.userId !== req.user?.userId) {
      res.status(403).json({ message: 'Not authorized to view these bookings' });
      return;
    }

    const bookings = await Booking.find({ userId: req.params.userId })
      .populate('userId', 'name email')
      .populate('serviceId')
      .sort({ date: 1, time: 1 });
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new booking (Protected)
router.post('/', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Fetch the service details using serviceId
    const service = await Service.findById(req.body.serviceId);
    if (!service) {
      res.status(400).json({ message: 'Service not found' });
      return;
    }

    // Create a new booking with the service name dynamically derived
    const booking = new Booking({
      ...req.body,
      service: service.title, // Assign service name dynamically
      userId: req.user?.userId, // Use the authenticated user's ID
      status: 'pending' // Set initial status
    });

    const savedBooking = await booking.save() as IBooking;

    // Create notification for the user
    await createNotification(
      req.user?.userId as string,
      `Booking request sent for ${savedBooking.service} on ${savedBooking.date} at ${savedBooking.time}`,
      'BOOKING',
      savedBooking._id.toString()
    );

    // Create notification for the service provider
    const provider = await Provider.findOne({ services: service._id });
    if (provider) {
      await createNotification(
        provider._id.toString(),
        `New booking request received for ${savedBooking.service} on ${savedBooking.date} at ${savedBooking.time}`,
        'BOOKING',
        savedBooking._id.toString()
      );
    }

    res.status(201).json(savedBooking);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Update booking status (Protected: Service Provider only)
router.patch('/:id/status', [auth, requireProvider], async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ message: 'Invalid booking ID' });
      return;
    }

    const { status } = req.body;
    if (!status || !['accepted', 'denied'].includes(status)) {
      res.status(400).json({ message: 'Invalid status. Must be "accepted" or "denied"' });
      return;
    }

    const booking = await Booking.findById(req.params.id).populate('serviceId');
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    // Verify the service belongs to the authenticated provider
    const provider = await Provider.findOne({ services: booking.serviceId });
    if (!provider || provider._id.toString() !== req.user?.userId) {
      res.status(403).json({ message: 'Not authorized to update this booking' });
      return;
    }

    booking.status = status;
    await booking.save();

    // Notify the client about the booking status change
    await createNotification(
      booking.userId.toString(),
      `Your booking for ${booking.service} on ${booking.date} at ${booking.time} has been ${status}`,
      'BOOKING',
      booking._id.toString()
    );

    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get all bookings (Protected: Admin only)
router.get('/', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('serviceId');
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get booking by ID (Protected: Owner or Admin only)
router.get('/:id', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ message: 'Invalid booking ID' });
      return;
    }

    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('serviceId');

    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    // Check if user is authorized to view this booking
    if (booking.userId.toString() !== req.user?.userId) {
      res.status(403).json({ message: 'Not authorized to view this booking' });
      return;
    }

    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update booking by ID (Protected: Owner only)
router.put('/:id', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ message: 'Invalid booking ID' });
      return;
    }

    // Check if booking exists and user is authorized
    const existingBooking = await Booking.findById(req.params.id) as IBooking;
    if (!existingBooking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    if (existingBooking.userId.toString() !== req.user?.userId) {
      res.status(403).json({ message: 'Not authorized to update this booking' });
      return;
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('userId', 'name email')
      .populate('serviceId') as IBooking;

    // Create notification for booking update
    await createNotification(
      req.user?.userId as string,
      `Booking updated for ${booking.service} on ${booking.date} at ${booking.time}`,
      'BOOKING',
      booking._id.toString()
    );

    res.json(booking);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Delete booking by ID (Protected: Owner only)
router.delete('/:id', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ message: 'Invalid booking ID' });
      return;
    }

    // Check if booking exists and user is authorized
    const booking = await Booking.findById(req.params.id) as IBooking;
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    if (booking.userId.toString() !== req.user?.userId) {
      res.status(403).json({ message: 'Not authorized to delete this booking' });
      return;
    }

    await Booking.findByIdAndDelete(req.params.id);

    // Create notification for booking cancellation
    await createNotification(
      req.user?.userId as string,
      `Booking cancelled for ${booking.service} on ${booking.date} at ${booking.time}`,
      'BOOKING',
      booking._id.toString()
    );

    res.json({ message: 'Booking deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
