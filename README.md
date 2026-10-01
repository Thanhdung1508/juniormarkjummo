# 🌌 JuniorMark - The Celestial Record Store

Fansite **React + Vite** dành cho JuniorMark, phát triển từ thiết kế **Studio Home (Figma frame 2007:2)** và mở rộng theo hướng **Celestial Archive**.

Website tập trung vào hành trình JuniorMark, media, lịch, cộng đồng fandom và các tương tác cùng Jummo.

> Frontend React + Vite; backend Kotlin chạy riêng trong IntelliJ; dữ liệu PostgreSQL. Fansite do người hâm mộ xây dựng, không phải website chính thức của GMMTV.

## Cập nhật 30/09/2026

- Chọn **Tiếng Việt / English** cạnh nút sáng/tối; mặc định tiếng Việt và nhớ lựa chọn trên trình duyệt. Nội dung fan nhập giữ nguyên, không tự dịch tên riêng hoặc ghi chú.
- Bộ khoảng cách và cỡ chữ chung tại `src/styles/rhythm.css`: nội dung 14–15px, khối 18–26px, khoảng cách phần lớn 32–48px. Hover hỗ trợ chuột và có chế độ giảm chuyển động.
- Hồ sơ đọc họ tên, nguồn và mạng xã hội từ database. X của Junior: **@jnnrrs**; TikTok của Mark: **@markjrtn**, theo liên kết GMMTV.
- Tình trạng nguồn và lịch cần đối chiếu: [Kiểm duyệt nội dung](docs/content-review.md). Chưa xác minh không được tự chuyển thành thông tin chính thức.

## Frontend, backend và database

| Thành phần | Thư mục / địa chỉ |
|---|---|
| Frontend | `C:/laragon/www/juniormark-frontend` — http://127.0.0.1:5173 |
| Backend Kotlin | `C:/Users/ADMIN/IdeaProjects/jumarkmo` — http://127.0.0.1:3001/api/health |
| PostgreSQL local | `127.0.0.1:55432`, database `juniormark`, user `postgres` |

1. Mở thư mục backend bằng IntelliJ, nạp Maven project, chọn JDK 17.
2. Trong terminal backend: `./scripts/database.ps1 -Action start`, rồi `./scripts/run.ps1 -Task run`.
3. Trong terminal frontend: `npm install`, rồi `npm run dev`.
4. Frontend gửi `/api` qua Vite proxy. `.env.example` chứa `API_PROXY_TARGET`; không đặt mật khẩu SQL trong biến frontend.

Nếu cổng 5173 đã được dùng, kiểm tra phiên frontend đang chạy trước khi mở thêm. Cổng database và backend khác nhau.

### SQL và mật khẩu local

SQL chính nằm **trong backend**:

- `database/migrations/`: tạo bảng, quyền truy cập và tài khoản.
- `database/seed/catalog.sql`: nội dung ban đầu.
- `database/updates/20260930_verified_profiles.sql`: cập nhật ba hồ sơ và sáu liên kết đã xác minh; chạy sau seed. Seed đã dẫn tới file này cho database mới.

Database đang có không cần chạy lại toàn bộ migration. Các thư mục `server/`, `supabase/` và script Node cũ còn trong repository frontend là di sản; luồng chạy hiện tại dùng Kotlin. Chưa xóa trong đợt chỉnh UI này.

Mật khẩu thực được ghi ở **`.local/README-SQL.md`** trên máy này, đã được Git bỏ qua. Backend đọc `.local/postgres-password.local`. README công khai chỉ ghi vị trí và cách cấu hình, không chứa mật khẩu. Để đổi mật khẩu: dùng `\password postgres` trong psql rồi cập nhật file mật khẩu local của backend và khởi động lại backend.

### Dữ liệu động và giới hạn

`src/data/catalog.js` tải catalog công khai từ Kotlin/PostgreSQL trước khi mở ứng dụng. `catalog.demo.json` là mẫu cho kiểm thử, không được dùng để che lỗi kết nối. Nội dung SQL mới cần bản dịch tương ứng trong `src/i18n/content.js`; chuỗi chưa có bản dịch giữ nguyên để maintainer phát hiện, không dịch máy ngầm.

Đăng ký/đăng nhập, hồ sơ cá nhân, ghi chú, cài đặt và mục đã lưu sử dụng backend. Môi trường local chưa xác minh email; thư đặt lại mật khẩu được ghi ở `.local/mail` của backend, chưa gửi email thật. Chưa coi đây là cấu hình production.


## 🚀 Chạy project

Yêu cầu:

- Node.js tương thích Vite 8
- Khuyến nghị Node 22.12+ hoặc Node 24 LTS
- npm

```bash
npm install
npm run dev
```

