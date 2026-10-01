# Góc cá nhân — phạm vi và vận hành

Yêu cầu: đăng ký/đăng nhập/đăng xuất, xem và sửa hồ sơ, cài đặt, quyền riêng tư, lưu nội dung website và ghi chú riêng. Giữ My Orbit và bộ sưu tập khách hiện có; tài khoản có bộ sưu tập riêng, không tự nhập dữ liệu khách vào tài khoản.

Triển khai: Supabase Auth quản lý mật khẩu, xác nhận email và khôi phục mật khẩu. `fan_profiles` giữ tên, avatar và giới thiệu. `user_settings` giữ lựa chọn công khai quốc gia trên lời nhắn mới; hồ sơ/ghi chú/bộ sưu tập luôn riêng tư. `user_notes` giữ ghi chú chữ thuần. `archive_items` hiện có mở rộng loại ảnh/trang, tiếp tục lưu kỷ niệm, lịch và mục yêu thích. Theme/giảm chuyển động là cài đặt thiết bị.

Các bước: migration và kiểm tra RLS → mở rộng Auth → trang tài khoản → nút lưu ảnh/trang → kiểm thử UI, SQL, build → áp dụng migration local. Không tạo Auth giả bằng mật khẩu trong localStorage. Chưa có cấu hình Supabase online nên kiểm thử email thật cần thực hiện sau khi cấu hình.

Migration: trên database đã chạy 001–005, chạy `003_archive_items.sql` nếu chưa có `archive_items`, rồi `006_account_features.sql`. Database mới dùng `setup.sql` đã gộp tất cả. Không chạy lại các migration đã áp dụng.

Supabase URL Configuration cần Site URL và Redirect URL đúng origin/path ứng dụng (ví dụ `http://localhost:5173/`). Email khôi phục quay về ứng dụng; sự kiện PASSWORD_RECOVERY mở form mật khẩu mới. Bật xác nhận email và chính sách mật khẩu tối thiểu 8 ký tự trong Supabase. Nguồn API: https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail và https://supabase.com/docs/reference/javascript/auth-updateuser.

## Sử dụng

- Mở `#/account`, hoặc My Orbit → Hồ sơ/Cài đặt/Quyền riêng tư/Ghi chú.
- Hồ sơ: sửa tên hiển thị, URL ảnh HTTPS, giới thiệu tối đa 500 ký tự. Email không cho sửa ở màn này.
- Cài đặt: chuyển sáng/tối, giảm chuyển động, đổi mật khẩu, gửi lại liên kết khi quên mật khẩu hiện tại, đăng xuất.
- Quyền riêng tư: chọn hiển thị quốc gia cho lời nhắn **mới**, xuất toàn bộ dữ liệu riêng thành JSON, đăng xuất mọi thiết bị. Không thay đổi nội dung lời nhắn cũ.
- Đã lưu: tìm ảnh, trang, lịch và kỷ niệm; bỏ lưu từng mục. Không phải dịch vụ tải file cá nhân lên cloud.
- Ghi chú: tạo, sửa, xóa sau khi xác nhận; văn bản thuần tối đa 10.000 ký tự/ghi chú. Lỗi lưu giữ nguyên bản nháp. Bấm Lưu trước khi chuyển ghi chú hoặc rời trang.
- Thư viện/khung xem ảnh có nút Save to My Orbit; cuối các trang có nút lưu trang. Khách lưu trên trình duyệt; thành viên lưu theo tài khoản ở Supabase. Hai bộ sưu tập tách riêng.

Database local đã chạy `003_archive_items.sql` và `006_account_features.sql`, không xóa dữ liệu cũ. Bộ SQL `setup.sql` đã bổ sung cả hai migration. `scripts/apply-account-local.ps1` chỉ áp dụng phần còn thiếu của lần nâng cấp này.

## Giới hạn kiểm thử

Đã kiểm tra UI bằng test tự động với SDK mock, phân quyền trên PostgreSQL PGlite, migrations trên PostgreSQL 14.5 local, và luồng khách lưu ảnh/hiện My Orbit trên trình duyệt. Chưa có `.env.local` nên chưa kiểm thử đăng ký email, liên kết khôi phục thực tế hoặc đồng bộ trên Supabase cloud. Cấu hình Supabase là bước cần thiết để tài khoản hoạt động thật.

Không dùng database local giả lập để xác thực mật khẩu. Không đưa mật khẩu PostgreSQL vào biến VITE hoặc frontend. Việc đổi mật khẩu vẫn do Supabase xác thực; cờ khôi phục trong sessionStorage chỉ khôi phục giao diện sau khi reload, không phải quyền phía server.
