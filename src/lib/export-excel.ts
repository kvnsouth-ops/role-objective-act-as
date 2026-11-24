import * as XLSX from 'xlsx';
import { Transaction, PayrollRecord } from '@/types';
import { formatDateVN, formatVND } from '@/lib/utils';

/**
 * Export filtered transactions to Excel (.xlsx) or CSV
 */
export function exportTransactionsToExcel(transactions: Transaction[], filename = 'Bao_Cao_Thu_Chi_Tram_Hoc.xlsx') {
  const data = transactions.map((t) => {
    const month = t.transaction_date ? t.transaction_date.substring(0, 7) : '';
    return {
      'Ngày': formatDateVN(t.transaction_date),
      'Tháng': month,
      'Loại': t.type,
      'Tầng': t.floor,
      'Hạng mục': t.category,
      'Phương thức': t.payment_method,
      'Nội dung': t.description,
      'Số tiền (VNĐ)': t.amount,
      'Định dạng VNĐ': formatVND(t.amount),
      'Ghi chú': t.note || '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 14 }, // Ngày
    { wch: 10 }, // Tháng
    { wch: 10 }, // Loại
    { wch: 12 }, // Tầng
    { wch: 22 }, // Hạng mục
    { wch: 16 }, // Phương thức
    { wch: 35 }, // Nội dung
    { wch: 15 }, // Số tiền
    { wch: 18 }, // Định dạng
    { wch: 30 }, // Ghi chú
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Thu-Chi Trạm Học');
  XLSX.writeFile(workbook, filename);
}

/**
 * Export monthly payroll to Excel (.xlsx)
 */
export function exportPayrollToExcel(records: PayrollRecord[], monthStr: string, filename?: string) {
  const actualFilename = filename || `Bang_Luong_Tram_Hoc_${monthStr}.xlsx`;

  const data = records.map((r, index) => ({
    'STT': index + 1,
    'Họ và tên': r.full_name,
    'Tầng phụ trách': r.floor,
    'Đơn giá / giờ': r.hourly_rate,
    'Giờ đã duyệt (h)': r.approved_hours,
    'Giờ dự kiến (h)': r.scheduled_hours,
    'Tổng ca làm': r.shift_count,
    'Phụ cấp (VNĐ)': r.total_allowance,
    'Thực lãnh (Đã duyệt)': r.approved_salary,
    'Định dạng thực lãnh': formatVND(r.approved_salary),
    'Lương dự kiến (Tất cả)': r.total_salary,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  worksheet['!cols'] = [
    { wch: 6 },  // STT
    { wch: 22 }, // Họ và tên
    { wch: 15 }, // Tầng phụ trách
    { wch: 15 }, // Đơn giá
    { wch: 18 }, // Giờ đã duyệt
    { wch: 18 }, // Giờ dự kiến
    { wch: 14 }, // Tổng ca
    { wch: 16 }, // Phụ cấp
    { wch: 22 }, // Thực lãnh
    { wch: 22 }, // Định dạng
    { wch: 24 }, // Lương dự kiến
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Bảng Lương ${monthStr}`);
  XLSX.writeFile(workbook, actualFilename);
}
