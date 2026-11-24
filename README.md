# TRẠM HỌC OPS - HỆ THỐNG QUẢN LÝ VẬN HÀNH 24/7 STUDY CAFE & CO-WORKING SPACE

> **Địa chỉ:** 601A Cách Mạng Tháng 8, Phường 15, Quận 10, TP. Hồ Chí Minh  
> **Mô hình hoạt động:** Không gian tự học & Co-working space mở cửa 24/7 xuyên suốt 365 ngày.  
> **Ngôn ngữ hiển thị:** Tiếng Việt (Vietnamese) | **Đơn vị tiền tệ:** VNĐ (e.g. `25.000 ₫`)

---

## ☕ TỔNG QUAN HỆ THỐNG

**Trạm Học Ops** là ứng dụng web quản lý vận hành chuyên dụng cho mô hình Study Cafe 24/7, giải quyết bài toán cốt lõi:
1. **Dòng tiền Thu - Chi phân tán:** Chốt doanh thu nhanh theo ca, phân tách tự động dòng tiền `Tiền mặt` tại quầy và `Chuyển khoản VietQR`, hạch toán chi phí chi tiết theo từng Tầng (`Tầng 1`, `Tầng 2`, `Tầng 3`, `Tất cả`).
2. **Xếp ca 24/7 liên tục đan xen theo từng giờ:** Ma trận 24 khung giờ (`00h` đến `23h`), hỗ trợ ca xuyên đêm (Overnight Split Helper) tự tách 2 bản ghi, hiển thị Thanh Phủ Ca trực quan theo màu sắc (`Trống ca` - đỏ, `Đủ ca` - xanh lá, `Cao điểm/Dư ca` - cam) và cho phép nhân viên đăng ký khung giờ rảnh.
3. **Bảng lương tự động & 1-Click Sync:** Tự động tính công dựa trên ca `Đã duyệt` (Approved), hỗ trợ hệ số ca đêm (x1.2), phụ cấp đêm, và nút **"Chốt & Đẩy sang Thu-Chi"** giúp đồng bộ ngay chi phí lương nhân viên sang báo cáo tài chính.
4. **Cổng Nhân Viên (Staff Portal):** Giao diện thân thiện trên điện thoại, nhân viên xem lịch ca, kiểm tra lương thực lãnh tức thì, và chạm chọn 24 ô giờ để đăng ký giờ rảnh.

---

## 🛠 TECH STACK

- **Frontend:** Next.js 15/16 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Recharts.
- **Export:** `xlsx` (SheetJS) hỗ trợ xuất file Excel chuẩn format cho Thu-Chi và Bảng Lương.
- **Backend & Database:** Supabase (PostgreSQL, Row Level Security RLS, Triggers, Indexes).
- **Trải nghiệm Zero-Friction Demo:** Tích hợp bộ chuyển đổi vai trò (Role Switcher: Admin 👑 / Nhân viên 👤) cùng bộ nhớ đệm LocalStorage tự động, giúp xem và trải nghiệm đầy đủ 100% tính năng ngay lập tức mà không bắt buộc phải tạo tài khoản trước.

---

## 📁 CẤU TRÚC DỰ ÁN

```bash
├── src/
│   ├── app/
│   │   ├── globals.css         # Light theme, scrollbar tùy chỉnh, lưới 24 cột
│   │   ├── layout.tsx          # AppProvider bọc toàn bộ ứng dụng
│   │   └── page.tsx            # Trang chính tích hợp các module theo vai trò
│   ├── components/
│   │   ├── dashboard/
│   │   │   └── OverviewDashboard.tsx   # Module 1: 4 KPI Cards, Recharts thu chi, phân bổ tầng
│   │   ├── transactions/
│   │   │   └── TransactionManagement.tsx # Module 2: Chốt doanh thu ca, tạo phiếu chi, xuất Excel
│   │   ├── shifts/
│   │   │   └── ShiftMatrix247.tsx      # Module 3: Ma trận 24h, Thanh phủ ca, helper ca xuyên đêm
│   │   ├── payroll/
│   │   │   └── PayrollModule.tsx       # Module 4: Bảng lương tự động, 1-Click sync sang Thu-Chi
│   │   ├── staff/
│   │   │   └── StaffPortal.tsx         # Module 5: Cổng nhân viên (Lịch ca, Chạm chọn giờ rảnh)
│   │   └── layout/
│   │       ├── Header.tsx      # Header, Role Switcher, Bộ lọc tầng, Chọn ngày/tháng
│   │       └── Navbar.tsx      # Thanh điều hướng phân quyền theo vai trò
│   ├── lib/
│   │   ├── export-excel.ts     # Xuất file Excel (.xlsx) cho Thu-Chi và Payroll
│   │   ├── utils.ts            # Định dạng VNĐ (formatVND), ngày tháng, giờ giấc
│   │   ├── supabase/
│   │   │   ├── client.ts       # Supabase client helper
│   │   │   └── server.ts
│   │   └── store/
│   │       ├── app-context.tsx # React State Management & LocalStorage sync
│   │       └── initial-data.ts # Dữ liệu mẫu thực tế của Trạm Học 601A CMT8
│   └── types/
│       └── index.ts            # Khai báo TypeScript types chuẩn chỉnh
├── supabase/
│   ├── schema.sql              # Database schema DDL + Row Level Security policies
│   └── seed.sql                # Dữ liệu khởi tạo thực tế cho Trạm Học (5 staff, ca 24/7, thu-chi)
└── README.md
```

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN

