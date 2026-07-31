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
    
    const invoices = await Invoice.find({ userId: user.id });
    const totalInvoices = invoices.length;

    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const paidRevenue = invoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + (inv.total || 0), 0);
    const unpaidRevenue = invoices.filter(inv => inv.status === 'Unpaid').reduce((sum, inv) => sum + (inv.total || 0), 0);

    // Calculate revenue for last 365 days
    const last365Days = Array.from({ length: 365 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const revenueByDate: Record<string, number> = {};
    invoices.forEach(inv => {
      const dateStr = new Date(inv.date || new Date()).toISOString().split('T')[0];
      revenueByDate[dateStr] = (revenueByDate[dateStr] || 0) + (inv.total || 0);
    });

    const chartData = last365Days.map(day => {
      return {
        date: format(new Date(day), 'MMM dd, yyyy'),
        shortDate: format(new Date(day), 'MMM dd'),
        amount: revenueByDate[day] || 0
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
