import mongoose, { Document, Model, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  message: string;
  read: boolean;
  createdAt: Date;
  type?: string;
  relatedId?: mongoose.Types.ObjectId;
}

const notificationSchema: Schema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ['BOOKING', 'SYSTEM', 'UPDATE'],
    default: 'SYSTEM'
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'type'
  }
}, {
  timestamps: true
});

export const Notification: Model<INotification> = mongoose.model<INotification>('Notification', notificationSchema);
