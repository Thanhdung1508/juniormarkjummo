# Backend Supabase — dữ liệu nào cần lưu?

## Trạng thái thực hiện

Đã tạo database PostgreSQL local **juniormark** tại **127.0.0.1:55432**, có 27 bảng public và 3 bảng private. Đã áp dụng migrations 001–005 và seed, bổ sung các mục còn thiếu từ Word: thông tin hồ sơ, social links, quẻ hằng ngày và phần thưởng Jummo. Xem [hướng dẫn kết nối](database-guide.md) và [danh mục trường](database-fields.md).

`npm run db:seed` tạo lại seed từ snapshot, không ghi đè nội dung đã chỉnh sửa; `npm run db:bundle` gộp bộ SQL cài mới cho Supabase thành `supabase/setup.sql`. `npm run test:db` có 38 kiểm tra đã qua. Auth/Storage local chỉ là schema tương thích; chưa chạy dịch vụ Supabase thật và chưa áp dụng migration lên cloud.

**UI chưa nối với catalog mới** ở mốc này: các mảng dữ liệu cũ vẫn đang được dùng. Các bảng lượt thích, bookmark, checklist và tiến độ đã có phân quyền nhưng cần nối thao tác giao diện. Không coi đây là backend đã hoàn tất tích hợp.

## Phân loại từ code hiện tại

| UI / dữ liệu | Nơi lưu | Lý do |
| --- | --- | --- |
| Tài khoản, mật khẩu, phiên | Supabase Auth | Không tạo bảng mật khẩu riêng |
| Tên fan | fan_profiles | Riêng từng tài khoản |
| Junior/Mark/Jummo, ảnh sân khấu, bio, ngày sinh, skills | artists | Một nguồn dùng cho màn chọn, modal, profile và countdown |
| Filmography, vai diễn, timeline | works + work_roles | Vai diễn liên kết nghệ sĩ, không tách chuỗi chữ trong UI |
| Gallery, video, credit, nguồn, chủ đề | media_items + media_artists | Metadata ở PostgreSQL, file ở Storage hoặc public asset có sẵn |
| Playlist/discography/voice memo | tracks | URL có thể trống khi chưa có bản thu; không giả trạng thái phát |
| Lịch | events | Ngày giờ có múi giờ, địa điểm, nguồn xác nhận; sinh nhật tính từ artists |
| Fan Projects | projects + project_entries | Tổng tiền tính từ bút toán công khai đã duyệt, không lưu thêm phần trăm |
| Highlights, lời nhắn Jummo, thư, facts, mood copy | editorial_entries | Nội dung biên tập thay đổi được, layout không lưu ở DB |
| Từ điển, checklist, câu hỏi quiz | glossary + checklist_items + quiz_questions | Nội dung quản trị được; quy tắc tính quiz để trong code |
| Gói tải | downloads | URL, tên, mô tả, loại tài nguyên; thiếu file thì không tạo link giả |
| Sao/nốt nhạc | fan_messages | Chờ duyệt, phân trang, giới hạn gửi tại DB |
| Lượt thích | message_likes | Khóa kép ngăn một người thích trùng; số lượng tính từ bảng |
| Ảnh đã lưu | media_bookmarks | Thuộc riêng từng fan |
| Checklist/thẻ kỷ niệm | user_checklist + fan_progress | Tiến độ riêng; thẻ là đồ lưu niệm không dùng làm phân quyền |
| Quyền nhân sự | private.staff | Không đọc từ user_metadata người dùng tự sửa |
| Lịch sử sửa nội dung/duyệt | private.audit_log | Chỉ admin đọc, trigger ghi tự động |
| Theme | localStorage | Sở thích theo thiết bị, chưa cần đồng bộ tài khoản |
| Bộ lọc, tab, carousel index, modal, âm lượng, zoom, Mưa Jummo, số lần chạm | React state | Trạng thái giao diện tạm thời |
| Màu sắc, font, CSS, icon, bố cục, route, kiểm tra biểu mẫu | Mã nguồn | Không biến database thành nơi lưu UI hoặc mã thực thi |
| Countdown, tuổi, phần trăm quỹ, số ảnh, số sao | Tính từ dữ liệu gốc | Tránh số liệu trùng bị lệch |
| Tweet nháp, lịch ICS, file thẻ xuất | Trình duyệt | Chỉ lưu DB khi có nhu cầu lịch sử, hiện chưa cần |

## Quyền

Khách chỉ đọc nội dung published, lời nhắn approved và thống kê công khai. Fan đọc/sửa dữ liệu của mình, gửi bài pending, thích bài đã duyệt. Editor quản lý nội dung; moderator duyệt lời nhắn; admin cấp quyền qua SQL Dashboard. Không nhúng service_role vào frontend. Chỉ RPC moderation được thay trạng thái bài, có audit.

## Chuyển đổi

Giữ migration 001/002 để tương thích bản trước. Migration 003 bổ sung catalog; 004 bổ sung cộng đồng/quyền/Storage. Seed sinh từ nội dung đang có, giữ trạng thái demo với sự kiện/quỹ mẫu. Dùng snapshot cục bộ chỉ khi chưa cấu hình; khi đã cấu hình mà lỗi tải phải báo lỗi, không tráo dữ liệu mẫu thành dữ liệu thật.

## Kiểm chứng

Chạy migration/seed trên PostgreSQL PGlite với auth/storage stub riêng cho test; kiểm tra RLS bằng SET ROLE và JWT sub. Đây không phải kiểm thử Supabase Auth/Storage qua mạng. Chưa có .env.local; chưa thay đổi cloud database.

Tham khảo: [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Database functions](https://supabase.com/docs/guides/database/functions), [Storage policies](https://supabase.com/docs/guides/storage/security/access-control).


## Cập nhật tài khoản ngày 22/09/2026

Đã áp dụng thêm `003_archive_items.sql` và `006_account_features.sql`. Trang `#/account` có hồ sơ, cài đặt, quyền riêng tư, nơi lưu trữ và ghi chú. Xem [account-features.md](account-features.md) để cấu hình Supabase và biết giới hạn kiểm thử. Catalog các trang nội dung vẫn chưa được nối toàn bộ.
