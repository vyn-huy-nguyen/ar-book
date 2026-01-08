# Hướng Dẫn Về AR Markers

## 📖 Tổng Quan

AR.js sử dụng NFT (Natural Feature Tracking) để track hình ảnh từ sách. NFT cho phép track bất kỳ hình ảnh nào mà không cần pattern đặc biệt.

## 🎯 Yêu Cầu Marker Images

### Đặc Điểm Marker Tốt:
1. **Độ tương phản cao**: Hình ảnh có nhiều vùng sáng/tối rõ ràng
2. **Chi tiết phong phú**: Nhiều chi tiết, không quá đơn giản
3. **Không có pattern lặp lại**: Tránh các pattern đều đặn
4. **Kích thước phù hợp**: Tối thiểu 512x512px, khuyến nghị 1024x1024px
5. **Chất lượng cao**: Không bị mờ, nén quá mức

### Ví Dụ Marker Tốt:
- ✅ Hình ảnh có nhiều chi tiết (ảnh minh họa, bức tranh)
- ✅ Text với font đậm và rõ ràng
- ✅ Logo phức tạp với nhiều chi tiết
- ✅ Ảnh có nhiều màu sắc và độ tương phản

### Ví Dụ Marker Không Tốt:
- ❌ Hình ảnh quá đơn giản (một màu, gradient đơn giản)
- ❌ Pattern lặp lại (ô vuông, đường thẳng đều)
- ❌ Hình ảnh quá tối hoặc quá sáng
- ❌ Hình ảnh bị mờ, không rõ nét

## 🔧 Chuẩn Bị Marker Images

### Bước 1: Chụp Ảnh Từ Sách
1. Đảm bảo ánh sáng đủ, không bị chói
2. Chụp vuông góc, không bị nghiêng
3. Lấy nét rõ ràng
4. Crop để lấy phần hình ảnh chính

### Bước 2: Xử Lý Ảnh
1. **Tăng Contrast**: Nếu ảnh hơi mờ, tăng contrast
2. **Resize**: Resize về 1024x1024px (hoặc giữ tỷ lệ nhưng cạnh dài nhất = 1024px)
3. **Format**: Lưu dạng JPG chất lượng cao (quality 90-100) hoặc PNG

### Bước 3: Đặt Vào Project
Đặt marker images vào `public/markers/`:
- `page1-marker.png`
- `page2-marker.jpg`
- `page3-marker.jpg`
- `page4-marker.jpg`

## 🚀 AR.js NFT Training (Tùy Chọn)

AR.js 3.x có thể tự động train NFT markers khi load lần đầu. Tuy nhiên, nếu muốn tối ưu performance, bạn có thể train trước:

### Cách Train NFT Markers:

1. **Cài đặt AR.js NFT Trainer:**
```bash
npm install -g @ar-js/nft
```

2. **Train marker:**
```bash
nft-trainer public/markers/page1-marker.png
```

3. **Kết quả**: Sẽ tạo thư mục `public/markers/page1-marker/` với các file:
   - `page1-marker.fset`
   - `page1-marker.fset3`
   - `page1-marker.iset`

4. **Cập nhật config**: Trong `src/config/pages.js`, thay đổi:
```javascript
markerImage: "public/markers/page1-marker/page1-marker"
```

**Lưu ý**: Nếu không train, AR.js sẽ tự động train khi load, nhưng có thể mất thời gian lâu hơn.

## 🧪 Test Marker

1. Mở ứng dụng
2. Quét QR code
3. Hướng camera vào marker image trong sách
4. Kiểm tra:
   - Marker có được nhận diện không?
   - Tracking có ổn định không?
   - Video có hiển thị đúng vị trí không?

### Nếu Marker Không Hoạt Động:
1. Thử với marker image khác có độ tương phản cao hơn
2. Đảm bảo ánh sáng đủ
3. Thử train marker trước (xem phần trên)
4. Kiểm tra xem marker image có được load đúng không (xem console)

## 💡 Tips

- **Ánh sáng**: Marker hoạt động tốt nhất với ánh sáng đều, không quá chói
- **Khoảng cách**: Giữ camera cách marker khoảng 20-50cm
- **Góc nhìn**: Giữ camera vuông góc với marker để tracking tốt nhất
- **Ổn định**: Giữ camera ổn định, tránh rung lắc

## 🔄 Alternative: Pattern Markers

Nếu NFT markers không hoạt động tốt, bạn có thể sử dụng pattern markers (Hiro, Kanji). Tuy nhiên, pattern markers yêu cầu in pattern đặc biệt, không phải hình ảnh từ sách.

Để sử dụng pattern markers, cần thay đổi ARViewer.js:
- Thay `a-nft` bằng `a-marker`
- Sử dụng pattern type như `hiro`, `kanji`, etc.

