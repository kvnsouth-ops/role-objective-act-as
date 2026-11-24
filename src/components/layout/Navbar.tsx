'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/app-context';
import {
  LayoutDashboard,
  Receipt,
  CalendarDays,
  Banknote,
  UserCheck,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useAppStore();
  const isAdmin = currentUser.role === 'admin';

  const adminTabs = [
    {
      id: 'dashboard',
      label: 'Tổng Quan',
      sublabel: 'KPI & Biểu đồ',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'transactions',
      label: 'Quản Lý Thu - Chi',
      sublabel: 'Doanh thu & Chi phí',
      icon: Receipt,
      badge: null,
    },
    {
      id: 'shifts',
      label: 'Xếp Ca 24/7',
      sublabel: 'Đan xen theo giờ',
      icon: CalendarDays,
      badge: '24/7',
    },
    {
      id: 'payroll',
      label: 'Bảng Lương',
      sublabel: 'Tự động & Đồng bộ',
      icon: Banknote,
      badge: null,
    },
    {
      id: 'staff-portal',
      label: 'Cổng Nhân Viên',
      sublabel: 'Giao diện xem thử',
      icon: UserCheck,
      badge: 'Staff',
    },
  ];

  const staffTabs = [
    {
      id: 'staff-portal',
      label: 'Cổng Nhân Viên',
      sublabel: 'Lịch & Giờ rảnh của tôi',
      icon: UserCheck,
      badge: 'Cá nhân',
    },
    {
      id: 'shifts',
      label: 'Lịch Ca Toàn Trạm',
      sublabel: 'Xem phối hợp 24/7',
      icon: CalendarDays,
      badge: '24/7',
    },
    {
      id: 'dashboard',
      label: 'Tổng Quan Chung',
      sublabel: 'Xem chỉ số chung',
      icon: LayoutDashboard,
      badge: null,
    },
  ];

  const tabs = isAdmin ? adminTabs : staffTabs;

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        {/* Desktop / Tablet Nav */}
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto custom-scrollbar py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <div className="text-left">
                  <div className="leading-tight font-semibold flex items-center gap-1.5">
                    {tab.label}
                    {tab.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                          isActive
                            ? 'bg-white/25 text-white'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-[10px] hidden md:block ${
                      isActive ? 'text-amber-100' : 'text-slate-400'
                    }`}
                  >
                    {tab.sublabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
