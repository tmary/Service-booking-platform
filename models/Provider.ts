import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IProvider extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  businessName: string;
  description?: string;
  services: mongoose.Types.ObjectId[];
  reviews?: mongoose.Types.ObjectId[];
  rating?: number;
  location?: string;
  category?: string;
}

const providerSchema: Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  businessName: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  location: {
    type: String
  },
  category: {
    type: String
  }
}, {
  timestamps: true
});

export const Provider: Model<IProvider> = mongoose.model<IProvider>('Provider', providerSchema);
