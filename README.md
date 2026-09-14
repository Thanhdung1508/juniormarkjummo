# JuniorMark — The Celestial Record Store

Giao diện React + Vite dựa trên frame **Studio Home (2007:2)** trong Figma được cung cấp. Chức năng tài khoản dùng **Supabase Auth**, hồ sơ lưu trong **PostgreSQL của Supabase**. Không dùng Firebase.

## 1. Chạy giao diện trước

Yêu cầu Node.js đáp ứng Vite 8 (khuyến nghị Node 22.12+ hoặc Node 24 LTS) và npm.

```powershell
npm install
npm run dev
```

Mở địa chỉ hiển thị trong terminal, thường là `http://localhost:5173`.

Không cần Supabase để xem giao diện. Khi chưa cấu hình, biểu mẫu vẫn mở nhưng nút gửi bị khóa và có thông báo rõ ràng; không tạo tài khoản/session giả.

## 2. Những phần đã có

- Header, hai ảnh hero, mâm đĩa theo bố cục thiết kế.
- Logo người dùng cung cấp trên header và favicon. Thư viện gồm 14 ảnh người dùng gửi và 2 ảnh bổ sung từ GMMTV; mở từng ảnh để xem credit/nguồn nếu có. Trên điện thoại, hai ảnh hero xếp dọc để giữ cả hai gương mặt.
- Nút **Warm Midnight Glow tại footer** (Figma node 2007:467): đổi toàn trang và dialog giữa navy tối và kem/be ấm. Lựa chọn được ghi nhớ sau khi tải lại; vẫn đổi được nếu trình duyệt chặn lưu trữ.
- Đếm ngược sinh nhật Junior/Mark theo UTC+7, chúc mừng trong ngày sinh nhật, xuất file lịch `.ics` lặp hàng năm.
- Jummo đổi lời chào theo tâm trạng; gallery mở ảnh lớn; thẻ nội dung mở phần giới thiệu; timeline cơ bản.
- Đăng ký, đăng nhập, đăng xuất trên thiết bị hiện tại; kiểm tra biểu mẫu, ẩn/hiện mật khẩu, chờ gửi, thông báo lỗi và xác nhận email.
- Khôi phục session khi tải lại và đọc hồ sơ riêng từ database.
- Responsive, menu điện thoại, focus trong dialog, phím Escape, hỗ trợ reduced-motion.

## 3. Tạo Supabase

1. Truy cập https://supabase.com/dashboard và tạo một project. Chọn vùng gần người dùng, lưu mật khẩu database ở nơi riêng của bạn.
2. Vào **SQL Editor**, tạo truy vấn, dán nội dung `supabase/001_fan_profiles.sql`, rồi chạy **một lần** trên project mới. Migration chạy trong transaction; nếu xảy ra lỗi, xử lý lỗi trước khi chạy lại.
3. Trong **Authentication**, bật đăng ký bằng **Email**. Nên bật **Confirm email** và đặt độ dài mật khẩu tối thiểu 8 ký tự để khớp biểu mẫu.
4. Tìm **Project URL** và **Publishable key** trong cài đặt API/Connect của project. Legacy `anon` key cũng dùng được. Không dùng `service_role`, `sb_secret_...` hoặc mật khẩu database trong frontend.
5. Tạo file `.env.local` tại thư mục gốc bằng cách sao chép `.env.example`:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

6. Trong **Authentication → URL Configuration**, đặt Site URL theo địa chỉ bạn dùng khi chạy, ví dụ `http://localhost:5173`. Thêm redirect URL đó, và `http://127.0.0.1:5173` nếu dùng bản preview tại địa chỉ này. Khi triển khai, thay/thêm domain HTTPS thật của website.
7. Dừng rồi chạy lại `npm run dev` để Vite nạp biến môi trường mới.

