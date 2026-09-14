# JuniorMark — giao diện và tài khoản MVP

Thiết kế đã được người dùng đồng ý trong hội thoại: giữ React + Vite, dùng Supabase Auth và PostgreSQL. Làm tuần tự, chú thích tiếng Việt. Không dùng Firebase. Tài liệu Word/Figma là tham khảo; không tự triển khai toàn bộ roadmap trong tài liệu.

## Giao diện
- Trang chủ phong cách tiệm đĩa và bầu trời: navy, vàng ấm, ảnh có sẵn trong file Figma.
- Header, hero, giới thiệu hai nghệ sĩ, đếm ngược sinh nhật, các câu chuyện biên tập, thư viện ảnh, lời mời gia nhập cộng đồng, footer.
- Chuyển sáng/tối, ghi nhớ bằng localStorage; chế độ sáng dùng kem/be ấm, không dùng nền trắng. Ưu tiên lựa chọn đã lưu, mặc định tối theo mẫu.
- Responsive, điều hướng anchor hoạt động, thư viện xem ảnh lớn, dialog thao tác bằng bàn phím, hỗ trợ reduced-motion.
- Nội dung biên tập tĩnh, không giả lập tin tức hoặc sự kiện trực tiếp. Ảnh từ tài liệu tham khảo, không khẳng định bản quyền tác giả chưa được xác minh.

## Tài khoản
- Đăng ký email/mật khẩu/tên hiển thị/xác nhận mật khẩu; mật khẩu ít nhất 8 ký tự.
- Supabase xử lý đăng nhập/đăng xuất và duy trì session; hiển thị trạng thái chờ, lỗi, email xác nhận.
- Không hiển thị đăng nhập thành công giả khi thiếu cấu hình.
- Tạo bảng public.fan_profiles tham chiếu auth.users, trigger tạo hồ sơ và RLS chỉ đọc/sửa hồ sơ của chính mình. Không lưu mật khẩu hoặc role trong dữ liệu do người dùng chỉnh sửa.
- SQL được giao dưới dạng migration; chỉ triển khai vào dịch vụ khi có kết nối của người dùng.

## Kiểm tra
Kiểm thử xác thực đầu vào, biên ngày đếm ngược, biểu mẫu với lỗi/thành công từ Auth boundary; kiểm tra build/lint và trình duyệt nếu khả dụng. Không tuyên bố đã kiểm thử Supabase thật khi chưa có project.
