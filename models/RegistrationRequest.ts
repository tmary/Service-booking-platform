import mongoose, { Schema, Document, Model } from 'mongoose';

interface IRegistrationRequest extends Document {
  name: string;
  email: string;
  businessName: string;
  description: string;
  documents: string[]; // Array of file paths
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const registrationRequestSchema: Schema<IRegistrationRequest> = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  businessName: { type: String, required: true },
  description: {type: String, required: true},
  documents: { type: [String], required: true }, // Array of document paths
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

export const RegistrationRequest: Model<IRegistrationRequest> = mongoose.model<IRegistrationRequest>(
  'RegistrationRequest',
  registrationRequestSchema
);
