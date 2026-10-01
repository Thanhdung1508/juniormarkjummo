# Danh mục bảng và trường

## Bổ sung tài khoản — migration 006

`fan_profiles.bio`: text, tối đa 500 ký tự, giới thiệu cá nhân.

| Bảng | Trường | Ý nghĩa |
| --- | --- | --- |
| archive_items | user_id, kind, item_id, payload | Chủ tài khoản, loại nội dung, mã nội dung, thông tin hiển thị JSON; khóa kép ngăn lưu trùng |
| user_settings | user_id, show_country, updated_at | Chủ tài khoản, hiển thị quốc gia trên lời nhắn mới, thời điểm cập nhật |
| user_notes | id, user_id, title, body, created_at, updated_at | Mã ghi chú, chủ sở hữu, tiêu đề, nội dung, ngày tạo/sửa |

`archive_items.kind` nhận `memory`, `event`, `favorite`, `progress`, `photo`, `page`. Ghi chú/settings/archive áp dụng RLS riêng từng tài khoản. Danh mục máy đọc đầy đủ ở `database-schema.json` đã được xuất lại từ database local.

Xuất từ database `juniormark` trên PostgreSQL local. Tất cả tên dùng tiếng Anh; cột giải thích dùng tiếng Việt. Chỉ gồm schema nghiệp vụ `public` và schema nội bộ `private`.

Các quan hệ, quyền và giá trị CHECK xem trong `supabase/001_...sql` đến `005_...sql`. Bảng có `status` biên tập dùng `draft/published/archived`; riêng lời nhắn dùng `pending/approved/rejected`.

## private.audit_log

| Trường | Kiểu | Cho phép trống | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | `int8` | Không | Mã bản ghi |
| `actor_id` | `uuid` | Có | Tài khoản thực hiện thay đổi |
| `table_name` | `text` | Không | Tên bảng bị thay đổi |
| `action` | `text` | Không | Thao tác thêm/sửa/xóa |
| `record_id` | `text` | Có | Mã bản ghi bị thay đổi |
| `occurred_at` | `timestamptz` | Không | Thời điểm thay đổi |
| `before_data` | `jsonb` | Có | Dữ liệu trước thay đổi |
| `after_data` | `jsonb` | Có | Dữ liệu sau thay đổi |
## private.message_submissions

| Trường | Kiểu | Cho phép trống | Ý nghĩa |
| --- | --- | --- | --- |
| `user_id` | `uuid` | Không | Tài khoản sở hữu, liên kết auth.users |
| `submitted_at` | `timestamptz` | Không | Thời điểm gửi |
## private.staff

| Trường | Kiểu | Cho phép trống | Ý nghĩa |
| --- | --- | --- | --- |
| `user_id` | `uuid` | Không | Tài khoản sở hữu, liên kết auth.users |
| `role` | `text` | Không | Quyền admin/editor/moderator |
## public.artist_social_links

| Trường | Kiểu | Cho phép trống | Ý nghĩa |
| --- | --- | --- | --- |
| `artist_id` | `text` | Không | Nhân vật liên quan, liên kết artists |
| `platform` | `text` | Không | Nền tảng mạng xã hội |
| `url` | `asset_url` | Không | Đường dẫn nội dung |
## public.artists

| Trường | Kiểu | Cho phép trống | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | `text` | Không | Mã bản ghi |
| `name` | `text` | Không | Tên hiển thị |
| `kind` | `text` | Không | Loại bản ghi; giá trị được ràng buộc theo từng bảng |
| `birthday` | `date` | Có | Ngày sinh gốc để tính tuổi và lịch sinh nhật |
| `stage_image` | `asset_url` | Không | Ảnh nhân vật trên màn chọn profile |
| `portrait_image` | `asset_url` | Không | Ảnh chân dung |
| `label` | `text` | Không | Nhãn hiển thị |
| `color_label` | `text` | Không | Tên màu đại diện |
| `role_label` | `text` | Không | Mô tả vai trò nghệ sĩ |
| `bio` | `text` | Không | Tiểu sử |
| `stage_description` | `text` | Không | Đoạn giới thiệu trên màn chọn profile |
| `skills` | `_text` | Không | Danh sách kỹ năng |
| `source_url` | `asset_url` | Có | Nguồn tham khảo/xác nhận |
| `sort_order` | `int4` | Không | Thứ tự hiển thị |
| `status` | `publish_state` | Không | Trạng thái xuất bản/duyệt nội dung |
| `updated_at` | `timestamptz` | Không | Lần cập nhật gần nhất |
| `full_name_english` | `text` | Có | Họ tên đầy đủ bằng tiếng Anh |
| `full_name_thai` | `text` | Có | Họ tên đầy đủ bằng tiếng Thái |
| `nickname` | `text` | Có | Tên gọi thân mật |
## public.checklist_items

