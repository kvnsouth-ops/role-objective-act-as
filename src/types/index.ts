// ==============================================================================
// TRẠM HỌC OPS - TYPE DEFINITIONS
// ==============================================================================

export type Role = 'admin' | 'staff';

export type Floor = 'Tầng 1' | 'Tầng 2' | 'Tầng 3' | 'Tất cả';

export type ShiftFloor = 'Tầng 1' | 'Tầng 2';

export type TransactionType = 'Thu' | 'Chi';

export type TransactionCategory =
  | 'Doanh thu'
  | 'Chi phí nhân viên'
  | 'Chi phí nguyên liệu'
  | 'Chi phí điện nước'
  | 'Chi phí mặt bằng'
  | 'Chi phí cơ sở hạ tầng'
  | 'Chi phí khác';

export type PaymentMethod = 'Tiền mặt' | 'Chuyển khoản';

export type ShiftStatus = 'scheduled' | 'approved' | 'absent';

export interface Profile {
  id: string;
  full_name: string;
  phone?: string | null;
  role: Role;
  default_floor: Floor;
  hourly_rate: number;
  is_active: boolean;
  created_at?: string;
}

export interface Transaction {
  id: string;
  transaction_date: string; // YYYY-MM-DD
  type: TransactionType;
  floor: Floor;
  category: TransactionCategory;
  payment_method: PaymentMethod;
  description: string;
  amount: number; // Positive integer in VNĐ
  note?: string | null;
  created_by?: string | null;
  created_at?: string;
  creator_name?: string;
}

export interface Shift {
  id: string;
  staff_id: string;
  work_date: string; // YYYY-MM-DD
  start_hour: number; // 0..23
  end_hour: number; // 1..24 (end_hour > start_hour)
  floor: ShiftFloor;
  hourly_rate_snapshot: number;
  rate_multiplier: number; // default 1.00
  allowance: number; // Phụ cấp VNĐ
  status: ShiftStatus;
  note?: string | null;
  created_at?: string;
  staff?: Profile;
}

export interface StaffAvailability {
  id: string;
  staff_id: string;
  work_date: string; // YYYY-MM-DD
  available_hours: number[]; // e.g. [0, 1, 2, ..., 23]
  note?: string | null;
  created_at?: string;
}

export interface PayrollRecord {
  staff_id: string;
  full_name: string;
  floor: Floor;
  hourly_rate: number;
  approved_hours: number;
  scheduled_hours: number;
  total_allowance: number;
  approved_salary: number; // Thực lãnh (approved)
  scheduled_salary: number; // Dự kiến (scheduled)
  total_salary: number;
  shift_count: number;
}

export interface HourlyCoverageTarget {
  min: number; // default 1
  ideal: number; // default 2
}