Tên mục trong dashboard có thể thay đổi; đối chiếu [tài liệu Supabase React](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs), [quản lý user](https://supabase.com/docs/guides/auth/managing-user-data) và [redirect URL](https://supabase.com/docs/guides/auth/redirect-urls).

**Email production:** cấu hình SMTP riêng trước khi mở cho fan thật. Dịch vụ email mặc định của Supabase có giới hạn và có thể chỉ gửi đến địa chỉ được cho phép trong tổ chức. Xem [SMTP](https://supabase.com/docs/guides/auth/auth-smtp).

## 4. Kiểm tra tài khoản sau khi cấu hình

1. Mở **Đăng nhập → Đăng ký ngay**, nhập tên, email thật của bạn, mật khẩu và xác nhận mật khẩu.
2. Nếu bật Confirm email: kiểm tra thư, bấm xác nhận, sau đó quay lại trang/đăng nhập. Trạng thái chờ xác nhận không được xem là đã đăng nhập.
3. Khi đã đăng nhập, header hiện **Tài khoản**. Mở ra để xem tên và email.
4. Tải lại trang: tài khoản vẫn được khôi phục.
5. Trong Supabase, kiểm tra `Authentication → Users` và bảng `public.fan_profiles` có cùng UUID. Hồ sơ được tạo bằng trigger trong transaction đăng ký.
6. Bấm **Đăng xuất**: header trở về Đăng nhập; tải lại vẫn ở trạng thái khách.
7. Kiểm tra phân quyền bằng hai tài khoản thử nghiệm: mỗi người chỉ đọc/sửa được `display_name` của hồ sơ chính mình. Khách chưa đăng nhập không đọc được bảng. SQL Editor thường chạy với quyền quản trị nên không dùng kết quả ở đó để kết luận RLS đang chặn người dùng.

Trình duyệt không lưu mật khẩu do ứng dụng tự viết. Supabase SDK tự quản lý token phiên đăng nhập; token là thông tin nhạy cảm, không log hoặc chia sẻ token.

## 5. Đọc mã theo thứ tự

| File | Vai trò |
| --- | --- |
| `src/index.css` | Bảng màu chung; theme sáng ở `:root[data-theme='light']` |
| `src/App.css` | CSS chia mục 1–9, có phần responsive |
| `src/App.jsx` | Ghép trang chủ, mở dialog và thao tác đăng xuất |
| `src/components/Header.jsx` | Header/menu điện thoại/tài khoản |
| `src/components/Hero.jsx` | Hai ảnh và tiêu đề đầu trang |
| `src/components/RecordPlayer.jsx` | Mâm đĩa, danh sách bản thu, điều khiển audio |
| `src/components/Birthdays.jsx` | Đếm ngược và tải lịch |
| `src/components/Jummo.jsx` | Lời chào và chọn tâm trạng |
| `src/components/Highlights.jsx` | Nội dung biên tập mẫu |
| `src/components/Gallery.jsx` | Bộ ảnh, mở lightbox |
| `src/lib/photos.js` | Danh sách 16 ảnh, vị trí thumbnail và nguồn ảnh |
| `src/components/Footer.jsx` | Footer và vị trí nút theme gốc |
| `src/components/ThemeToggle.jsx` | Đổi theme, lưu lựa chọn, đồng bộ giữa tab |
| `src/components/Dialog.jsx` | Hộp thoại native, focus và Escape |
| `src/features/auth/AuthDialog.jsx` | Biểu mẫu đăng nhập/đăng ký |
| `src/features/auth/AuthProvider.jsx` | Gọi SDK Supabase, quản lý session và tải hồ sơ |
| `src/features/auth/authContext.js` | Context dùng chung cho tài khoản |
| `src/lib/supabase.js` | Khởi tạo kết nối từ `.env.local` |
| `src/lib/helpers.js` | Validation, thông báo lỗi, ngày sinh nhật |
| `supabase/001_fan_profiles.sql` | Bảng hồ sơ, trigger, quyền cột và RLS |

## 6. Giới hạn hiện tại

- Chưa kết nối project Supabase thật vì bạn chưa tạo project. Migration được chuẩn bị nhưng **chưa chạy trên dịch vụ của bạn**. Kiểm thử SDK trong máy dùng phản hồi giả ở ranh giới network, không thay thế kiểm thử đăng ký/email thật.
- Playlist giữ các tên bản thu trong thiết kế dưới dạng minh họa. Chưa có audio được cung cấp nên nút phát đang khóa, thời lượng hiển thị `--:--`. Khi có bản thu phù hợp, điền `audioSrc` trong `RecordPlayer.jsx`; không tự bịa thời lượng/trạng thái đang phát.
- Highlights/gallery đang là nội dung tĩnh, không phải tin tức đồng bộ. Metadata sự kiện tương lai trong mẫu không được coi là lịch phát hành đã xác minh.
- Các trang đã được bổ sung như danh sách bên dưới. Chưa có trang admin; quản trị viên duyệt lời nhắn trực tiếp trong Supabase Dashboard. Lịch sự kiện, quỹ, fancam, bản thu, bộ sticker/photobook chưa có dữ liệu thật được ghi rõ trên giao diện, không tạo giao dịch hoặc file tải giả.
- Logo và 14 ảnh gốc do người dùng cung cấp; mascot/icon lấy từ thiết kế tham khảo. Hai ảnh bổ sung có liên kết bài đăng GMMTV trong `src/lib/photos.js`. Giữ nguyên file gốc và watermark; credit không đồng nghĩa với quyền xuất bản. Font tải qua Google Fonts, có font hệ thống dự phòng khi mất mạng.
- Chưa triển khai lên hosting; bản xem trước chạy trên máy hiện tại.

## 7. Kiểm tra trước khi bàn giao

```powershell
npm test
npm run lint
npm run build
```

Bộ kiểm thử kiểm tra ngày biên sinh nhật, validation, ghi nhớ theme, luồng biểu mẫu và vòng đời session/hồ sơ. Thông tin kiểm tra trình duyệt được lưu tại `docs/verification.md`.

## 8. Các trang bổ sung — đọc và chạy lần lượt

| Đường dẫn sau địa chỉ website | Mã nguồn | Chức năng |
| --- | --- | --- |
| `#/profiles` | `src/pages/CharacterStage.jsx`, `ProfileDossier.jsx` | Chọn Junior/Mark/Jummo bằng ảnh, mũi tên hoặc chấm; Discover mở modal; Overview/Filmography/Discography; đóng giữ nhân vật đang chọn |
| `#/profiles/junior`, `#/profiles/mark` | `src/pages/Profiles.jsx` | Hồ sơ dài, Sun/Moon, voice memo chờ bản thu, hành trình |
| `#/timeline` | `src/pages/Timeline.jsx` | Bốn cột mốc, nội dung và ảnh đổi theo lựa chọn |
| `#/media` | `src/pages/MediaHub.jsx` | Tìm không dấu, lọc nhân vật/chủ đề, sắp xếp, xem/tải ảnh gốc |
| `#/schedule` | `src/pages/Schedule.jsx` | Lịch tháng/danh sách, đổi tháng, lọc và xuất ICS; bật riêng lịch mẫu |
| `#/sky`, `#/wall` | `src/pages/Community.jsx` | Sao/nốt nhạc, bộ lọc, form có kiểm tra, âm tổng hợp, chế độ local hoặc Supabase |
| `#/jummo` | `src/pages/JummoWorld.jsx` | Chọn mood, Mưa Jummo, chạm 5 lần mở thư biên tập, tải mascot, quiz |
| `#/projects` | `src/pages/Projects.jsx` | Tracker mẫu, từ điển tìm kiếm, checklist, soạn/sao chép lời cổ vũ, thẻ Baby Fan |

Các component dùng chung nằm ở `src/pages/shared.jsx`; CSS dùng lại biến màu trong `src/pages/Pages.css`. Logic tìm kiếm, lịch, quiz, tải file và nốt nhạc nằm ở `src/lib/archive.js`. Hash routing hỗ trợ mở thẳng và tải lại trên static hosting.

### Kết nối lời nhắn Supabase

1. Chạy `supabase/002_fan_messages.sql` sau migration 001, một lần trên project mới.
2. Khi chưa có cấu hình, nội dung chỉ lưu tại localStorage với khóa `jm-demo-star` và `jm-demo-note`. Đây không phải dữ liệu công khai và không tự chuyển sang Supabase.
3. Khi đã cấu hình, người dùng đăng nhập mới được gửi. Client chỉ gửi tên, địa điểm, nội dung và bản sắc; trạng thái mặc định `pending`.
4. Quản trị viên đọc nội dung trong Table Editor rồi đổi `status` thành `approved` hoặc `rejected`. Trình duyệt không có quyền tự duyệt/sửa trạng thái. Bài đã duyệt hiện khi mở lại trang.
5. Không công khai UUID người gửi qua truy vấn frontend; chỉ đọc các cột phục vụ hiển thị. Các chỉ số trên UI đếm tập lời nhắn tải về (tối đa 100), không phải toàn bộ thống kê hệ thống.

### Nội dung tham khảo

Hai ảnh tách nền trong màn chọn được lấy từ file Figma gốc. Bố cục hộp thoại theo hai ảnh quy trình người dùng gửi thêm. Không sao chép tên thật/ngày sinh không nhất quán trong mockup. Fan Projects được dựng từ metadata Figma và nội dung dán vì Figma đã đạt giới hạn đọc trước khi lấy được context từng phần; cần đối chiếu hình chi tiết khi công cụ khả dụng trở lại.