| Trường | Kiểu | Cho phép trống | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | `text` | Không | Mã bản ghi |
| `label` | `text` | Không | Nhãn hiển thị |
| `sort_order` | `int4` | Không | Thứ tự hiển thị |
| `status` | `publish_state` | Không | Trạng thái xuất bản/duyệt nội dung |
| `updated_at` | `timestamptz` | Không | Lần cập nhật gần nhất |
## public.downloads

| Trường | Kiểu | Cho phép trống | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | `text` | Không | Mã bản ghi |
| `title` | `text` | Không | Tiêu đề |
| `description` | `text` | Không | Mô tả |
| `url` | `asset_url` | Có | Đường dẫn nội dung |
| `kind` | `text` | Không | Loại bản ghi; giá trị được ràng buộc theo từng bảng |
| `credit` | `text` | Không | Tên tác giả/nguồn ảnh |
| `sort_order` | `int4` | Không | Thứ tự hiển thị |
| `status` | `publish_state` | Không | Trạng thái xuất bản/duyệt nội dung |
| `updated_at` | `timestamptz` | Không | Lần cập nhật gần nhất |
## public.editorial_entries

| Trường | Kiểu | Cho phép trống | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | `text` | Không | Mã bản ghi |
| `section` | `text` | Không | Khu vực nội dung biên tập |
| `title` | `text` | Không | Tiêu đề |
| `body` | `text` | Không | Nội dung văn bản |
| `image` | `asset_url` | Có | Đường dẫn hình minh họa |
| `subtitle` | `text` | Không | Dòng phụ dưới tiêu đề |
| `detail` | `text` | Không | Nội dung chi tiết |
| `tag` | `text` | Không | Nhãn hiển thị trên thẻ |
| `sort_order` | `int4` | Không | Thứ tự hiển thị |
| `status` | `publish_state` | Không | Trạng thái xuất bản/duyệt nội dung |
| `updated_at` | `timestamptz` | Không | Lần cập nhật gần nhất |
## public.events

| Trường | Kiểu | Cho phép trống | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | `text` | Không | Mã bản ghi |
| `title` | `text` | Không | Tiêu đề |
| `description` | `text` | Không | Mô tả |
| `starts_at` | `timestamptz` | Không | Thời điểm bắt đầu, có múi giờ |
| `ends_at` | `timestamptz` | Có | Thời điểm kết thúc, có múi giờ |
| `timezone` | `text` | Không | Múi giờ IANA của sự kiện |
| `all_day` | `bool` | Không | Sự kiện cả ngày hay có giờ cụ thể |
| `category` | `text` | Không | Nhóm sự kiện |
| `venue` | `text` | Có | Địa điểm |
| `image` | `asset_url` | Không | Đường dẫn hình minh họa |
| `source_url` | `asset_url` | Có | Nguồn tham khảo/xác nhận |
| `action_url` | `asset_url` | Có | Link hành động, ví dụ trang vé |
| `is_demo` | `bool` | Không | Đánh dấu dữ liệu minh họa |
| `event_status` | `text` | Không | scheduled/cancelled/postponed |
| `sort_order` | `int4` | Không | Thứ tự hiển thị |
| `status` | `publish_state` | Không | Trạng thái xuất bản/duyệt nội dung |
| `updated_at` | `timestamptz` | Không | Lần cập nhật gần nhất |
| `map_url` | `asset_url` | Có | Link bản đồ |
| `stream_url` | `asset_url` | Có | Link xem trực tiếp |
| `hashtags` | `_text` | Không | Danh sách hashtag |
| `created_at` | `timestamptz` | Không | Thời điểm tạo |
## public.fan_messages

