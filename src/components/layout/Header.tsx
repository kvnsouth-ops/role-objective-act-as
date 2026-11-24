'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/app-context';
import { Floor } from '@/types';
import {
  Coffee,
  Building2,
  Calendar,
  RotateCcw,
  User,
  Shield,
  Layers,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { formatDateWithWeekdayVN } from '@/lib/utils';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const {
    currentUser,
    switchUserById,
    profiles,
    selectedFloor,
    setSelectedFloor,
    selectedDate,
    setSelectedDate,
    selectedMonth,
    setSelectedMonth,
    resetToSampleData,
    isDemoMode,
  } = useAppStore();

  const floorOptions: Floor[] = ['Tất cả', 'Tầng 1', 'Tầng 2', 'Tầng 3'];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner: Address & Role Switcher */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-amber-50 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold tracking-wide">TRẠM HỌC 24/7</span>
            <span className="hidden sm:inline text-amber-200">|</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-amber-100">
              <MapPin className="w-3 h-3 text-amber-300" />
              601A Cách Mạng Tháng 8, P.15, Q.10, TP.HCM
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Demo Switcher */}
            <div className="flex items-center gap-1.5 bg-black/30 rounded-md px-2 py-0.5 border border-amber-500/40">
              <User className="w-3 h-3 text-amber-300" />
              <span className="hidden md:inline text-amber-200 text-[11px]">Đang đăng nhập:</span>
              <select
                aria-label="Chọn tài khoản nhân sự"
                value={currentUser.id}
                onChange={(e) => switchUserById(e.target.value)}
                className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id} className="text-slate-900">
                    {p.role === 'admin' ? '👑 [Admin] ' : '👤 [Staff] '}
                    {p.full_name} ({p.default_floor})
                  </option>
                ))}
              </select>
            </div>

            {isDemoMode && (
              <button
                onClick={() => {
                  if (confirm('Khôi phục dữ liệu mẫu ban đầu của Trạm Học?')) {
                    resetToSampleData();
                  }
                }}
                title="Khôi phục dữ liệu mẫu ban đầu"
                className="flex items-center gap-1 bg-amber-600/50 hover:bg-amber-600 text-amber-100 rounded px-2 py-0.5 text-[11px] transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Khôi phục mẫu</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Logo & Space info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                <Coffee className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                    Trạm Học Ops
                  </h1>
                  <span className="text-[11px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                    24/7 Space
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Hệ thống Quản lý Vận hành, Ca kíp & Thu Chi Thông Minh
                </p>
              </div>
            </div>

            {/* Mobile role badge */}
            <div className="lg:hidden flex items-center">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1 ${
                  currentUser.role === 'admin'
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {currentUser.role === 'admin' ? (
                  <>
                    <Shield className="w-3 h-3 text-purple-600" /> Quản lý
                  </>
                ) : (
                  <>
                    <User className="w-3 h-3 text-emerald-600" /> Nhân viên
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Quick Context Controls: Floor Filter + Date/Month Picker */}
          <div className="flex flex-wrap items-center gap-2 pt-1 lg:pt-0">
            {/* Floor Filter Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
              <span className="text-slate-500 px-2 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Khu vực:</span>
              </span>
              {floorOptions.map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFloor(f)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    selectedFloor === f
                      ? 'bg-white text-amber-800 font-semibold shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Date / Month Picker */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-amber-600 mr-1.5" />
                <span className="text-slate-500 mr-1 hidden sm:inline">Ngày:</span>
                <input
                  type="date"
                  aria-label="Chọn ngày"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    if (e.target.value) {
                      setSelectedMonth(e.target.value.substring(0, 7));
                    }
                  }}
                  className="font-medium text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                />
              </div>

              <div className="flex items-center bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs shadow-2xs">
                <span className="text-slate-500 mr-1">Tháng:</span>
                <input
                  type="month"
                  aria-label="Chọn tháng"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="font-medium text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
