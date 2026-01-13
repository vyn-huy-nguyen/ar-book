# Kịch Bản và Lựa Chọn Công Nghệ - AR Book Project

## 📋 Phân Tích Bài Toán

### Yêu Cầu Chính:

1. **Sách vật lý** với 4 trang, mỗi trang có:
   - 1 QR code
   - 1 bức ảnh mô tả video
2. **Quét QR code** bằng điện thoại
3. **Hiển thị video AR** đúng vị trí bức ảnh trong sách
4. **4 video** tương ứng với 4 trang
5. **Đa ngôn ngữ**: Hỗ trợ Tiếng Anh và Tiếng Việt
   - Người dùng có thể chọn ngôn ngữ trên giao diện
   - Mỗi video có 2 phiên bản: Tiếng Anh và Tiếng Việt

### Thách Thức Kỹ Thuật:

- Tracking vị trí sách khi người dùng di chuyển điện thoại
- Hiển thị video đúng vị trí và tỷ lệ với ảnh trong sách
- Tối ưu hiệu năng trên mobile
- Hỗ trợ đa nền tảng (iOS/Android)

---

## 🎬 Kịch Bản Hoạt Động

### Flow 1: Chọn Ngôn Ngữ và Quét QR Code

```
1. Người dùng mở ứng dụng/web trên điện thoại
2. Chọn ngôn ngữ (Tiếng Anh / Tiếng Việt)
3. Cho phép truy cập camera
4. Quét QR code trên trang sách
5. QR code chứa thông tin:
   - ID trang (1-4)
   - URL ảnh marker (ảnh trong sách)
   - URL video tương ứng (sẽ load video theo ngôn ngữ đã chọn)
```

### Flow 2: AR Tracking và Hiển Thị

```
1. Sau khi quét QR, hệ thống:
   - Tải ảnh marker (ảnh trong sách)
   - Khởi tạo AR tracking dựa trên ảnh marker
   - Tải video tương ứng theo ngôn ngữ đã chọn (EN/VI)

2. Khi camera nhận diện được ảnh marker:
   - Hiển thị video overlay đúng vị trí ảnh
   - Video tự động phát (phiên bản ngôn ngữ đã chọn)
   - Video có thể pause/play khi người dùng tương tác
   - Có thể đổi ngôn ngữ video mà không cần quét lại QR

3. Khi camera mất tracking:
   - Video có thể pause hoặc ẩn
   - Hiển thị hướng dẫn quay lại vị trí (theo ngôn ngữ đã chọn)
```

### Flow 3: Điều Hướng Giữa Các Trang

```
1. Người dùng có thể:
   - Quét QR code khác để chuyển trang
   - Quay lại trang trước
   - Xem danh sách tất cả video
```

---

## 🛠️ Lựa Chọn Công Nghệ

### Phương Án 1: Web AR (Khuyến Nghị) ⭐

**Công nghệ:**

- **AR.js** + **A-Frame** hoặc **Three.js**
- **QR Code Scanner**: jsQR hoặc html5-qrcode
- **Image Tracking**: AR.js marker tracking

**Ưu điểm:**

- ✅ Không cần cài app, chỉ cần mở trình duyệt
- ✅ Dễ triển khai và maintain
- ✅ Hỗ trợ tốt trên cả iOS và Android
- ✅ Có thể host trên web server
- ✅ Dễ update nội dung

**Nhược điểm:**

- ⚠️ Cần kết nối internet (có thể cache)
- ⚠️ Hiệu năng thấp hơn native một chút

**Kiến trúc:**

```
QR Code → Web App → AR.js → Image Tracking → Video Overlay
```

---

### Phương Án 2: Native App

**Công nghệ:**

- **React Native** + **ViroReact** hoặc **Expo AR**
- **QR Code**: react-native-qrcode-scanner
- **AR**: ARCore (Android) / ARKit (iOS)

**Ưu điểm:**

- ✅ Hiệu năng tốt nhất
- ✅ Tích hợp sâu với hệ điều hành
- ✅ Có thể hoạt động offline

**Nhược điểm:**

- ❌ Cần phát triển 2 platform
- ❌ Cần publish lên App Store/Play Store
- ❌ Phức tạp hơn trong development

---

### Phương Án 3: Hybrid (PWA + Web AR)

**Công nghệ:**

- **Progressive Web App (PWA)**
- **AR.js** hoặc **8th Wall**
- Service Worker cho offline

**Ưu điểm:**

- ✅ Kết hợp ưu điểm của Web và Native
- ✅ Có thể install như app
- ✅ Hỗ trợ offline

---

## 🎯 Đề Xuất: Web AR với AR.js

### Lý Do:

