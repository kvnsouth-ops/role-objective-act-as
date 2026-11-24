-- ==============================================================================
-- TRẠM HỌC OPS - SUPABASE SEED DATA
-- Trạm Học 24/7 Study Cafe & Co-working Space (601A Cách Mạng Tháng 8, Q.10, TP.HCM)
-- ==============================================================================

-- 1. SEED PROFILES
-- Fix predefined UUIDs so shifts, availability, and transactions can reference them cleanly
insert into public.profiles (id, full_name, phone, role, default_floor, hourly_rate, is_active, created_at)
values
  ('11111111-1111-1111-1111-111111111111', 'Lê Hoàng Long (Quản Lý)', '0901234567', 'admin', 'Tất cả', 35000, true, now() - interval '60 days'),
  ('22222222-2222-2222-2222-222222222222', 'Nguyễn Văn An', '0912345678', 'staff', 'Tầng 1', 25000, true, now() - interval '45 days'),
  ('33333333-3333-3333-3333-333333333333', 'Trần Thị Bích', '0923456789', 'staff', 'Tầng 2', 25000, true, now() - interval '40 days'),
  ('44444444-4444-4444-4444-444444444444', 'Phạm Minh Cường', '0934567890', 'staff', 'Tầng 1', 25000, true, now() - interval '30 days'),
  ('55555555-5555-5555-5555-555555555555', 'Lê Thuỳ Dung', '0945678901', 'staff', 'Tầng 2', 25000, true, now() - interval '20 days'),
  ('66666666-6666-6666-6666-666666666666', 'Vũ Đức Em', '0956789012', 'staff', 'Tầng 2', 25000, true, now() - interval '10 days')
on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  role = excluded.role,
  default_floor = excluded.default_floor,
  hourly_rate = excluded.hourly_rate;

