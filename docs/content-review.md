# Kiểm duyệt nội dung JuniorMarkJummo

Cập nhật 30/09/2026. Bản tổng hợp của chủ website là đầu vào biên tập; từng chi tiết vẫn cần nguồn cụ thể. Không tự điền ngày, vai diễn, học vấn hoặc phát ngôn từ suy đoán.

## Đã đối chiếu và cập nhật database

| Hồ sơ | Thông tin | Nguồn |
|---|---|---|
| Junior | Panachai Sriariyarungruang; 23/10/1996; Instagram junniorrs, X jnnrrs, TikTok jnnrrs | [GMMTV](https://www.gmm-tv.com/artists/view/61/) |
| Mark | Jiruntanin Trairattanayon; 15/06/1997; Instagram, X và TikTok markjrtn | [GMMTV](https://www.gmm-tv.com/artists/view/82/) |
| Jummo | Linh vật JuniorMark, thuộc GMMTV Fandom Characters | [Bài tổng kết Sunny Moon](https://www.gmm-tv.com/news/4372/) |

Hai khác biệt với bản tổng hợp: X của Junior được GMMTV dẫn đến **jnnrrs**; TikTok của Mark đã có liên kết **markjrtn**. Không đồng nhất Instagram với X chỉ vì tên gần giống nhau.

SQL: backend `database/updates/20260930_verified_profiles.sql`, được seed gọi sau khi tạo dữ liệu. Frontend đọc `artists` và `artist_social_links` từ `get_catalog`.

## Lịch sự kiện đang biên tập

| Sự kiện | Kết quả đối chiếu | Nguồn / bước tiếp theo |
|---|---|---|
| Shine Rise Fancon | 11–12/08/2025 đã có nguồn GMMTV | [Bài GMMTV](https://www.gmm-tv.com/news/3827/) |
| Love Out Loud: Heart Race | 22–24/05/2026, IMPACT Arena | [Bài GMMTV](https://www.gmm-tv.com/news/4188/) |
| Sunny Moon Concert | 07–09/08/2026, BITEC LIVE | [Bài GMMTV](https://www.gmm-tv.com/news/4372/) |
| Fan Day 20 Taipei | **07/03/2025 là ngày bán vé**; bài TTV ghi sự kiện 19/04/2025 | [TTV](https://news.ttv.com.tw/news/11403060000800W); cần liên kết thông báo của nhà tổ chức trước khi nhập lịch |
| Perfect 10 Liners First Date | Ngày 27/10/2024 do chủ website cung cấp | Chờ link thông báo cụ thể |
| Perfect 10 Liners tại Việt Nam | Ngày 11/10/2025 do chủ website cung cấp | Chờ link nhà tổ chức và địa điểm |
| Fan Meeting Singapore | Ngày 19/09/2026 do chủ website cung cấp | Chưa xác minh |
| Fan Meeting Manila | Ngày 14/11/2026 do chủ website cung cấp | Chưa xác minh; không công bố là lịch sắp tới |

Các dòng trên là sổ kiểm duyệt, **chưa nhập thành lịch thật**. Schedule hiện còn dữ liệu minh họa có nhãn. Muốn nhập cần đủ ngày, múi giờ, địa điểm và nguồn; không bịa giờ diễn. Với sự kiện chỉ có ngày, dùng all_day.

## Thông tin còn cần nguồn

- Học vấn: Junior — Chulalongkorn; Mark — Kỹ thuật Công nghiệp, SIIT/Thammasat. Đã nhận từ chủ website, chưa đưa vào hồ sơ chính thức khi chưa đối chiếu nguồn trực tiếp.
- Junior từng thuộc Nadao Bangkok; các vai diễn cá nhân và năm phát hành cần link cụ thể.
- Vai diễn chung do chủ website cung cấp: Jinta/Min (Cherry Magic), Faifa/Wine (Perfect 10 Liners), Tim/Pai (My Romance Scammer). Những vai này đã có trong catalog cũ; cần bổ sung nguồn cho mỗi tác phẩm.
- Cutie Overload và Trust Me: chủ website xác nhận là bài song ca. Cần URL GMMTV Records cụ thể và metadata cho từng track. Không coi cả playlist là đĩa nhạc riêng của JuniorMark: No One Else hiện ghi nghệ sĩ Perth/Santa.
- My Romance Scammer còn nhãn mẫu “Next chapter” trong catalog cũ; cần bổ sung lịch phát hành có nguồn để thay bằng năm chính xác.
- Mặt Trời/Mặt Trăng và tên các “kỷ nguyên tinh tú” là ngôn ngữ thiết kế của fansite. Không dùng để khẳng định tính cách, cung hoàng đạo hay ý nghĩa chính thức của mascot nếu chưa có nguồn.
- Ảnh do chủ website cung cấp giữ credit/watermark. Chưa có ngày chụp thì không lấy năm của bộ phim gán cho ảnh.

## Quy tắc xuất bản

1. Lưu nguồn cùng bản ghi database; nội dung công khai có status published.
2. Dịch nội dung biên tập ở `src/i18n/content.js`, giữ nguyên tên người, tác phẩm và tài khoản.
3. Không tự dịch nội dung fan nhập hoặc thay đổi ghi chú riêng khi đổi ngôn ngữ.
4. Nội dung thiếu nguồn ghi “Chưa cập nhật” hoặc giữ nhãn minh họa; không tạo số liệu hay sự kiện giả.
