'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AddCustomerPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    gstNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phone.length !== 10) {
      return toast.error('Phone number must be 10 digits');
    }
    setLoading(true);
    try {
      await axios.post('/api/customers', formData);
      toast.success('Customer added successfully');
      router.push('/customers');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/customers" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Add New Customer</h1>
      </div>

      <div className="bg-card rounded-xl border shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Customer Name *</label>
              <input
                required
                type="text"
                className="w-full px-4 py-2 rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter customer name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number *</label>
              <input
                required
                type="text"
                maxLength={10}
                className="w-full px-4 py-2 rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                placeholder="10 digit number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">GST Number (Optional)</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary"
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
              placeholder="e.g. 24AAAAA0000A1Z5"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Address</label>
            <textarea
              rows={3}
              className="w-full px-4 py-2 rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter customer address"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-4">
            <Link 
              href="/customers" 
              className="px-6 py-2 rounded-lg border hover:bg-muted transition-colors text-sm font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium transition-all hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
