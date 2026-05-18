'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Users, 
  FileText, 
  IndianRupee, 
  TrendingUp,
  Package,
  PlusCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Brush
} from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('/api/stats');
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const cards = [
    { title: 'Total Revenue', value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`, icon: IndianRupee, color: 'bg-orange-500' },
    { title: 'Paid Revenue', value: `₹${stats?.paidRevenue?.toLocaleString() || 0}`, icon: CheckCircle2, color: 'bg-emerald-500' },
    { title: 'Unpaid Revenue', value: `₹${stats?.unpaidRevenue?.toLocaleString() || 0}`, icon: AlertCircle, color: 'bg-rose-500' },
    { title: 'Total Customers', value: stats?.totalCustomers || 0, icon: Users, color: 'bg-blue-500' },
    { title: 'Total Invoices', value: stats?.totalInvoices || 0, icon: FileText, color: 'bg-green-500' },
    { title: 'Total Products', value: stats?.totalProducts || 0, icon: Package, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to your invoice management system.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-card p-6 rounded-2xl border shadow-sm flex items-center space-x-4">
            <div className={`p-4 rounded-xl ${card.color} text-white`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{card.title}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Revenue Chart */}
          <div className="bg-card rounded-2xl border shadow-sm p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold">Revenue Trends</h2>
                <p className="text-sm text-muted-foreground">Weekly performance overview</p>
              </div>
              <div className="flex items-center space-x-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                <TrendingUp size={16} />
                <span>+12.5%</span>
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.chartData || []}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="shortDate" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#6b7280' }} 
                    dy={10}
                    minTickGap={30}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`₹${value}`, 'Revenue']}
                    labelFormatter={(label, payload) => {
                      if (payload && payload.length > 0 && payload[0].payload) {
                        return payload[0].payload.date;
                      }
                      return label;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorAmount)" 
                  />
                  <Brush 
                    dataKey="shortDate" 
                    height={30} 
                    stroke="#8b5cf6"
                    startIndex={stats?.chartData ? Math.max(0, stats.chartData.length - 30) : 0}
                    tickFormatter={() => ''}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Recent Invoices</h2>
              <Link href="/invoices" className="text-sm text-primary hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground text-sm uppercase">
                    <th className="px-6 py-4">Invoice No</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stats?.recentInvoices.map((inv: any) => (
                    <tr key={inv._id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium">{inv.invoiceNumber}</td>
                      <td className="px-6 py-4">{inv.customerId?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {format(new Date(inv.date), 'dd MMM yyyy')}
                      </td>
                      <td className="px-6 py-4 font-bold">₹{inv.total.toLocaleString()}</td>
                    </tr>
                  ))}
                  {stats?.recentInvoices.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">
                        No invoices found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border shadow-sm p-6 h-fit">
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="space-y-4">
            <Link 
              href="/invoices/create" 
              className="flex items-center p-4 rounded-xl border hover:bg-muted transition-colors group"
            >
              <div className="p-2 bg-primary/10 text-primary rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                <PlusCircle size={20} />
              </div>
              <span className="ml-3 font-medium">Create New Invoice</span>
            </Link>
            <Link 
              href="/customers/add" 
              className="flex items-center p-4 rounded-xl border hover:bg-muted transition-colors group"
            >
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Users size={20} />
              </div>
              <span className="ml-3 font-medium">Add New Customer</span>
            </Link>
            <Link 
              href="/products" 
              className="flex items-center p-4 rounded-xl border hover:bg-muted transition-colors group"
            >
              <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <Package size={20} />
              </div>
              <span className="ml-3 font-medium">Manage Products</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
