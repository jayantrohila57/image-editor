@echo off
REM WebAssembly Image Editor Build Script for Windows
REM This script compiles the C++ image processing code to WebAssembly

echo 🔨 Building WebAssembly Image Editor...

REM Check if Emscripten is available
where emcc >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Emscripten not found. Please install Emscripten first:
    echo    https://emscripten.org/docs/getting_started/downloads.html
    exit /b 1
)

REM Create build directory
if not exist "public\wasm" mkdir "public\wasm"

REM Compile C++ to WebAssembly
echo 📦 Compiling image.cpp to WebAssembly...
emcc ^
    src\wasm\image.cpp ^
    -O3 ^
    -s WASM=1 ^
    -s EXPORTED_FUNCTIONS="_invert,_grayscale,_brightness,_contrast,_gamma,_sepia,_saturation,_temperature,_fade,_solarize,_malloc,_free" ^
    -s EXPORTED_RUNTIME_METHODS="ccall,cwrap" ^
    -s ALLOW_MEMORY_GROWTH=1 ^
    -s MODULARIZE=1 ^
    -s EXPORT_NAME="ImageModule" ^
    -o public\wasm\image.js ^
    --no-entry

if %errorlevel% neq 0 (
    echo ❌ Build failed!
    exit /b 1
)

echo ✅ WebAssembly build completed successfully!
echo 📁 Generated files:
echo    - public\wasm\image.js (JavaScript bindings)
echo    - public\wasm\image.wasm (WebAssembly binary)

REM Show file sizes
echo.
echo 📊 File sizes:
dir "public\wasm\image.*" 2>nul || echo    No WASM files found

echo.
echo 🚀 You can now run the development server with: npm run dev
