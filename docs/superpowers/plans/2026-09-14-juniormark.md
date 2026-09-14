# JuniorMark Implementation Plan

**Goal:** Trang chủ responsive và tài khoản Supabase, chú thích tiếng Việt.
**Architecture:** Các section React độc lập, AuthProvider quản lý session, Supabase client tập trung, PostgreSQL RLS bảo vệ hồ sơ.
**Tech Stack:** React, Vite, CSS variables, Supabase JS, Vitest, Testing Library.
**Spec:** ../specs/2026-09-14-juniormark-design.md

## Global Constraints
Giữ React + Vite. Supabase Auth và PostgreSQL. Chế độ sáng kem/be ấm; không nền trắng. Không nhúng secret key. Thực hiện tuần tự trong workspace hiện tại (chưa có Git repository).

## 1. Trang chủ
- [x] Thay mẫu Vite trong src/App.jsx, src/index.css, src/App.css; thêm Header, HomeSections, Gallery, Dialog và ThemeToggle tại src/components.
- [x] Dùng ảnh đã trích từ Figma trong public/images. Nội dung tĩnh được ghi rõ là bộ sưu tập/biên tập.
- [x] Kiểm tra countdown bằng ngày cố định trước/sau sinh nhật; theme lưu khi tải lại và hoạt động khi storage bị chặn.
- [x] Kiểm tra desktop/mobile, navigation, dialog, bàn phím và reduced-motion.

## 2. Tài khoản
- [x] Viết kiểm thử validation trong src/lib/helpers.test.js và biểu mẫu trong AuthDialog.test.jsx trước triển khai.
- [x] src/lib/supabase.js tạo client từ VITE_SUPABASE_URL và VITE_SUPABASE_PUBLISHABLE_KEY, thiếu config trả null.
- [x] AuthProvider.jsx theo dõi INITIAL_SESSION/SIGNED_IN/SIGNED_OUT, tải hồ sơ ngoài callback auth để tránh deadlock.
- [x] AuthDialog.jsx gọi signUp/signInWithPassword; hiển thị lỗi tiếng Việt; trường hợp cần xác nhận email không hiển thị là đã đăng nhập.
- [x] Đăng xuất scope local, lỗi không xóa session giả; ngăn gửi lặp.

## 3. Database và hướng dẫn
- [x] supabase/001_fan_profiles.sql tạo bảng, trigger, RLS, giới hạn update cột.
- [x] .env.example và README.md hướng dẫn tạo Supabase, chạy SQL, cấu hình email redirect và bật email auth.
- [x] Chạy npm test, npm run lint, npm run build. Ghi đúng giới hạn kiểm tra dịch vụ thật.