-- 2. SEED TRANSACTIONS (Thu - Chi for current month and previous weeks)
insert into public.transactions (transaction_date, type, floor, category, payment_method, description, amount, note, created_by)
values
  -- Doanh thu các ngày gần đây
  (current_date - 6, 'Thu', 'Tầng 1', 'Doanh thu', 'Tiền mặt', 'Doanh thu ca sáng & chiều Tầng 1 - combo tự học', 1450000, '38 lượt khách', '11111111-1111-1111-1111-111111111111'),
  (current_date - 6, 'Thu', 'Tầng 1', 'Doanh thu', 'Chuyển khoản', 'Doanh thu chuyển khoản qua VietQR Tầng 1', 2850000, 'Chuyển khoản VietQR', '11111111-1111-1111-1111-111111111111'),
  (current_date - 6, 'Thu', 'Tầng 2', 'Doanh thu', 'Tiền mặt', 'Doanh thu phòng yên tĩnh Tầng 2', 1200000, 'Khách thuê theo giờ', '11111111-1111-1111-1111-111111111111'),
  (current_date - 6, 'Thu', 'Tầng 2', 'Doanh thu', 'Chuyển khoản', 'Gói tháng học sinh & sinh viên Tầng 2', 3900000, '3 gói tháng 1.300k', '11111111-1111-1111-1111-111111111111'),
  (current_date - 6, 'Thu', 'Tầng 3', 'Doanh thu', 'Chuyển khoản', 'Thuê phòng họp nhóm Pod 1 & Pod 2 Tầng 3', 1800000, '6 tiếng họp nhóm', '11111111-1111-1111-1111-111111111111'),
  
  -- Chi phí ngày -6
  (current_date - 6, 'Chi', 'Tất cả', 'Chi phí nguyên liệu', 'Chuyển khoản', 'Nhập hạt cafe Robusta & Arabica Cầu Đất', 2400000, 'Nhà cung cấp Cafe Sạch', '11111111-1111-1111-1111-111111111111'),
  (current_date - 6, 'Chi', 'Tầng 2', 'Chi phí cơ sở hạ tầng', 'Tiền mặt', 'Thay bóng đèn LED bảo vệ mắt bàn A1-A4', 350000, 'Đèn Philips chống cận', '11111111-1111-1111-1111-111111111111'),

  -- Ngày -5
  (current_date - 5, 'Thu', 'Tầng 1', 'Doanh thu', 'Chuyển khoản', 'Doanh thu cafe & chỗ ngồi Tầng 1', 3400000, 'Khách đông ca chiều', '11111111-1111-1111-1111-111111111111'),
  (current_date - 5, 'Thu', 'Tầng 1', 'Doanh thu', 'Tiền mặt', 'Doanh thu nước đóng chai và snack Tầng 1', 980000, 'Tiền lẻ thu ngân', '11111111-1111-1111-1111-111111111111'),
  (current_date - 5, 'Thu', 'Tầng 2', 'Doanh thu', 'Chuyển khoản', 'Doanh thu ca đêm 24/7 Tầng 2', 2600000, 'Khách cú đêm ôn thi ĐH', '11111111-1111-1111-1111-111111111111'),
  (current_date - 5, 'Chi', 'Tầng 1', 'Chi phí nguyên liệu', 'Tiền mặt', 'Mua sữa tươi Dalatmilk & trà đào', 1150000, 'Bách Hoá Xanh CMT8', '11111111-1111-1111-1111-111111111111'),

  -- Ngày -4
  (current_date - 4, 'Thu', 'Tầng 1', 'Doanh thu', 'Chuyển khoản', 'Doanh thu Tầng 1', 3100000, '', '11111111-1111-1111-1111-111111111111'),
  (current_date - 4, 'Thu', 'Tầng 2', 'Doanh thu', 'Chuyển khoản', 'Doanh thu Tầng 2', 4200000, '', '11111111-1111-1111-1111-111111111111'),
  (current_date - 4, 'Thu', 'Tầng 3', 'Doanh thu', 'Chuyển khoản', 'Thuê workshop Workshop Studio Tầng 3', 3500000, 'Workshop Lập trình Python 4h', '11111111-1111-1111-1111-111111111111'),
  (current_date - 4, 'Chi', 'Tất cả', 'Chi phí điện nước', 'Chuyển khoản', 'Tiền điện EVN tháng trước (hệ thống máy lạnh 24/7)', 8650000, 'Hoá đơn EVN HCMC', '11111111-1111-1111-1111-111111111111'),

  -- Ngày -3
  (current_date - 3, 'Thu', 'Tầng 1', 'Doanh thu', 'Chuyển khoản', 'Doanh thu Tầng 1', 2900000, '', '11111111-1111-1111-1111-111111111111'),
  (current_date - 3, 'Thu', 'Tầng 2', 'Doanh thu', 'Tiền mặt', 'Doanh thu Tầng 2', 1500000, '', '11111111-1111-1111-1111-111111111111'),
  (current_date - 3, 'Thu', 'Tầng 2', 'Doanh thu', 'Chuyển khoản', 'Doanh thu Tầng 2 online', 3300000, '', '11111111-1111-1111-1111-111111111111'),
  (current_date - 3, 'Chi', 'Tất cả', 'Chi phí khác', 'Tiền mặt', 'Mua văn phòng phẩm, giấy in, bút nhớ cho khách', 450000, '', '11111111-1111-1111-1111-111111111111'),

  -- Ngày -2
  (current_date - 2, 'Thu', 'Tầng 1', 'Doanh thu', 'Chuyển khoản', 'Doanh thu Tầng 1 cuối tuần', 4600000, 'Thứ 7 đông kín bàn', '11111111-1111-1111-1111-111111111111'),
  (current_date - 2, 'Thu', 'Tầng 1', 'Doanh thu', 'Tiền mặt', 'Doanh thu Tầng 1 tiền mặt', 2100000, '', '11111111-1111-1111-1111-111111111111'),
  (current_date - 2, 'Thu', 'Tầng 2', 'Doanh thu', 'Chuyển khoản', 'Doanh thu Tầng 2', 5100000, 'Full phòng 24/7', '11111111-1111-1111-1111-111111111111'),
  (current_date - 2, 'Thu', 'Tầng 3', 'Doanh thu', 'Chuyển khoản', 'Phòng họp nhóm Chủ Nhật Tầng 3', 2400000, '', '11111111-1111-1111-1111-111111111111'),
  (current_date - 2, 'Chi', 'Tất cả', 'Chi phí mặt bằng', 'Chuyển khoản', 'Tiền thuê mặt bằng 601A CMT8 đợt 1', 25000000, 'Chuyển khoản chủ nhà', '11111111-1111-1111-1111-111111111111'),

  -- Ngày -1 (Hôm qua)
  (current_date - 1, 'Thu', 'Tầng 1', 'Doanh thu', 'Chuyển khoản', 'Doanh thu Tầng 1', 3800000, '', '11111111-1111-1111-1111-111111111111'),
  (current_date - 1, 'Thu', 'Tầng 2', 'Doanh thu', 'Chuyển khoản', 'Doanh thu Tầng 2', 4500000, '', '11111111-1111-1111-1111-111111111111'),
  (current_date - 1, 'Chi', 'Tầng 2', 'Chi phí cơ sở hạ tầng', 'Chuyển khoản', 'Bảo dưỡng định kỳ 4 điều hoà Daikin Inverter', 1200000, 'Vệ sinh lưới lọc và nạp gas', '11111111-1111-1111-1111-111111111111'),

  -- Hôm nay
  (current_date, 'Thu', 'Tầng 1', 'Doanh thu', 'Tiền mặt', 'Doanh thu ca sáng Tầng 1', 1250000, 'Mở ca sáng', '11111111-1111-1111-1111-111111111111'),
  (current_date, 'Thu', 'Tầng 1', 'Doanh thu', 'Chuyển khoản', 'Doanh thu chuyển khoản hôm nay Tầng 1', 2950000, '', '11111111-1111-1111-1111-111111111111'),
  (current_date, 'Thu', 'Tầng 2', 'Doanh thu', 'Chuyển khoản', 'Doanh thu Tầng 2 hôm nay', 3850000, '', '11111111-1111-1111-1111-111111111111'),
  (current_date, 'Chi', 'Tất cả', 'Chi phí nguyên liệu', 'Tiền mặt', 'Nhập đá sạch & siro Monin các vị', 650000, '', '11111111-1111-1111-1111-111111111111');

