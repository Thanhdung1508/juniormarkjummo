# Kết quả kiểm tra — 14/09/2026

## Tự động

- `npm test`: 4 file, 20 kiểm thử đạt. Bao gồm validation, ngày biên sinh nhật, theme, biểu mẫu đăng nhập/đăng ký, khôi phục session, phản hồi hồ sơ cũ, đăng xuất thành công/thất bại và cleanup subscription.
- `npm run lint`: thành công, không có chẩn đoán lỗi.
- `npm run build`: thành công.

## Trình duyệt

- Xem giao diện tối trên desktop 1280px và sáng kem/be trên điện thoại. Theme đổi bằng nút tại footer, lưu sau tải lại.
- Kiểm tra tại 320px: chiều rộng nội dung và vùng hiển thị đều 305px (15px còn lại là thanh cuộn), không tràn ngang. Hai ảnh hero xếp dọc để thấy cả hai người.
- Menu điện thoại mở/đóng và điều hướng; dialog mở/đóng bằng nút và Escape; biểu mẫu chuyển đăng nhập/đăng ký, báo thiếu cấu hình và khóa gửi.
- Logo mới tải được. Gallery mở rộng đủ 16 ảnh, thu gọn được; ảnh GMMTV mở lightbox cùng liên kết bài gốc. Không phát hiện ảnh tải lỗi trong lần kiểm tra.
- Jummo đổi lời nhắn theo tâm trạng.

## Giới hạn

Chưa có project Supabase: chưa chạy SQL, chưa kiểm tra email xác nhận, đăng ký/đăng nhập hoặc RLS trên dịch vụ thật. Kiểm thử Auth dùng mock tại ranh giới SDK. Các bước kiểm tra dịch vụ thật được ghi trong README.

Chưa có file audio nên nút phát bị khóa; chưa kiểm tra phát nhạc thật. Chưa deploy hosting.

## Bổ sung các trang đầy đủ (cùng ngày)

- 8 file kiểm thử, 29 kiểm thử đạt. Bổ sung tìm không dấu, lịch tháng nhuận, ICS qua năm mới, validation lời nhắn, lưu/khôi phục demo, chấm quiz và hồi quy skip link.
- Luồng quan trọng đã kiểm thử: chọn Junior → Discover → modal Overview → Filmography → phím mũi tên sang Discography → đóng → giữ Junior và trả focus nút Discover.
- Browser desktop 1280px: modal dùng đúng ảnh tách nền từ `.fig`; Filmography đổi đúng nội dung. Media tìm “sunshine” trả một ảnh. Lịch tháng 9/2026 có 35 ô.
- Browser mobile 320px: cả Profiles, Timeline, Media, Schedule, Sky, Jummo và Projects có scrollWidth bằng clientWidth (305px), không phát hiện ảnh lỗi. Đã điều chỉnh vùng bấm nhân vật phụ để không chồng vào nhân vật giữa.
- Modal Mark ở theme sáng ấm: mở đúng nhân vật, chiều rộng nội dung bằng chiều rộng cuộn 284px, không tràn ngang. Jummo chạm 5 lần mở đúng thư biên tập.
- Rà soát độc lập phát hiện lỗi skip link và chấm quiz; đã sửa và thêm kiểm thử hồi quy. Lint không còn cảnh báo, build thành công sau định dạng mã.
- Migration 002 chưa chạy trên Supabase thật. Nguồn media chưa cung cấp được hiển thị là chưa có; quỹ/lịch mẫu không được coi là dữ liệu thật. Figma đạt giới hạn đọc trước khi trả context chi tiết Fan Projects; bố cục trang đó cần đối chiếu thêm khi có thể đọc lại.
