import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Invoice from '@/models/Invoice';
import Customer from '@/models/Customer';
import Product from '@/models/Product';
import { getUser } from '@/lib/auth';
import { z } from 'zod';

const invoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  type: z.enum(['GST', 'NON-GST']).default('GST'),
  items: z.array(z.object({
    productId: z.string().min(1, 'Product is required'),
    name: z.string().min(1),
    quantity: z.number().positive(),
    price: z.number().min(0),
    hsnCode: z.string().optional(),
  })).min(1, 'At least one item is required'),
  gstRate: z.number().min(0).max(100),
  discount: z.number().min(0).optional().default(0),
  isGstIncluded: z.boolean().optional(),
  date: z.string().optional().or(z.date().optional()),
  dueDate: z.string().optional().or(z.date().optional()),
});

export async function GET() {
  try {
    const user: any = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const invoices = await Invoice.find({ userId: user.id })
      .populate('customerId')
      .sort({ createdAt: -1 });
    return NextResponse.json(invoices);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user: any = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    
    // 1. Validate request body
    const validatedData = invoiceSchema.parse(body);
    
    await dbConnect();

    // 2. Cross-user data verification: Check if customer belongs to user
    const customer = await Customer.findOne({ _id: validatedData.customerId, userId: user.id });
    if (!customer) {
      return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 });
    }

    // 3. Verify all products belong to user (Optional but recommended)
    const productIds = validatedData.items.map(item => item.productId);
    const validProductsCount = await Product.countDocuments({ 
      _id: { $in: productIds }, 
      userId: user.id 
    });
    if (validProductsCount !== productIds.length) {
      return NextResponse.json({ error: 'One or more products are invalid' }, { status: 400 });
    }

    // 4. Calculate totals on server to prevent manipulation
    let subtotal = 0;
    validatedData.items.forEach(item => {
      subtotal += item.price * item.quantity;
    });

    const gstRate = validatedData.type === 'NON-GST' ? 0 : validatedData.gstRate;
    const discount = validatedData.discount || 0;
    const discountedSubtotal = subtotal - discount;
    
    let gstAmount = 0;
    let finalTotal = 0;
    let finalSubtotal = subtotal;

    if (validatedData.type === 'NON-GST') {
      gstAmount = 0;
      finalTotal = discountedSubtotal;
      finalSubtotal = subtotal;
    } else if (body.isGstIncluded) {
      // In case of GST included, the total matches discountedSubtotal
      finalTotal = discountedSubtotal;
      const taxableValue = discountedSubtotal / (1 + gstRate / 100);
      gstAmount = discountedSubtotal - taxableValue;
    } else {
      gstAmount = (discountedSubtotal * gstRate) / 100;
      finalTotal = discountedSubtotal + gstAmount;
    }

    // 5. Generate robust Invoice Number
    const count = await Invoice.countDocuments({ userId: user.id });
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const invoiceNumber = `INV-${dateStr}-${(count + 1).toString().padStart(4, '0')}-${randomSuffix}`;

    const invoice = await Invoice.create({
      customerId: validatedData.customerId,
      type: validatedData.type,
      items: validatedData.items,
      subtotal: subtotal,
      discount: discount,
      gstRate,
      gstAmount,
      total: finalTotal,
      invoiceNumber,
      userId: user.id,
      date: validatedData.date || new Date(),
      dueDate: validatedData.dueDate
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
