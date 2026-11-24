'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store/app-context';
import {
  Transaction,
  TransactionType,
  Floor,
  TransactionCategory,
  PaymentMethod,
} from '@/types';
import { formatVND, formatDateVN, getTodayDateStr } from '@/lib/utils';
import { exportTransactionsToExcel } from '@/lib/export-excel';
import {
  Plus,
  FileSpreadsheet,
  Search,
  Filter,
  Trash2,
  Edit2,
  Check,
  X,
  CreditCard,
  Banknote,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Layers,
  Calendar,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const TransactionManagement: React.FC = () => {
  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addRevenueQuickEntry,
    selectedFloor,
    selectedMonth,
  } = useAppStore();

  // Active sub-tabs / forms
  const [showQuickRevenue, setShowQuickRevenue] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Quick Revenue Form State
  const [quickDate, setQuickDate] = useState<string>('2026-11-24');
  const [quickFloor, setQuickFloor] = useState<Floor>('Tầng 1');
  const [cashAmountStr, setCashAmountStr] = useState<string>('');
  const [transferAmountStr, setTransferAmountStr] = useState<string>('');
  const [quickDesc, setQuickDesc] = useState<string>('Chốt doanh thu ca học');
  const [quickNote, setQuickNote] = useState<string>('');

  // Expense Form State
  const [expenseDate, setExpenseDate] = useState<string>('2026-11-24');

  React.useEffect(() => {
    setQuickDate(getTodayDateStr());
    setExpenseDate(getTodayDateStr());
  }, []);
  const [expenseFloor, setExpenseFloor] = useState<Floor>('Tất cả');
  const [expenseCategory, setExpenseCategory] = useState<TransactionCategory>('Chi phí nguyên liệu');
  const [expenseMethod, setExpenseMethod] = useState<PaymentMethod>('Chuyển khoản');
  const [expenseAmountStr, setExpenseAmountStr] = useState<string>('');
  const [expenseDesc, setExpenseDesc] = useState<string>('');
  const [expenseNote, setExpenseNote] = useState<string>('');

  // Filter State
  const [filterType, setFilterType] = useState<string>('Tất cả');
  const [filterFloor, setFilterFloor] = useState<string>('Tất cả');
  const [filterCategory, setFilterCategory] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Inline Edit Row State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Transaction>>({});

  const categories: TransactionCategory[] = [
    'Doanh thu',
    'Chi phí nhân viên',
    'Chi phí nguyên liệu',
    'Chi phí điện nước',
    'Chi phí mặt bằng',
    'Chi phí cơ sở hạ tầng',
    'Chi phí khác',
  ];

  const floors: Floor[] = ['Tất cả', 'Tầng 1', 'Tầng 2', 'Tầng 3'];

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Type
      if (filterType !== 'Tất cả' && t.type !== filterType) return false;
      // Floor
      if (filterFloor !== 'Tất cả' && t.floor !== filterFloor) return false;
      // Category
      if (filterCategory !== 'Tất cả' && t.category !== filterCategory) return false;
      // Date range
      if (startDate && t.transaction_date < startDate) return false;
      if (endDate && t.transaction_date > endDate) return false;
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchDesc = t.description?.toLowerCase().includes(q);
        const matchNote = t.note?.toLowerCase().includes(q);
        const matchAmount = t.amount.toString().includes(q);
        if (!matchDesc && !matchNote && !matchAmount) return false;
      }
      return true;
    });
  }, [transactions, filterType, filterFloor, filterCategory, startDate, endDate, searchQuery]);

  // Totals for filtered list
  const { totalThu, totalChi } = useMemo(() => {
    let thu = 0;
    let chi = 0;
    for (const t of filteredTransactions) {
      if (t.type === 'Thu') thu += t.amount;
      else if (t.type === 'Chi') chi += t.amount;
    }
    return { totalThu: thu, totalChi: chi };
  }, [filteredTransactions]);

  // Handle Quick Revenue Submit
  const handleQuickRevenueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cash = parseFloat(cashAmountStr.replace(/\D/g, '')) || 0;
    const transfer = parseFloat(transferAmountStr.replace(/\D/g, '')) || 0;

    if (cash === 0 && transfer === 0) {
      alert('Vui lòng nhập số tiền cho ít nhất một phương thức (Tiền mặt hoặc Chuyển khoản)!');
      return;
    }

    addRevenueQuickEntry({
      date: quickDate,
      floor: quickFloor,
      cashAmount: cash,
      transferAmount: transfer,
      description: quickDesc || 'Chốt doanh thu',
      note: quickNote,
    });

    setCashAmountStr('');
    setTransferAmountStr('');
    setQuickNote('');
    setShowQuickRevenue(false);
  };

  // Handle Expense Submit
  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(expenseAmountStr.replace(/\D/g, '')) || 0;

    if (amount <= 0) {
      alert('Vui lòng nhập số tiền chi phí lớn hơn 0!');
      return;
    }

    if (!expenseDesc.trim()) {
      alert('Vui lòng nhập nội dung chi phí!');
      return;
    }

    addTransaction({
      transaction_date: expenseDate,
      type: 'Chi',
      floor: expenseFloor,
      category: expenseCategory,
      payment_method: expenseMethod,
      description: expenseDesc.trim(),
      amount,
      note: expenseNote.trim() || undefined,
    });

    setExpenseAmountStr('');
    setExpenseDesc('');
    setExpenseNote('');
    setShowExpenseModal(false);
  };

  // Start inline editing
  const startEditing = (t: Transaction) => {
    setEditingId(t.id);
    setEditFormData({
      description: t.description,
      amount: t.amount,
      floor: t.floor,
      category: t.category,
      payment_method: t.payment_method,
      note: t.note || '',
    });
  };

  const saveEditing = (id: string) => {
    if (editingId === id && editFormData.amount && editFormData.amount > 0) {
      updateTransaction(id, editFormData);
    }
    setEditingId(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditFormData({});
  };

  return (
    <div className="space-y-6">
      {/* Header bar & Action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Quản Lý Thu - Chi Trạm Học
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
              {filteredTransactions.length} bản ghi
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý dòng tiền thực tế, chốt ca tự động, xuất hóa đơn và báo cáo Excel
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Revenue Entry button */}
          <button
            onClick={() => {
              setShowQuickRevenue(!showQuickRevenue);
              setShowExpenseModal(false);
            }}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Chốt Doanh Thu Ca</span>
          </button>

          {/* New Expense button */}
          <button
            onClick={() => {
              setShowExpenseModal(!showExpenseModal);
              setShowQuickRevenue(false);
            }}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Phiếu Chi</span>
          </button>

          {/* Export to Excel */}
          <button
            onClick={() => exportTransactionsToExcel(filteredTransactions)}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
            title="Xuất file Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* QUICK REVENUE FORM (CHỐT DOANH THU CA / NGÀY TỰ ĐỘNG PHÂN BỔ TIỀN MẶT / CHUYỂN KHOẢN) */}
      {showQuickRevenue && (
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white rounded-2xl p-5 border border-emerald-200 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-100 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Chốt Doanh Thu Nhanh (Ngày / Ca)
                </h3>
                <p className="text-xs text-slate-500">
                  Tự động tách 2 giao dịch Thu: Tiền mặt tại quầy và Chuyển khoản VietQR
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowQuickRevenue(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleQuickRevenueSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Ngày chốt:</label>
                <input
                  type="date"
                  value={quickDate}
                  onChange={(e) => setQuickDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Khu vực / Tầng:</label>
                <select
                  value={quickFloor}
                  onChange={(e) => setQuickFloor(e.target.value as Floor)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Tầng 1">Tầng 1 (Cà phê tự học)</option>
                  <option value="Tầng 2">Tầng 2 (Yên tĩnh 24/7)</option>
                  <option value="Tầng 3">Tầng 3 (Phòng họp / Workshop)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1 text-emerald-800">
                  <Banknote className="w-3.5 h-3.5" />
                  Tiền mặt tại quầy (VNĐ):
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 1.250.000"
                  value={cashAmountStr}
                  onChange={(e) => setCashAmountStr(e.target.value)}
                  className="w-full bg-white border border-emerald-300 rounded-lg p-2 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1 text-teal-800">
                  <CreditCard className="w-3.5 h-3.5" />
                  Chuyển khoản VietQR (VNĐ):
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 3.400.000"
                  value={transferAmountStr}
                  onChange={(e) => setTransferAmountStr(e.target.value)}
                  className="w-full bg-white border border-teal-300 rounded-lg p-2 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nội dung / Mô tả:</label>
                <input
                  type="text"
                  placeholder="Doanh thu ca sáng / cả ngày..."
                  value={quickDesc}
                  onChange={(e) => setQuickDesc(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Ghi chú (Số lượt khách, sự cố...):</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 45 lượt khách, 3 combo đồ uống..."
                  value={quickNote}
                  onChange={(e) => setQuickNote(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowQuickRevenue(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-xs font-semibold shadow-xs"
              >
                Lưu Chốt Doanh Thu
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EXPENSE MODAL / FORM */}
      {showExpenseModal && (
        <div className="bg-gradient-to-br from-rose-50 via-orange-50 to-white rounded-2xl p-5 border border-rose-200 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-rose-100 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Tạo Phiếu Chi Mới</h3>
                <p className="text-xs text-slate-500">
                  Ghi nhận chi phí nguyên vật liệu, cơ sở hạ tầng, điện nước, mặt bằng...
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowExpenseModal(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Ngày chi:</label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Khu vực / Tầng:</label>
                <select
                  value={expenseFloor}
                  onChange={(e) => setExpenseFloor(e.target.value as Floor)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  <option value="Tất cả">Tất cả (Chi chung)</option>
                  <option value="Tầng 1">Tầng 1</option>
                  <option value="Tầng 2">Tầng 2</option>
                  <option value="Tầng 3">Tầng 3</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Hạng mục chi:</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as TransactionCategory)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  <option value="Chi phí nguyên liệu">Chi phí nguyên liệu</option>
                  <option value="Chi phí cơ sở hạ tầng">Chi phí cơ sở hạ tầng</option>
                  <option value="Chi phí điện nước">Chi phí điện nước</option>
                  <option value="Chi phí mặt bằng">Chi phí mặt bằng</option>
                  <option value="Chi phí nhân viên">Chi phí nhân viên</option>
                  <option value="Chi phí khác">Chi phí khác</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Hình thức thanh toán:</label>
                <select
                  value={expenseMethod}
                  onChange={(e) => setExpenseMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  <option value="Chuyển khoản">Chuyển khoản</option>
                  <option value="Tiền mặt">Tiền mặt</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-rose-800">
                  Số tiền chi (VNĐ):
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 450.000"
                  value={expenseAmountStr}
                  onChange={(e) => setExpenseAmountStr(e.target.value)}
                  className="w-full bg-white border border-rose-300 rounded-lg p-2 font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Nội dung chi tiết:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Mua cafe Robusta hạt, Thay bóng đèn LED..."
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-slate-700 font-semibold mb-1">Ghi chú thêm (Nhà cung cấp, mã HĐ):</label>
              <input
                type="text"
                placeholder="Ví dụ: Hoá đơn số 00291 xưởng rang..."
                value={expenseNote}
                onChange={(e) => setExpenseNote(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExpenseModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-lg text-xs font-semibold shadow-xs"
              >
                Tạo Phiếu Chi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          {/* Search text */}
          <div className="relative lg:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Tìm theo nội dung, ghi chú, số tiền..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Type filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none"
            >
              <option value="Tất cả">Loại: Tất cả</option>
              <option value="Thu">Thu (Doanh thu)</option>
              <option value="Chi">Chi (Chi phí)</option>
            </select>
          </div>

          {/* Floor filter */}
          <div>
            <select
              value={filterFloor}
              onChange={(e) => setFilterFloor(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none"
            >
              <option value="Tất cả">Tầng: Tất cả</option>
              <option value="Tầng 1">Tầng 1</option>
              <option value="Tầng 2">Tầng 2</option>
              <option value="Tầng 3">Tầng 3</option>
            </select>
          </div>

          {/* Category filter */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none"
            >
              <option value="Tất cả">Hạng mục: Tất cả</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date range filter row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Khoảng ngày:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1"
            />
            <span className="text-slate-400">đến</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1"
            />
            {(startDate || endDate || searchQuery || filterType !== 'Tất cả' || filterFloor !== 'Tất cả' || filterCategory !== 'Tất cả') && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setSearchQuery('');
                  setFilterType('Tất cả');
                  setFilterFloor('Tất cả');
                  setFilterCategory('Tất cả');
                }}
                className="text-amber-700 hover:text-amber-800 font-semibold underline text-[11px] ml-2"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Summary pill */}
          <div className="flex items-center gap-3 font-semibold">
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Tổng Thu: {formatVND(totalThu)}
            </span>
            <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Tổng Chi: {formatVND(totalChi)}
            </span>
            <span
              className={`px-2 py-0.5 rounded border ${
                totalThu - totalChi >= 0
                  ? 'text-amber-800 bg-amber-50 border-amber-200'
                  : 'text-rose-800 bg-rose-100 border-rose-300'
              }`}
            >
              Chênh lệch: {formatVND(totalThu - totalChi)}
            </span>
          </div>
        </div>
      </div>

      {/* TRANSACTIONS DATA TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5">Ngày</th>
                <th className="py-3 px-3">Loại</th>
                <th className="py-3 px-3">Tầng</th>
                <th className="py-3 px-3.5">Hạng Mục</th>
                <th className="py-3 px-3.5">Phương Thức</th>
                <th className="py-3 px-4">Nội Dung</th>
                <th className="py-3 px-4 text-right">Số Tiền (VNĐ)</th>
                <th className="py-3 px-3">Ghi Chú</th>
                <th className="py-3 px-3 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Không tìm thấy bản ghi Thu - Chi nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isEditing = editingId === tx.id;

                  if (isEditing) {
                    return (
                      <tr key={tx.id} className="bg-amber-50/60">
                        <td className="py-2 px-3 font-semibold text-slate-700">
                          {formatDateVN(tx.transaction_date)}
                        </td>
                        <td className="py-2 px-2">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              tx.type === 'Thu'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-2 px-2">
                          <select
                            value={editFormData.floor || tx.floor}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, floor: e.target.value as Floor })
                            }
                            className="bg-white border border-slate-300 rounded px-1.5 py-1 text-xs"
                          >
                            <option value="Tầng 1">Tầng 1</option>
                            <option value="Tầng 2">Tầng 2</option>
                            <option value="Tầng 3">Tầng 3</option>
                            <option value="Tất cả">Tất cả</option>
                          </select>
                        </td>
                        <td className="py-2 px-2">
                          <select
                            value={editFormData.category || tx.category}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                category: e.target.value as TransactionCategory,
                              })
                            }
                            className="bg-white border border-slate-300 rounded px-1.5 py-1 text-xs"
                          >
                            {categories.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-2">
                          <select
                            value={editFormData.payment_method || tx.payment_method}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                payment_method: e.target.value as PaymentMethod,
                              })
                            }
                            className="bg-white border border-slate-300 rounded px-1.5 py-1 text-xs"
                          >
                            <option value="Tiền mặt">Tiền mặt</option>
                            <option value="Chuyển khoản">Chuyển khoản</option>
                          </select>
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={editFormData.description ?? tx.description}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, description: e.target.value })
                            }
                            className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                          />
                        </td>
                        <td className="py-2 px-2 text-right">
                          <input
                            type="number"
                            value={editFormData.amount ?? tx.amount}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                amount: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-28 text-right bg-white border border-slate-300 rounded px-2 py-1 font-bold text-xs"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={editFormData.note ?? tx.note ?? ''}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, note: e.target.value })
                            }
                            placeholder="Ghi chú"
                            className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                          />
                        </td>
                        <td className="py-2 px-2 text-center whitespace-nowrap">
                          <button
                            onClick={() => saveEditing(tx.id)}
                            className="p-1 text-emerald-600 hover:text-emerald-800 mr-1"
                            title="Lưu"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-1 text-slate-400 hover:text-slate-600"
                            title="Hủy"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3.5 font-medium text-slate-700 whitespace-nowrap">
                        {formatDateVN(tx.transaction_date)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.type === 'Thu'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700 whitespace-nowrap">
                        {tx.floor}
                      </td>
                      <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">
                        {tx.category}
                      </td>
                      <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          {tx.payment_method === 'Tiền mặt' ? (
                            <Banknote className="w-3.5 h-3.5 text-amber-600" />
                          ) : (
                            <CreditCard className="w-3.5 h-3.5 text-teal-600" />
                          )}
                          {tx.payment_method}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-900 font-medium max-w-xs truncate">
                        {tx.description}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-bold whitespace-nowrap ${
                          tx.type === 'Thu' ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {tx.type === 'Thu' ? '+' : '-'}
                        {formatVND(tx.amount)}
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px] max-w-xs truncate">
                        {tx.note || '—'}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => startEditing(tx)}
                            className="p-1 text-slate-400 hover:text-amber-600 transition-colors"
                            title="Sửa bản ghi"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Xoá bản ghi "${tx.description}"?`)) {
                                deleteTransaction(tx.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Xóa bản ghi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
