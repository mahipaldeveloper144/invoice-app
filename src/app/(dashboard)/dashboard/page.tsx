'use client';

import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { 
  Users, 
  FileText, 
  IndianRupee, 
  Package,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Layers,
  LineChart,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { 
  BarChart,
  Bar,
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'grouped-bar' | 'stacked-bar' | 'area' | 'invoices'>('grouped-bar');
  const [timeRange, setTimeRange] = useState<'6m' | '12m'>('12m');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('/api/stats');
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const monthlyChartData = useMemo(() => {
    if (!stats?.monthlyData) return [];
    if (timeRange === '6m') {
      return stats.monthlyData.slice(-6);
    }
    return stats.monthlyData;
  }, [stats?.monthlyData, timeRange]);

  const monthlySummary = stats?.monthlySummary;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground animate-pulse">Loading dashboard insights...</p>
        </div>
      </div>
    );
  }

  const cards = [
    { title: 'Total Revenue', value: `₹${stats?.totalRevenue?.toLocaleString('en-IN') || 0}`, icon: IndianRupee, color: 'bg-orange-500', subtitle: 'All time gross revenue' },
    { title: 'Paid Revenue', value: `₹${stats?.paidRevenue?.toLocaleString('en-IN') || 0}`, icon: CheckCircle2, color: 'bg-emerald-500', subtitle: 'Settled & completed' },
    { title: 'Unpaid Revenue', value: `₹${stats?.unpaidRevenue?.toLocaleString('en-IN') || 0}`, icon: AlertCircle, color: 'bg-rose-500', subtitle: 'Pending / overdue' },
    { title: 'Total Customers', value: stats?.totalCustomers || 0, icon: Users, color: 'bg-blue-500', subtitle: 'Active clients' },
    { title: 'Total Invoices', value: stats?.totalInvoices || 0, icon: FileText, color: 'bg-indigo-500', subtitle: 'Generated invoices' },
    { title: 'Total Products', value: stats?.totalProducts || 0, icon: Package, color: 'bg-purple-500', subtitle: 'Inventory items' },
  ];

  // Custom rich tooltip for monthly analysis
  const CustomMonthlyTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0]?.payload;
    if (!data) return null;

    return (
      <div className="bg-card/95 backdrop-blur-md border border-border p-4 rounded-xl shadow-xl min-w-[240px]">
        <div className="flex items-center justify-between border-b pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-primary" />
            <span className="font-bold text-foreground">{data.month}</span>
          </div>
          <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
            {data.invoiceCount} {data.invoiceCount === 1 ? 'Invoice' : 'Invoices'}
          </span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Total Invoiced
            </span>
            <span className="font-bold text-foreground">₹{data.totalRevenue?.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Paid
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              ₹{data.paidRevenue?.toLocaleString('en-IN')}
              <span className="text-xs text-muted-foreground ml-1">({data.paidCount})</span>
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Pending
            </span>
            <span className="font-semibold text-rose-600 dark:text-rose-400">
              ₹{data.unpaidRevenue?.toLocaleString('en-IN')}
              <span className="text-xs text-muted-foreground ml-1">({data.unpaidCount})</span>
            </span>
          </div>

          <div className="pt-2 border-t mt-2">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-muted-foreground">Collection Rate</span>
              <span className="font-bold text-foreground">{data.collectionRate}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${data.collectionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const formatCurrencyAxis = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
    return `₹${value}`;
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard & Analytics</h1>
          <p className="text-muted-foreground mt-1">Overview of your invoicing performance, cash flow, and monthly trends.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/invoices/create"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-medium px-4 py-2.5 rounded-xl shadow-sm hover:bg-primary/90 transition-colors"
          >
            <PlusCircle size={18} />
            <span>Create Invoice</span>
          </Link>
        </div>
      </div>

      {/* Top Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card, index) => (
          <div key={index} className="bg-card p-6 rounded-2xl border shadow-sm flex items-center justify-between hover:border-primary/40 transition-all">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
              <p className="text-2xl font-bold tracking-tight">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.subtitle}</p>
            </div>
            <div className={`p-4 rounded-2xl ${card.color} text-white shadow-sm shrink-0`}>
              <card.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Analytics Highlight Section */}
      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        {/* Card Header & Controls */}
        <div className="p-6 border-b flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">Monthly Analysis</h2>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                <Sparkles size={12} /> Insights
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Detailed month-over-month revenue breakdown, collections, and billing activity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Time Range Selector */}
            <div className="flex items-center bg-muted p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setTimeRange('6m')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeRange === '6m'
                    ? 'bg-card text-foreground font-semibold shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Last 6 Months
              </button>
              <button
                onClick={() => setTimeRange('12m')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeRange === '12m'
                    ? 'bg-card text-foreground font-semibold shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Last 12 Months
              </button>
            </div>

            {/* Chart Format Switcher */}
            <div className="flex items-center bg-muted p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setChartType('grouped-bar')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  chartType === 'grouped-bar'
                    ? 'bg-card text-primary font-semibold shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Side by Side Bar Chart (Paid vs Unpaid)"
              >
                <BarChart3 size={14} />
                <span>Bar Chart</span>
              </button>

              <button
                onClick={() => setChartType('stacked-bar')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  chartType === 'stacked-bar'
                    ? 'bg-card text-primary font-semibold shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Stacked Bar Chart"
              >
                <Layers size={14} />
                <span>Stacked</span>
              </button>

              <button
                onClick={() => setChartType('area')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  chartType === 'area'
                    ? 'bg-card text-primary font-semibold shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Revenue Area Trend"
              >
                <LineChart size={14} />
                <span>Trend</span>
              </button>

              <button
                onClick={() => setChartType('invoices')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  chartType === 'invoices'
                    ? 'bg-card text-primary font-semibold shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Invoice Count Volume"
              >
                <FileText size={14} />
                <span>Invoices</span>
              </button>
            </div>
          </div>
        </div>

        {/* Monthly Summary Quick KPI Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-muted/20 border-b">
          <div className="p-3 bg-card rounded-xl border">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>This Month Revenue</span>
              {monthlySummary && (
                <span className={`inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                  monthlySummary.growthPercentage >= 0 
                    ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/50'
                    : 'text-rose-700 bg-rose-100 dark:text-rose-400 dark:bg-rose-950/50'
                }`}>
                  {monthlySummary.growthPercentage >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {Math.abs(monthlySummary.growthPercentage)}% MoM
                </span>
              )}
            </div>
            <p className="text-lg font-bold">₹{monthlySummary?.currentMonthRevenue?.toLocaleString('en-IN') || 0}</p>
          </div>

          <div className="p-3 bg-card rounded-xl border">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Best Month</span>
              <span className="text-[11px] text-primary font-medium">{monthlySummary?.bestMonth?.month || 'N/A'}</span>
            </div>
            <p className="text-lg font-bold">₹{monthlySummary?.bestMonth?.revenue?.toLocaleString('en-IN') || 0}</p>
          </div>

          <div className="p-3 bg-card rounded-xl border">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Monthly Average</span>
              <span className="text-[11px] text-muted-foreground">Active Months</span>
            </div>
            <p className="text-lg font-bold">₹{monthlySummary?.avgMonthlyRevenue?.toLocaleString('en-IN') || 0}</p>
          </div>

          <div className="p-3 bg-card rounded-xl border">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Collection Efficiency</span>
              <span className="text-[11px] text-emerald-600 font-semibold">{monthlySummary?.yearlyCollectionRate || 0}%</span>
            </div>
            <p className="text-lg font-bold">₹{monthlySummary?.yearlyPaidRevenue?.toLocaleString('en-IN') || 0}</p>
          </div>
        </div>

        {/* Chart View */}
        <div className="p-6">
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'grouped-bar' ? (
                <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                  <XAxis 
                    dataKey="shortMonth" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'currentColor' }} 
                    className="text-muted-foreground"
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'currentColor' }} 
                    className="text-muted-foreground"
                    tickFormatter={formatCurrencyAxis}
                  />
                  <Tooltip content={<CustomMonthlyTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    align="right" 
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: '20px', fontSize: '13px' }}
                    formatter={(value) => <span className="text-foreground font-medium">{value}</span>}
                  />
                  <Bar 
                    name="Paid Revenue" 
                    dataKey="paidRevenue" 
                    fill="#10b981" 
                    radius={[6, 6, 0, 0]} 
                    maxBarSize={45} 
                  />
                  <Bar 
                    name="Unpaid Revenue" 
                    dataKey="unpaidRevenue" 
                    fill="#f43f5e" 
                    radius={[6, 6, 0, 0]} 
                    maxBarSize={45} 
                  />
                </BarChart>
              ) : chartType === 'stacked-bar' ? (
                <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                  <XAxis 
                    dataKey="shortMonth" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'currentColor' }} 
                    className="text-muted-foreground"
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'currentColor' }} 
                    className="text-muted-foreground"
                    tickFormatter={formatCurrencyAxis}
                  />
                  <Tooltip content={<CustomMonthlyTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    align="right" 
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: '20px', fontSize: '13px' }}
                    formatter={(value) => <span className="text-foreground font-medium">{value}</span>}
                  />
                  <Bar 
                    name="Paid Revenue" 
                    dataKey="paidRevenue" 
                    stackId="a" 
                    fill="#10b981" 
                    radius={[0, 0, 0, 0]} 
                    maxBarSize={48} 
                  />
                  <Bar 
                    name="Unpaid Revenue" 
                    dataKey="unpaidRevenue" 
                    stackId="a" 
                    fill="#f43f5e" 
                    radius={[6, 6, 0, 0]} 
                    maxBarSize={48} 
                  />
                </BarChart>
              ) : chartType === 'area' ? (
                <AreaChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorTotalRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPaidRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                  <XAxis 
                    dataKey="shortMonth" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'currentColor' }} 
                    className="text-muted-foreground"
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'currentColor' }} 
                    className="text-muted-foreground"
                    tickFormatter={formatCurrencyAxis}
                  />
                  <Tooltip content={<CustomMonthlyTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    align="right" 
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: '20px', fontSize: '13px' }}
                    formatter={(value) => <span className="text-foreground font-medium">{value}</span>}
                  />
                  <Area 
                    type="monotone" 
                    name="Total Revenue"
                    dataKey="totalRevenue" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorTotalRevenue)" 
                  />
                  <Area 
                    type="monotone" 
                    name="Paid Revenue"
                    dataKey="paidRevenue" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1} 
                    fill="url(#colorPaidRevenue)" 
                  />
                </AreaChart>
              ) : (
                <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                  <XAxis 
                    dataKey="shortMonth" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'currentColor' }} 
                    className="text-muted-foreground"
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'currentColor' }} 
                    className="text-muted-foreground"
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomMonthlyTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    align="right" 
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: '20px', fontSize: '13px' }}
                    formatter={(value) => <span className="text-foreground font-medium">{value}</span>}
                  />
                  <Bar 
                    name="Paid Invoices" 
                    dataKey="paidCount" 
                    fill="#10b981" 
                    radius={[6, 6, 0, 0]} 
                    maxBarSize={45} 
                  />
                  <Bar 
                    name="Unpaid Invoices" 
                    dataKey="unpaidCount" 
                    fill="#f43f5e" 
                    radius={[6, 6, 0, 0]} 
                    maxBarSize={45} 
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Breakdown Table */}
        <div className="border-t">
          <div className="p-4 px-6 bg-muted/30 flex items-center justify-between">
            <span className="text-sm font-semibold flex items-center gap-2">
              <Calendar size={16} className="text-primary" /> Month-by-Month Financial Log ({timeRange === '6m' ? 'Past 6 Months' : 'Past 12 Months'})
            </span>
            <span className="text-xs text-muted-foreground">
              Total Invoiced: ₹{monthlyChartData.reduce((acc: number, curr: any) => acc + curr.totalRevenue, 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground text-xs uppercase sticky top-0 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-3 font-semibold">Month</th>
                  <th className="px-6 py-3 font-semibold">Invoices</th>
                  <th className="px-6 py-3 font-semibold">Paid (₹)</th>
                  <th className="px-6 py-3 font-semibold">Pending (₹)</th>
                  <th className="px-6 py-3 font-semibold">Total Revenue</th>
                  <th className="px-6 py-3 font-semibold text-right">Collection %</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[...monthlyChartData].reverse().map((item: any) => (
                  <tr key={item.monthKey} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-3.5 font-medium">{item.month}</td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-muted">
                        {item.invoiceCount}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-emerald-600 dark:text-emerald-400 font-medium">
                      ₹{item.paidRevenue.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-3.5 text-rose-600 dark:text-rose-400 font-medium">
                      ₹{item.unpaidRevenue.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-3.5 font-bold">
                      ₹{item.totalRevenue.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${item.collectionRate}%` }}
                          />
                        </div>
                        <span className="font-bold text-xs w-8 text-right">{item.collectionRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Invoices & Quick Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Recent Invoices Table */}
          <div className="bg-card rounded-2xl border shadow-sm overflow-hidden h-full flex flex-col justify-between">
            <div>
              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Recent Invoices</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Latest generated client billing</p>
                </div>
                <Link 
                  href="/invoices" 
                  className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  View All Invoices &rarr;
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[550px]">
                  <thead>
                    <tr className="bg-muted/40 text-muted-foreground text-xs uppercase">
                      <th className="px-6 py-3.5">Invoice No</th>
                      <th className="px-6 py-3.5">Customer</th>
                      <th className="px-6 py-3.5">Date</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {stats?.recentInvoices?.map((inv: any) => (
                      <tr key={inv._id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-foreground">
                          <Link href={`/invoices/view/${inv._id}`} className="hover:text-primary hover:underline">
                            {inv.invoiceNumber}
                          </Link>
                        </td>
                        <td className="px-6 py-4 font-medium">{inv.customerId?.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {inv.date ? format(new Date(inv.date), 'dd MMM yyyy') : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            inv.status === 'Paid'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}>
                            {inv.status || 'Unpaid'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-right">₹{inv.total?.toLocaleString('en-IN') || 0}</td>
                      </tr>
                    ))}
                    {(!stats?.recentInvoices || stats.recentInvoices.length === 0) && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                          No invoices found. Create your first invoice!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-card rounded-2xl border shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1">Quick Actions</h2>
            <p className="text-xs text-muted-foreground mb-6">Frequently used management shortcuts</p>
            
            <div className="space-y-3.5">
              <Link 
                href="/invoices/create" 
                className="flex items-center p-4 rounded-xl border border-border/80 hover:border-primary/50 hover:bg-muted/50 transition-all group"
              >
                <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                  <PlusCircle size={22} />
                </div>
                <div className="ml-3.5">
                  <span className="font-semibold block text-foreground">Create New Invoice</span>
                  <span className="text-xs text-muted-foreground">Generate GST or Non-GST invoice</span>
                </div>
              </Link>

              <Link 
                href="/customers/add" 
                className="flex items-center p-4 rounded-xl border border-border/80 hover:border-blue-500/50 hover:bg-muted/50 transition-all group"
              >
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <Users size={22} />
                </div>
                <div className="ml-3.5">
                  <span className="font-semibold block text-foreground">Add Customer</span>
                  <span className="text-xs text-muted-foreground">Store client contact and GSTIN</span>
                </div>
              </Link>

              <Link 
                href="/products" 
                className="flex items-center p-4 rounded-xl border border-border/80 hover:border-purple-500/50 hover:bg-muted/50 transition-all group"
              >
                <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <Package size={22} />
                </div>
                <div className="ml-3.5">
                  <span className="font-semibold block text-foreground">Manage Products</span>
                  <span className="text-xs text-muted-foreground">Update inventory & pricing</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Quick Collection Badge */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-indigo-500/5 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-primary block">Payment Collection</span>
                <p className="text-sm font-bold mt-0.5">
                  {monthlySummary?.yearlyCollectionRate || 0}% overall paid
                </p>
              </div>
              <div className="p-2.5 bg-primary text-primary-foreground rounded-xl">
                <CheckCircle2 size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
