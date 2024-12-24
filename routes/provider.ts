import express from 'express';
import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { Provider } from '../models/Provider';

const router = express.Router();

// Get provider by email
router.get('/by-email', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, populate } = req.query;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email parameter is required'
      });
      return;
    }

    let query = Provider.findOne({ email: email.toString() })
      .select('_id name businessName description services rating location category');

    // Populate services if requested
    if (populate === 'services') {
      query = query.populate({
        path: 'services',
        select: '_id title description price availability'
      });
    }

    const provider = await query.lean();

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
      services: (provider.services || []).map((service: any) => ({
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

  } catch (error: any) {
    console.error('Error in GET /api/providers/by-email:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});


// Get all providers
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const providers = await Provider.find()
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
        services: (provider.services || []).map((service: any) => ({
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

  } catch (error: any) {
    console.error('Error in GET /api/providers:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

// Get specific provider with their services
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ 
        success: false,
        message: 'Invalid provider ID format'
      });
      return;
    }

    const provider = await Provider.findById(req.params.id)
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
      services: (provider.services || []).map((service: any) => ({
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

  } catch (error: any) {
    console.error('Provider fetch error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

// Add service to provider
router.put('/:providerId/services/:serviceId', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.providerId) || !mongoose.Types.ObjectId.isValid(req.params.serviceId)) {
      res.status(400).json({ 
        success: false,
        message: 'Invalid ID format'
      });
      return;
    }

    const provider = await Provider.findById(req.params.providerId);
    if (!provider) {
      res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
      return;
    }

    // Check if service is already added
    if (provider.services.includes(new mongoose.Types.ObjectId(req.params.serviceId))) {
      res.status(400).json({
        success: false,
        message: 'Service already added to provider'
      });
      return;
    }

    // Add service to provider's services array
    provider.services.push(new mongoose.Types.ObjectId(req.params.serviceId));
    await provider.save();

    // Return updated provider with populated services
    const updatedProvider = await Provider.findById(req.params.providerId)
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

  } catch (error: any) {
    console.error('Error adding service to provider:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

// Remove service from provider
router.delete('/:providerId/services/:serviceId', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.providerId) || !mongoose.Types.ObjectId.isValid(req.params.serviceId)) {
      res.status(400).json({ 
        success: false,
        message: 'Invalid ID format'
      });
      return;
    }

    const provider = await Provider.findById(req.params.providerId);
    if (!provider) {
      res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
      return;
    }

    // Remove service from provider's services array
    provider.services = provider.services.filter(
      id => id.toString() !== req.params.serviceId
    );
    await provider.save();

    // Return updated provider with populated services
    const updatedProvider = await Provider.findById(req.params.providerId)
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

  } catch (error: any) {
    console.error('Error removing service from provider:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

export default router;