-- 3. SEED SHIFTS (24/7 Coverage across staff for Today and adjacent days)
-- 24 hours schedule:
-- Staff 1: Nguyễn Văn An (06:00 - 14:00) Tầng 1
-- Staff 2: Trần Thị Bích (14:00 - 22:00) Tầng 2
-- Staff 3: Phạm Minh Cường (22:00 - 24:00 and 00:00 - 06:00) Night owl
-- Staff 4: Lê Thuỳ Dung (08:00 - 16:00) Tầng 2
-- Staff 5: Vũ Đức Em (16:00 - 24:00) Tầng 2
insert into public.shifts (staff_id, work_date, start_hour, end_hour, floor, hourly_rate_snapshot, rate_multiplier, allowance, status, note)
values
  -- Hôm qua (Đã duyệt)
  ('22222222-2222-2222-2222-222222222222', current_date - 1, 0, 6, 'Tầng 1', 25000, 1.20, 30000, 'approved', 'Ca trực đêm qua rạng sáng'),
  ('33333333-3333-3333-3333-333333333333', current_date - 1, 6, 12, 'Tầng 2', 25000, 1.00, 0, 'approved', 'Ca sáng đón khách sớm'),
  ('44444444-4444-4444-4444-444444444444', current_date - 1, 8, 16, 'Tầng 1', 25000, 1.00, 20000, 'approved', 'Ca hành chính pha chế'),
  ('55555555-5555-5555-5555-555555555555', current_date - 1, 12, 18, 'Tầng 2', 25000, 1.00, 0, 'approved', 'Ca chiều trực tầng 2'),
  ('66666666-6666-6666-6666-666666666666', current_date - 1, 16, 22, 'Tầng 2', 25000, 1.00, 0, 'approved', 'Ca tối đông khách'),
  ('22222222-2222-2222-2222-222222222222', current_date - 1, 22, 24, 'Tầng 1', 25000, 1.20, 20000, 'approved', 'Nửa đầu ca đêm qua 24h'),

  -- Hôm nay
  ('22222222-2222-2222-2222-222222222222', current_date, 0, 6, 'Tầng 1', 25000, 1.20, 30000, 'approved', 'Nửa sau ca đêm từ 0h'),
  ('33333333-3333-3333-3333-333333333333', current_date, 6, 12, 'Tầng 2', 25000, 1.00, 0, 'approved', 'Mở cửa ca sáng'),
  ('44444444-4444-4444-4444-444444444444', current_date, 8, 14, 'Tầng 1', 25000, 1.00, 0, 'approved', 'Ca trưa'),
  ('55555555-5555-5555-5555-555555555555', current_date, 12, 18, 'Tầng 2', 25000, 1.00, 0, 'scheduled', 'Ca chiều theo lịch'),
  ('66666666-6666-6666-6666-666666666666', current_date, 16, 22, 'Tầng 2', 25000, 1.00, 0, 'scheduled', 'Ca tối sinh viên học nhóm'),
  ('33333333-3333-3333-3333-333333333333', current_date, 22, 24, 'Tầng 2', 25000, 1.20, 20000, 'scheduled', 'Ca đêm đợt 1'),

  -- Ngày mai
  ('33333333-3333-3333-3333-333333333333', current_date + 1, 0, 6, 'Tầng 2', 25000, 1.20, 30000, 'scheduled', 'Ca đêm đợt 2'),
  ('22222222-2222-2222-2222-222222222222', current_date + 1, 6, 12, 'Tầng 1', 25000, 1.00, 0, 'scheduled', 'Ca sáng'),
  ('55555555-5555-5555-5555-555555555555', current_date + 1, 10, 16, 'Tầng 2', 25000, 1.00, 0, 'scheduled', 'Ca giao ban trưa'),
  ('44444444-4444-4444-4444-444444444444', current_date + 1, 16, 22, 'Tầng 1', 25000, 1.00, 0, 'scheduled', 'Ca tối'),
  ('66666666-6666-6666-6666-666666666666', current_date + 1, 22, 24, 'Tầng 2', 25000, 1.20, 20000, 'scheduled', 'Trực đêm');