### 1. Khởi chạy ở chế độ cục bộ (Local Development)

```bash
# Cài đặt dependencies
npm install

# Khởi chạy máy chủ phát triển
npm run dev
```

Mở trình duyệt tại [http://localhost:3000](http://localhost:3000).

> 💡 **Chế độ Demo Sẵn Sàng (Zero Configuration):** Nếu chưa cấu hình Supabase, hệ thống sẽ tự động kích hoạt **Demo Mode** với dữ liệu mẫu khởi tạo phong phú (5 nhân viên, ca làm việc 24/7, các giao dịch Thu-Chi tiêu biểu). Mọi thao tác thêm/sửa/xóa và đồng bộ lương đều được lưu vào LocalStorage của trình duyệt.

---

### 2. Thiết lập cơ sở dữ liệu Supabase

#### Bước 2.1: Tạo Project trên Supabase
1. Đăng nhập [Supabase](https://supabase.com) và tạo một Project mới.
2. Vào **Project Settings -> API** để lấy `Project URL` và `anon public key`.

#### Bước 2.2: Chạy Schema & Seed Data
1. Vào tab **SQL Editor** trong bảng điều khiển Supabase.
2. Sao chép toàn bộ nội dung file [supabase/schema.sql](supabase/schema.sql) và bấm **Run**. File này sẽ tạo 4 bảng (`profiles`, `transactions`, `shifts`, `staff_availability`), các chỉ mục tìm kiếm và các chính sách bảo mật cấp hàng (RLS).
3. Tiếp tục sao chép nội dung file [supabase/seed.sql](supabase/seed.sql) và bấm **Run** để nạp dữ liệu mẫu ban đầu cho Trạm Học.

#### Bước 2.3: Cấu hình biến môi trường
Tạo file `.env.local` tại thư mục gốc:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Khởi động lại ứng dụng:
```bash
npm run dev
```

---

### 3. Hướng dẫn Deploy lên Vercel

1. Đẩy code lên GitHub repository.
2. Truy cập [Vercel](https://vercel.com) và chọn **Import Git Repository**.
3. Tại phần **Environment Variables**, điền 2 biến môi trường:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Bấm **Deploy**. Vercel sẽ tự động build Next.js và phát hành trang web trong vòng chưa đầy 1 phút.

---

## 🌟 TÍNH NĂNG CHI TIẾT CỦA 5 MODULES

### Module 1: Dashboard Tổng Quan (Admin)
- **Bộ lọc động:** Lọc theo Tháng/Năm và Khu vực (`Tất cả`, `Tầng 1`, `Tầng 2`, `Tầng 3`).
- **4 Thẻ KPI chính:**
  - **Tổng Doanh Thu:** Kèm chi tiết doanh thu tiền mặt tại quầy.
  - **Tổng Chi Phí:** Chi phí mặt bằng, điện nước, hạt cafe, nguyên liệu.
  - **Lợi Nhuận Ròng (Thu - Chi):** Đánh giá nhanh tình hình tài chính thực tế.
  - **Quỹ Lương Nhân Viên:** Hiển thị lương đã duyệt và số tiền dự kiến chi trả thêm.
- **Hệ thống biểu đồ (Recharts):**
  - Biểu đồ cột ghép: So sánh Doanh thu và Chi phí từng ngày trong tháng.
  - Bảng phân bổ & Biểu đồ: Đo lường lãi/lỗ chi tiết theo từng tầng.
  - Biểu đồ tròn (Pie chart): Tỷ trọng phương thức thanh toán `Chuyển khoản (VietQR)` vs `Tiền mặt`.

### Module 2: Quản lý Thu - Chi (Admin)
- **Form Chốt Doanh Thu Nhanh (Ngày / Ca):** Cho phép nhập song song 2 ô: `Tiền mặt` và `Chuyển khoản VietQR`. Hệ thống tự động tạo 1 hoặc 2 bản ghi `Thu` tương ứng cho tầng được chọn.
- **Form Tạo Phiếu Chi:** Phân loại rõ các hạng mục chi phí (Nguyên liệu, Điện nước, Mặt bằng 601A CMT8, Cơ sở hạ tầng, Chi phí nhân viên...).
- **Bảng dữ liệu Thu - Chi thông minh:** Hỗ trợ lọc theo loại, theo tầng, theo hạng mục, theo khoảng ngày, và tìm kiếm tức thì.
- **Sửa / Xoá trực tiếp (Inline Editing):** Chỉnh sửa số tiền, nội dung, ghi chú ngay trên từng dòng.
- **Xuất Excel (.xlsx):** Tải file báo cáo Thu-Chi với đầy đủ các cột chuẩn kế toán.

### Module 3: Xếp Ca 24/7 Đan Xen Theo Giờ (Admin & Staff)
- **Ma trận 24 khung giờ liên tục:**
  - Trục X: 24 ô giờ từ `00:00` đến `23:00`.
  - Trục Y: Danh sách nhân viên trực theo tầng (`Tầng 1`, `Tầng 2`).
- **Thanh Phủ Ca 24/7 (Hourly Coverage Indicator):**
  - Đếm số nhân sự trực thực tế mỗi giờ.
  - Mã màu trực quan: Đỏ (0 NV - Trống ca cảnh báo), Xanh lá (1-2 NV - Đủ ca), Cam (>2 NV - Cao điểm).
  - Cho phép quản lý tùy chỉnh ngưỡng tối thiểu & lý tưởng.
- **Overnight Shift Helper (Tự tách ca xuyên đêm):**
  - Khi quản lý xếp ca đêm qua nửa đêm (ví dụ: `22:00` đến `06:00`), hệ thống tự động tách thành 2 bản ghi: `22h–24h` ngày D và `00h–06h` ngày D+1.
- **Hiển thị giờ rảnh của nhân viên:** Các chấm xanh tinh tế xuất hiện trên các ô giờ mà nhân viên đã đăng ký rảnh.
- **Duyệt ca 1 chạm:** Chuyển đổi trạng thái ca (`scheduled` -> `approved` -> `absent`) hoặc nút **"Duyệt tất cả ca trong ngày"**.

### Module 4: Bảng Lương Tự Động (Payroll)
- **Công thức tính:**
  $$\text{Lương ca} = (\text{Số giờ} \times \text{Đơn giá snapshot} \times \text{Hệ số ca đêm}) + \text{Phụ cấp}$$
- Chỉ tính các ca **Đã duyệt (Approved)** vào cột **Thực lãnh**; các ca chưa duyệt được đưa vào phần **Dự kiến**.
- **1-Click Sync to Expenses:** Nút **"Chốt & Đẩy sang Thu-Chi"** tự động tạo các phiếu chi `Chi phí nhân viên` tương ứng vào bảng giao dịch.
- **Xuất Excel Bảng Lương:** Xuất file `.xlsx` đầy đủ giờ làm, phụ cấp, đơn giá và thực lãnh.

### Module 5: Cổng Nhân Viên (Staff Portal)
- Khi chuyển sang tài khoản nhân viên (hoặc đăng nhập với `role = 'staff'`):
  - **Lịch làm việc của tôi:** Thẻ danh sách ca trực được giao, khung giờ, phụ cấp và tiền lương dự kiến nhận.
  - **Đăng ký khung giờ rảnh 24/7:** Chạm chọn các ô giờ từ 00h đến 23h cho ngày mai hoặc những ngày sắp tới với các mẫu chọn nhanh (Sáng, Chiều, Cú đêm, Cả ngày).
  - **Bảng chấm công cá nhân:** Tổng hợp số giờ đã duyệt, số giờ đang chờ và tổng tiền thực lãnh trong tháng.

---

## 👥 THÔNG TIN NHÂN SỰ MẪU TẠI TRẠM HỌC

| STT | Họ và Tên | Vai Trò | Khu Vực | Đơn Giá | SĐT Liên Hệ |
|:---:|:---|:---:|:---:|:---:|:---:|
| 1 | **Lê Hoàng Long** | Quản lý (Admin) | Tất cả | 35.000 ₫/h | 0901 234 567 |
| 2 | **Nguyễn Văn An** | Nhân viên | Tầng 1 | 25.000 ₫/h | 0912 345 678 |
| 3 | **Trần Thị Bích** | Nhân viên | Tầng 2 | 25.000 ₫/h | 0923 456 789 |
| 4 | **Phạm Minh Cường** | Nhân viên | Tầng 1 | 25.000 ₫/h | 0934 567 890 |
| 5 | **Lê Thuỳ Dung** | Nhân viên | Tầng 2 | 25.000 ₫/h | 0945 678 901 |
| 6 | **Vũ Đức Em** | Nhân viên | Tầng 2 | 25.000 ₫/h | 0956 789 012 |

---

## 🔒 AN NINH & ROW LEVEL SECURITY (RLS)

- **profiles:** Mọi nhân sự đăng nhập được xem danh sách đồng nghiệp; chỉ Quản lý mới có quyền tạo/sửa thông tin nhân sự.
- **transactions:** Quản lý có toàn quyền quản trị (Thêm, Sửa, Xóa); nhân viên chỉ xem được tổng quan khi được cấp quyền.
- **shifts:** Mọi thành viên trong ca đều xem được lịch phối hợp ca trực; quyền xếp ca, đổi ca, duyệt ca thuộc về Quản lý.
- **staff_availability:** Nhân viên có toàn quyền thêm, cập nhật, xóa lịch đăng ký giờ rảnh của chính mình (`staff_id = auth.uid()`). Quản lý xem được lịch rảnh của toàn bộ đội ngũ.

---

*Hệ thống được phát triển chuyên biệt cho Trạm Học - 601A Cách Mạng Tháng 8, Q.10, TP.HCM.*
