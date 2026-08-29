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

    // Calculate monthly data for the past 12 months
    const now = new Date();
    const monthlyData = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthNum = d.getMonth();
      const monthKey = `${year}-${String(monthNum + 1).padStart(2, '0')}`;
      const monthLabel = format(d, 'MMM yyyy');
      const shortMonth = format(d, 'MMM');

      let monthTotalRevenue = 0;
      let monthPaidRevenue = 0;
      let monthUnpaidRevenue = 0;
      let invoiceCount = 0;
      let paidCount = 0;
      let unpaidCount = 0;

      invoices.forEach(inv => {
        const invDate = new Date(inv.date || inv.createdAt || new Date());
        if (invDate.getFullYear() === year && invDate.getMonth() === monthNum) {
          const amt = inv.total || 0;
          monthTotalRevenue += amt;
          invoiceCount += 1;
          if (inv.status === 'Paid') {
            monthPaidRevenue += amt;
            paidCount += 1;
          } else {
            monthUnpaidRevenue += amt;
            unpaidCount += 1;
          }
        }
      });

      const collectionRate = monthTotalRevenue > 0 ? Math.round((monthPaidRevenue / monthTotalRevenue) * 100) : 0;

      monthlyData.push({
        monthKey,
        month: monthLabel,
        shortMonth,
        year,
        totalRevenue: monthTotalRevenue,
        paidRevenue: monthPaidRevenue,
        unpaidRevenue: monthUnpaidRevenue,
        invoiceCount,
        paidCount,
        unpaidCount,
        collectionRate,
      });
    }

    // Calculate Monthly Summary KPIs
    const currentMonthData = monthlyData[monthlyData.length - 1];
    const prevMonthData = monthlyData[monthlyData.length - 2] || { totalRevenue: 0 };
    const growthPercentage = prevMonthData.totalRevenue > 0
      ? Math.round(((currentMonthData.totalRevenue - prevMonthData.totalRevenue) / prevMonthData.totalRevenue) * 100)
      : (currentMonthData.totalRevenue > 0 ? 100 : 0);

    const activeMonths = monthlyData.filter(m => m.totalRevenue > 0);
    const avgMonthlyRevenue = monthlyData.length > 0
      ? Math.round(monthlyData.reduce((sum, m) => sum + m.totalRevenue, 0) / (activeMonths.length || 1))
      : 0;

    let bestMonth = monthlyData[0];
    monthlyData.forEach(m => {
      if (m.totalRevenue > (bestMonth?.totalRevenue || 0)) {
        bestMonth = m;
      }
    });

    const yearlyTotalRevenue = monthlyData.reduce((sum, m) => sum + m.totalRevenue, 0);
    const yearlyPaidRevenue = monthlyData.reduce((sum, m) => sum + m.paidRevenue, 0);
    const yearlyUnpaidRevenue = monthlyData.reduce((sum, m) => sum + m.unpaidRevenue, 0);
    const yearlyCollectionRate = yearlyTotalRevenue > 0
      ? Math.round((yearlyPaidRevenue / yearlyTotalRevenue) * 100)
      : 0;

    const monthlySummary = {
      currentMonthRevenue: currentMonthData.totalRevenue,
      currentMonthPaid: currentMonthData.paidRevenue,
      currentMonthUnpaid: currentMonthData.unpaidRevenue,
      currentMonthInvoices: currentMonthData.invoiceCount,
      growthPercentage,
      avgMonthlyRevenue,
      bestMonth: {
        month: bestMonth?.month || 'N/A',
        revenue: bestMonth?.totalRevenue || 0,
      },
      yearlyTotalRevenue,
      yearlyPaidRevenue,
      yearlyUnpaidRevenue,
      yearlyCollectionRate,
    };

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
      monthlyData,
      monthlySummary,
      recentInvoices
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
