'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Profile,
  Transaction,
  Shift,
  StaffAvailability,
  Floor,
  ShiftFloor,
  Role,
  ShiftStatus,
  PayrollRecord,
  HourlyCoverageTarget,
} from '@/types';
import {
  INITIAL_PROFILES,
  getInitialTransactions,
  getInitialShifts,
  getInitialAvailability,
} from './initial-data';
import { getTodayDateStr, getCurrentMonthStr, addDaysToStr } from '@/lib/utils';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';

interface AppContextType {
  // User & Role
  currentUser: Profile;
  setCurrentUser: (user: Profile) => void;
  switchUserById: (userId: string) => void;
  profiles: Profile[];
  updateProfile: (profile: Profile) => void;

  // Global Filters
  selectedFloor: Floor;
  setSelectedFloor: (floor: Floor) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;

  // Transactions
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'created_at'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addRevenueQuickEntry: (params: {
    date: string;
    floor: Floor;
    cashAmount: number;
    transferAmount: number;
    description?: string;
    note?: string;
  }) => void;

  // Shifts
  shifts: Shift[];
  addShift: (shiftData: {
    staff_id: string;
    work_date: string;
    start_hour: number;
    end_hour: number;
    floor: ShiftFloor;
    hourly_rate_snapshot?: number;
    rate_multiplier?: number;
    allowance?: number;
    status?: ShiftStatus;
    note?: string;
  }) => void;
  updateShift: (id: string, partial: Partial<Shift>) => void;
  deleteShift: (id: string) => void;
  toggleShiftStatus: (id: string, newStatus: ShiftStatus) => void;
  bulkApproveShiftsForDate: (date: string, floorFilter?: string) => void;

  // Availability
  availabilities: StaffAvailability[];
  saveStaffAvailability: (
    staffId: string,
    date: string,
    hours: number[],
    note?: string
  ) => void;

  // Coverage settings
  coverageTarget: HourlyCoverageTarget;
  setCoverageTarget: (target: HourlyCoverageTarget) => void;

  // Payroll
  payrollRecords: PayrollRecord[];
  syncPayrollToExpenses: (records: PayrollRecord[], monthStr: string) => { syncedCount: number; totalAmount: number };