Mặc định truy cập tại:

```text
http://localhost:5173
```

---

## ✨ Tính năng chính

| Khu vực | Nội dung |
|---|---|
| 🏠 **Studio** | Hero, record player, Living Dashboard, sinh nhật, Memory of the Day và Jummo Guide |
| 🗂️ **Archive** | Profiles, Constellation / Timeline và Visual Archive |
| 🪐 **Orbit** | Schedule, My Orbit, memories/events đã lưu và tiến độ khám phá |
| 🌠 **Community** | Starry Sky, Community Galaxy và Wall of Melody |
| 🐣 **Jummo World** | Mood GIF, Jummo Rain, secret letter, goodies và quiz |
| 🎫 **Fan Hub** | Fan Projects, New Fan Guide, Support Guide và Celestial Pass |

---

## 🎨 UI / UX

- Glassmorphism có kiểm soát cho header, menu, dialog, card và control.
- Hỗ trợ dark / light theme và ghi nhớ lựa chọn.
- Navigation desktop được gom thành 4 khu chính: **Studio, Archive, Orbit, Community**.
- Mobile navigation dùng menu dọc, tap target lớn và Archive submenu mở theo chiều dọc.
- Responsive cho desktop, tablet và mobile.
- Hỗ trợ keyboard navigation, skip link, focus state, `Escape` và `prefers-reduced-motion`.

---

## 🌌 Starry Sky

Starry Sky là khu vực cộng đồng tương tác chính của website.

- Nền sao nhiều lớp chuyển động chậm và chớp sáng.
- Các layer sao có tốc độ khác nhau để tạo chiều sâu.
- Sky hiển thị gần full viewport.
- Có chế độ **Full Sky** để xem toàn màn hình.
- Community stars vẫn có thể click và tương tác.
- Ưu tiên hiển thị **Your Star** của người dùng.
- Có chức năng **Find My Star**.
- Khi gửi ước nguyện thành công, ngôi sao sẽ có hiệu ứng bay lên trời rồi xuất hiện tại vị trí thật.

---

## 🐣 Jummo

Jummo không chỉ nằm trong Jummo World mà còn đóng vai trò UX Companion trong website.

| Khu vực | Jummo |
|---|---|
| Studio | Guide / Welcome |
| Timeline | Hướng dẫn khám phá memory |
| Schedule | Jummo Calendar |
| Media | Jummo Camera |
| 404 | Sleeping Jummo |

Jummo World gồm:

- Mood GIF
- Jummo Rain
- Secret Letter
- Goodies
- Quiz

**Jummo Rain** hiển thị 18 mascot rơi với vị trí, tốc độ và kích thước ngẫu nhiên.

---

## 🖼️ Archive & Media

### Profiles

- Chọn Junior / Mark / Jummo.
- Mở dossier nhanh bằng `Discover`.
- Liên kết tới hồ sơ đầy đủ và memory liên quan.

### Constellation of Memories

- Hiển thị hành trình JuniorMark dưới dạng chòm sao.
- Preview memory khi tương tác.
- Hỗ trợ keyboard navigation.
- Theo dõi tiến độ khám phá.

### Media Hub

- Tìm kiếm không dấu.
- Filter theo nhân vật, chủ đề, era và nguồn.
- Sort ảnh.
- Lightbox.
- Tải ảnh gốc.
- Liên kết sang memory và profile liên quan.

---

## 📅 Schedule & My Orbit

### Schedule

- Month / List view trên desktop.
- Agenda view trên mobile.
- Lọc sự kiện.
- Đổi tháng / năm.
- Export file `.ics`.
- Event demo hoặc chưa xác minh luôn được ghi nhãn rõ.

### My Orbit

Lưu lại:

- Memories
- Events
- Favorites
- Progress
- Badges

Dữ liệu guest có thể được lưu cục bộ trên trình duyệt.

---

## 💫 Community

### Community Galaxy

- Lời nhắn fandom hiển thị dưới dạng các vì sao.
- Filter theo nhóm.
- Zoom.
- Favorite.
- Your Star.
- Full Sky.

### Wall of Melody

- Lời nhắn hiển thị dưới dạng nốt nhạc.
- Có âm thanh tổng hợp khi tương tác.

Demo/local data luôn được phân biệt với dữ liệu production.

---

## 🧭 Routes

