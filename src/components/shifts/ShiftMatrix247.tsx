'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store/app-context';
import { Shift, Profile, ShiftFloor, ShiftStatus, HourlyCoverageTarget } from '@/types';
import {
  formatDateVN,
  formatDateWithWeekdayVN,
  getTodayDateStr,
  addDaysToStr,
  formatHour,
  formatVND,
} from '@/lib/utils';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Plus,
  Trash2,
  Moon,
  Sun,
  Shield,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Settings,
  Check,
  X,
  UserCheck,
} from 'lucide-react';

export const ShiftMatrix247: React.FC = () => {
  const {
    profiles,
    shifts,
    addShift,
    updateShift,
    deleteShift,
    toggleShiftStatus,
    bulkApproveShiftsForDate,
    availabilities,
    coverageTarget,
    setCoverageTarget,
    selectedDate,
    setSelectedDate,
    selectedFloor,
    setSelectedFloor,
    currentUser,
  } = useAppStore();

  const isAdmin = currentUser.role === 'admin';

  // View mode: 'day-matrix' | 'week-summary'
  const [viewMode, setViewMode] = useState<'day-matrix' | 'week-summary'>('day-matrix');

  // Modal / Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTargetConfig, setShowTargetConfig] = useState(false);

  // New shift form state
  const [modalStaffId, setModalStaffId] = useState<string>('');
  const [modalDate, setModalDate] = useState<string>(selectedDate);
  const [modalStartHour, setModalStartHour] = useState<number>(8);
  const [modalEndHour, setModalEndHour] = useState<number>(16);
  const [modalFloor, setModalFloor] = useState<ShiftFloor>('Tầng 2');
  const [modalMultiplier, setModalMultiplier] = useState<number>(1.0);
  const [modalAllowance, setModalAllowance] = useState<number>(0);
  const [modalNote, setModalNote] = useState<string>('');
  const [isOvernight, setIsOvernight] = useState<boolean>(false);

  // Target config state
  const [minTarget, setMinTarget] = useState<number>(coverageTarget.min);
  const [idealTarget, setIdealTarget] = useState<number>(coverageTarget.ideal);

  // Active staff list
  const staffList = useMemo(() => {
    return profiles.filter((p) => p.is_active && (p.role === 'staff' || p.role === 'admin'));
  }, [profiles]);

  // Filtered shifts for selectedDate
  const dayShifts = useMemo(() => {
    return shifts.filter((s) => {
      const matchDate = s.work_date === selectedDate;
      const matchFloor =
        selectedFloor === 'Tất cả' || s.floor === selectedFloor;
      return matchDate && matchFloor;
    });
  }, [shifts, selectedDate, selectedFloor]);

  // Hourly coverage calculation (0..23)
  const hourlyCoverage = useMemo(() => {
    const coverage: { hour: number; count: number; staffNames: string[] }[] = [];

    for (let h = 0; h < 24; h++) {
      const activeInHour = dayShifts.filter(
        (s) => s.start_hour <= h && s.end_hour > h
      );
      const names = activeInHour.map((s) => {
        const staff = profiles.find((p) => p.id === s.staff_id);
        return staff ? staff.full_name : 'NV';
      });

      coverage.push({
        hour: h,
        count: activeInHour.length,
        staffNames: names,
      });
    }

    return coverage;
  }, [dayShifts, profiles]);

  // Helper to get staff availability for this date
  const staffAvailabilityMap = useMemo(() => {
    const map = new Map<string, number[]>();
    for (const a of availabilities) {
      if (a.work_date === selectedDate) {
        map.set(a.staff_id, a.available_hours || []);
      }
    }
    return map;
  }, [availabilities, selectedDate]);

  // Quick Presets
  const applyPreset = (preset: 'morning' | 'afternoon' | 'night' | 'overnight') => {
    if (preset === 'morning') {
      setModalStartHour(6);
      setModalEndHour(14);
      setModalMultiplier(1.0);
      setModalAllowance(0);
      setIsOvernight(false);
      setModalNote('Ca sáng (06:00 - 14:00)');
    } else if (preset === 'afternoon') {
      setModalStartHour(14);
      setModalEndHour(22);
      setModalMultiplier(1.0);
      setModalAllowance(0);
      setIsOvernight(false);
      setModalNote('Ca chiều (14:00 - 22:00)');
    } else if (preset === 'night') {
      setModalStartHour(18);
      setModalEndHour(24);
      setModalMultiplier(1.2);
      setModalAllowance(20000);
      setIsOvernight(false);
      setModalNote('Ca tối / đêm (18:00 - 24:00)');
    } else if (preset === 'overnight') {
      // Overnight 22:00 to 06:00
      setModalStartHour(22);
      setModalEndHour(6);
      setModalMultiplier(1.2);
      setModalAllowance(30000);
      setIsOvernight(true);
      setModalNote('Ca cú đêm (22:00 - 06:00 hôm sau, tự tách ca)');
    }
  };

  // Open modal for a specific staff and hour
  const openAddModalForCell = (staffId: string, hour: number) => {
    const staff = profiles.find((p) => p.id === staffId);
    setModalStaffId(staffId);
    setModalDate(selectedDate);
    setModalStartHour(hour);
    setModalEndHour(Math.min(24, hour + 6));
    setModalFloor((staff?.default_floor === 'Tầng 1' ? 'Tầng 1' : 'Tầng 2'));
    setModalMultiplier(hour >= 22 || hour < 6 ? 1.2 : 1.0);
    setModalAllowance(hour >= 22 || hour < 6 ? 20000 : 0);
    setModalNote('');
    setIsOvernight(false);
    setShowAddModal(true);
  };

  // Handle shift submit
  const handleShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalStaffId) {
      alert('Vui lòng chọn nhân viên!');
      return;
    }

    addShift({
      staff_id: modalStaffId,
      work_date: modalDate,
      start_hour: modalStartHour,
      end_hour: modalEndHour,
      floor: modalFloor,
      rate_multiplier: modalMultiplier,
      allowance: modalAllowance,
      note: modalNote,
      status: 'scheduled',
    });

    setShowAddModal(false);
  };

  // Date controls
  const handlePrevDay = () => setSelectedDate(addDaysToStr(selectedDate, -1));
  const handleNextDay = () => setSelectedDate(addDaysToStr(selectedDate, 1));
  const handleToday = () => setSelectedDate(getTodayDateStr());

  // Week days calculation for week view
  const weekDays = useMemo(() => {
    const base = new Date(selectedDate + 'T00:00:00');
    const dayOfWeek = base.getDay(); // 0 is Sunday, 1 is Monday
    // Calculate Monday of current week
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(base);
    monday.setDate(base.getDate() + diffToMonday);

    const days: { dateStr: string; label: string; isCurrent: boolean }[] = [];
    const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      days.push({
        dateStr,
        label: `${dayNames[i]} (${day}/${month})`,
        isCurrent: dateStr === selectedDate,
      });
    }

    return days;
  }, [selectedDate]);

  return (
    <div className="space-y-6">
      {/* Top Header & Scheduling Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Xếp Ca 24/7 Đan Xen Theo Giờ
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                24 Hours Continuous
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Lịch phân bổ nhân sự từng giờ, hỗ trợ tách ca xuyên đêm tự động và kiểm soát tỷ lệ phủ ca
          </p>
        </div>

        {/* View Mode & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Day / Week Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium border border-slate-200">
            <button
              onClick={() => setViewMode('day-matrix')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'day-matrix'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ma Trận 24 Giờ (Ngày)
            </button>
            <button
              onClick={() => setViewMode('week-summary')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'week-summary'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tổng Quan Tuần (7 Ngày)
            </button>
          </div>

          {/* Target coverage config button */}
          {isAdmin && (
            <button
              onClick={() => setShowTargetConfig(!showTargetConfig)}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold shadow-2xs"
              title="Cấu hình mục tiêu phủ ca"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>Chỉ tiêu ({coverageTarget.min}-{coverageTarget.ideal} NV)</span>
            </button>
          )}

          {/* Bulk Approve button */}
          {isAdmin && (
            <button
              onClick={() => {
                if (confirm(`Duyệt tất cả ca làm việc trong ngày ${formatDateVN(selectedDate)}?`)) {
                  bulkApproveShiftsForDate(selectedDate, selectedFloor);
                }
              }}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs"
              title="Duyệt tất cả ca chưa duyệt trong ngày"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Duyệt Tất Cả Trong Ngày</span>
            </button>
          )}

          {/* Add Shift button */}
          {isAdmin && (
            <button
              onClick={() => {
                setModalStaffId(staffList[0]?.id || '');
                setModalDate(selectedDate);
                setModalStartHour(8);
                setModalEndHour(16);
                setShowAddModal(true);
              }}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Ca Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* TARGET CONFIG POPUP / BAR */}
      {showTargetConfig && (
        <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="font-bold text-slate-900">
              Cấu hình Tiêu Chuẩn Phủ Ca (Thanh Phủ Ca 24h):
            </span>
            <span className="text-slate-600">
              Quy định số nhân viên tối thiểu và lý tưởng mỗi khung giờ.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-slate-700 font-medium">Tối thiểu:</span>
              <input
                type="number"
                min="0"
                max="5"
                value={minTarget}
                onChange={(e) => setMinTarget(parseInt(e.target.value) || 0)}
                className="w-12 bg-white border border-slate-300 rounded px-1.5 py-1 text-center font-bold"
              />
              <span className="text-slate-500">NV</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-slate-700 font-medium">Lý tưởng:</span>
              <input
                type="number"
                min="1"
                max="10"
                value={idealTarget}
                onChange={(e) => setIdealTarget(parseInt(e.target.value) || 1)}
                className="w-12 bg-white border border-slate-300 rounded px-1.5 py-1 text-center font-bold"
              />
              <span className="text-slate-500">NV</span>
            </div>

            <button
              onClick={() => {
                setCoverageTarget({ min: minTarget, ideal: idealTarget });
                setShowTargetConfig(false);
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-lg font-semibold"
            >
              Áp dụng
            </button>
            <button
              onClick={() => setShowTargetConfig(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* DATE NAVIGATION STRIP */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={handlePrevDay}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
            title="Ngày trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleToday}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 font-semibold text-slate-700"
          >
            Hôm nay
          </button>
          <button
            onClick={handleNextDay}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
            title="Ngày sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="font-bold text-slate-900 text-sm ml-2">
            {formatDateWithWeekdayVN(selectedDate)}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-400 inline-block" />
            <span>Đã duyệt (Approved)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-100 border border-amber-400 inline-block" />
            <span>Chờ duyệt (Scheduled)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-100 border border-rose-400 inline-block" />
            <span>Vắng (Absent)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" />
            <span>NV Đăng ký rảnh</span>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: DAY TIMELINE MATRIX (24 HOURS) */}
      {viewMode === 'day-matrix' && (
        <div className="space-y-3">
          {/* HOURLY COVERAGE INDICATOR BAR (THANH PHỦ CA 24H) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs overflow-x-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-600" />
                  Thanh Phủ Ca 24/7 (Hourly Coverage Indicator)
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-500">
                  Số lượng nhân sự trực thực tế từng khung giờ
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-medium">
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold border border-rose-200">
                  0 NV: Trống ca
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                  1-{coverageTarget.ideal} NV: Đủ ca
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                  &gt;{coverageTarget.ideal} NV: Dư ca / Cao điểm
                </span>
              </div>
            </div>

            {/* 24 Hourly Grid */}
            <div className="min-w-[960px] grid grid-cols-24 gap-1 text-center">
              {hourlyCoverage.map((item) => {
                let colorClass = '';
                let statusLabel = '';

                if (item.count === 0) {
                  colorClass = 'bg-rose-50 border-rose-300 text-rose-700 font-bold';
                  statusLabel = 'Trống';
                } else if (item.count <= coverageTarget.ideal) {
                  colorClass = 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold';
                  statusLabel = 'Đủ';
                } else {
                  colorClass = 'bg-amber-50 border-amber-300 text-amber-800 font-bold';
                  statusLabel = 'Dư';
                }

                return (
                  <div
                    key={item.hour}
                    className={`p-1.5 rounded-lg border text-xs flex flex-col justify-between transition-all hover:shadow-xs ${colorClass}`}
                    title={`Khung giờ ${formatHour(item.hour)}: ${item.count} nhân viên (${item.staffNames.join(', ') || 'Chưa có ai'})`}
                  >
                    <div className="text-[10px] text-slate-500 font-mono">
                      {item.hour.toString().padStart(2, '0')}h
                    </div>
                    <div className="text-sm font-extrabold my-0.5">{item.count}</div>
                    <div className="text-[9px] uppercase tracking-tighter opacity-80">
                      {statusLabel}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 24-HOUR TIMELINE MATRIX TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <div className="min-w-[1100px]">
                {/* Timeline Header Row */}
                <div className="grid grid-cols-[200px_repeat(24,_1fr)] bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <div className="p-3 sticky left-0 bg-slate-50 z-20 border-r border-slate-200">
                    Nhân Sự / Khung Giờ
                  </div>
                  {Array.from({ length: 24 }).map((_, h) => (
                    <div
                      key={h}
                      className={`py-3 text-center border-r border-slate-200/60 font-mono text-[11px] ${
                        h >= 22 || h < 6 ? 'bg-amber-50/70 text-amber-900 font-bold' : ''
                      }`}
                    >
                      {h.toString().padStart(2, '0')}h
                    </div>
                  ))}
                </div>

                {/* Staff Rows */}
                <div className="divide-y divide-slate-100">
                  {staffList.map((staff) => {
                    const staffDayShifts = dayShifts.filter((s) => s.staff_id === staff.id);
                    const freeHours = staffAvailabilityMap.get(staff.id) || [];

                    return (
                      <div
                        key={staff.id}
                        className="grid grid-cols-[200px_repeat(24,_1fr)] relative hover:bg-slate-50/40 transition-colors min-h-[58px]"
                      >
                        {/* Sticky Staff Info Card Column */}
                        <div className="p-2.5 sticky left-0 bg-white/95 backdrop-blur-xs z-10 border-r border-slate-200 flex flex-col justify-center">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs truncate">
                              {staff.full_name}
                            </span>
                            {staff.role === 'admin' && (
                              <span className="text-[9px] bg-purple-100 text-purple-700 px-1 rounded font-bold">
                                Admin
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 font-medium text-[10px]">
                              {staff.default_floor}
                            </span>
                            <span>•</span>
                            <span className="text-amber-800 font-medium">
                              {formatVND(staff.hourly_rate)}/h
                            </span>
                          </div>
                        </div>

                        {/* 24 Hourly Cells */}
                        {Array.from({ length: 24 }).map((_, h) => {
                          const isFree = freeHours.includes(h);
                          const isNight = h >= 22 || h < 6;

                          return (
                            <div
                              key={h}
                              onClick={() => {
                                if (isAdmin) {
                                  openAddModalForCell(staff.id, h);
                                }
                              }}
                              className={`border-r border-slate-100 relative group cursor-pointer transition-colors ${
                                isNight ? 'bg-slate-50/50' : ''
                              } ${isFree ? 'bg-teal-50/40' : 'hover:bg-amber-50/30'}`}
                              title={
                                isFree
                                  ? `${staff.full_name} đã đăng ký rảnh lúc ${formatHour(h)}`
                                  : isAdmin
                                  ? `Nhấp để thêm ca cho ${staff.full_name} lúc ${formatHour(h)}`
                                  : ''
                              }
                            >
                              {/* Availability Subtle Indicator */}
                              {isFree && (
                                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-teal-500" />
                              )}
                            </div>
                          );
                        })}

                        {/* Shift Block Overlay positioned absolute across the 24 columns */}
                        {staffDayShifts.map((shift) => {
                          const start = Math.max(0, shift.start_hour);
                          const end = Math.min(24, shift.end_hour);
                          const span = end - start;

                          // Left offset: 200px sticky column + (start / 24) * 100% of the remaining width
                          const leftPercent = (start / 24) * 100;
                          const widthPercent = (span / 24) * 100;

                          const statusStyles = {
                            approved:
                              'bg-gradient-to-r from-emerald-100/95 to-teal-100/95 border-emerald-400 text-emerald-900 shadow-xs',
                            scheduled:
                              'bg-gradient-to-r from-amber-100/95 to-orange-100/95 border-amber-400 text-amber-900 shadow-xs',
                            absent:
                              'bg-rose-100 border-rose-300 text-rose-900 opacity-80',
                          };

                          return (
                            <div
                              key={shift.id}
                              style={{
                                left: `calc(200px + ${leftPercent}% * ((100% - 200px) / 100))`,
                                width: `calc(${widthPercent}% * ((100% - 200px) / 100))`,
                              }}
                              className={`absolute top-1.5 bottom-1.5 rounded-xl border p-1.5 z-20 flex items-center justify-between overflow-hidden transition-all ${
                                statusStyles[shift.status]
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isAdmin) {
                                      const nextStatus: ShiftStatus =
                                        shift.status === 'scheduled'
                                          ? 'approved'
                                          : shift.status === 'approved'
                                          ? 'absent'
                                          : 'scheduled';
                                      toggleShiftStatus(shift.id, nextStatus);
                                    }
                                  }}
                                  className="p-0.5 rounded hover:bg-black/10 shrink-0"
                                  title="Nhấp để đổi trạng thái: Chờ -> Đã duyệt -> Vắng"
                                >
                                  {shift.status === 'approved' && (
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                                  )}
                                  {shift.status === 'scheduled' && (
                                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                                  )}
                                  {shift.status === 'absent' && (
                                    <X className="w-3.5 h-3.5 text-rose-700" />
                                  )}
                                </button>

                                <div className="truncate">
                                  <div className="font-bold text-[11px] leading-tight truncate">
                                    {formatHour(shift.start_hour)} - {formatHour(shift.end_hour)}
                                    <span className="ml-1 opacity-80 font-normal">
                                      ({shift.floor})
                                    </span>
                                  </div>
                                  <div className="text-[10px] opacity-75 truncate">
                                    {shift.status === 'approved'
                                      ? 'Đã duyệt'
                                      : shift.status === 'scheduled'
                                      ? 'Chờ duyệt'
                                      : 'Vắng mặt'}
                                    {shift.rate_multiplier > 1 && (
                                      <span className="ml-1 font-bold">
                                        x{shift.rate_multiplier}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {isAdmin && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('Xoá ca làm việc này?')) {
                                      deleteShift(shift.id);
                                    }
                                  }}
                                  className="text-slate-400 hover:text-rose-600 p-1 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity shrink-0"
                                  title="Xoá ca"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: WEEK SUMMARY (7 DAYS) */}
      {viewMode === 'week-summary' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-48">Nhân Viên</th>
                  {weekDays.map((d) => (
                    <th
                      key={d.dateStr}
                      className={`py-3 px-3 text-center font-medium ${
                        d.isCurrent ? 'bg-amber-100/60 text-amber-900 font-bold' : ''
                      }`}
                    >
                      <div>{d.label}</div>
                    </th>
                  ))}
                  <th className="py-3 px-4 text-right">Tổng Giờ Tuần</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffList.map((staff) => {
                  let totalWeekHours = 0;

                  return (
                    <tr key={staff.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        <div>{staff.full_name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {staff.default_floor} • {formatVND(staff.hourly_rate)}/h
                        </div>
                      </td>

                      {weekDays.map((d) => {
                        const dayStaffShifts = shifts.filter(
                          (s) => s.staff_id === staff.id && s.work_date === d.dateStr
                        );
                        let dayHours = 0;
                        for (const s of dayStaffShifts) {
                          dayHours += s.end_hour - s.start_hour;
                        }
                        totalWeekHours += dayHours;

                        return (
                          <td
                            key={d.dateStr}
                            className={`py-2 px-2 text-center align-top ${
                              d.isCurrent ? 'bg-amber-50/40' : ''
                            }`}
                          >
                            {dayStaffShifts.length === 0 ? (
                              <span className="text-slate-300">—</span>
                            ) : (
                              <div className="space-y-1">
                                {dayStaffShifts.map((s) => (
                                  <div
                                    key={s.id}
                                    className={`px-1.5 py-1 rounded text-[10px] font-semibold border ${
                                      s.status === 'approved'
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                        : 'bg-amber-50 text-amber-800 border-amber-300'
                                    }`}
                                  >
                                    {s.start_hour}h - {s.end_hour}h ({s.floor})
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        );
                      })}

                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-sm">
                        {totalWeekHours} giờ
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD SHIFT MODAL WITH OVERNIGHT SPLIT HELPER */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Thêm Ca Làm Việc 24/7
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hỗ trợ tự động tách ca khi làm xuyên đêm qua 24:00
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Presets */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                Chọn mẫu ca nhanh:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => applyPreset('morning')}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-center"
                >
                  🌅 Sáng (06-14h)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('afternoon')}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-center"
                >
                  ☀️ Chiều (14-22h)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('night')}
                  className="p-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 font-medium text-center"
                >
                  🌙 Tối (18-24h)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('overnight')}
                  className="p-1.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 font-medium text-center"
                  title="Ca qua đêm: 22h tối nay đến 6h sáng mai"
                >
                  🦉 Đêm (22-06h)
                </button>
              </div>
            </div>

            <form onSubmit={handleShiftSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nhân viên:</label>
                  <select
                    value={modalStaffId}
                    onChange={(e) => setModalStaffId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium focus:bg-white focus:outline-none"
                    required
                  >
                    <option value="">-- Chọn nhân viên --</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.full_name} ({s.default_floor})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Ngày làm việc:</label>
                  <input
                    type="date"
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium focus:bg-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Giờ bắt đầu:</label>
                  <select
                    value={modalStartHour}
                    onChange={(e) => setModalStartHour(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold focus:bg-white focus:outline-none"
                  >
                    {Array.from({ length: 24 }).map((_, h) => (
                      <option key={h} value={h}>
                        {formatHour(h)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Giờ kết thúc:
                  </label>
                  <select
                    value={modalEndHour}
                    onChange={(e) => setModalEndHour(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold focus:bg-white focus:outline-none"
                  >
                    {Array.from({ length: 25 }).map((_, h) => (
                      <option key={h} value={h}>
                        {h === 24 ? '24:00 (Nửa đêm)' : formatHour(h)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Khu vực / Tầng:</label>
                  <select
                    value={modalFloor}
                    onChange={(e) => setModalFloor(e.target.value as ShiftFloor)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium focus:bg-white focus:outline-none"
                  >
                    <option value="Tầng 1">Tầng 1</option>
                    <option value="Tầng 2">Tầng 2</option>
                  </select>
                </div>
              </div>

              {/* Overnight alert note if start >= end */}
              {modalEndHour <= modalStartHour && (
                <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 flex items-center gap-2">
                  <Moon className="w-4 h-4 text-purple-700 shrink-0" />
                  <span>
                    <strong>Ca xuyên đêm:</strong> Sẽ tự động tách thành 2 bản ghi: từ{' '}
                    {formatHour(modalStartHour)}–24:00 ngày {formatDateVN(modalDate)}, và từ 00:00–
                    {formatHour(modalEndHour)} ngày hôm sau.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Hệ số lương ca:
                  </label>
                  <select
                    value={modalMultiplier}
                    onChange={(e) => setModalMultiplier(parseFloat(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium focus:bg-white focus:outline-none"
                  >
                    <option value={1.0}>1.0x (Ca tiêu chuẩn)</option>
                    <option value={1.2}>1.2x (Ca đêm 22h-06h)</option>
                    <option value={1.5}>1.5x (Cuối tuần / Tăng cường)</option>
                    <option value={2.0}>2.0x (Lễ, Tết)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Phụ cấp thêm (VNĐ):
                  </label>
                  <input
                    type="number"
                    step="5000"
                    placeholder="Ví dụ: 20000"
                    value={modalAllowance}
                    onChange={(e) => setModalAllowance(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Ghi chú ca:</label>
                <input
                  type="text"
                  placeholder="Ghi chú nhiệm vụ hoặc vị trí..."
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg font-semibold shadow-xs"
                >
                  Lưu & Phân Ca
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
