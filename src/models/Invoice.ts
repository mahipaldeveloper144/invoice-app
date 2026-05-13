import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  type: { type: String, enum: ['GST', 'NON-GST'], default: 'GST' },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    hsnCode: { type: String },
  }],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  gstRate: { type: Number, default: 5 },
  gstAmount: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { type: String, enum: ['Paid', 'Unpaid'], default: 'Unpaid' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  dueDate: { type: Date },
}, { timestamps: true });

if (mongoose.models.Invoice) {
  delete mongoose.models.Invoice;
}

export default mongoose.model('Invoice', InvoiceSchema);
