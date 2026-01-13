# AR Book - Multi-language AR Video Experience

Ứng dụng AR Book được xây dựng với Next.js 14, TypeScript, Tailwind CSS, Ant Design và hỗ trợ đa ngôn ngữ (Tiếng Anh và Tiếng Việt).

## 🚀 Tech Stack

- **Next.js 14** - React framework với App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Ant Design** - UI component library
- **next-intl** - Internationalization (i18n)
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **AR.js** - AR framework
- **A-Frame** - 3D/AR framework
- **jsQR** - QR code scanner

## 📦 Cài Đặt

### Yêu Cầu

- Node.js 18+
- npm hoặc yarn

### Bước 1: Install Dependencies

```bash
npm install
```

### Bước 2: Chuẩn Bị Assets

Đặt các file vào thư mục `public/`:

**Videos** (`public/videos/`):

- `page1-video-en.mp4`, `page1-video-vi.mp4`
- `page2-video-en.mp4`, `page2-video-vi.mp4`
- `page3-video-en.mp4`, `page3-video-vi.mp4`
- `page4-video-en.mp4`, `page4-video-vi.mp4`

**Marker Images** (`public/markers/`):

- `page1-marker.jpg`
- `page2-marker.jpg`
- `page3-marker.jpg`
- `page4-marker.jpg`

Xem [AR_MARKERS_GUIDE.md](./AR_MARKERS_GUIDE.md) để biết cách chuẩn bị marker images.

### Bước 3: Tạo QR Codes (Optional)

```bash
npm run generate-qr
```

QR codes sẽ được tạo trong `public/qr-codes/`.

### Bước 4: Chạy Development Server

```bash
npm run dev
```

Mở trình duyệt tại: `http://localhost:3000/vi` hoặc `http://localhost:3000/en`

### Scripts Khác

```bash
# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

## 📁 Cấu Trúc Dự Án

```
ar-book/
├── app/
│   ├── [locale]/          # Locale-based routing
│   │   ├── layout.tsx     # Locale layout
│   │   └── page.tsx       # Home page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── ARViewer.tsx       # AR viewer component
│   ├── LanguageSelector.tsx # Language selector
│   └── QRScanner.tsx      # QR code scanner
├── config/
│   └── pages.ts           # Page configuration
├── messages/              # i18n translations
│   ├── en.json
│   └── vi.json
├── public/                # Static assets
│   ├── videos/
│   └── markers/
├── scripts/
│   └── generate-qr-codes.js
├── i18n.ts               # i18n configuration
├── middleware.ts         # Next.js middleware
├── next.config.mjs       # Next.js config
├── tailwind.config.ts    # Tailwind config
├── tsconfig.json         # TypeScript config
└── package.json
```

## 🌐 Đa Ngôn Ngữ

Ứng dụng hỗ trợ 2 ngôn ngữ:

- Tiếng Việt (vi) - Default
- Tiếng Anh (en)

URL structure:

- `/vi` - Tiếng Việt
- `/en` - Tiếng Anh

## 🎨 Styling

- **Tailwind CSS** cho utility classes
- **Ant Design** cho UI components
- Custom styles trong `app/globals.css`

## 📝 Code Quality

### ESLint

```bash
npm run lint
```

### Prettier

```bash
npm run format        # Format all files
npm run format:check  # Check formatting
```

### TypeScript

```bash
npm run type-check
```

## 🔧 Configuration

### Pages Config

Chỉnh sửa `config/pages.ts` để cấu hình:

- Marker images
- Video URLs
- Page titles

### i18n

Thêm translations trong `messages/`:

- `messages/en.json` - English
- `messages/vi.json` - Vietnamese

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Other Platforms

- Build: `npm run build`
- Start: `npm start`
- Port: 3000 (default)

**Lưu ý**: Camera access yêu cầu HTTPS trên production. Vercel tự động cung cấp HTTPS.

## 📱 Features

- ✅ QR Code scanning
- ✅ AR video overlay
- ✅ Multi-language support
- ✅ Responsive design
- ✅ Modern UI with Ant Design
- ✅ TypeScript for type safety

## 🐛 Troubleshooting

### Camera not working

- Ensure HTTPS in production
- Check browser permissions
- Test on real device

### AR not loading

- Check A-Frame and AR.js scripts
- Verify marker images are accessible
- Check browser console for errors

### i18n not working

- Ensure middleware is configured
- Check locale in URL
- Verify messages files exist

## 📄 License

MIT