| Trường | Kiểu | Cho phép trống | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | `uuid` | Không | Mã bản ghi |
| `user_id` | `uuid` | Không | Tài khoản sở hữu, liên kết auth.users |
| `kind` | `text` | Không | Loại bản ghi; giá trị được ràng buộc theo từng bảng |
| `name` | `text` | Không | Tên hiển thị |
| `country` | `text` | Không | Quốc gia/khu vực do fan nhập |
| `body` | `text` | Không | Nội dung văn bản |
| `spectrum` | `text` | Không | Nhân vật được chọn: junior/mark/jummo |
| `status` | `text` | Không | Trạng thái xuất bản/duyệt nội dung |
| `created_at` | `timestamptz` | Không | Thời điểm tạo |
| `country_code` | `text` | Không | Mã quốc gia hai chữ hoặc GLOBAL |
| `position_x` | `numeric` | Không | Tọa độ ngang ngôi sao, từ 0 đến 100 |
| `position_y` | `numeric` | Không | Tọa độ dọc ngôi sao, từ 0 đến 100 |
## public.fan_profiles

| Trường | Kiểu | Cho phép trống | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | `uuid` | Không | Mã bản ghi |
| `display_name` | `text` | Không | Tên hiển thị của fan |
| `created_at` | `timestamptz` | Không | Thời điểm tạo |
| `avatar_url` | `asset_url` | Có | Ảnh đại diện fan |
## public.fan_progress

| Trường | Kiểu | Cho phép trống | Ý nghĩa |
| --- | --- | --- | --- |
| `user_id` | `uuid` | Không | Tài khoản sở hữu, liên kết auth.users |
| `kind` | `text` | Không | Loại bản ghi; giá trị được ràng buộc theo từng bảng |
| `data` | `jsonb` | Không | Kết quả quiz/thẻ kỷ niệm dạng JSON, tối đa 4096 byte |
| `updated_at` | `timestamptz` | Không | Lần cập nhật gần nhất |
## public.glossary

| Trường | Kiểu | Cho phép trống | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | `text` | Không | Mã bản ghi |
| `title` | `text` | Không | Tiêu đề |
| `body` | `text` | Không | Nội dung văn bản |
| `sort_order` | `int4` | Không | Thứ tự hiển thị |
| `status` | `publish_state` | Không | Trạng thái xuất bản/duyệt nội dung |
| `updated_at` | `timestamptz` | Không | Lần cập nhật gần nhất |
## public.jummo_daily_logs

| Trường | Kiểu | Cho phép trống | Ý nghĩa |
| --- | --- | --- | --- |
| `user_id` | `uuid` | Không | Tài khoản sở hữu, liên kết auth.users |
| `fortune_id` | `uuid` | Không | Quẻ đã nhận, liên kết jummo_fortunes |
| `claimed_date` | `date` | Không | Ngày nhận quẻ theo giờ Việt Nam |
| `created_at` | `timestamptz` | Không | Thời điểm tạo |
## public.jummo_fortunes

| Trường | Kiểu | Cho phép trống | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | `uuid` | Không | Mã bản ghi |
| `quote_text` | `text` | Không | Nội dung lời nhắn may mắn |
| `author_type` | `text` | Không | Nhân vật đại diện cho quẻ |
| `background_url` | `asset_url` | Có | Hình nền của quẻ |
| `status` | `publish_state` | Không | Trạng thái xuất bản/duyệt nội dung |
| `sort_order` | `int4` | Không | Thứ tự hiển thị |
| `created_at` | `timestamptz` | Không | Thời điểm tạo |
| `updated_at` | `timestamptz` | Không | Lần cập nhật gần nhất |
## public.jummo_secret_rewards

