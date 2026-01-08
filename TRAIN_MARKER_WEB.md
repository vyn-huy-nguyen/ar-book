# Train NFT Marker - Cách Đơn Giản Nhất

## 🌐 Sử Dụng Web Tool (Khuyến Nghị)

AR.js cung cấp công cụ online để train NFT markers, **không cần cài đặt gì**!

### Bước 1: Truy Cập Web Tool

Mở trình duyệt và truy cập:
**https://ar-js-org.github.io/AR.js/three.js/examples/nft.html**

### Bước 2: Upload Marker Image

1. Click vào nút "Upload Image" hoặc kéo thả file
2. Chọn file `page1-marker.png` từ `public/markers/`
3. Đợi tool xử lý (có thể mất 1-2 phút)

### Bước 3: Download Trained Files

Sau khi train xong, tool sẽ tự động download các file:
- `marker.fset`
- `marker.fset3`  
- `marker.iset`

### Bước 4: Đặt Files Vào Project

1. Tạo thư mục:
```bash
mkdir -p public/markers/page1-marker
```

2. Di chuyển các file đã download vào thư mục đó:
```bash
mv marker.fset public/markers/page1-marker/page1-marker.fset
mv marker.fset3 public/markers/page1-marker/page1-marker.fset3
mv marker.iset public/markers/page1-marker/page1-marker.iset
```

### Bước 5: Cập Nhật Config

Cập nhật `config/pages.ts`:

```typescript
markerImage: '/markers/page1-marker/page1-marker'
```

**Lưu ý**: Không cần extension, chỉ cần path đến folder và tên file.

### Bước 6: Restart và Test

```bash
npm run dev
```

AR sẽ load **nhanh hơn rất nhiều**!

## ✅ Checklist

- [ ] Truy cập web tool
- [ ] Upload `page1-marker.png`
- [ ] Download 3 files (.fset, .fset3, .iset)
- [ ] Đặt vào `public/markers/page1-marker/`
- [ ] Đổi tên files thành `page1-marker.fset`, etc.
- [ ] Cập nhật `config/pages.ts`
- [ ] Restart dev server
- [ ] Test trên iPhone

## 🎯 Kết Quả

Sau khi train:
- ✅ AR load trong vài giây (thay vì 30+ phút)
- ✅ Tracking chính xác hơn
- ✅ Trải nghiệm mượt mà hơn


