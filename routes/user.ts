import express from 'express';
import { Request, Response } from 'express';
import { User, IUser, CreateUserData } from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { auth, AuthRequest } from '../middleware/auth';
import { requireRole } from '../middleware/roleAuth';

const router = express.Router();

// Register route
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, address, role }: CreateUserData = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists with this email' });
      return;
    }

    // Prevent creation of admin accounts through registration
    if (role === 'admin') {
      res.status(403).json({ message: 'Cannot create admin accounts through registration' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in MongoDB
    const user = new User({
      name,
      email,
      password: hashedPassword,
      address,
      role: role && ['client', 'provider'].includes(role) ? role : 'client'
    });

    const savedUser = await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: savedUser._id, email: savedUser.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // Send user data with token
    const userResponse = {
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
      token
    };

    res.status(201).json(userResponse);
  } catch (error: any) {
    console.error('Error creating user:', error);
    res.status(400).json({ message: error.message });
  }
});

// Login route
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Debug log
    console.log('Login attempt:', {
      userId: user._id,
      email: user.email,
      role: user.role
    });

    // Generate JWT token
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    };
    console.log('Token payload:', tokenPayload);

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET!,
      { 
        expiresIn: '24h',
        algorithm: 'HS256'
      }
    );

    // Debug log
    console.log('Generated token length:', token.length);

    // Send user data with token
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    };

    res.json(userResponse);
  } catch (error: any) {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

// Protected route - Get all users (admin only)
router.get('/', auth, requireRole(['admin']), async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Protected route - Get user by ID (admin or own profile)
router.get('/:id', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Allow users to access their own profile or admins to access any profile
    if (req.user?.userId !== req.params.id && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized to access this user profile' });
      return;
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Protected route - Update user (admin or own profile)
router.put('/:id', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, address, role, password } = req.body;
    
    // Check if user is updating their own profile or is an admin
    if (req.user?.userId !== req.params.id && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized to update this user' });
      return;
    }

    // Only admins can change roles
    if (role && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Only admins can change user roles' });
      return;
    }
    
    // Prepare update data
    const updateData: any = { name, address };
    if (role && req.user?.role === 'admin') {
      updateData.role = role;
    }
    
    // If password is being updated, hash it
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(updatedUser);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Protected route - Delete user (admin only)
router.delete('/:id', auth, requireRole(['admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
