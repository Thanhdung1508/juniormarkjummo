# Tách frontend và Kotlin backend

Yêu cầu đã chốt: backend Kotlin trong C:/Users/ADMIN/IdeaProjects/jumarkmo; frontend React giữ ở C:/laragon/www/juniormark-frontend. Chú thích tiếng Việt, tên trường tiếng Anh, không duy trì hai backend hay hai bộ SQL.

1. Dựng Kotlin Spring Boot + Maven + Java 17, giữ giao thức /api hiện tại để không phá giao diện.
2. Chia auth (controller/service/repository), data (controller/service/repository), common (lỗi), config (database/origin), JDBC transaction áp dụng RLS.
3. Chuyển migration/seed về backend/database; script quản lý database, cấu hình bí mật, PostgreSQL local cũng thuộc backend. Giữ nguyên dữ liệu, dừng database trước khi di chuyển.
4. Kiểm thử HTTP thực với hai tài khoản, phân quyền, reset mật khẩu và nội dung database. Đảm bảo mật khẩu scrypt cũ vẫn dùng được.
5. Chỉ khi Kotlin chạy và dữ liệu được xác nhận mới bỏ Node server và file SQL trùng khỏi frontend. Frontend chỉ chứa UI, assets, API client, test UI.
6. Viết README backend hướng dẫn mở pom.xml ở IntelliJ, chạy, vị trí SQL và ví dụ luồng request. Kiểm tra frontend build/test và API qua proxy.

Không đổi tên bảng hiện có hoặc xoá database. Không sửa/xoá metadata Git/IntelliJ của người dùng. README frontend đang conflict sẽ không bị ghi đè.
