import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IService extends Document {
  _id: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  price?: number;
  category?: string;
  availability?: string[];
}

const serviceSchema: Schema<IService> = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  price: Number,
  category: String,
  availability: [String],
});

export const Service: Model<IService> = mongoose.model<IService>('Service', serviceSchema);
