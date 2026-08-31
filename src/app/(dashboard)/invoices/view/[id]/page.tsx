'use client';

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Printer,
  Download,
  Mail,
  Share2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import html2canvas from 'html2canvas';
import Link from 'next/link';
import { format } from 'date-fns';
import { useReactToPrint } from 'react-to-print';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { ToWords } from 'to-words';

export default function ViewInvoicePage() {
  const { id } = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const componentRef = useRef<HTMLDivElement>(null);

  const toWords = new ToWords({
    localeCode: 'en-IN',
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
      ignoreZeroCurrency: false,
      doNotAddOnly: false,
      currencyOptions: {
        name: 'Rupee',
        plural: 'Rupees',
        symbol: '₹',
        fractionalUnit: {
          name: 'Paisa',
          plural: 'Paise',
          symbol: '',
        },
      }
    }
  });

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const [invRes, setRes] = await Promise.all([
          axios.get(`/api/invoices/${id}`),
          axios.get('/api/settings')
        ]);
        setInvoice(invRes.data);
        setSettings(setRes.data);
      } catch (error) {
        toast.error('Failed to load invoice details');
        router.push('/invoices');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!invoice) return null;

  const upiLink = settings?.upiId
    ? `upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(settings.firmName)}&am=${invoice.total}&cu=INR`
    : null;

  const halfGst = (invoice.gstAmount / 2).toFixed(2);
  const halfRate = (invoice.gstRate / 2).toFixed(2);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="space-y-4 no-print">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/invoices" className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Invoice Details</h1>
              <p className="text-sm text-muted-foreground">{invoice.invoiceNumber}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
            {invoice.status}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-card p-3 rounded-2xl border shadow-sm">
          <button
            onClick={async () => {
              try {
                const newStatus = invoice.status === 'Paid' ? 'Unpaid' : 'Paid';
                const { data } = await axios.patch(`/api/invoices/${invoice._id}`, { status: newStatus });
                setInvoice(data);
                toast.success(`Invoice marked as ${newStatus}`);
              } catch (error) {
                toast.error('Failed to update status');
              }
            }}
            className={`h-10 px-4 rounded-xl text-sm font-bold flex items-center justify-center transition-all shadow-sm ${invoice.status === 'Paid'
              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200'
              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200'
              }`}
          >
            {invoice.status === 'Paid' ? (
              <><AlertCircle size={16} className="mr-2" /> Mark Unpaid</>
            ) : (
              <><CheckCircle2 size={16} className="mr-2" /> Mark Paid</>
            )}
          </button>

          <button
            onClick={() => {
              const text = `Hello ${invoice.customerId?.name}, here is your invoice ${invoice.invoiceNumber} from ${settings?.firmName || 'Prasad Cold Coco'}. Total Amount: ₹${invoice.total.toLocaleString()}. View here: ${window.location.href}`;
              window.open(`https://wa.me/${invoice.customerId?.phone}?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="h-10 px-4 rounded-xl bg-[#25D366] text-white text-sm font-bold flex items-center justify-center transition-all hover:bg-[#20bd5c] shadow-sm"
          >
            <Share2 size={16} className="mr-2" />
            WhatsApp Text
          </button>

          <button
            onClick={async () => {
              if (!componentRef.current) return;
              const toastId = toast.loading('Generating image...');
              try {
                const canvas = await html2canvas(componentRef.current, {
                  scale: 2,
                  useCORS: true,
                  backgroundColor: '#ffffff',
                  logging: false,
                  onclone: (clonedDoc) => {
                    // Modern CSS Color Fix: Scan and replace lab/oklch colors that crash html2canvas
                    const elements = clonedDoc.getElementsByTagName('*');
                    for (let i = 0; i < elements.length; i++) {
                      const el = elements[i] as HTMLElement;
                      const style = window.getComputedStyle(el);

                      // Check problematic properties
                      ['color', 'backgroundColor', 'borderColor', 'boxShadow'].forEach(prop => {
                        const val = (style as any)[prop];
                        if (val && (val.includes('lab(') || val.includes('oklch(') || val.includes('oklsh('))) {
                          // Force fallback to safe colors if modern colors are detected
                          if (prop === 'color') el.style.color = '#1f2937';
                          if (prop === 'backgroundColor') {
                            if (val.includes('oklch')) el.style.backgroundColor = 'transparent';
                            else el.style.backgroundColor = '#ffffff';
                          }
                          if (prop === 'borderColor') el.style.borderColor = '#e5e7eb';
                          if (prop === 'boxShadow') el.style.boxShadow = 'none';
                        }
                      });
                    }
                  }
                });

                canvas.toBlob(async (blob) => {
                  if (!blob) {
                    toast.error('Failed to create image blob', { id: toastId });
                    return;
                  }
                  try {
                    const item = new ClipboardItem({ "image/png": blob });
                    await navigator.clipboard.write([item]);
                    toast.success('Invoice image copied to clipboard!', { id: toastId });

                    const text = `Hello ${invoice.customerId?.name}, here is your invoice ${invoice.invoiceNumber}. Total: ₹${invoice.total.toLocaleString()}.`;
                    window.open(`https://wa.me/${invoice.customerId?.phone}?text=${encodeURIComponent(text)}`, '_blank');
                  } catch (err) {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.download = `invoice-${invoice.invoiceNumber}.png`;
                    link.href = url;
                    link.click();
                    toast.success('Image downloaded for sharing.', { id: toastId });
                  }
                });
              } catch (error) {
                console.error('html2canvas error:', error);
                toast.error('Failed to generate image. Please try again.', { id: toastId });
              }
            }}
            className="h-10 px-4 rounded-xl bg-[#128C7E] text-white text-sm font-bold flex items-center justify-center transition-all hover:bg-[#0e7468] shadow-sm"
          >
            <ImageIcon size={16} className="mr-2" />
            WhatsApp Image
          </button>

          <button
            onClick={() => (handlePrint as any)()}
            className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center transition-all hover:opacity-90 shadow-sm"
          >
            <Printer size={16} className="mr-2" />
            Print / PDF
          </button>
        </div>
      </div>

      <div className="border shadow-lg rounded-xl overflow-hidden no-print">
        <div className="bg-white text-black p-6 md:p-8" ref={componentRef}>
          {/* Row 1: Centered Firm Name */}
          <div className="text-center border-b border-[#e5e7eb] pb-3 mb-3">
            <h1 className="text-3xl font-black text-[#2563eb] uppercase tracking-tighter">
              {settings?.firmName || 'Prasad Food and Beverages'}
            </h1>
          </div>

          {/* Row 2: Logo, Firm Details & Tax Invoice Side-by-Side */}
          <div className="flex flex-row justify-between items-start gap-6 border-b border-[#e5e7eb] pb-3 mb-3">
            <div className="flex flex-row items-start space-x-4 gap-1">
              <img src="/logo-chocolate-nobg.png" alt="Logo" className="h-12 w-auto" />
              <div className="text-[12px] text-gray-600 max-w-[250px] whitespace-pre-wrap leading-tight">
                {settings?.address || 'Ahmedabad, Gujarat, India'}
                {settings?.phone && <><br />Phone: {settings.phone}</>}
                {settings?.email && <><br />Email: {settings.email}</>}
                {invoice.type !== 'NON-GST' && settings?.gstNumber && <><br /><span className="font-bold text-gray-900">GSTIN: {settings.gstNumber}</span></>}
              </div>
            </div>

            <div className="text-right w-auto">
              <h2 className="text-xl font-light text-gray-300 uppercase tracking-widest mb-1 leading-none">
                {invoice.type === 'NON-GST' ? 'Invoice' : 'Tax Invoice'}
              </h2>
              <div className="space-y-0 text-[10px]">
                <p><span className="text-gray-500 uppercase font-semibold">Invoice No:</span> <span className="font-bold">{invoice.invoiceNumber}</span></p>
                <p><span className="text-gray-500 uppercase font-semibold">Date:</span> <span className="font-bold">{format(new Date(invoice.date), 'dd MMM yyyy')}</span></p>
                {invoice.dueDate && (
                  <p><span className="text-gray-500 uppercase font-semibold">Due Date:</span> <span className="font-bold text-red-600">{format(new Date(invoice.dueDate), 'dd MMM yyyy')}</span></p>
                )}
                <p>
                  <span className="text-gray-500 uppercase font-semibold">Status:</span>
                  <span className={`ml-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${invoice.status === 'Paid' ? 'bg-[#d1fae5] text-[#047857]' : 'bg-[#fef3c7] text-[#92400e]'}`}>
                    {invoice.status || 'Unpaid'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Row 3: Bill To */}
          <div className="grid grid-cols-2 gap-4 pb-2 mb-2 border-b border-gray-100">
            <div>
              <h4 className="text-[13px] font-bold text-gray-400 uppercase mb-0.5">Bill To:</h4>
              <div className="space-y-0">
                <p className="font-bold text-md leading-tight">{invoice.customerId?.name}</p>
                <p className="text-[11px] text-gray-600 leading-tight">{invoice.customerId?.address}</p>
                <p className="text-[11px] text-gray-600">Phone: {invoice.customerId?.phone}</p>
                {invoice.type !== 'NON-GST' && invoice.customerId?.gstNumber && (
                  <p className="text-[11px] text-gray-600">GSTIN: {invoice.customerId.gstNumber}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-[#f3f4f6] border-y border-[#e5e7eb]">
                  <th className="px-3 py-2 text-[10px] font-bold text-[#6b7280] uppercase w-12 text-center">Sr. No.</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-[#6b7280] uppercase">Item Description</th>
                  {invoice.type !== 'NON-GST' && (
                    <th className="px-3 py-2 text-[10px] font-bold text-[#6b7280] uppercase text-center">HSN</th>
                  )}
                  <th className="px-3 py-2 text-[10px] font-bold text-[#6b7280] uppercase text-center">Qty</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-[#6b7280] uppercase text-right">Price</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-[#6b7280] uppercase text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b">
                {invoice.items.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="px-3 py-1 text-center text-gray-600 text-[11px]">{idx + 1}</td>
                    <td className="px-3 py-1 font-medium text-[11px]">{item.name}</td>
                    {invoice.type !== 'NON-GST' && (
                      <td className="px-3 py-1 text-center text-[11px] text-gray-500">{item.hsnCode || '-'}</td>
                    )}
                    <td className="px-3 py-1 text-center text-[11px]">{item.quantity}</td>
                    <td className="px-3 py-1 text-right text-[11px]">₹{item.price.toFixed(2)}</td>
                    <td className="px-3 py-1 text-right text-[11px]">₹{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <div className="w-full max-w-[240px] space-y-1">
              {invoice.type !== 'NON-GST' ? (
                <>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-500">Taxable Value:</span>
                    <span className="font-medium">₹{(invoice.total - invoice.gstAmount).toFixed(2)}</span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="flex justify-between text-[11px] text-emerald-600">
                      <span>Discount:</span>
                      <span className="font-medium">- ₹{(invoice.discount).toFixed(2)}</span>
                    </div>
                  )}
                  {(invoice.gstRate > 0) && (
                    <>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-500">CGST ({halfRate}%):</span>
                        <span className="font-medium">₹{halfGst}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-500">SGST ({halfRate}%):</span>
                        <span className="font-medium">₹{halfGst}</span>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-500">Subtotal:</span>
                    <span className="font-medium">₹{(invoice.subtotal || 0).toFixed(2)}</span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="flex justify-between text-[11px] text-emerald-600">
                      <span>Discount:</span>
                      <span className="font-medium">- ₹{(invoice.discount).toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between items-center pt-1 mt-1 border-t border-gray-800">
                <span className="text-sm font-bold uppercase">Total:</span>
                <span className="text-xl font-black text-[#2563eb]">₹{invoice.total.toFixed(2)}</span>
              </div>
              <p className="text-[12px] text-right text-gray-400 pt-1 italic font-medium leading-tight">
                <span className="text-gray-600 font-bold text-[10px] uppercase block mb-0.5">Amount in words</span>
                {toWords.convert(invoice.total)}
              </p>
            </div>
          </div>

          <div className="mt-4 border-t pt-3 flex flex-col md:grid md:grid-cols-3 gap-6">
            <div className="text-[10px] text-[#6b7280] space-y-1.5">
              <div>
                <p className="font-bold uppercase mb-0.5 text-[9px]">Bank Details:</p>
                <p>Bank: {settings?.bankName || 'N/A'} | A/c: {settings?.accountNumber || 'N/A'}</p>
                <p>IFSC: {settings?.ifscCode || 'N/A'} | Branch: {settings?.branch || 'N/A'}</p>
              </div>
              <div className="pt-0.5">
                <p className="font-bold uppercase mb-0.5 text-[9px] underline">Terms & Conditions:</p>
                <p className="text-[8px] leading-tight">
                  • Goods once sold will not be taken back.
                </p>
                <p className="text-[8px] leading-tight">
                  • Payment within 15 days.
                </p>
                <p className="text-[8px] leading-tight">
                  • Subject to Gujarat jurisdiction.
                </p>
                {/* <p className="text-[8px] leading-tight">
                  • Payments not received within <b className='text-red-500 font-bold'>3 days</b> of the due date will be subject to an interest charge of <b className='text-red-500 font-bold'>18% per annum</b> on the outstanding amount.
                </p>

                <p className="text-[8px] leading-tight">
                  • If any payment remains outstanding for more than <b className='text-red-500 font-bold'>10 days</b> after the due date, all subsequent orders will be accepted on an <b className='text-red-500 font-bold'>ADVANCE PAYMENT ONLY</b> basis until all outstanding dues are cleared.
                </p> */}
              </div>
            </div>

            <div className="flex flex-col items-center justify-start text-center">
              {upiLink ? (
                <div className="flex flex-col items-center">
                  <p className="text-[8px] font-bold uppercase mb-0.5 text-[#6b7280]">Scan to Pay via UPI</p>
                  <div className="p-0.5 border rounded bg-white">
                    <QRCodeSVG value={upiLink} size={64} />
                  </div>
                  <p className="text-[7px] mt-0.5 text-[#9ca3af]">{settings.upiId}</p>
                </div>
              ) : null}
            </div>

            <div className="text-right flex flex-col justify-end items-end relative min-h-[80px]">
              <p className="text-[9px] italic mb-0.5">For <span className="font-bold">{settings?.firmName || 'Prasad Food and Beverages'}</span></p>
              {settings?.signatureImage && (
                <div className="mb-0.5">
                  <img src={settings.signatureImage} alt="Signature" className="h-20 w-auto object-contain" />
                </div>
              )}
              {!settings?.signatureImage && <div className="h-8" />}
              <div className="border-t border-black w-32 pt-0.5 text-center text-[9px] font-bold uppercase">
                Authorized Signatory
              </div>
            </div>
          </div>

          {invoice.status === 'Unpaid' && (
            <div className="pt-8">
              <div className='p-2 border border-gray-400 rounded-md shadow-lg'>
                <p className="font-bold mb-1 text-[10px] ">Note:</p>
                <p className="text-[10px] leading-tight">
                  • Payments not received within <b className='text-red-500 font-bold'>3 days</b> of the due date will be subject to an interest charge of <b className='text-red-500 font-bold'>18% per annum</b> on the outstanding amount.
                </p>

                <p className="text-[10px] leading-tight">
                  • If any payment remains outstanding for more than <b className='text-red-500 font-bold'>10 days</b> after the due date, all subsequent orders will be accepted on an <b className='text-red-500 font-bold'>ADVANCE PAYMENT ONLY</b> basis until all outstanding dues are cleared.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
          }
          .bg-background {
            background: white !important;
          }
          .shadow-lg, .rounded-xl, .border {
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </div>

  );
}
