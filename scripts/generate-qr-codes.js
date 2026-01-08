/**
 * Script to generate QR codes for book pages
 * Run with: node scripts/generate-qr-codes.js
 */

const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '../public/qr-codes');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// QR code data for each page
const pages = [
  { pageId: 1, data: JSON.stringify({ pageId: 1 }) },
  { pageId: 2, data: JSON.stringify({ pageId: 2 }) },
  { pageId: 3, data: JSON.stringify({ pageId: 3 }) },
  { pageId: 4, data: JSON.stringify({ pageId: 4 }) }
];

// Generate QR codes
async function generateQRCodes() {
  console.log('Generating QR codes...\n');

  for (const page of pages) {
    try {
      const filePath = path.join(outputDir, `page${page.pageId}-qr.png`);
      await QRCode.toFile(filePath, page.data, {
        errorCorrectionLevel: 'H',
        type: 'png',
        width: 512,
        margin: 2
      });
      console.log(`✅ Generated: page${page.pageId}-qr.png`);
      console.log(`   Data: ${page.data}\n`);
    } catch (error) {
      console.error(`❌ Error generating QR for page ${page.pageId}:`, error);
    }
  }

  console.log('✨ QR code generation complete!');
  console.log(`📁 Output directory: ${outputDir}`);
}

// Run
generateQRCodes().catch(console.error);

