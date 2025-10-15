import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const paymentSchema = new Schema({
  patient: {
    type: Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: Types.ObjectId,
    ref: 'ProviderProfile',
    required: true
  },
  booking: {
    type: Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'MK'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'paypal', 'stripe', 'cash', 'other'],
    default: 'card'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    trim: true
  },
  paidAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default model('Payment', paymentSchema);
