'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function EditCustomerPage() {
  const { customerId } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    gstNumber: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const { data } = await axios.get(`/api/customers/${customerId}`);
        setFormData({
          name: data.name,
          phone: data.phone,
          address: data.address || '',
          gstNumber: data.gstNumber || ''
        });
      } catch (error) {
        toast.error('Failed to load customer');
        router.push('/customers');
      } finally {
        setLoading(false);
      }
    };
    if (customerId) fetchCustomer();
  }, [customerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phone.length !== 10) {
      return toast.error('Phone number must be 10 digits');
    }
    setSaving(true);
    try {
      await axios.put(`/api/customers/${customerId}`, formData);
      toast.success('Customer updated successfully');
      router.push('/customers');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update customer');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/customers" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Edit Customer</h1>
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
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Address</label>
            <textarea
              rows={3}
              className="w-full px-4 py-2 rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
              disabled={saving}
              className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium transition-all hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Update Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