-- 4. SEED STAFF AVAILABILITY (Giờ rảnh đã đăng ký)
insert into public.staff_availability (staff_id, work_date, available_hours, note)
values
  ('22222222-2222-2222-2222-222222222222', current_date, '{0,1,2,3,4,5,6,18,19,20,21,22,23}', 'Rảnh đêm và sáng sớm'),
  ('33333333-3333-3333-3333-333333333333', current_date, '{6,7,8,9,10,11,12,13,14,22,23}', 'Rảnh ca sáng & đêm'),
  ('44444444-4444-4444-4444-444444444444', current_date, '{8,9,10,11,12,13,14,15,16}', 'Rảnh ban ngày'),
  ('55555555-5555-5555-5555-555555555555', current_date, '{12,13,14,15,16,17,18,19,20}', 'Rảnh chiều tối'),
  ('66666666-6666-6666-6666-666666666666', current_date, '{16,17,18,19,20,21,22,23}', 'Rảnh tối'),
  
  ('22222222-2222-2222-2222-222222222222', current_date + 1, '{6,7,8,9,10,11,12}', 'Rảnh ca sáng mai'),
  ('33333333-3333-3333-3333-333333333333', current_date + 1, '{0,1,2,3,4,5,6}', 'Trực đêm mai ok'),
  ('55555555-5555-5555-5555-555555555555', current_date + 1, '{10,11,12,13,14,15,16,17}', 'Rảnh trưa chiều')
on conflict (staff_id, work_date) do update set
  available_hours = excluded.available_hours,
  note = excluded.note;
