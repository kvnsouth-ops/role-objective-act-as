'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store/app-context';
import { Shift, StaffAvailability } from '@/types';
import {
  formatVND,
  formatDateVN,
  formatDateWithWeekdayVN,
  getTodayDateStr,
  addDaysToStr,
  formatHour,
} from '@/lib/utils';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  Banknote,
  Send,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  User,
  Coffee,
  Check,
  X,
  Phone,
  BookmarkCheck,
} from 'lucide-react';

export const StaffPortal: React.FC = () => {
  const {
    currentUser,
    shifts,
    availabilities,
    saveStaffAvailability,
    selectedMonth,
    selectedDate,
    setSelectedDate,
  } = useAppStore();

  // Active sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'my-shifts' | 'availability' | 'salary'>('my-shifts');

  // Availability Registration State
  const [availDate, setAvailDate] = useState<string>('2026-11-25'); // Default tomorrow
  const [selectedHours, setSelectedHours] = useState<number[]>([8, 9, 10, 11, 12, 13, 14, 15, 16]);
  const [availNote, setAvailNote] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  React.useEffect(() => {
    setAvailDate(addDaysToStr(getTodayDateStr(), 1));
  }, []);

  // Sync selectedHours when availDate changes
  React.useEffect(() => {
    const existing = availabilities.find(
      (a) => a.staff_id === currentUser.id && a.work_date === availDate
    );
    if (existing) {
      setSelectedHours(existing.available_hours || []);
      setAvailNote(existing.note || '');
    } else {
      setSelectedHours([]);
      setAvailNote('');
    }
  }, [availDate, availabilities, currentUser.id]);

  // Toggle hourly block
  const toggleHour = (hour: number) => {
    setSelectedHours((prev) => {
      if (prev.includes(hour)) {
        return prev.filter((h) => h !== hour);
      } else {
        return [...prev, hour].sort((a, b) => a - b);
      }
    });
  };

  // Quick Presets
  const applyAvailPreset = (preset: 'morning' | 'afternoon' | 'night' | 'allday' | 'clear') => {
    if (preset === 'morning') {
      setSelectedHours([6, 7, 8, 9, 10, 11, 12, 13, 14]);
    } else if (preset === 'afternoon') {
      setSelectedHours([14, 15, 16, 17, 18, 19, 20, 21, 22]);
    } else if (preset === 'night') {
      setSelectedHours([22, 23, 0, 1, 2, 3, 4, 5, 6]);
    } else if (preset === 'allday') {
      setSelectedHours(Array.from({ length: 24 }, (_, i) => i));
    } else if (preset === 'clear') {
      setSelectedHours([]);
    }
  };

  // Handle save availability
  const handleSaveAvailability = (e: React.FormEvent) => {
    e.preventDefault();
    saveStaffAvailability(currentUser.id, availDate, selectedHours, availNote);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  // Staff Shifts for current month
  const myMonthlyShifts = useMemo(() => {
    return shifts
      .filter(
        (s) => s.staff_id === currentUser.id && s.work_date.startsWith(selectedMonth)
      )
      .sort((a, b) => b.work_date.localeCompare(a.work_date));
  }, [shifts, currentUser.id, selectedMonth]);

  // Earnings calculations
  const { approvedHours, scheduledHours, approvedPay, scheduledPay, totalPay } = useMemo(() => {
    let appH = 0;
    let schH = 0;
    let appP = 0;
    let schP = 0;

    for (const s of myMonthlyShifts) {
      const hours = s.end_hour - s.start_hour;
      const rate = s.hourly_rate_snapshot || currentUser.hourly_rate;
      const mult = Number(s.rate_multiplier) || 1.0;
      const allowance = Number(s.allowance) || 0;
      const shiftPay = Math.round(hours * rate * mult) + allowance;

      if (s.status === 'approved') {
        appH += hours;
        appP += shiftPay;
      } else if (s.status === 'scheduled') {
        schH += hours;
        schP += shiftPay;
      }
    }

    return {
      approvedHours: appH,
      scheduledHours: schH,
      approvedPay: appP,
      scheduledPay: schP,
      totalPay: appP + schP,
    };
  }, [myMonthlyShifts, currentUser.hourly_rate]);

  return (
    <div className="space-y-6">
      {/* USER HERO BANNER */}
      <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xl font-bold shadow-inner">
              {currentUser.full_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight">
                  {currentUser.full_name}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950 font-bold">
                  {currentUser.role === 'admin' ? 'Quản lý' : 'Nhân viên'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-amber-200 mt-1">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  Khu vực: <strong>{currentUser.default_floor}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Banknote className="w-3.5 h-3.5" />
                  Đơn giá: <strong>{formatVND(currentUser.hourly_rate)}/giờ</strong>
                </span>
                {currentUser.phone && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {currentUser.phone}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Earnings Box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3.5 text-right shrink-0">
            <div className="text-[11px] text-amber-200 font-medium uppercase tracking-wider">
              Thực lãnh tháng {selectedMonth}
            </div>
            <div className="text-2xl font-black text-amber-100">
              {formatVND(approvedPay)}
            </div>
            <div className="text-xs text-amber-200/90 mt-0.5">
              Đã duyệt: <strong>{approvedHours}h</strong> | Dự kiến nhận:{' '}
              <strong>{formatVND(totalPay)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION */}
      <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('my-shifts')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'my-shifts'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CalendarDays className="w-4 h-4 text-amber-600" />
          <span>Lịch Làm Việc Của Tôi ({myMonthlyShifts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('availability')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'availability'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4 text-teal-600" />
          <span>Đăng Ký Khung Giờ Rảnh 24/7</span>
        </button>

        <button
          onClick={() => setActiveSubTab('salary')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'salary'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Banknote className="w-4 h-4 text-emerald-600" />
          <span>Công & Lương Tháng Này</span>
        </button>
      </div>

      {/* TAB 1: LỊCH LÀM VIỆC CỦA TÔI */}
      {activeSubTab === 'my-shifts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4 text-amber-700" />
              Danh Sách Ca Làm Đã Phân Công (Tháng {selectedMonth})
            </h3>
            <span className="text-xs text-slate-500">
              Tổng {approvedHours + scheduledHours} giờ công
            </span>
          </div>

          {myMonthlyShifts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Bạn chưa có ca làm việc nào được xếp trong tháng {selectedMonth}.</p>
              <p className="text-xs mt-1 text-slate-400">
                Hãy chuyển sang tab "Đăng Ký Khung Giờ Rảnh" để Quản lý xếp ca cho bạn!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {myMonthlyShifts.map((s) => {
                const hours = s.end_hour - s.start_hour;
                const rate = s.hourly_rate_snapshot || currentUser.hourly_rate;
                const mult = Number(s.rate_multiplier) || 1.0;
                const allowance = Number(s.allowance) || 0;
                const shiftPay = Math.round(hours * rate * mult) + allowance;

                return (
                  <div
                    key={s.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {formatDateWithWeekdayVN(s.work_date)}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            s.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {s.status === 'approved' ? '✓ Đã Duyệt' : '⏳ Chờ Duyệt'}
                        </span>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-2.5 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Khung giờ ca:</span>
                          <span className="font-mono font-bold text-slate-800">
                            {formatHour(s.start_hour)} - {formatHour(s.end_hour)} ({hours}h)
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Khu vực phân công:</span>
                          <span className="font-semibold text-slate-700">{s.floor}</span>
                        </div>
                        {mult > 1 && (
                          <div className="flex items-center justify-between text-amber-800">
                            <span>Hệ số ca đêm / lễ:</span>
                            <span className="font-bold">x{mult}</span>
                          </div>
                        )}
                        {allowance > 0 && (
                          <div className="flex items-center justify-between text-purple-700">
                            <span>Phụ cấp:</span>
                            <span className="font-semibold">+{formatVND(allowance)}</span>
                          </div>
                        )}
                      </div>

                      {s.note && (
                        <p className="text-[11px] text-slate-500 mt-2 italic">
                          "{s.note}"
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Lương ca này:</span>
                      <span className="font-extrabold text-slate-900 text-sm">
                        {formatVND(shiftPay)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ĐĂNG KÝ KHUNG GIỜ RẢNH 24/7 */}
      {activeSubTab === 'availability' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                Đăng Ký Khung Giờ Rảnh 24/7 (Submit Availability)
              </h3>
              <p className="text-xs text-slate-500">
                Chạm hoặc click chọn các khung giờ bạn có thể nhận ca tại 601A Cách Mạng Tháng 8
              </p>
            </div>

            {saveSuccess && (
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-lg flex items-center gap-1.5 animate-bounce">
                <CheckCircle2 className="w-4 h-4" />
                Đã lưu đăng ký thành công!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveAvailability} className="space-y-4">
            {/* Date selection & quick presets */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Chọn ngày đăng ký:</span>
                <input
                  type="date"
                  value={availDate}
                  onChange={(e) => setAvailDate(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium focus:bg-white focus:outline-none"
                  required
                />
              </div>

              {/* Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-500 mr-1">Mẫu nhanh:</span>
                <button
                  type="button"
                  onClick={() => applyAvailPreset('morning')}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
                >
                  🌅 Sáng (06-14h)
                </button>
                <button
                  type="button"
                  onClick={() => applyAvailPreset('afternoon')}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
                >
                  ☀️ Chiều (14-22h)
                </button>
                <button
                  type="button"
                  onClick={() => applyAvailPreset('night')}
                  className="px-2.5 py-1 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900"
                >
                  🦉 Đêm (22-06h)
                </button>
                <button
                  type="button"
                  onClick={() => applyAvailPreset('allday')}
                  className="px-2.5 py-1 rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-900"
                >
                  ✨ Cả ngày
                </button>
                <button
                  type="button"
                  onClick={() => applyAvailPreset('clear')}
                  className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50"
                >
                  Xoá chọn
                </button>
              </div>
            </div>

            {/* 24-Hour Tap Blocks Grid */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">
                  Chạm chọn từng giờ (Đã chọn: <strong>{selectedHours.length} giờ</strong>):
                </span>
                <span className="text-[11px] text-slate-400">
                  Xanh lá = Giờ sẵn sàng nhận ca
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
                {Array.from({ length: 24 }).map((_, h) => {
                  const isSelected = selectedHours.includes(h);
                  const isNight = h >= 22 || h < 6;

                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => toggleHour(h)}
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-teal-600 text-white border-teal-700 shadow-xs font-bold scale-[1.02]'
                          : isNight
                          ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-teal-50'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-teal-50'
                      }`}
                    >
                      <span className="text-xs font-mono">{formatHour(h)}</span>
                      <span className="text-[10px] mt-0.5 opacity-80">
                        {isSelected ? '✓ Rảnh' : isNight ? '🌙 Đêm' : '—'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note input */}
            <div className="text-xs">
              <label className="block text-slate-700 font-semibold mb-1">
                Ghi chú gửi Quản lý (Ưu tiên tầng, lý do bận, v.v.):
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Ưu tiên trực Tầng 2 phòng yên tĩnh, hoặc sẵn sàng tăng ca..."
                value={availNote}
                onChange={(e) => setAvailNote(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Lưu Đăng Ký Khung Giờ Rảnh</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: CÔNG & LƯƠNG THÁNG NÀY */}
      {activeSubTab === 'salary' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 uppercase font-semibold">
                Giờ Công Đã Duyệt
              </span>
              <div className="text-2xl font-bold text-emerald-700 mt-1">
                {approvedHours} giờ
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Đã được Quản lý xác nhận
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 uppercase font-semibold">
                Giờ Chờ Duyệt (Dự Kiến)
              </span>
              <div className="text-2xl font-bold text-amber-800 mt-1">
                {scheduledHours} giờ
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Sắp hoàn thành trong tháng
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 uppercase font-semibold">
                Tổng Lương Thực Lãnh
              </span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {formatVND(approvedPay)}
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                Dự kiến tất cả: {formatVND(totalPay)}
              </p>
            </div>
          </div>

          {/* Breakdown table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800">
              Chi Tiết Bảng Chấm Công Cá Nhân (Tháng {selectedMonth})
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Ngày Làm</th>
                    <th className="py-2.5 px-3">Khung Giờ</th>
                    <th className="py-2.5 px-3 text-center">Giờ</th>
                    <th className="py-2.5 px-3">Tầng</th>
                    <th className="py-2.5 px-3 text-center">Hệ Số</th>
                    <th className="py-2.5 px-3 text-right">Phụ Cấp</th>
                    <th className="py-2.5 px-3 text-center">Tình Trạng</th>
                    <th className="py-2.5 px-3 text-right">Thành Tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myMonthlyShifts.map((s) => {
                    const hours = s.end_hour - s.start_hour;
                    const rate = s.hourly_rate_snapshot || currentUser.hourly_rate;
                    const mult = Number(s.rate_multiplier) || 1.0;
                    const allowance = Number(s.allowance) || 0;
                    const pay = Math.round(hours * rate * mult) + allowance;

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {formatDateVN(s.work_date)}
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          {formatHour(s.start_hour)} - {formatHour(s.end_hour)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold">{hours}h</td>
                        <td className="py-2.5 px-3 text-slate-600">{s.floor}</td>
                        <td className="py-2.5 px-3 text-center font-semibold text-amber-800">
                          {mult > 1 ? `x${mult}` : '1.0x'}
                        </td>
                        <td className="py-2.5 px-3 text-right text-purple-700">
                          {formatVND(allowance)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              s.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {s.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {formatVND(pay)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
