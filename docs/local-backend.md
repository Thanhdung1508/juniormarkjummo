# Backend chạy trên máy

API Node.js + PostgreSQL sử dụng database `juniormark` hiện có. Đây là backend local thực, không phải Supabase server. Khi cấu hình Supabase, frontend vẫn dùng SDK Supabase hiện có; không tự chuyển sang local nếu Supabase lỗi.

Phạm vi: đăng ký/đăng nhập/đăng xuất, session cookie HttpOnly, scrypt password hashing, hồ sơ, ghi chú, bộ sưu tập, quyền riêng tư, xuất dữ liệu, lời nhắn chờ duyệt và quẻ Jummo. API whitelist bảng/cột/RPC; truy vấn nghiệp vụ luôn chạy với role anon/authenticated và auth.uid() để RLS áp dụng. Session và mật khẩu nằm trong schema private, trình duyệt không nhận mật khẩu PostgreSQL.

Local email: quên mật khẩu tạo thư trong `.local/mail/`; không gửi email thật. Liên kết chỉ dùng một lần, hết hạn sau 30 phút. Local đăng ký không xác minh email, không dùng cấu hình này như dịch vụ Internet production.

## Chạy trên máy

1. Khởi động database: `./scripts/database-local.ps1 -Action start`.
2. File `.env.local` chứa `VITE_BACKEND=local`. Không điền Supabase URL/key nếu dùng local.
3. Mở terminal chạy `npm run api`, terminal khác chạy `npm run dev`.
4. Truy cập `http://127.0.0.1:5173`. API ở cổng 3001; frontend dùng proxy cùng origin.

Database `juniormark` ở `127.0.0.1:55432`, user `postgres`. Mật khẩu chỉ đọc từ file riêng `.local/postgres-password.local`. Vite chặn truy cập thư mục `.local`, môi trường và mã server từ trình duyệt.

## Dữ liệu động

| Nội dung | Bảng tiếng Anh |
|---|---|
| Chọn nhân vật, hồ sơ, sinh nhật | artists |
| Timeline, các bộ sưu tập, vai diễn | works, work_roles |
| Gallery, bộ lọc nghệ sĩ, credit, nguồn ảnh | media_items, media_artists |
| Playlist và file âm thanh | tracks |
| Lịch trình | events |
| Tiến độ dự án | projects, project_entries |
| Hero, highlights, tâm trạng và thư Jummo | editorial_entries |
| Thuật ngữ, hướng dẫn, quiz, quà tải xuống | glossary, checklist_items, quiz_questions, downloads |
| Hồ sơ fan, cài đặt, ghi chú, đã lưu | fan_profiles, user_settings, user_notes, archive_items |

Chỉ nội dung `status='published'` được công khai. Sửa trực tiếp bản ghi trong PostgreSQL rồi tải lại website để thấy nội dung mới. Website tải một snapshot trước khi hiển thị; lỗi kết nối có nút thử lại, không dùng dữ liệu mẫu để che lỗi. Chưa có trang quản trị chỉnh nội dung.

Màu theme, bố cục, icon, hiệu ứng, tên nút điều hướng và lời hướng dẫn thao tác giữ trong code. Theme và trạng thái duyệt của khách lưu trên thiết bị. Lịch/dự án có cờ `is_demo` vẫn là minh họa, không phải sự kiện hoặc chiến dịch đã xác minh.

`npm run db:import` nhập nội dung từ `supabase/seed.sql`, không ghi đè bản ghi đã tồn tại. `npm run db:seed` tái tạo SQL từ snapshot nội dung; `npm run db:bundle` tạo bản setup cho Supabase. Sửa nội dung đang tồn tại bằng UPDATE trong database, không chỉnh snapshot để mong tự ghi đè dữ liệu thật.

## Kiểm tra

- `npm run test:backend`: HTTP thật và PostgreSQL local; tạo hai tài khoản thử rồi dọn đúng các tài khoản đó.
- `npm run test:db`: kiểm tra schema/RLS trong database WASM riêng.
- `npm test`, `npm run lint`, `npm run build`: giao diện và bản build.

Backend này phục vụ môi trường phát triển local. Khi chuyển lên Supabase, dùng hướng dẫn Supabase hiện có; tài khoản local không tự chuyển sang Supabase Auth. Email đặt lại mật khẩu local nằm trong `.local/mail/`, không phải hộp thư thật.
