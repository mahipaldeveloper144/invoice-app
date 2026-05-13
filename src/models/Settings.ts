import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  firmName: { type: String, default: 'Prasad Cold Coco' },
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  gstNumber: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);
      },
      message: 'Invalid GSTIN format'
    },
    default: '' 
  },
  email: { type: String, default: '' },
  bankName: { type: String, default: '' },
  accountNumber: { type: String, default: '' },
  ifscCode: { type: String, default: '' },
  branch: { type: String, default: '' },
  upiId: { type: String, default: '' },
  signatureImage: { type: String, default: '' },
}, { timestamps: true });

if (mongoose.models.Settings) {
  delete mongoose.models.Settings;
}

export default mongoose.model('Settings', SettingsSchema);
