import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId;
  service: string;
  date: string;
  time: string;
  details: string;
  status: 'pending' | 'accepted' | 'denied';
  userId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
}

const bookingSchema = new Schema({
  service: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  details: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'denied'],
    default: 'pending',
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  }
}, {
  timestamps: true
});

export const Booking: Model<IBooking> = mongoose.model<IBooking>('Booking', bookingSchema);
