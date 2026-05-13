'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Save, Building2, MapPin, Phone, Hash, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    firmName: '',
    address: '',
    phone: '',
    gstNumber: '',
    email: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branch: '',
    upiId: '',
    signatureImage: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get('/api/settings');
        setSettings({
          firmName: data.firmName || '',
          address: data.address || '',
          phone: data.phone || '',
          gstNumber: data.gstNumber || '',
          email: data.email || '',
          bankName: data.bankName || '',
          accountNumber: data.accountNumber || '',
          ifscCode: data.ifscCode || '',
          branch: data.branch || '',
          upiId: data.upiId || '',
          signatureImage: data.signatureImage || '',
        });
      } catch (error) {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('/api/settings', settings);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
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
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your firm details and invoice preferences.</p>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-muted/30">
          <h2 className="text-xl font-bold">Firm Details</h2>
          <p className="text-sm text-muted-foreground">These details will appear on your generated invoices.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Building2 size={16} className="mr-2 text-primary" />
                Firm Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. Prasad Cold Coco"
                value={settings.firmName}
                onChange={(e) => setSettings({ ...settings, firmName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Hash size={16} className="mr-2 text-primary" />
                Your GST Number
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary uppercase"
                placeholder="GSTIN"
                value={settings.gstNumber}
                onChange={(e) => setSettings({ ...settings, gstNumber: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Phone size={16} className="mr-2 text-primary" />
                Mobile Number
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary"
                placeholder="10-digit mobile"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Mail size={16} className="mr-2 text-primary" />
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary"
                placeholder="Email for communication"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center">
              <MapPin size={16} className="mr-2 text-primary" />
              Firm Address
            </label>
            <textarea
              rows={3}
              className="w-full px-4 py-2 rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary"
              placeholder="Full shop/office address"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            />
          </div>

          <div className="border-t pt-8">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Building2 size={20} className="mr-2 text-primary" />
              Bank Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Bank Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary"
                  value={settings.bankName}
                  onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Account Number</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary"
                  value={settings.accountNumber}
                  onChange={(e) => setSettings({ ...settings, accountNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">IFSC Code</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary uppercase"
                  value={settings.ifscCode}
                  onChange={(e) => setSettings({ ...settings, ifscCode: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Branch</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary"
                  value={settings.branch}
                  onChange={(e) => setSettings({ ...settings, branch: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary flex items-center">
                  UPI ID (VPA)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-primary/50 bg-background outline-none focus:ring-2 focus:ring-primary"
                  placeholder="example@okaxis"
                  value={settings.upiId}
                  onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-8">
            <h3 className="text-lg font-bold mb-4 flex items-center text-primary">
              Digital Signature
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="w-48 h-24 border-2 border-dashed rounded-xl flex items-center justify-center bg-muted/30 overflow-hidden relative group">
                  {settings.signatureImage ? (
                    <>
                      <img src={settings.signatureImage} alt="Signature" className="max-h-full max-w-full object-contain" />
                      <button 
                        type="button"
                        onClick={() => setSettings({ ...settings, signatureImage: '' })}
                        className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">No Signature</span>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Upload Signature Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 200000) return toast.error('File size too large (max 200KB)');
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setSettings({ ...settings, signatureImage: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                  <p className="text-[10px] text-muted-foreground">Recommended: Transparent PNG, approx 400x200px. Max 200KB.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
            >
              <Save size={18} className="mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
