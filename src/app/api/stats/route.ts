import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Customer from '@/models/Customer';
import Product from '@/models/Product';
import Invoice from '@/models/Invoice';
import { getUser } from '@/lib/auth';
import { format } from 'date-fns';

export async function GET() {
  try {
    const user: any = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    const totalCustomers = await Customer.countDocuments({ userId: user.id });
    const totalProducts = await Product.countDocuments({ userId: user.id });
    const totalInvoices = await Invoice.countDocuments({ userId: user.id });

    // Calculate revenue for last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const chartData = last7Days.map(day => {
      const dayTotal = invoices
        .filter(inv => new Date(inv.date).toISOString().split('T')[0] === day)
        .reduce((sum, inv) => sum + inv.total, 0);
      return {
        date: format(new Date(day), 'MMM dd'),
        amount: dayTotal
      };
    });

    const recentInvoices = await Invoice.find({ userId: user.id })
      .populate('customerId')
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json({
      totalCustomers,
      totalProducts,
      totalInvoices,
      totalRevenue,
      paidRevenue,
      unpaidRevenue,
      chartData,
      recentInvoices
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
