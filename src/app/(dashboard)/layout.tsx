import Sidebar from '@/components/Sidebar';
import { Toaster } from 'react-hot-toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto p-4 md:p-8 pt-16 lg:pt-8">
        <Toaster position="top-right" />
        {children}
      </main>
    </div>
  );
}
