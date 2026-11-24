'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store/app-context';
import { PayrollRecord, Shift } from '@/types';
import { formatVND, formatDateVN, formatHour } from '@/lib/utils';
import { exportPayrollToExcel } from '@/lib/export-excel';
import {
  Banknote,
  FileSpreadsheet,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  User,
  Users,
  Building,
  Calendar,
  Sparkles,
  Info,
  Check,
  ChevronRight,
  X,
} from 'lucide-react';

export const PayrollModule: React.FC = () => {
  const {
    payrollRecords,
    syncPayrollToExpenses,
    selectedMonth,
    setSelectedMonth,
    shifts,
  } = useAppStore();

  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);
  const [selectedStaffForBreakdown, setSelectedStaffForBreakdown] = useState<PayrollRecord | null>(
    null
  );

  // Overall totals for selectedMonth
  const {
    totalApprovedSalary,
    totalScheduledSalary,
    totalApprovedHours,
    totalScheduledHours,
    totalAllowance,
  } = useMemo(() => {
    let approvedSal = 0;
    let scheduledSal = 0;
    let approvedH = 0;
    let scheduledH = 0;
    let allowance = 0;

    for (const r of payrollRecords) {
      approvedSal += r.approved_salary;
      scheduledSal += r.scheduled_salary;
      approvedH += r.approved_hours;
      scheduledH += r.scheduled_hours;
      allowance += r.total_allowance;
    }

    return {
      totalApprovedSalary: approvedSal,
      totalScheduledSalary: scheduledSal,
      totalApprovedHours: approvedH,
      totalScheduledHours: scheduledH,
      totalAllowance: allowance,
    };
  }, [payrollRecords]);

  // Handle 1-Click Sync to Thu-Chi expenses
  const handleSyncToExpenses = () => {
    if (totalApprovedSalary === 0) {
      alert('Chưa có ca làm việc nào được duyệt trong tháng này để kết chuyển lương!');
      return;
    }

    if (
      confirm(
        `Xác nhận chốt và tạo ${payrollRecords.filter((r) => r.approved_salary > 0).length} phiếu chi "Chi phí nhân viên" sang module Thu-Chi với tổng số tiền ${formatVND(
          totalApprovedSalary
        )}?`
      )
    ) {
      const result = syncPayrollToExpenses(payrollRecords, selectedMonth);
      if (result.syncedCount > 0) {
        setSyncStatusMessage(
          `Đã đồng bộ thành công ${result.syncedCount} phiếu chi lương (tổng: ${formatVND(
            result.totalAmount
          )}) vào Thu - Chi!`
        );
      } else {
        setSyncStatusMessage(
          `Các khoản lương tháng ${selectedMonth} đã được đồng bộ trước đó. Không có khoản mới cần tạo.`
        );
      }
      setTimeout(() => setSyncStatusMessage(null), 6000);
    }
  };

  // Staff shift breakdown details for modal
  const staffShifts = useMemo(() => {
    if (!selectedStaffForBreakdown) return [];
    return shifts.filter(
      (s) =>
        s.staff_id === selectedStaffForBreakdown.staff_id &&
        s.work_date.startsWith(selectedMonth)
    );
  }, [selectedStaffForBreakdown, shifts, selectedMonth]);

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Bảng Lương Nhân Sự Tự Động
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
              Tháng {selectedMonth}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tính lương tự động theo công thức: (Giờ x Đơn giá x Hệ số) + Phụ cấp. Chỉ tính ca Đã duyệt vào Thực lãnh.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 1-Click Sync to Expenses Button */}
          <button
            onClick={handleSyncToExpenses}
            className="flex items-center gap-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all"
            title="Đẩy tự động các khoản lương đã duyệt sang Quản lý Thu - Chi"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Chốt & Đẩy Sang Thu-Chi</span>
          </button>

          {/* Export to Excel */}
          <button
            onClick={() => exportPayrollToExcel(payrollRecords, selectedMonth)}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất Bảng Lương (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncStatusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center justify-between shadow-2xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncStatusMessage}</span>
          </div>
          <button
            onClick={() => setSyncStatusMessage(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Thực lãnh (Đã duyệt) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-bl-full -z-0 opacity-60" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Tổng Lương Thực Lãnh
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 relative z-10">
            <div className="text-2xl font-bold text-emerald-700 tracking-tight">
              {formatVND(totalApprovedSalary)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Dựa trên {totalApprovedHours} giờ làm việc đã duyệt
            </p>
          </div>
        </div>

        {/* Card 2: Lương Dự Kiến (Scheduled) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-50 rounded-bl-full -z-0 opacity-60" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Lương Dự Kiến (Chờ Duyệt)
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 relative z-10">
            <div className="text-2xl font-bold text-amber-800 tracking-tight">
              {formatVND(totalScheduledSalary)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Gồm {totalScheduledHours} giờ trong ca đang xếp
            </p>
          </div>
        </div>

        {/* Card 3: Tổng Giờ Công */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-full -z-0 opacity-60" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Tổng Giờ Công Toàn Bộ
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 relative z-10">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {totalApprovedHours + totalScheduledHours} giờ
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Đã duyệt: {totalApprovedHours}h • Chờ: {totalScheduledHours}h
            </p>
          </div>
        </div>

        {/* Card 4: Tổng Phụ Cấp */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-bl-full -z-0 opacity-60" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Phụ Cấp Đêm & Tăng Ca
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 relative z-10">
            <div className="text-2xl font-bold text-purple-700 tracking-tight">
              {formatVND(totalAllowance)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Hỗ trợ ca đêm 24/7 & chuyên cần
            </p>
          </div>
        </div>
      </div>

      {/* PAYROLL SUMMARY TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Chi Tiết Lương Từng Nhân Viên ({payrollRecords.length} nhân sự)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Nhấp vào tên nhân viên để xem danh sách chi tiết các ca làm
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/90 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5 text-center w-12">STT</th>
                <th className="py-3 px-4">Họ và Tên</th>
                <th className="py-3 px-3">Tầng</th>
                <th className="py-3 px-3 text-right">Đơn Giá</th>
                <th className="py-3 px-3 text-center">Giờ Đã Duyệt</th>
                <th className="py-3 px-3 text-center">Giờ Dự Kiến</th>
                <th className="py-3 px-3 text-center">Tổng Ca</th>
                <th className="py-3 px-3 text-right">Phụ Cấp</th>
                <th className="py-3 px-4 text-right bg-emerald-50/50 text-emerald-900 font-bold">
                  Thực Lãnh (Đã Duyệt)
                </th>
                <th className="py-3 px-4 text-right">Tổng Dự Kiến</th>
                <th className="py-3 px-3 text-center">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {payrollRecords.map((r, index) => (
                <tr
                  key={r.staff_id}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  onClick={() => setSelectedStaffForBreakdown(r)}
                >
                  <td className="py-3 px-3.5 text-center text-slate-400 font-normal">
                    {index + 1}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{r.full_name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold">
                      {r.floor}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-700 whitespace-nowrap">
                    {formatVND(r.hourly_rate)}/h
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-700">
                    {r.approved_hours}h
                  </td>
                  <td className="py-3 px-3 text-center text-amber-700">
                    {r.scheduled_hours}h
                  </td>
                  <td className="py-3 px-3 text-center text-slate-600">
                    {r.shift_count} ca
                  </td>
                  <td className="py-3 px-3 text-right text-purple-700 font-semibold whitespace-nowrap">
                    {formatVND(r.total_allowance)}
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-emerald-700 text-sm bg-emerald-50/30 whitespace-nowrap">
                    {formatVND(r.approved_salary)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600 font-semibold whitespace-nowrap">
                    {formatVND(r.total_salary)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <ChevronRight className="w-4 h-4 text-slate-400 inline-block" />
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Table Footer Totals */}
            <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
              <tr>
                <td colSpan={4} className="py-3 px-4 text-slate-900">
                  TỔNG CỘNG THÁNG {selectedMonth}:
                </td>
                <td className="py-3 px-3 text-center text-emerald-800">
                  {totalApprovedHours}h
                </td>
                <td className="py-3 px-3 text-center text-amber-800">
                  {totalScheduledHours}h
                </td>
                <td className="py-3 px-3 text-center text-slate-700">
                  {shifts.filter((s) => s.work_date.startsWith(selectedMonth)).length} ca
                </td>
                <td className="py-3 px-3 text-right text-purple-800">
                  {formatVND(totalAllowance)}
                </td>
                <td className="py-3 px-4 text-right text-emerald-800 text-sm bg-emerald-100/50">
                  {formatVND(totalApprovedSalary)}
                </td>
                <td className="py-3 px-4 text-right text-slate-900">
                  {formatVND(totalApprovedSalary + totalScheduledSalary)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* SHIFT BREAKDOWN MODAL FOR SELECTED STAFF */}
      {selectedStaffForBreakdown && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl max-w-2xl w-full space-y-4 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Chi Tiết Ca Làm: {selectedStaffForBreakdown.full_name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tháng {selectedMonth} • Đơn giá cơ bản: {formatVND(selectedStaffForBreakdown.hourly_rate)}/h
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStaffForBreakdown(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Shifts breakdown table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Ngày</th>
                    <th className="py-2.5 px-3">Khung Giờ</th>
                    <th className="py-2.5 px-3 text-center">Số Giờ</th>
                    <th className="py-2.5 px-3">Tầng</th>
                    <th className="py-2.5 px-2 text-center">Hệ Số</th>
                    <th className="py-2.5 px-3 text-right">Phụ Cấp</th>
                    <th className="py-2.5 px-3 text-center">Trạng Thái</th>
                    <th className="py-2.5 px-3 text-right">Thành Tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffShifts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Không có ca làm việc nào trong tháng {selectedMonth}.
                      </td>
                    </tr>
                  ) : (
                    staffShifts.map((s) => {
                      const hours = s.end_hour - s.start_hour;
                      const rate = s.hourly_rate_snapshot || selectedStaffForBreakdown.hourly_rate;
                      const mult = Number(s.rate_multiplier) || 1.0;
                      const allowance = Number(s.allowance) || 0;
                      const shiftPay = Math.round(hours * rate * mult) + allowance;

                      return (
                        <tr key={s.id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-3 font-semibold text-slate-800">
                            {formatDateVN(s.work_date)}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-medium">
                            {formatHour(s.start_hour)} - {formatHour(s.end_hour)}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                            {hours}h
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{s.floor}</td>
                          <td className="py-2.5 px-2 text-center font-semibold text-amber-800">
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
                            {formatVND(shiftPay)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <div className="text-slate-500">
                Thực lãnh (chỉ ca đã duyệt):{' '}
                <strong className="text-emerald-700 text-sm">
                  {formatVND(selectedStaffForBreakdown.approved_salary)}
                </strong>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStaffForBreakdown(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
