'use client';

import React, { useMemo } from 'react';
import { useAppStore } from '@/lib/store/app-context';
import { formatVND, formatDateVN } from '@/lib/utils';
import { Floor } from '@/types';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Banknote,
  Building,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  Line,
  ComposedChart,
} from 'recharts';

export const OverviewDashboard: React.FC = () => {
  const {
    transactions,
    shifts,
    payrollRecords,
    selectedFloor,
    selectedMonth,
    selectedDate,
  } = useAppStore();

  // Filter transactions by selectedMonth and selectedFloor
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchMonth = t.transaction_date.startsWith(selectedMonth);
      const matchFloor =
        selectedFloor === 'Tất cả' ||
        t.floor === selectedFloor ||
        t.floor === 'Tất cả';
      return matchMonth && matchFloor;
    });
  }, [transactions, selectedMonth, selectedFloor]);

  // Compute KPI metrics
  const { totalRevenue, totalExpense, netProfit, cashRevenue, transferRevenue } = useMemo(() => {
    let rev = 0;
    let exp = 0;
    let cash = 0;
    let transfer = 0;

    for (const t of filteredTransactions) {
      if (t.type === 'Thu') {
        rev += t.amount;
        if (t.payment_method === 'Tiền mặt') cash += t.amount;
        if (t.payment_method === 'Chuyển khoản') transfer += t.amount;
      } else if (t.type === 'Chi') {
        exp += t.amount;
      }
    }

    return {
      totalRevenue: rev,
      totalExpense: exp,
      netProfit: rev - exp,
      cashRevenue: cash,
      transferRevenue: transfer,
    };
  }, [filteredTransactions]);

  // Payroll KPI for selectedMonth
  const { approvedPayroll, scheduledPayroll, totalPayroll } = useMemo(() => {
    let approved = 0;
    let scheduled = 0;

    for (const r of payrollRecords) {
      if (selectedFloor === 'Tất cả' || r.floor === selectedFloor) {
        approved += r.approved_salary;
        scheduled += r.scheduled_salary;
      }
    }

    return {
      approvedPayroll: approved,
      scheduledPayroll: scheduled,
      totalPayroll: approved + scheduled,
    };
  }, [payrollRecords, selectedFloor]);

  // Chart 1: Daily Revenue & Expense in selectedMonth
  const dailyChartData = useMemo(() => {
    const map: Record<string, { date: string; displayDate: string; thu: number; chi: number }> = {};

    // Sort transactions by date
    const sorted = [...filteredTransactions].sort((a, b) =>
      a.transaction_date.localeCompare(b.transaction_date)
    );

    for (const t of sorted) {
      const d = t.transaction_date;
      if (!map[d]) {
        const parts = d.split('-');
        map[d] = {
          date: d,
          displayDate: `${parts[2]}/${parts[1]}`,
          thu: 0,
          chi: 0,
        };
      }
      if (t.type === 'Thu') {
        map[d].thu += t.amount;
      } else {
        map[d].chi += t.amount;
      }
    }

    return Object.values(map);
  }, [filteredTransactions]);

  // Chart 2: Floor Breakdown (Lãi/Lỗ theo từng tầng)
  const floorBreakdown = useMemo(() => {
    const floors: Floor[] = ['Tầng 1', 'Tầng 2', 'Tầng 3', 'Tất cả'];
    return floors.map((fl) => {
      let thu = 0;
      let chi = 0;
      for (const t of transactions) {
        if (t.transaction_date.startsWith(selectedMonth) && t.floor === fl) {
          if (t.type === 'Thu') thu += t.amount;
          else chi += t.amount;
        }
      }
      return {
        floor: fl,
        thu,
        chi,
        profit: thu - chi,
      };
    });
  }, [transactions, selectedMonth]);

  // Chart 3: Pie Chart Tiền mặt vs Chuyển khoản
  const paymentRatioData = useMemo(() => {
    if (cashRevenue === 0 && transferRevenue === 0) {
      return [
        { name: 'Chưa có phát sinh', value: 1, color: '#e2e8f0' },
      ];
    }
    return [
      { name: 'Chuyển khoản (VietQR)', value: transferRevenue, color: '#0d9488' },
      { name: 'Tiền mặt', value: cashRevenue, color: '#f59e0b' },
    ];
  }, [cashRevenue, transferRevenue]);

  const PIE_COLORS = ['#0d9488', '#f59e0b'];

  // Shifts summary for today
  const todayShifts = useMemo(() => {
    return shifts.filter((s) => s.work_date === selectedDate);
  }, [shifts, selectedDate]);

  return (
    <div className="space-y-6">
      {/* Page Title & Scope */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Tổng Quan Hoạt Động & Tài Chính
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
              Tháng {selectedMonth}
            </span>
            {selectedFloor !== 'Tất cả' && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 border border-blue-200">
                {selectedFloor}
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Trạm Học 24/7 - 601A Cách Mạng Tháng 8, Q.10 • Số liệu thực tế tức thì
          </p>
        </div>

        <div className="text-xs text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Hôm nay có <strong>{todayShifts.length}</strong> ca trực</span>
        </div>
      </div>

      {/* 4 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng Doanh Thu */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-0 opacity-70" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Tổng Doanh Thu
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 relative z-10">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {formatVND(totalRevenue)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-700 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Tiền mặt: {formatVND(cashRevenue)}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Tổng Chi Phí */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -z-0 opacity-70" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Tổng Chi Phí
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 relative z-10">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {formatVND(totalExpense)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-rose-600 font-medium">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Gồm mặt bằng, điện nước, nguyên liệu</span>
            </div>
          </div>
        </div>

        {/* Card 3: Lợi Nhuận Ròng */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div
            className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -z-0 opacity-70 ${
              netProfit >= 0 ? 'bg-amber-50' : 'bg-rose-50'
            }`}
          />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Lợi Nhuận Ròng (Thu - Chi)
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                netProfit >= 0
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 relative z-10">
            <div
              className={`text-2xl font-bold tracking-tight ${
                netProfit >= 0 ? 'text-amber-800' : 'text-rose-600'
              }`}
            >
              {formatVND(netProfit)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-600 font-medium">
              {netProfit >= 0 ? (
                <span className="text-emerald-700 font-semibold">Tỷ suất lãi dương</span>
              ) : (
                <span className="text-rose-600 font-semibold">Cần tối ưu chi phí</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 4: Quỹ Lương Dự Kiến / Đã Duyệt */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-0 opacity-70" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Quỹ Lương Nhân Viên
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 relative z-10">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {formatVND(approvedPayroll)}
            </div>
            <div className="flex items-center justify-between gap-1 mt-1 text-xs">
              <span className="text-emerald-700 font-medium">Đã duyệt</span>
              <span className="text-slate-400">|</span>
              <span className="text-amber-700 font-medium">
                Dự kiến: +{formatVND(scheduledPayroll)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS ROW 1: Daily Revenue/Expense & Cash/Transfer Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart: Doanh thu & Chi phí theo ngày */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Doanh Thu & Chi Phí Theo Ngày Trong Tháng
              </h3>
              <p className="text-xs text-slate-500">
                So sánh dòng tiền ra vào mỗi ngày tại Trạm Học
              </p>
            </div>
            <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium">
              {dailyChartData.length} ngày phát sinh
            </span>
          </div>

          <div className="h-72 w-full">
            {dailyChartData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                <p>Chưa có dữ liệu giao dịch trong tháng {selectedMonth}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dailyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="displayDate"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${(val / 1000000).toFixed(1)}Tr`}
                  />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      formatVND(Number(value) || 0),
                      name === 'thu' ? 'Doanh Thu' : 'Chi Phí',
                    ]}
                    labelFormatter={(label) => `Ngày ${label}`}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }}
                    formatter={(val) => (val === 'thu' ? 'Doanh Thu' : 'Chi Phí')}
                  />
                  <Bar dataKey="thu" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="chi" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie Chart: Cash vs Transfer */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Tỷ Trọng Phương Thức Thu
              </h3>
              <CreditCard className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Chuyển khoản VietQR vs Tiền mặt tại quầy
            </p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentRatioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {paymentRatioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatVND(Number(val) || 0), 'Số tiền']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '10px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-teal-600 inline-block" />
                <span className="text-slate-600 font-medium">Chuyển khoản (VietQR):</span>
              </div>
              <span className="font-bold text-slate-900">{formatVND(transferRevenue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span className="text-slate-600 font-medium">Tiền mặt:</span>
              </div>
              <span className="font-bold text-slate-900">{formatVND(cashRevenue)}</span>
            </div>
            <div className="pt-2 text-[11px] text-slate-400 text-center">
              Tỷ lệ thanh toán không tiền mặt:{' '}
              <strong className="text-teal-700">
                {totalRevenue > 0
                  ? `${Math.round((transferRevenue / totalRevenue) * 100)}%`
                  : '0%'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS ROW 2: Floor Breakdown Table & Profit Chart */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Building className="w-4 h-4 text-amber-700" />
              Hiệu Quả Kinh Doanh Theo Tầng
            </h3>
            <p className="text-xs text-slate-500">
              Phân tách Doanh thu, Chi phí vận hành và Lãi / Lỗ theo từng khu vực tại 601A CMT8
            </p>
          </div>
          <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
            Tầng 1 (Cà phê tự học) | Tầng 2 (Phòng yên tĩnh 24/7) | Tầng 3 (Phòng họp/Workshop)
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Table */}
          <div className="lg:col-span-2 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Khu Vực</th>
                  <th className="py-2.5 px-3 text-right">Doanh Thu</th>
                  <th className="py-2.5 px-3 text-right">Chi Phí</th>
                  <th className="py-2.5 px-3 text-right">Lãi / (Lỗ)</th>
                  <th className="py-2.5 px-3 text-center">Tình Trạng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {floorBreakdown.map((row) => (
                  <tr key={row.floor} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-800">
                      {row.floor}
                      {row.floor === 'Tất cả' && (
                        <span className="text-[10px] text-slate-400 font-normal ml-1">
                          (Chi phí chung: MB, EVN)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-700 font-semibold">
                      {formatVND(row.thu)}
                    </td>
                    <td className="py-3 px-3 text-right text-rose-600">
                      {formatVND(row.chi)}
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-bold ${
                        row.profit >= 0 ? 'text-amber-800' : 'text-rose-600'
                      }`}
                    >
                      {formatVND(row.profit)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          row.profit >= 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {row.profit >= 0 ? 'Có Lãi' : 'Chi Phí Lớn'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mini Bar Chart */}
          <div className="h-56 w-full flex flex-col justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={floorBreakdown} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="floor" tick={{ fontSize: 10 }} />
                <YAxis
                  tick={{ fontSize: 9 }}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(0)}Tr`}
                />
                <Tooltip formatter={(val: any) => formatVND(Number(val) || 0)} />
                <Bar dataKey="thu" name="Doanh Thu" fill="#0d9488" radius={[3, 3, 0, 0]} />
                <Bar dataKey="chi" name="Chi Phí" fill="#f43f5e" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
