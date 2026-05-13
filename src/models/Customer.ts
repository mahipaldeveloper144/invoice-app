import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  gstNumber: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);
      },
      message: 'Invalid GSTIN format'
    }
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// Prevent duplicate customers for the same user
CustomerSchema.index({ userId: 1, phone: 1 }, { unique: true });

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
