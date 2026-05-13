'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  ChevronLeft,
  Search,
  Check,
  ChevronDown,
  Calculator,
  Printer,
  Save
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CreateInvoicePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [invoiceType, setInvoiceType] = useState<'GST' | 'NON-GST'>('GST');
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
  const [gstRate, setGstRate] = useState(5);
  const [isGstIncluded, setIsGstIncluded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          axios.get('/api/customers'),
          axios.get('/api/products')
        ]);
        setCustomers(custRes.data);
        setProducts(prodRes.data);
      } catch (error) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addItem = () => {
    setInvoiceItems([...invoiceItems, { productId: '', name: '', quantity: 1, price: 0, hsnCode: '' }]);
  };

  const removeItem = (index: number) => {
    const newItems = [...invoiceItems];
    newItems.splice(index, 1);
    setInvoiceItems(newItems);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...invoiceItems];
    if (field === 'productId') {
      const product = products.find(p => p._id === value);
      newItems[index] = {
        ...newItems[index],
        productId: value,
        name: product?.name || '',
        price: product?.price || 0,
        hsnCode: product?.hsnCode || ''
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setInvoiceItems(newItems);
  };

  const calculateSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const subtotal = calculateSubtotal();
  const discountedSubtotal = subtotal - discount;
  
  const gstAmount = isGstIncluded
    ? discountedSubtotal - (discountedSubtotal / (1 + gstRate / 100))
    : (discountedSubtotal * gstRate) / 100;

  const total = isGstIncluded ? discountedSubtotal : discountedSubtotal + gstAmount;

  const handleSave = async () => {
    if (!selectedCustomer) return toast.error('Please select a customer');
    if (invoiceItems.length === 0) return toast.error('Add at least one item');
    if (invoiceItems.some(item => !item.productId || item.quantity <= 0)) {
      return toast.error('Please complete all item details');
    }

    setSaving(true);
    try {
      const invoiceData = {
        customerId: selectedCustomer._id,
        type: invoiceType,
        items: invoiceItems,
        subtotal: subtotal,
        discount: discount,
        gstRate: invoiceType === 'GST' ? gstRate : 0,
        gstAmount: invoiceType === 'GST' ? gstAmount : 0,
        total: invoiceType === 'GST' ? total : discountedSubtotal,
        date: new Date(invoiceDate),
        dueDate: dueDate ? new Date(dueDate) : undefined
      };

      const { data } = await axios.post('/api/invoices', invoiceData);
      toast.success('Invoice saved successfully');
      router.push(`/invoices/view/${data._id}`);
    } catch (error) {
      toast.error('Failed to save invoice');
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
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/invoices" className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Create New Invoice</h1>
        </div>
        <div className="flex bg-muted p-1 rounded-lg">
          <button
            onClick={() => setInvoiceType('GST')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${invoiceType === 'GST' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground'}`}
          >
            GST Invoice
          </button>
          <button
            onClick={() => setInvoiceType('NON-GST')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${invoiceType === 'NON-GST' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground'}`}
          >
            Non-GST Invoice
          </button>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
          >
            <Save size={18} className="mr-2" />
            {saving ? 'Saving...' : 'Save Invoice'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection */}
          <div className="bg-card rounded-xl border shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">Customer Details</h2>
            <div className="space-y-4">
              <select
                className="w-full px-4 py-2 rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary"
                value={selectedCustomer?._id || ''}
                onChange={(e) => {
                  const customer = customers.find(c => c._id === e.target.value);
                  setSelectedCustomer(customer);
                }}
              >
                <option value="">Select a customer</option>
                {customers.map(c => (
                  <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>
                ))}
              </select>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground uppercase">Invoice Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground uppercase">Due Date (Optional)</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
              {selectedCustomer && (
                <div className="p-4 bg-muted/50 rounded-lg text-sm grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground">Address:</p>
                    <p className="font-medium">{selectedCustomer.address || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">GST Number:</p>
                    <p className="font-medium">{selectedCustomer.gstNumber || 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Items Section */}
          <div className="bg-card rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Invoice Items</h2>
              <button
                onClick={addItem}
                className="text-sm font-medium text-primary hover:underline flex items-center"
              >
                <Plus size={16} className="mr-1" /> Add Item
              </button>
            </div>

            <div className="space-y-4">
              {invoiceItems.map((item, index) => (
                <div key={index} className="flex flex-col md:grid md:grid-cols-12 gap-3 items-end border-b pb-4 last:border-0 last:pb-0">
                  <div className={`${invoiceType === 'GST' ? "md:col-span-3" : "md:col-span-5"} w-full space-y-2`}>
                    <label className="text-xs font-medium text-muted-foreground uppercase">Product</label>
                    <select
                      className="w-full px-3 py-2 rounded-lg border bg-background text-sm outline-none focus:ring-2 focus:ring-primary"
                      value={item.productId}
                      onChange={(e) => updateItem(index, 'productId', e.target.value)}
                    >
                      <option value="">Select Product</option>
                      {products.map(p => (
                        <option key={p._id} value={p._id}>{p.name} (₹{p.price})</option>
                      ))}
                    </select>
                  </div>
                  {invoiceType === 'GST' && (
                    <div className="md:col-span-2 w-full space-y-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase">HSN Code</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 rounded-lg border bg-background text-sm outline-none focus:ring-2 focus:ring-primary"
                        value={item.hsnCode}
                        onChange={(e) => updateItem(index, 'hsnCode', e.target.value)}
                        placeholder="HSN"
                      />
                    </div>
                  )}
                  <div className="md:col-span-2 w-full space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase">Qty</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-3 py-2 rounded-lg border bg-background text-sm outline-none focus:ring-2 focus:ring-primary"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="md:col-span-2 w-full space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase">Price</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 rounded-lg border bg-background text-sm outline-none focus:ring-2 focus:ring-primary"
                      value={item.price}
                      onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="md:col-span-2 w-full space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase">Total</label>
                    <div className="px-3 py-2 font-medium bg-muted/30 rounded-lg">₹{(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                  <div className="md:col-span-1 w-full pb-1 flex justify-end">
                    <button 
                      onClick={() => removeItem(index)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {invoiceItems.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed rounded-xl text-muted-foreground">
                  No items added. Click "Add Item" to start.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar / Summary */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl border shadow-sm p-6 sticky top-8">
            <h2 className="text-lg font-bold mb-6 flex items-center">
              <Calculator size={20} className="mr-2" />
              Summary
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="space-y-2 py-2 border-b">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Discount (₹)</span>
                  <input
                    type="number"
                    min="0"
                    className="w-24 px-2 py-1 rounded border bg-background text-sm text-right outline-none focus:ring-1 focus:ring-primary"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              {invoiceType === 'GST' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">GST Rate</span>
                    <select
                      className="bg-muted px-2 py-1 rounded text-sm outline-none"
                      value={gstRate}
                      onChange={(e) => setGstRate(parseInt(e.target.value))}
                    >
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18%</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">GST Included?</span>
                    <button
                      onClick={() => setIsGstIncluded(!isGstIncluded)}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${isGstIncluded ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isGstIncluded ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  {gstRate > 0 && (
                    <>
                      <div className="flex items-center justify-between py-2 border-b text-sm">
                        <span className="text-muted-foreground text-xs uppercase">CGST ({gstRate / 2}%)</span>
                        <span className="font-medium">₹{(gstAmount / 2).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b text-sm">
                        <span className="text-muted-foreground text-xs uppercase">SGST ({gstRate / 2}%)</span>
                        <span className="font-medium">₹{(gstAmount / 2).toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  {gstRate === 0 && (
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-muted-foreground">GST Amount</span>
                      <span className="font-medium">₹0.00</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-2 text-sm text-muted-foreground italic border-b">
                  No GST will be applied to this invoice.
                </div>
              )}

              <div className="flex items-center justify-between pt-4">
                <span className="text-xl font-bold">Total</span>
                <span className="text-2xl font-bold text-primary">₹{(invoiceType === 'GST' ? total : subtotal).toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Finalize Invoice'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
