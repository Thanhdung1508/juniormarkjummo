// Ảnh gốc người dùng cung cấp; chỉ crop bằng CSS ở thumbnail, lightbox luôn xem toàn ảnh.
const root = '/images/fan-photos/'
const supplied = 'Bộ ảnh do người dùng cung cấp • Giữ nguyên watermark trên ảnh gốc.'
export const photos = [
  { file: 'HNwgVKGbsAA2z-b.jpg', title: 'A Little Promise', tag: 'TOGETHER ON STAGE', alt: 'Hai người móc tay và mỉm cười trên sân khấu', position: 'center 30%', credit: supplied },
  { file: 'HNpnaOZbsAAGFbv.jpg', title: 'By Your Side', tag: 'COZY DAYS', alt: 'Hai người trong trang phục trắng bên cửa sổ', position: 'center 30%', credit: 'CITER • Ảnh do người dùng cung cấp.' },
  { file: 'HLt1Jy5bcAAdFxD.jpg', title: 'Soft Starlight', tag: 'PORTRAIT DIARY', alt: 'Chân dung trong áo khoác trắng viền đen', position: 'center 25%', credit: supplied },
  { file: 'HPWCyKybkAAHKUm.jpg', title: 'Our Little Sunshine', tag: 'JUMMO MOMENTS', alt: 'Jummo với chiếc mũ hướng dương giữa những mảnh confetti', position: '28% center', credit: 'BRACIB • Ảnh do người dùng cung cấp.' },
  { file: 'HNwNJ4GbsAE5PwW.jpg', title: 'Golden Hour', tag: 'JUNIORMARK', alt: 'Hai người đứng trong căn phòng ánh đèn vàng ấm', credit: supplied },
  { file: '731417546_18122842150657853_5326659436814355590_n.jpg', title: 'A Quiet Moment', tag: 'SOFT LIGHT', alt: 'Chân dung nhìn nghiêng với ánh sáng dịu', credit: supplied },
  { file: 'bac532af2edaf92f15cd0d49fe41c8e1.jpg', title: 'Red & Green', tag: 'PORTRAIT DIARY', alt: 'Chân dung áo len sọc đỏ đen bên tán lá', credit: supplied },
  { file: 'HK_3D4bbsAAFcSk.jpg', title: 'Little Everyday Things', tag: 'DAILY MOMENTS', alt: 'Khoảnh khắc sinh hoạt, chuẩn bị một chiếc áo trắng', credit: supplied },
  { file: 'HLlKtNeaUAA42uM.jpg', title: 'Pages of Us', tag: 'PHOTO DIARY', alt: 'Ảnh ghép những món ăn, quà tặng và kỷ niệm đời thường', credit: '@junniours (watermark trên ảnh) • Ảnh do người dùng cung cấp.' },
  { file: 'HMUIpvfa0AE-yvv.jpg', title: 'Midnight Portrait', tag: 'IN THE SPOTLIGHT', alt: 'Chân dung nghiêng trong trang phục đen', credit: 'MarkJrtn’s Trends TH • Ảnh do người dùng cung cấp.' },
  { file: 'HNoYWmeaIAAtCbj.jpg', title: 'A Tender Moment', tag: 'JUNIORMARK', alt: 'Khoảnh khắc hôn trán dịu dàng', credit: supplied },
  { file: 'HNr2eA_aUAAAesn.jpg', title: 'Blue Notes', tag: 'PORTRAIT DIARY', alt: 'Ảnh ghép hai dáng chụp với trang phục denim', credit: supplied },
  { file: 'HPSkkI9bIAEmbku.jpg', title: 'Under Stage Lights', tag: 'STAGE MEMORY', alt: 'Hai người tựa sát bên nhau dưới ánh đèn sân khấu', credit: supplied },
  { file: 'HQZjqeoaIAApm0L.jpg', title: 'Slow Morning', tag: 'COZY DAYS', alt: 'Khoảnh khắc ngồi bên giường nhìn về phía ánh sáng', credit: supplied },
  { file: 'gmmtv-jumarkmo.jpg', title: 'JuMarkMo', tag: 'GMMTV ARCHIVE', alt: 'Ảnh đôi trong trang phục tối màu từ bài đăng GMMTV', credit: 'GMMTV', source: 'https://x.com/GMMTV/status/2047943286078484622' },
  { file: 'gmmtv-shinerise.jpg', title: 'ShineRise', tag: 'GMMTV ARCHIVE', alt: 'Ảnh đôi trong suit đen trắng tại hậu trường từ GMMTV', credit: 'GMMTV', source: 'https://x.com/GMMTV/status/1955203882625458213' },
].map((photo) => ({ ...photo, src: root + photo.file }))