  // System
  isDemoMode: boolean;
  isSupabaseLive: boolean;
  resetToSampleData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILES: 'tramhoc_profiles_v1',
  TRANSACTIONS: 'tramhoc_transactions_v1',
  SHIFTS: 'tramhoc_shifts_v1',
  AVAILABILITY: 'tramhoc_availability_v1',
  CURRENT_USER_ID: 'tramhoc_user_id_v1',
  COVERAGE_TARGET: 'tramhoc_coverage_target_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>(INITIAL_PROFILES);
  const [currentUser, setCurrentUser] = useState<Profile>(INITIAL_PROFILES[0]); // Default Admin
  const [selectedFloor, setSelectedFloor] = useState<Floor>('Tất cả');
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-24');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-11');
  const [coverageTarget, setCoverageTarget] = useState<HourlyCoverageTarget>({ min: 1, ideal: 2 });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [availabilities, setAvailabilities] = useState<StaffAvailability[]>([]);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const storedProfiles = localStorage.getItem(STORAGE_KEYS.PROFILES);
      const storedTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const storedShifts = localStorage.getItem(STORAGE_KEYS.SHIFTS);
      const storedAvail = localStorage.getItem(STORAGE_KEYS.AVAILABILITY);
      const storedUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      const storedTarget = localStorage.getItem(STORAGE_KEYS.COVERAGE_TARGET);

      const resolvedProfiles: Profile[] = storedProfiles ? JSON.parse(storedProfiles) : INITIAL_PROFILES;
      setProfiles(resolvedProfiles);

      if (storedUserId) {
        const found = resolvedProfiles.find((p) => p.id === storedUserId);
        if (found) setCurrentUser(found);
      } else {
        setCurrentUser(resolvedProfiles[0]);
      }

      const today = getTodayDateStr();
      setSelectedDate(today);
      setSelectedMonth(today.substring(0, 7));

      setTransactions(storedTx ? JSON.parse(storedTx) : getInitialTransactions(today));
      setShifts(storedShifts ? JSON.parse(storedShifts) : getInitialShifts(today));
      setAvailabilities(storedAvail ? JSON.parse(storedAvail) : getInitialAvailability(today));

      if (storedTarget) {
        setCoverageTarget(JSON.parse(storedTarget));
      }
    } catch (e) {
      console.warn('Error reading from localStorage, using initial mock data', e);
      setProfiles(INITIAL_PROFILES);
      setCurrentUser(INITIAL_PROFILES[0]);
      setTransactions(getInitialTransactions());
      setShifts(getInitialShifts());
      setAvailabilities(getInitialAvailability());
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
      localStorage.setItem(STORAGE_KEYS.AVAILABILITY, JSON.stringify(availabilities));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUser.id);
      localStorage.setItem(STORAGE_KEYS.COVERAGE_TARGET, JSON.stringify(coverageTarget));
    } catch (e) {
      console.warn('Error saving to localStorage', e);
    }
  }, [profiles, transactions, shifts, availabilities, currentUser, coverageTarget, isLoaded]);

  const switchUserById = useCallback(
    (userId: string) => {
      const found = profiles.find((p) => p.id === userId);
      if (found) {
        setCurrentUser(found);
      }
    },
    [profiles]
  );

  const updateProfile = useCallback((updated: Profile) => {
    setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setCurrentUser((prev) => (prev.id === updated.id ? updated : prev));
  }, []);

  // Reset to sample data
  const resetToSampleData = useCallback(() => {
    setProfiles(INITIAL_PROFILES);
    setCurrentUser(INITIAL_PROFILES[0]);
    setTransactions(getInitialTransactions());
    setShifts(getInitialShifts());
    setAvailabilities(getInitialAvailability());
    setCoverageTarget({ min: 1, ideal: 2 });
    localStorage.clear();
  }, []);

  // Transactions operations
  const addTransaction = useCallback(
    (tx: Omit<Transaction, 'id' | 'created_at'>) => {
      const newTx: Transaction = {
        ...tx,
        id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        created_at: new Date().toISOString(),
        created_by: currentUser.id,
        creator_name: currentUser.full_name,
      };
      setTransactions((prev) => [newTx, ...prev]);

      // If Supabase is connected, insert asynchronously
      if (isSupabaseConfigured && supabase) {
        supabase.from('transactions').insert([newTx]).then();
      }
    },
    [currentUser]
  );

  const updateTransaction = useCallback((id: string, partial: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...partial } : t))
    );
    if (isSupabaseConfigured && supabase) {
      supabase.from('transactions').update(partial).eq('id', id).then();
    }
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (isSupabaseConfigured && supabase) {
      supabase.from('transactions').delete().eq('id', id).then();
    }
  }, []);

  // Quick Revenue Entry: auto creates 1 or 2 Thu records for cash and transfer
  const addRevenueQuickEntry = useCallback(
    ({
      date,
      floor,
      cashAmount,
      transferAmount,
      description = 'Doanh thu trong ca',
      note = '',
    }: {
      date: string;
      floor: Floor;
      cashAmount: number;
      transferAmount: number;
      description?: string;
      note?: string;
    }) => {
      const newItems: Transaction[] = [];
      const timestamp = new Date().toISOString();

      if (cashAmount > 0) {
        newItems.push({
          id: 'tx-cash-' + Date.now(),
          transaction_date: date,
          type: 'Thu',
          floor,
          category: 'Doanh thu',
          payment_method: 'Tiền mặt',
          description: `${description} (${floor} - Tiền mặt)`,
          amount: Math.round(cashAmount),
          note,
          created_by: currentUser.id,
          creator_name: currentUser.full_name,
          created_at: timestamp,
        });
      }

      if (transferAmount > 0) {
        newItems.push({
          id: 'tx-tf-' + (Date.now() + 1),
          transaction_date: date,
          type: 'Thu',
          floor,
          category: 'Doanh thu',
          payment_method: 'Chuyển khoản',
          description: `${description} (${floor} - Chuyển khoản VietQR)`,
          amount: Math.round(transferAmount),
          note,
          created_by: currentUser.id,
          creator_name: currentUser.full_name,
          created_at: timestamp,
        });
      }

      if (newItems.length > 0) {
        setTransactions((prev) => [...newItems, ...prev]);
        if (isSupabaseConfigured && supabase) {
          supabase.from('transactions').insert(newItems).then();
        }
      }
    },
    [currentUser]
  );

  // Shift Management with Overnight Shift Helper:
  // If a shift crosses midnight (e.g. 22:00 to 06:00), automatically split into 2 records:
  // 22-24 on Day D and 0-6 on Day D+1!
  const addShift = useCallback(
    (shiftData: {
      staff_id: string;
      work_date: string;
      start_hour: number;
      end_hour: number;
      floor: ShiftFloor;
      hourly_rate_snapshot?: number;
      rate_multiplier?: number;
      allowance?: number;
      status?: ShiftStatus;
      note?: string;
    }) => {
      const staff = profiles.find((p) => p.id === shiftData.staff_id);
      const hourlyRate = shiftData.hourly_rate_snapshot ?? (staff ? staff.hourly_rate : 25000);
      const multiplier = shiftData.rate_multiplier ?? 1.0;
      const allowance = shiftData.allowance ?? 0;
      const status = shiftData.status ?? 'scheduled';
      const note = shiftData.note || '';

      const { start_hour, end_hour, work_date, staff_id, floor } = shiftData;

      const createdShifts: Shift[] = [];

      // Check if crossing midnight: e.g. start_hour >= end_hour, or user explicitly selected overnight
      if (end_hour <= start_hour) {
        // Record 1: start_hour to 24 on Day D
        const shift1: Shift = {
          id: 'sh-' + Date.now() + '-1',
          staff_id,
          work_date,
          start_hour,
          end_hour: 24,
          floor,
          hourly_rate_snapshot: hourlyRate,
          rate_multiplier: multiplier,
          allowance: Math.round(allowance / 2),
          status,
          note: note ? `${note} (Ca đêm phần 1)` : 'Ca đêm qua nửa đêm (Phần 1: ' + start_hour + 'h - 24h)',
          created_at: new Date().toISOString(),
        };

        // Record 2: 0 to end_hour on Day D+1
        const nextDay = addDaysToStr(work_date, 1);
        const shift2: Shift = {
          id: 'sh-' + Date.now() + '-2',
          staff_id,
          work_date: nextDay,
          start_hour: 0,
          end_hour,
          floor,
          hourly_rate_snapshot: hourlyRate,
          rate_multiplier: multiplier,
          allowance: Math.round(allowance / 2),
          status,
          note: note ? `${note} (Ca đêm phần 2)` : 'Ca đêm qua nửa đêm (Phần 2: 0h - ' + end_hour + 'h)',
          created_at: new Date().toISOString(),
        };

        createdShifts.push(shift1, shift2);
      } else {
        // Normal shift within same day
        const normalShift: Shift = {
          id: 'sh-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          staff_id,
          work_date,
          start_hour,
          end_hour,
          floor,
          hourly_rate_snapshot: hourlyRate,
          rate_multiplier: multiplier,
          allowance,
          status,
          note,
          created_at: new Date().toISOString(),
        };
        createdShifts.push(normalShift);
      }

      setShifts((prev) => [...prev, ...createdShifts]);

      if (isSupabaseConfigured && supabase) {
        supabase.from('shifts').insert(createdShifts).then();
      }
    },
    [profiles]
  );

  const updateShift = useCallback((id: string, partial: Partial<Shift>) => {
    setShifts((prev) => prev.map((s) => (s.id === id ? { ...s, ...partial } : s)));
    if (isSupabaseConfigured && supabase) {
      supabase.from('shifts').update(partial).eq('id', id).then();
    }
  }, []);

  const deleteShift = useCallback((id: string) => {
    setShifts((prev) => prev.filter((s) => s.id !== id));
    if (isSupabaseConfigured && supabase) {
      supabase.from('shifts').delete().eq('id', id).then();
    }
  }, []);

  const toggleShiftStatus = useCallback((id: string, newStatus: ShiftStatus) => {
    setShifts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
    if (isSupabaseConfigured && supabase) {
      supabase.from('shifts').update({ status: newStatus }).eq('id', id).then();
    }
  }, []);

  const bulkApproveShiftsForDate = useCallback((date: string, floorFilter?: string) => {
    setShifts((prev) =>
      prev.map((s) => {
        if (s.work_date === date && (!floorFilter || floorFilter === 'Tất cả' || s.floor === floorFilter)) {
          return { ...s, status: 'approved' };
        }
        return s;
      })
    );
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('shifts').update({ status: 'approved' }).eq('work_date', date);
      if (floorFilter && floorFilter !== 'Tất cả') {
        query = query.eq('floor', floorFilter);
      }
      query.then();
    }
  }, []);

  // Availability
  const saveStaffAvailability = useCallback(
    (staffId: string, date: string, hours: number[], note: string = '') => {
      setAvailabilities((prev) => {
        const filtered = prev.filter((a) => !(a.staff_id === staffId && a.work_date === date));
        const newRecord: StaffAvailability = {
          id: 'av-' + Date.now(),
          staff_id: staffId,
          work_date: date,
          available_hours: hours,
          note,
          created_at: new Date().toISOString(),
        };
        return [...filtered, newRecord];
      });

      if (isSupabaseConfigured && supabase) {
        supabase
          .from('staff_availability')
          .upsert(
            { staff_id: staffId, work_date: date, available_hours: hours, note },
            { onConflict: 'staff_id,work_date' }
          )
          .then();
      }
    },
    []
  );

  // Compute Payroll Records for selectedMonth
  const payrollRecords = useMemo<PayrollRecord[]>(() => {
    const staffProfiles = profiles.filter((p) => p.role === 'staff' && p.is_active);

    return staffProfiles.map((staff) => {
      const staffShifts = shifts.filter(
        (s) => s.staff_id === staff.id && s.work_date.startsWith(selectedMonth)
      );

      let approvedHours = 0;
      let scheduledHours = 0;
      let totalAllowance = 0;
      let approvedSalary = 0;
      let scheduledSalary = 0;

      for (const shift of staffShifts) {
        const hours = Math.max(0, shift.end_hour - shift.start_hour);
        const rate = shift.hourly_rate_snapshot || staff.hourly_rate;
        const multiplier = Number(shift.rate_multiplier) || 1.0;
        const allowance = Number(shift.allowance) || 0;
        const shiftPay = Math.round(hours * rate * multiplier) + allowance;

        if (shift.status === 'approved') {
          approvedHours += hours;
          totalAllowance += allowance;
          approvedSalary += shiftPay;
        } else if (shift.status === 'scheduled') {
          scheduledHours += hours;
          scheduledSalary += shiftPay;
        }
      }

      return {
        staff_id: staff.id,
        full_name: staff.full_name,
        floor: staff.default_floor,
        hourly_rate: staff.hourly_rate,
        approved_hours: approvedHours,
        scheduled_hours: scheduledHours,
        total_allowance: totalAllowance,
        approved_salary: approvedSalary,
        scheduled_salary: scheduledSalary,
        total_salary: approvedSalary + scheduledSalary,
        shift_count: staffShifts.length,
      };
    });
  }, [profiles, shifts, selectedMonth]);

  // 1-Click Sync Payroll to Thu-Chi expenses
  const syncPayrollToExpenses = useCallback(
    (records: PayrollRecord[], monthStr: string) => {
      const today = getTodayDateStr();
      const newTransactions: Transaction[] = [];
      let totalAmount = 0;

      for (const r of records) {
        if (r.approved_salary <= 0) continue;

        // Check if an expense for this staff and this month was already synced
        const searchDesc = `Lương tháng ${monthStr} - ${r.full_name}`;
        const alreadyExists = transactions.some(
          (t) =>
            t.type === 'Chi' &&
            t.category === 'Chi phí nhân viên' &&
            t.description.includes(searchDesc)
        );

        if (!alreadyExists) {
          totalAmount += r.approved_salary;
          newTransactions.push({
            id: 'tx-salary-' + r.staff_id + '-' + Date.now(),
            transaction_date: today,
            type: 'Chi',
            floor: r.floor,
            category: 'Chi phí nhân viên',
            payment_method: 'Chuyển khoản',
            description: `${searchDesc} (${r.approved_hours}h làm việc)`,
            amount: r.approved_salary,
            note: `Đồng bộ tự động từ Bảng Lương tháng ${monthStr}. Phụ cấp: ${r.total_allowance.toLocaleString('vi-VN')}đ`,
            created_by: currentUser.id,
            creator_name: currentUser.full_name,
            created_at: new Date().toISOString(),
          });
        }
      }

      if (newTransactions.length > 0) {
        setTransactions((prev) => [...newTransactions, ...prev]);
        if (isSupabaseConfigured && supabase) {
          supabase.from('transactions').insert(newTransactions).then();
        }
      }

      return { syncedCount: newTransactions.length, totalAmount };
    },
    [transactions, currentUser]
  );

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchUserById,
        profiles,
        updateProfile,

        selectedFloor,
        setSelectedFloor,
        selectedDate,
        setSelectedDate,
        selectedMonth,
        setSelectedMonth,

        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addRevenueQuickEntry,

        shifts,
        addShift,
        updateShift,
        deleteShift,
        toggleShiftStatus,
        bulkApproveShiftsForDate,

        availabilities,
        saveStaffAvailability,

        coverageTarget,
        setCoverageTarget,

        payrollRecords,
        syncPayrollToExpenses,

        isDemoMode: !isSupabaseConfigured,
        isSupabaseLive: isSupabaseConfigured,
        resetToSampleData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}