| Trường | Kiểu | Cho phép trống | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | `uuid` | Không | Mã bản ghi |
| `title` | `text` | Không | Tiêu đề |
| `reward_type` | `text` | Không | Loại quà: letter/video/wallpaper/sticker |
| `body` | `text` | Không | Nội dung văn bản |
| `content_url` | `asset_url` | Có | Link tài nguyên phần thưởng |
| `status` | `publish_state` | Không | Trạng thái xuất bản/duyệt nội dung |
| `sort_order` | `int4` | Không | Thứ tự hiển thị |
| `created_at` | `timestamptz` | Không | Thời điểm tạo |
| `updated_at` | `timestamptz` | Không | Lần cập nhật gần nhất |
## public.media_artists

| Trường | Kiểu | Cho phép trống | Ý nghĩa |
| --- | --- | --- | --- |
| `media_id` | `text` | Không | Ảnh/video liên quan, liên kết media_items |
| `artist_id` | `text` | Không | Nhân vật liên quan, liên kết artists |
## public.media_bookmarks

| Trường | Kiểu | Cho phép trống | Ý nghĩa |
| --- | --- | --- | --- |
| `user_id` | `uuid` | Không | Tài khoản sở hữu, liên kết auth.users |
| `media_id` | `text` | Không | Ảnh/video liên quan, liên kết media_items |
| `created_at` | `timestamptz` | Không | Thời điểm tạo |
## public.media_items

| Trường | Kiểu | Cho phép trống | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | `text` | Không | Mã bản ghi |
| `title` | `text` | Không | Tiêu đề |
| `alt` | `text` | Không | Mô tả ảnh cho trình đọc màn hình |
| `kind` | `text` | Không | Loại bản ghi; giá trị được ràng buộc theo từng bảng |
| `url` | `asset_url` | Không | Đường dẫn nội dung |
| `thumbnail_url` | `asset_url` | Có | Ảnh thu nhỏ |
| `file_name` | `text` | Không | Tên file |
| `credit` | `text` | Không | Tên tác giả/nguồn ảnh |
| `source_url` | `asset_url` | Có | Nguồn tham khảo/xác nhận |
| `topic` | `text` | Không | Chủ đề lọc ảnh |
| `tag` | `text` | Không | Nhãn hiển thị trên thẻ |
| `captured_at` | `date` | Có | Ngày chụp/ghi hình nếu đã biết |
| `position` | `text` | Không | Vị trí căn ảnh trong khung CSS |
| `downloadable` | `bool` | Không | Có cho phép hiện nút tải không |
| `sort_order` | `int4` | Không | Thứ tự hiển thị |
| `status` | `publish_state` | Không | Trạng thái xuất bản/duyệt nội dung |
| `updated_at` | `timestamptz` | Không | Lần cập nhật gần nhất |
| `tags` | `_text` | Không | Danh sách nhãn tìm kiếm |
| `view_count` | `int8` | Không | Số lượt xem do server/editor xác nhận; chưa nối UI |
| `created_at` | `timestamptz` | Không | Thời điểm tạo |
## public.message_likes

| Trường | Kiểu | Cho phép trống | Ý nghĩa |
| --- | --- | --- | --- |
| `user_id` | `uuid` | Không | Tài khoản sở hữu, liên kết auth.users |
| `message_id` | `uuid` | Không | Lời nhắn được thích |
| `created_at` | `timestamptz` | Không | Thời điểm tạo |
## public.project_entries

| Trường | Kiểu | Cho phép trống | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | `uuid` | Không | Mã bản ghi |
| `project_id` | `text` | Không | Dự án nhận bút toán |
| `amount` | `int8` | Không | Số tiền bút toán; số âm là điều chỉnh giảm |
| `entry_date` | `date` | Không | Ngày ghi nhận bút toán |
| `note` | `text` | Không | Ghi chú công khai cho bút toán |
| `evidence_url` | `asset_url` | Có | Link chứng từ công khai |
| `status` | `publish_state` | Không | Trạng thái xuất bản/duyệt nội dung |
| `updated_at` | `timestamptz` | Không | Lần cập nhật gần nhất |
| `sort_order` | `int4` | Không | Thứ tự hiển thị |
## public.projects

