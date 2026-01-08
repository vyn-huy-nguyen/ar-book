# Hướng Dẫn Train Marker cho AR.js

## 🎯 Vấn Đề

AR.js NFT markers cần được train trước. Nếu không train, lần đầu sẽ mất **rất nhiều thời gian** (có thể 30+ phút) để tự động train.

## ✅ Giải Pháp: Train Marker Trước

### Cách 1: Dùng npx (Khuyến Nghị - Không Cần Cài)

```bash
cd public/markers
npx @ar-js/nft page1-marker.png
```

### Cách 2: Cài Đặt Global

```bash
npm install -g @ar-js/nft
cd public/markers
nft-trainer page1-marker.png
```

### Cách 3: Dùng Script

```bash
node scripts/train-marker.js
```

## 📁 Kết Quả

Sau khi train, sẽ tạo thư mục `public/markers/page1-marker/` với các file:
- `page1-marker.fset`
- `page1-marker.fset3`
- `page1-marker.iset`

## 🔧 Cập Nhật Config

Sau khi train xong, cập nhật `config/pages.ts`:

```typescript
markerImage: '/markers/page1-marker/page1-marker'
```

**Lưu ý**: Không cần extension (.fset, .fset3, .iset), chỉ cần path đến folder và tên file.

## ⚡ Sau Khi Train

1. Restart dev server:
```bash
npm run dev
```

2. Test lại trên iPhone - AR sẽ load **nhanh hơn rất nhiều**!

## 🐛 Troubleshooting

### Lỗi: "nft-trainer not found"

**Giải pháp**: Dùng npx (không cần cài):
```bash
npx @ar-js/nft public/markers/page1-marker.png
```

### Lỗi: "Permission denied"

**Giải pháp**: Không cần cài global, dùng npx thay thế.

### Training mất quá nhiều thời gian

- Marker image quá lớn → Resize về 512x512px hoặc 1024x1024px
- Marker image quá phức tạp → Thử với marker đơn giản hơn

## 📝 Notes

- Training chỉ cần làm **một lần** cho mỗi marker
- Sau khi train, AR sẽ load trong vài giây thay vì 30+ phút
- Trained files có thể commit vào git để chia sẻ với team

