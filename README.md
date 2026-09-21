JuniorMark — The Celestial Record Store

Giao diện React + Vite phát triển từ frame Studio Home (2007:2) trong Figma. Website được mở rộng theo hướng Celestial Archive: lưu trữ hành trình JuniorMark, media, lịch, cộng đồng fandom và các tương tác cùng Jummo.

Phần cấu hình tài khoản/backend do maintainer của repository quản lý. README này tập trung vào giao diện, trải nghiệm và các chức năng phía client.

1. Chạy giao diện

Yêu cầu Node.js đáp ứng Vite 8 (khuyến nghị Node 22.12+ hoặc Node 24 LTS) và npm.

npm install
npm run dev

Mở địa chỉ hiển thị trong terminal, thường là http://localhost:5173.

2. Những phần đã có
   Header được gom thành bốn khu chính: Studio, Archive, Orbit, Community; giữ Jummo, tài khoản và theme ở khu tiện ích.
   Trang Studio giữ hai ảnh hero và mâm đĩa theo thiết kế, đồng thời bổ sung Living Dashboard với số liệu archive, sinh nhật gần nhất, Memory of the Day, tiến độ khám phá và gợi ý từ Jummo.
   Hệ thống shared memories dùng chung dữ liệu hành trình cho Timeline, Profiles và Media.
   Constellation of Memories hiển thị các cột mốc theo dạng chòm sao kết nối; hỗ trợ hover/focus preview, điều hướng bàn phím, mở memory và lưu tiến độ đã khám phá.
   Profiles có màn chọn Junior / Mark / Jummo bằng ảnh, mũi tên hoặc chấm; Discover mở dossier nhanh, đồng thời liên kết tới hồ sơ đầy đủ và memory liên quan.
   Media Hub hỗ trợ tìm kiếm không dấu, lọc nhân vật/chủ đề/era/nguồn, sắp xếp, xem ảnh lớn, tải ảnh gốc và liên kết sang memory/profile.
   Schedule hỗ trợ lịch tháng/danh sách trên desktop và agenda trên mobile, đổi tháng/năm, lọc và xuất file .ics; dữ liệu demo hoặc chưa xác minh luôn được ghi nhãn rõ.
   Fan Hub gom Fan Projects, New Fan Guide, Support Guide và Celestial Pass. Các project mẫu không thực hiện giao dịch hoặc nhận quyên góp.
   My Orbit lưu memories, events, favorites, tiến độ khám phá và badges; dữ liệu guest có thể lưu cục bộ trên trình duyệt.
   Jummo Companion đưa gợi ý theo từng khu vực của website. Jummo World có mood GIF, Jummo Rain, secret letter, goodies và quiz.
   Community Galaxy hiển thị lời nhắn fandom dưới dạng các vì sao có vị trí ổn định; hỗ trợ filter, zoom, danh sách đọc dễ hơn và favorite.
   Wall of Melody lưu lời nhắn dạng nốt nhạc và sử dụng âm thanh tổng hợp cho tương tác.
   Quiz, Baby Fan Pass, My Orbit và Memory hỗ trợ xuất shareable PNG card; có text fallback khi trình duyệt không render Canvas.
   Nút đổi theme chuyển giao diện giữa navy tối và kem/be ấm; lựa chọn được ghi nhớ sau khi tải lại.
   Đếm ngược sinh nhật Junior/Mark theo UTC+7, chúc mừng trong ngày sinh nhật và xuất file lịch .ics.
   Responsive, menu điện thoại, skip link, keyboard navigation, focus trong dialog, phím Escape và prefers-reduced-motion được hỗ trợ.
3. Đọc mã theo thứ tự
   File	Vai trò
   src/index.css	Bảng màu chung và theme sáng/tối
   src/App.css	CSS chính của Studio và các component nền
   src/App.jsx	Ghép layout, route, dialog và các khu chính
   src/components/Header.jsx	Header, navigation, menu điện thoại và utility actions
   src/components/Hero.jsx	Hai ảnh và tiêu đề đầu trang
   src/components/RecordPlayer.jsx	Mâm đĩa, playlist và điều khiển audio
   src/components/Birthdays.jsx	Đếm ngược sinh nhật và tải lịch
   src/components/Jummo.jsx	Jummo trên Studio
   src/components/Gallery.jsx	Bộ ảnh và lightbox
   src/components/ThemeToggle.jsx	Đổi theme và ghi nhớ lựa chọn
   src/components/Dialog.jsx	Dialog, focus và Escape
   src/data/memories.js	Nguồn dữ liệu chung cho memory và era
   src/pages/journeyData.js	Dữ liệu hành trình dẫn xuất từ memories
   src/pages/shared.jsx	Component dùng chung cho các trang archive
   src/pages/Pages.css	Visual system, responsive và layout trang mở rộng
   src/pages/CharacterStage.jsx	Chọn Junior / Mark / Jummo
   src/pages/ProfileDossier.jsx	Dossier nhanh trong modal
   src/pages/Profiles.jsx	Hồ sơ dài và hành trình
   src/pages/Timeline.jsx	Constellation of Memories
   src/pages/MediaHub.jsx	Visual Archive
   src/pages/Schedule.jsx	Lịch desktop/mobile và ICS
   src/pages/Community.jsx	Community Galaxy và Wall of Melody
   src/pages/JummoWorld.jsx	Jummo World, mood, rain, letter và quiz
   src/pages/Projects.jsx	Fan Hub
   src/pages/MyOrbit.jsx	My Orbit
   src/lib/photos.js	Danh sách ảnh, vị trí thumbnail và nguồn ảnh
   src/lib/archive.js	Search, lịch, quiz, tải file và audio helper
   src/lib/helpers.js	Validation, theme và ngày sinh nhật
   src/lib/useRoute.js	Hash routing, focus và scroll khi đổi trang
