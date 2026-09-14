# Bổ sung toàn bộ các trang theo Figma

**Goal:** Hoàn thiện các trang còn thiếu đã được người dùng xác nhận, thực hiện tuần tự.
**Architecture:** Giữ React/Vite, routing bằng hash để dùng được trên static hosting. Dùng chung Header/Footer/Auth/Dialog/theme; mỗi trang một component. Không đưa dữ liệu minh họa thành tin tức, số liệu hoặc quyên góp thật.
**Tech Stack:** React, CSS, Supabase, Vitest.
**Spec:** Figma kEYJptrmnlQkjVKqAbIdof và pasted-text do người dùng gửi. Frames: Profiles 2007:2377, Timeline 2007:527, Media 2007:2888, Schedule 2007:3505, Sky 2007:1882, Jummo 2007:1477, Projects 2007:3906, Wall 2007:941. Đã đọc context/screenshot; Projects chỉ nhận metadata do giới hạn Figma.

- [x] Routing đầy đủ, back/forward, active menu và liên kết từ Studio.
- [x] Profiles: chọn nhân vật, hồ sơ, Sun/Moon, voice memo có trạng thái thiếu bản thu, hành trình.
- [x] Timeline: chọn mốc, panel ký ức và bộ ảnh liên quan.
- [x] Media: tìm kiếm, lọc, sort, xem ảnh, tải ảnh gốc, video có nguồn.
- [x] Schedule: list/calendar, đổi tháng, lọc, ICS. Lịch mẫu phân biệt rõ.
- [x] Sky + Wall: lọc, tương tác sao/nốt nhạc, form có validation, Supabase pending moderation; demo cục bộ khi chưa cấu hình.
- [x] Jummo: mood, hiệu ứng, 5 lần chạm mở thư biên tập, tải mascot, quiz/thẻ.
- [x] Projects: tracker minh họa, cẩm nang tìm kiếm, hướng dẫn vote/stream có nguồn, checklist và chứng nhận lưu cục bộ.
- [x] Test logic/filter/calendar/form; lint/build; browser desktop/mobile cả hai theme; README và SQL mở rộng.

Không gửi bài lên X, không nhận tiền hay ghi danh sự kiện thật. Dữ liệu dịch vụ thật chỉ hoạt động sau cấu hình. Nội dung mẫu không được gán thành lời nói thật của nghệ sĩ. Giữ nguyên các ảnh đã cung cấp.

Bổ sung theo ảnh người dùng gửi: Profiles bắt đầu bằng màn chọn ba nhân vật, Discover mở modal ba tab; dùng ảnh tách nền gốc 34.png/8.png. Dữ liệu/file thật chưa có được ghi rõ trong README và giao diện.

