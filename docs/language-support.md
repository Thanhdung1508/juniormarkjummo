# Tiếng Việt và English

## Thiết kế

Người dùng chọn ngôn ngữ ở đầu trang, cạnh nút đổi theme. Lần đầu truy cập dùng tiếng Việt, không tự chuyển theo ngôn ngữ trình duyệt. Lựa chọn lưu trong trình duyệt và áp dụng ngay mà không tải lại, mất form hoặc đổi trang.

Giao diện có hai bản dịch riêng, gồm menu, nút, hướng dẫn, thông báo, nhãn hỗ trợ trình đọc màn hình và định dạng ngày. Tên nghệ sĩ, tên tác phẩm và nguồn ảnh giữ nguyên. Nội dung fan nhập (ghi chú, tên hiển thị, bài viết) không tự dịch.

## Cấu trúc đã triển khai

1. Viết kiểm thử cho mặc định tiếng Việt, chuyển ngôn ngữ, lưu lựa chọn và chế độ không truy cập được localStorage.
2. Tạo `src/i18n/language.js` làm nguồn trạng thái chung và bộ chọn ngôn ngữ có nhãn rõ ràng.
3. Thay chữ cố định trong các component bằng `t(tiengViet, english)`. Không dịch theo DOM, không dùng nội dung đã dịch làm khóa dữ liệu.
4. Tạo bảng dịch nội dung biên tập hiện có; chỉ dùng bảng này với dữ liệu biên tập, không áp dụng cho nội dung cá nhân.
5. Rà các trang nội dung và tài khoản độc lập, giữ nguyên hành vi xác thực và lưu dữ liệu.
6. Chạy kiểm thử, build, lint; kiểm tra trình duyệt cả hai ngôn ngữ và menu mobile.

## Quy ước cho người bảo trì

Các chuỗi mới cần có đủ hai bản. Hàm `t()` phải được gọi khi render hoặc xử lý sự kiện, tránh tính một lần bên ngoài component. Dữ liệu biên tập mới từ database cần được bổ sung vào bảng dịch trước khi xuất bản phiên bản song ngữ. Không thay đổi ID, URL hoặc dữ liệu người dùng khi chuyển ngôn ngữ.
