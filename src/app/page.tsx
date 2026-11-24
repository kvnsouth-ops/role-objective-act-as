'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store/app-context';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { OverviewDashboard } from '@/components/dashboard/OverviewDashboard';
import { TransactionManagement } from '@/components/transactions/TransactionManagement';
import { ShiftMatrix247 } from '@/components/shifts/ShiftMatrix247';
import { PayrollModule } from '@/components/payroll/PayrollModule';
import { StaffPortal } from '@/components/staff/StaffPortal';
import {
  MapPin,
  Clock,
  Coffee,
  Heart,
  ShieldCheck,
  Sparkles,
  Database,
  CheckCircle,
} from 'lucide-react';

export default function HomePage() {
  const { currentUser, isDemoMode } = useAppStore();
  const isAdmin = currentUser.role === 'admin';

  // Default active tab: dashboard for admin, staff-portal for staff
  const [activeTab, setActiveTab] = useState<string>(
    currentUser.role === 'admin' ? 'dashboard' : 'staff-portal'
  );

  // When user switches role, adjust tab if necessary
  useEffect(() => {
    if (currentUser.role === 'staff' && (activeTab === 'dashboard' || activeTab === 'payroll' || activeTab === 'transactions')) {
      setActiveTab('staff-portal');
    }
  }, [currentUser.role]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Global Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Primary Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'dashboard' && <OverviewDashboard />}
        {activeTab === 'transactions' && <TransactionManagement />}
        {activeTab === 'shifts' && <ShiftMatrix247 />}
        {activeTab === 'payroll' && <PayrollModule />}
        {activeTab === 'staff-portal' && <StaffPortal />}
      </main>

      {/* Footer with Space Information */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-800">
                Trạm Học - 24/7 Study Cafe & Co-working Space
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                <MapPin className="w-3 h-3 text-amber-600" />
                <span>601A Cách Mạng Tháng 8, P.15, Quận 10, TP.HCM</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1 text-slate-600">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mở cửa 24/7 xuyên suốt 365 ngày</span>
            </div>

            <span className="text-slate-300">|</span>

            <div className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-teal-600" />
              <span>{isDemoMode ? 'Chế độ Demo (LocalStorage Sync)' : 'Supabase Live Connected'}</span>
            </div>

            <span className="text-slate-300">|</span>

            <div className="flex items-center gap-1 text-slate-400">
              <span>Đơn vị tiền tệ: <strong>VNĐ</strong></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
