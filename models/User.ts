import mongoose, { Document, Model, Schema } from 'mongoose';

// Interface for the User document
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: string;
  address?: string;
}

// Interface for creating a new user
export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role?: 'client' | 'provider' | 'admin';
  address?: string;
}

// Mongoose schema
const userSchema: Schema<IUser> = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['client', 'provider', 'admin'],
    default: 'client',
  },
  address: {
    type: String,
    required: false,
  }
});

// Export the Mongoose model
export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
