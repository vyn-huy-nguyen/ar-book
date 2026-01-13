#!/bin/bash

# Script to setup trained marker files
# After downloading from web tool, run this script to organize files

echo "📁 Setting up trained marker files..."
echo ""

# Check if files exist in current directory
if [ ! -f "marker.fset" ] || [ ! -f "marker.fset3" ] || [ ! -f "marker.iset" ]; then
    echo "❌ Trained marker files not found in current directory!"
    echo ""
    echo "📝 Steps:"
    echo "1. Go to: https://ar-js-org.github.io/AR.js/three.js/examples/nft.html"
    echo "2. Upload page1-marker.jpg"
    echo "3. Download the 3 files (marker.fset, marker.fset3, marker.iset)"
    echo "4. Place them in this directory"
    echo "5. Run this script again"
    exit 1
fi

# Create output directory
OUTPUT_DIR="../public/markers/page1-marker"
mkdir -p "$OUTPUT_DIR"

# Copy and rename files
echo "📋 Copying files..."
cp marker.fset "$OUTPUT_DIR/page1-marker.fset"
cp marker.fset3 "$OUTPUT_DIR/page1-marker.fset3"
cp marker.iset "$OUTPUT_DIR/page1-marker.iset"

echo "✅ Files copied to: $OUTPUT_DIR"
echo ""
echo "📝 Next step: Update config/pages.ts:"
echo "   markerImage: '/markers/page1-marker/page1-marker'"
echo ""
echo "✨ Done!"