1. **Dễ tiếp cận**: Người dùng chỉ cần quét QR → mở link
2. **Phát triển nhanh**: Không cần build app
3. **Chi phí thấp**: Host trên web server thông thường
4. **Dễ bảo trì**: Update nội dung không cần phát hành app mới

### Tech Stack Chi Tiết:

#### Frontend:

- **HTML5/CSS3/JavaScript** (Vanilla hoặc React/Vue)
- **AR.js** (v3.x) - AR framework
- **A-Frame** - 3D/AR framework
- **jsQR** - QR code scanner
- **MediaElement.js** - Video player control
- **i18next** hoặc custom i18n - Internationalization (đa ngôn ngữ)

#### Backend (Optional):

- **Node.js/Express** - API server (nếu cần quản lý nội dung)
- **Firebase/Cloudinary** - Lưu trữ video và ảnh

#### Infrastructure:

- **Web Server** (Nginx/Apache)
- **HTTPS** (bắt buộc cho camera access)

---

## 📐 Kiến Trúc Hệ Thống

```
┌─────────────────┐
│   Sách Vật Lý   │
│  QR + Ảnh Marker │
└────────┬────────┘
         │
         │ Quét QR
         ▼
┌─────────────────┐
│  Web App (PWA)  │
│  - QR Scanner   │
│  - AR Engine    │
│  - Video Player │
└────────┬────────┘
         │
         │ Load Content
         ▼
┌─────────────────┐
│  Content Server │
│  - Videos       │
│  - Marker Images│
│  - Metadata     │
└─────────────────┘
```

---

## 🔄 Quy Trình Phát Triển

### Phase 1: Setup & Prototype

1. Setup project structure
2. Tích hợp QR scanner
3. Tích hợp AR.js với image tracking
4. Test với 1 video

### Phase 2: Core Features

1. Multi-page support (4 trang)
2. Video player với controls
3. Smooth transitions giữa các trang
4. Error handling

### Phase 3: Optimization

1. Video compression
2. Lazy loading
3. Caching strategy
4. Performance tuning

### Phase 4: Polish

1. UI/UX improvements
2. Loading states
3. Instructions/help
4. Testing trên nhiều devices

---

## 📦 Cấu Trúc Dự Án Đề Xuất

```
ar-book/
├── public/
│   ├── videos/          # 8 video files (4 trang x 2 ngôn ngữ)
│   │   ├── page1-video-en.mp4
│   │   ├── page1-video-vi.mp4
│   │   ├── page2-video-en.mp4
│   │   ├── page2-video-vi.mp4
│   │   └── ...
│   ├── markers/         # 4 marker images (từ sách)
│   └── qr-codes/        # QR code images (optional)
├── src/
│   ├── components/
│   │   ├── QRScanner.js
│   │   ├── ARViewer.js
│   │   ├── VideoPlayer.js
│   │   └── LanguageSelector.js
│   ├── config/
│   │   ├── pages.js     # Config 4 trang với video đa ngôn ngữ
│   │   └── i18n.js      # Cấu hình đa ngôn ngữ
│   ├── locales/
│   │   ├── en.json      # Translations Tiếng Anh
│   │   └── vi.json      # Translations Tiếng Việt
│   ├── utils/
│   │   ├── qr-decoder.js
│   │   └── i18n.js      # i18n utilities
│   └── index.html
├── package.json
└── README.md
```

---

## 🎨 Cấu Hình Trang Sách

Mỗi QR code sẽ chứa JSON data:

```json
{
  "pageId": 1,
  "markerImage": "/markers/page1-marker.jpg",
  "videos": {
    "en": "/videos/page1-video-en.mp4",
    "vi": "/videos/page1-video-vi.mp4"
  },
  "title": {
    "en": "Video 1 Title",
    "vi": "Tiêu đề Video 1"
  }
}
```

### Cấu Trúc Video:

- Mỗi trang có 2 video: `page{N}-video-en.mp4` và `page{N}-video-vi.mp4`
- Video được load dựa trên ngôn ngữ người dùng đã chọn

---

## ✅ Checklist Trước Khi Code

- [x] Phân tích yêu cầu
- [x] Lựa chọn công nghệ
- [x] Thiết kế kiến trúc
- [x] Quy trình phát triển
- [ ] Chuẩn bị assets (videos, marker images)
- [ ] Setup development environment
- [ ] Bắt đầu implement

---

## 🚀 Bước Tiếp Theo

Sau khi xác nhận kịch bản và công nghệ, chúng ta sẽ:

1. Setup project với AR.js
2. Tạo QR scanner component
3. Implement AR tracking
4. Tích hợp video player
5. Test và optimize
