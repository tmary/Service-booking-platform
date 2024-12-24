import express from 'express';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Notification } from '../models/Notification';
import { auth, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all notifications for the authenticated user
router.get('/', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find({ userId: req.user?.userId })
      .sort({ createdAt: -1 }); // Sort by newest first
    res.json({ data: notifications });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get unread count for the authenticated user
router.get('/unread-count', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user?.userId,
      read: false
    });
    res.json({ data: count });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Mark a notification as read
router.patch('/:id/read', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?.userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    res.json({ data: notification });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/read-all', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Update notifications
    const updated = await Notification.updateMany(
      { userId: req.user?.userId, read: false },
      { read: true }
    );
    if (updated.matchedCount === 0) {
      res.status(404).json({ message: 'No unread notifications found' });
      return;
    }

    // Fetch updated notifications
    const notifications = await Notification.find({ userId: req.user?.userId })
      .sort({ createdAt: -1 });

    res.json({ data: notifications });
  } catch (error: any) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ message: 'Failed to update notifications' });
    return;
  }
});

// Create a booking notification
router.post('/booking', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message } = req.body;
    
    if (!message) {
      res.status(400).json({ message: 'Message is required' });
      return;
    }

    const notificationData = {
      userId: req.user?.userId,
      message,
      type: 'BOOKING',
      read: false
    };

    // Only add relatedId if it's provided and valid
    if (req.body.relatedId && mongoose.Types.ObjectId.isValid(req.body.relatedId)) {
      Object.assign(notificationData, {
        relatedId: new mongoose.Types.ObjectId(req.body.relatedId)
      });
    }
    
    const notification = new Notification(notificationData);
    const savedNotification = await notification.save();
    
    res.status(201).json({ 
      success: true,
      data: savedNotification 
    });
  } catch (error: any) {
    console.error('Notification creation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create notification',
      error: error.message 
    });
  }
});

// Delete a notification
router.delete('/:id', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.userId
    });

    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create a notification (internal use only, not exposed as API)
export const createNotification = async (
  userId: string,
  message: string,
  type: string = 'SYSTEM',
  relatedId?: string
): Promise<void> => {
  try {
    const notification = new Notification({
      userId,
      message,
      type,
      relatedId
    });
    await notification.save();
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

export default router;