| Trường | Kiểu | Cho phép trống | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | `text` | Không | Mã bản ghi |
| `title` | `text` | Không | Tiêu đề |
| `description` | `text` | Không | Mô tả |
| `image` | `asset_url` | Không | Đường dẫn hình minh họa |
| `goal_amount` | `int8` | Không | Mục tiêu gây quỹ |
| `currency` | `text` | Không | Đơn vị tiền tệ, hiện là VND |
| `source_url` | `asset_url` | Có | Nguồn tham khảo/xác nhận |
| `is_demo` | `bool` | Không | Đánh dấu dữ liệu minh họa |
| `sort_order` | `int4` | Không | Thứ tự hiển thị |
| `status` | `publish_state` | Không | Trạng thái xuất bản/duyệt nội dung |
| `updated_at` | `timestamptz` | Không | Lần cập nhật gần nhất |
## public.quiz_questions

| Trường | Kiểu | Cho phép trống | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | `text` | Không | Mã bản ghi |
| `prompt` | `text` | Không | Câu hỏi quiz |
| `solar_choice` | `text` | Không | Lựa chọn tương ứng Junior |
| `lunar_choice` | `text` | Không | Lựa chọn tương ứng Mark |
| `jummo_choice` | `text` | Không | Lựa chọn tương ứng Jummo |
| `sort_order` | `int4` | Không | Thứ tự hiển thị |
| `status` | `publish_state` | Không | Trạng thái xuất bản/duyệt nội dung |
| `updated_at` | `timestamptz` | Không | Lần cập nhật gần nhất |
## public.tracks

| Trường | Kiểu | Cho phép trống | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | `text` | Không | Mã bản ghi |
| `title` | `text` | Không | Tiêu đề |
| `subtitle` | `text` | Không | Dòng phụ dưới tiêu đề |
| `audio_url` | `asset_url` | Có | Link file âm thanh; trống nếu chưa có |
| `artist_id` | `text` | Có | Nhân vật liên quan, liên kết artists |
| `work_id` | `text` | Có | Tác phẩm liên quan |
| `kind` | `text` | Không | Loại bản ghi; giá trị được ràng buộc theo từng bảng |
| `source_url` | `asset_url` | Có | Nguồn tham khảo/xác nhận |
| `sort_order` | `int4` | Không | Thứ tự hiển thị |
| `status` | `publish_state` | Không | Trạng thái xuất bản/duyệt nội dung |
| `updated_at` | `timestamptz` | Không | Lần cập nhật gần nhất |
## public.user_checklist

| Trường | Kiểu | Cho phép trống | Ý nghĩa |
| --- | --- | --- | --- |
| `user_id` | `uuid` | Không | Tài khoản sở hữu, liên kết auth.users |
| `item_id` | `text` | Không | Mục checklist đã hoàn thành |
| `completed_at` | `timestamptz` | Không | Thời điểm hoàn thành |
## public.work_roles

| Trường | Kiểu | Cho phép trống | Ý nghĩa |
| --- | --- | --- | --- |
| `work_id` | `text` | Không | Tác phẩm liên quan |
| `artist_id` | `text` | Không | Nhân vật liên quan, liên kết artists |
| `role_name` | `text` | Không | Tên vai diễn |
## public.works

| Trường | Kiểu | Cho phép trống | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | `text` | Không | Mã bản ghi |
| `title` | `text` | Không | Tiêu đề |
| `era_label` | `text` | Không | Nhãn giai đoạn trên timeline |
| `year_label` | `text` | Không | Năm/giai đoạn hiển thị |
| `kind` | `text` | Không | Loại bản ghi; giá trị được ràng buộc theo từng bảng |
| `description` | `text` | Không | Mô tả |
| `image` | `asset_url` | Không | Đường dẫn hình minh họa |
| `source_url` | `asset_url` | Có | Nguồn tham khảo/xác nhận |
| `sort_order` | `int4` | Không | Thứ tự hiển thị |
| `status` | `publish_state` | Không | Trạng thái xuất bản/duyệt nội dung |
| `updated_at` | `timestamptz` | Không | Lần cập nhật gần nhất |
