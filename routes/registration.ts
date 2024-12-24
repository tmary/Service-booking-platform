import express from 'express';
import { RegistrationRequest } from '../models/RegistrationRequest';
import  Mongoose  from 'mongoose';

const router = express.Router();

// Endpoint to create a registration request
router.post('/', async (req, res) => {
  try {
    const { name, email, businessName, description, documents } = req.body;

    // Create new registration request
    const request = new RegistrationRequest({
      name,
      email,
      businessName,
      description,
      documents, // File paths or metadata for uploaded files
      status: 'pending', // Default status
    });

    const savedRequest = await request.save();
    res.status(201).json({ message: 'Registration request created', request: savedRequest });
  } catch (error) {
    if (error instanceof Error) {
        console.error('Error creating registration request:', error.message);
        res.status(400).json({ message: error.message });
      } else {
        console.error('Unexpected error:', error);
        res.status(500).json({ message: 'An unexpected error occurred' });
      }
  }
});

// Endpoint for admin to fetch all pending registration requests
router.get('/pending', async (req, res) => {
  try {
    const pendingRequests = await RegistrationRequest.find({ status: 'pending' });
    res.json(pendingRequests);
  } catch (error) {
    if (error instanceof Error) {
        console.error('Error fetching pending requests:', error.message);
        res.status(500).json({ message: error.message });
      } else {
        console.error('Unexpected error:', error);
        res.status(500).json({ message: 'An unexpected error occurred' });
      }
  }
});

// Endpoint to update request status (e.g., approve or reject)
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedRequest = await RegistrationRequest.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );

    if (!updatedRequest) {
      res.status(404).json({ message: 'Registration request not found' });
      return;
    }

    res.json(updatedRequest);
  } catch (error) {
    if (error instanceof Error) {
        console.error('Error updating registration request:', error.message);
        res.status(400).json({ message: error.message });
      } else {
        console.error('Unexpected error:', error);
        res.status(500).json({ message: 'An unexpected error occurred' });
      }
  }
});

export default router;
