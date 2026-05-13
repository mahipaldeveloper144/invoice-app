'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Edit2, 
  Trash2,
  Package,
  IndianRupee,
  Tag,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Cold Coco',
    hsnCode: ''
  });

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/api/products');
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, formData);
        toast.success('Product updated');
      } else {
        await axios.post('/api/products', formData);
        toast.success('Product added');
      }
      setShowModal(false);
      setEditingProduct(null);
      setFormData({ name: '', price: '', category: 'Cold Coco', hsnCode: '' });
      fetchProducts();
    } catch (error) {
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    setDeletingId(id);
    try {
      await axios.delete(`/api/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Delete failed');
      setDeletingId(null);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      hsnCode: product.hsnCode || ''
    });
    setShowModal(true);
  };

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
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">Manage your product catalog.</p>
        </div>
        <button 
          onClick={() => {
            setEditingProduct(null);
            setFormData({ name: '', price: '', category: 'Cold Coco', hsnCode: '' });
            setShowModal(true);
          }}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
        >
          <Plus size={18} className="mr-2" />
          Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-card rounded-xl border shadow-sm p-6 hover:shadow-md transition-shadow group relative">
            <div className="flex items-start justify-between">
              <div className="p-3 bg-primary/10 text-primary rounded-xl">
                <Package size={24} />
              </div>
              <div className="flex space-x-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEdit(product)}
                  className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(product._id)}
                  disabled={deletingId === product._id}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  {deletingId === product._id ? (
                    <div className="h-4 w-4 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-lg">{product.name}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <div className="flex items-center">
                  <Tag size={14} className="mr-1" />
                  {product.category}
                </div>
                {product.hsnCode && (
                  <div className="flex items-center">
                    <span className="font-bold mr-1">HSN:</span>
                    {product.hsnCode}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center text-xl font-bold text-primary">
                <IndianRupee size={18} />
                {product.price}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-muted rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Name</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price (₹)</label>
                <input
                  required
                  type="number"
                  className="w-full px-4 py-2 rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  className="w-full px-4 py-2 rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Cold Coco">Cold Coco</option>
                  <option value="Premix">Premix</option>
                  <option value="Add-ons">Add-ons</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">HSN Code</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary"
                  value={formData.hsnCode}
                  onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                  placeholder="e.g. 2106"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {saving ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : null}
                  {editingProduct ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