| Route | Trang | Chức năng |
|---|---|---|
| `#/studio` | Studio | Hero, record player, dashboard, birthday, Jummo |
| `#/profiles` | Character Stage | Chọn Junior / Mark / Jummo |
| `#/profiles/junior` | Junior Profile | Hồ sơ Junior và journey |
| `#/profiles/mark` | Mark Profile | Hồ sơ Mark và journey |
| `#/timeline` | Constellation | Hành trình và memories |
| `#/media` | Visual Archive | Search, filter, lightbox, download |
| `#/schedule` | Schedule | Calendar, agenda mobile, ICS |
| `#/orbit` | My Orbit | Saved items, progress, badges |
| `#/account` | My Orbit / Account | Dữ liệu cá nhân và tiến độ |
| `#/sky` | Starry Sky | Community Galaxy, Full Sky, Your Star |
| `#/wall` | Wall of Melody | Community notes |
| `#/jummo` | Jummo World | Mood, rain, letter, goodies, quiz |
| `#/projects` | Fan Hub | Projects, guide, support, Celestial Pass |

---

## 🧩 File quan trọng

| File | Vai trò |
|---|---|
| `src/App.jsx` | Layout, routing và các khu chính |
| `src/index.css` | Theme và màu sắc chung |
| `src/App.css` | CSS chính của Studio |
| `src/components/Header.jsx` | Header và navigation |
| `src/components/Hero.jsx` | Hero |
| `src/components/RecordPlayer.jsx` | Record player |
| `src/components/Birthdays.jsx` | Countdown sinh nhật |
| `src/components/ThemeToggle.jsx` | Dark / light theme |
| `src/components/Dialog.jsx` | Dialog và focus |
| `src/data/memories.js` | Nguồn dữ liệu memory chung |
| `src/pages/shared.jsx` | Shared UI components |
| `src/pages/Pages.css` | Visual system, glass và responsive |
| `src/pages/StarSkyBackground.jsx` | Background Starry Sky |
| `src/pages/StarSkyBackground.css` | Star drift / twinkle animation |
| `src/pages/CharacterStage.jsx` | Character selector |
| `src/pages/ProfileDossier.jsx` | Dossier nhanh |
| `src/pages/Profiles.jsx` | Hồ sơ đầy đủ |
| `src/pages/Timeline.jsx` | Constellation of Memories |
| `src/pages/MediaHub.jsx` | Visual Archive |
| `src/pages/Schedule.jsx` | Calendar / agenda / ICS |
| `src/pages/Community.jsx` | Starry Sky và Wall of Melody |
| `src/pages/JummoWorld.jsx` | Jummo World và Jummo Rain |
| `src/pages/Projects.jsx` | Fan Hub |
| `src/pages/MyOrbit.jsx` | Saved data, progress và badges |
| `src/lib/photos.js` | Ảnh, credit và metadata |
| `src/lib/archive.js` | Search, calendar, quiz, download, audio |
| `src/lib/helpers.js` | Validation, theme và birthday |
| `src/lib/useRoute.js` | Hash routing, focus và scroll |

---

## 📦 Jummo Assets

| Asset | Sử dụng |
|---|---|
| `public/images/main_mas.png` | Studio / Timeline |
| `public/images/camera_ms.png` | Media |
| `public/images/calender_ms.png` | Schedule |
| `public/images/sleep_ms.png` | 404 |
| `public/images/jummo_rain.png` | Jummo Rain |

---

## ⚠️ Giới hạn hiện tại

- Một số event và Fan Project là **DEMO / SAMPLE / UNCONFIRMED**.
- Media chưa có ngày chụp đáng tin cậy cho toàn bộ ảnh.
- Fan Projects không nhận quyên góp hoặc thực hiện giao dịch.
- Không tạo file tải giả cho asset chưa được cung cấp.
- Ảnh giữ watermark, credit và metadata nguồn khi có.
- Demo/local community data không được trình bày như production data.
- Shareable card không chứa email, UUID hoặc account ID.
- Midnight Archive hiện vẫn là ý tưởng mở rộng.
- Production hosting phụ thuộc môi trường deploy của repository.

---

## 🧪 Kiểm tra trước khi bàn giao

```bash
npm test
npm run lint
npm run build
```

Nên chạy lại các lệnh trên trước mỗi commit hoặc PR có thay đổi lớn về UI, routing hoặc interaction.

---

## 📝 Quy ước dữ liệu

- `src/data/memories.js` là nguồn dữ liệu chung cho era và memory.
- Tránh duplicate nội dung giữa Timeline, Profiles và Media.
- Không tự suy đoán metadata chưa được xác minh.
- Community, Schedule và Fan Projects phải phân biệt rõ dữ liệu thật với dữ liệu minh họa.
- Interaction và animation mới phải tiếp tục hỗ trợ keyboard, focus và `prefers-reduced-motion`.
- Không công khai email, UUID hoặc dữ liệu tài khoản nhạy cảm trên UI/share card.

---

## 💛 JuniorMark Celestial Archive

Một không gian nhỏ để lưu lại hành trình, hình ảnh, kỷ niệm và những lời nhắn của fandom dành cho JuniorMark.