4. Giới hạn hiện tại
   Một số event và Fan Project trong thiết kế là dữ liệu minh họa; giao diện ghi rõ DEMO, SAMPLE hoặc UNCONFIRMED khi phù hợp.
   Ảnh trong Media chưa có ngày chụp đáng tin cậy nên chưa lọc theo ngày/năm thực tế hoặc dựng chronological story từ metadata chưa xác minh.
   Fan Projects không nhận quyên góp và không thực hiện giao dịch.
   Sticker pack, wallpaper 4K, fancam, photobook và các asset chưa được cung cấp không được tạo file tải giả.
   Community chỉ hiển thị thông tin cần cho trải nghiệm và không công khai UUID người gửi.
   Dữ liệu guest của My Orbit và một số tương tác được lưu cục bộ khi phù hợp; phần đồng bộ tài khoản/backend do maintainer quản lý.
   Metadata editorial, mockup hoặc nội dung mẫu không được coi là lịch phát hành hay sự kiện chính thức.
   Midnight Archive hiện được giữ lại như ý tưởng mở rộng và chưa thuộc bản hiện tại.
   Chưa triển khai lên hosting production nếu repository chưa có môi trường deploy riêng.
5. Kiểm tra trước khi bàn giao
   npm test
   npm run lint
   npm run build

Bộ kiểm thử hiện bao phủ các helper chính, calendar/ICS, search/filter, memory flow, navigation, My Orbit, Community Galaxy và các interaction liên quan.

Chạy lại các lệnh trên để xác minh trạng thái hiện tại trước mỗi commit.

6. Các trang bổ sung — đọc và chạy lần lượt
   Đường dẫn sau địa chỉ website	Mã nguồn	Chức năng
   #/studio	src/App.jsx và các component Studio	Hero, record player, Living Dashboard, birthday và Jummo
   #/profiles	src/pages/CharacterStage.jsx, ProfileDossier.jsx	Chọn Junior/Mark/Jummo; Discover mở dossier; liên kết tới hồ sơ đầy đủ
   #/profiles/junior, #/profiles/mark	src/pages/Profiles.jsx	Hồ sơ dài, Sun/Moon, journey và memory liên quan
   #/timeline	src/pages/Timeline.jsx	Constellation of Memories, preview, keyboard navigation và progress
   #/media	src/pages/MediaHub.jsx	Search/filter, era/source, lightbox, tải ảnh và memory links
   #/schedule	src/pages/Schedule.jsx	Lịch tháng/danh sách, mobile agenda, lọc và xuất ICS
   #/orbit, #/account	src/pages/MyOrbit.jsx	Saved memories/events, favorites, progress và badges
   #/sky	src/pages/Community.jsx	Community Galaxy, star messages, filter, zoom và favorites
   #/wall	src/pages/Community.jsx	Wall of Melody, interactive notes và âm tổng hợp
   #/jummo	src/pages/JummoWorld.jsx	Mood GIF, Jummo Rain, secret letter, goodies và quiz
   #/projects	src/pages/Projects.jsx	Fan Projects, New Fan Guide, Support Guide và Celestial Pass

Các component dùng chung nằm ở src/pages/shared.jsx; CSS trang mở rộng sử dụng src/pages/Pages.css. Logic tìm kiếm, lịch, quiz, tải file và nốt nhạc nằm trong src/lib/archive.js.

Hash routing hỗ trợ mở trực tiếp và tải lại trên static hosting. Các hash/anchor cũ cần thiết vẫn được giữ để tránh phá navigation đã có.

7. Nội dung và dữ liệu
   src/data/memories.js là nguồn dữ liệu chung cho các era/memory hiện tại. Timeline, Profiles và Media nên dùng lại nguồn này thay vì duplicate nội dung.
   Các memory chưa có ngày chính xác vẫn giữ metadata editorial thay vì tự suy đoán ngày phát hành.
   Ảnh gốc giữ watermark, credit và metadata nguồn khi có.
   Demo/local community data không được trình bày như dữ liệu production.
   Shareable cards không đưa email, UUID hoặc account ID vào ảnh xuất.
   Nội dung Community, Fan Projects và Schedule phải phân biệt rõ dữ liệu thật với dữ liệu minh họa.
   Khi thêm animation hoặc interaction mới, tiếp tục giữ keyboard navigation, focus state và prefers-reduced-motion