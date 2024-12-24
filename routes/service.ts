import express from 'express';
import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { Service } from '../models/Service';
import { auth, AuthRequest } from '../middleware/auth';

const router = express.Router();

// CREATE - Create a new service (Protected: Only authenticated users)
router.post('/', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const service = new Service({
      ...req.body,
      providerId: req.user?.userId // Set the current user as the provider
    });
    const savedService = await service.save();
    res.status(201).json(savedService);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// READ - Get all services (Public)
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const services = await Service.find().populate('providerId', 'name email');
    res.json(services);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// READ - Get service by ID (Public)
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ message: 'Invalid service ID' });
      return;
    }

    const service = await Service.findById(req.params.id).populate('providerId', 'name email');
    if (!service) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }
    res.json(service);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE - Update service by ID (Protected: Only service provider)
router.put('/:id', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ message: 'Invalid service ID' });
      return;
    }

    // Check if user is the service provider
    const service = await Service.findById(req.params.id);
    if (!service) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }

    if (service.providerId.toString() !== req.user?.userId) {
      res.status(403).json({ message: 'Not authorized to update this service' });
      return;
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('providerId', 'name email');

    res.json(updatedService);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE - Delete service by ID (Protected: Only service provider)
router.delete('/:id', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ message: 'Invalid service ID' });
      return;
    }

    // Check if user is the service provider
    const service = await Service.findById(req.params.id);
    if (!service) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }

    if (service.providerId.toString() !== req.user?.userId) {
      res.status(403).json({ message: 'Not authorized to delete this service' });
      return;
    }

    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// READ - Get service with provider details by service ID (Public)
router.get('/:id/with-provider', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate service ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ message: 'Invalid service ID' });
      return;
    }

    // Fetch the service with provider details
    const service = await Service.findById(req.params.id).populate('providerId', 'name email');
    if (!service) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }

    // You can include additional logic if necessary (e.g., enrich provider data)

    res.status(200).json({ service, provider: service.providerId });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});


export default router;
