import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/store/app-context';

export const metadata: Metadata = {
  title: 'Trạm Học Ops - Quản Lý 24/7 Study Cafe & Co-working Space',
  description:
    'Hệ thống Quản lý Vận hành, Xếp ca 24/7, Thu Chi & Bảng Lương - Trạm Học (601A Cách Mạng Tháng 8, Q.10, TP.HCM)',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full bg-slate-50 antialiased">
      <body className="min-h-full flex flex-col font-sans text-slate-900 bg-slate-50">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
