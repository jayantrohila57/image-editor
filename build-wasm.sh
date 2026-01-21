#!/bin/bash

# WebAssembly Image Editor Build Script
# This script compiles the C++ image processing code to WebAssembly

set -e

echo "🔨 Building WebAssembly Image Editor..."

# Check if Emscripten is available
if ! command -v emcc &> /dev/null; then
    echo "❌ Emscripten not found. Please install Emscripten first:"
    echo "   https://emscripten.org/docs/getting_started/downloads.html"
    exit 1
fi

# Create build directory
mkdir -p public/wasm

# Compile C++ to WebAssembly
echo "📦 Compiling image.cpp to WebAssembly..."
emcc \
    src/wasm/image.cpp \
    -O3 \
    -s WASM=1 \
    -s EXPORTED_FUNCTIONS='["_invert", "_grayscale", "_brightness", "_contrast", "_gamma", "_sepia", "_saturation", "_temperature", "_fade", "_solarize", "_malloc", "_free"]' \
    -s EXPORTED_RUNTIME_METHODS='["ccall", "cwrap"]' \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s MODULARIZE=1 \
    -s EXPORT_NAME='"ImageModule"' \
    -o public/wasm/image.js \
    --no-entry

echo "✅ WebAssembly build completed successfully!"
echo "📁 Generated files:"
echo "   - public/wasm/image.js (JavaScript bindings)"
echo "   - public/wasm/image.wasm (WebAssembly binary)"

# Show file sizes
echo ""
echo "📊 File sizes:"
ls -lh public/wasm/image.* 2>/dev/null || echo "   No WASM files found"

echo ""
echo "🚀 You can now run the development server with: npm run dev"
