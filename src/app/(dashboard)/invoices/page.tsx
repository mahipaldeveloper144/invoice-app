'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Search,
  Plus,
  Eye,
  Trash2,
  Calendar,
  FileText,
  Download,
  PlusCircle
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchInvoices = async () => {
    try {
      const { data } = await axios.get('/api/invoices');
      setInvoices(data);
    } catch (error) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await axios.delete(`/api/invoices/${id}`);
      toast.success('Invoice deleted');
      fetchInvoices();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const filteredInvoices = invoices.filter(inv =>
    inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    inv.customerId?.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
        <Link href="/invoices/create" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity">
          <PlusCircle size={20} />
          <span>New Invoice</span>
        </Link>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search by invoice number or customer..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-sm uppercase">
                <th className="px-6 py-4">Invoice No</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredInvoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center font-medium">
                      <FileText size={16} className="mr-2 text-primary" />
                      {inv.invoiceNumber}
                    </div>
                    {inv.type && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase mt-1 inline-block ${inv.type === 'GST' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                        {inv.type}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">{inv.customerId?.name || 'Deleted Customer'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar size={14} className="mr-2" />
                      {format(new Date(inv.date), 'dd MMM yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold">₹{inv.total.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${inv.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {inv.status || 'Unpaid'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/invoices/view/${inv._id}`}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="View & Print"
                      >
                        <Eye size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(inv._id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
