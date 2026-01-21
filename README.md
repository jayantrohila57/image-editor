# WebAssembly Image Editor

A high-performance web-based image editor built with Next.js and WebAssembly. This application demonstrates the power of combining modern web technologies with low-level performance optimizations for smooth image processing directly in the browser.

## Features

- **10 Professional Filters**: Invert, Grayscale, Brightness, Contrast, Gamma, Sepia, Saturation, Temperature, Fade, Solarize
- **Real-time Preview**: Instant visual feedback as you adjust filter parameters
- **WebAssembly Performance**: C++-compiled image processing for maximum speed (WASM-accelerated)
- **Non-blocking UI**: Web Worker architecture with explicit initialization handshake
- **Modern UI**: Clean, responsive interface built with shadcn/ui components
- **Error Protection**: Granular Error Boundaries and a hidden processing canvas to prevent crashes
- **System Logging**: Integrated debug log and filter history for transparent processing
- **Download**: Core feature to save processed images directly to the browser
- **Dark/Light Theme**: Automatic theme switching support

## Architecture

### Frontend

- **Next.js 16** with React 19 and TypeScript
- **Tailwind CSS v4** for styling
- **shadcn/ui** component library
- **Canvas API** for image rendering

### Image Processing

- **C++ Backend**: High-performance image algorithms compiled to WebAssembly
- **Web Worker**: Non-blocking image processing pipeline
- **WASM Module**: 16KB compiled binary for efficient pixel manipulation

## Available Filters

| Filter      | Range       | Description                 |
| ----------- | ----------- | --------------------------- |
| Invert      | 0-1         | Inverts all colors          |
| Grayscale   | 0-1         | Converts to black and white |
| Brightness  | -100 to 100 | Adjusts image brightness    |
| Contrast    | 0.5-2.5     | Modifies contrast levels    |
| Gamma       | 0.5-2       | Applies gamma correction    |
| Sepia       | 0-1         | Adds vintage sepia tone     |
| Saturation  | 0-2         | Adjusts color intensity     |
| Temperature | -1 to 1     | Shifts color temperature    |
| Fade        | 0-1         | Adds white fade effect      |
| Solarize    | 0-1         | Creates solarization effect |

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. Click "Choose Image" to upload an image
2. Use the slider controls to adjust filters in real-time
3. Click "Reset" on individual filters to restore defaults
4. Use "Reset All" to restore the original image

## Current State

- ✅ **Core Feature**: 10 professional filters with real-time preview
- ✅ **Infrastructure**: WebAssembly + Web Worker with loading states
- ✅ **Reliability**: Error Boundaries and processing canvas stabilization
- ✅ **Logging**: Real-time system log and operation history
- ✅ **Export**: Core download functionality (PNG)
- 🚧 **In Development**: Multi-format export, undo/redo, transformations
- 📋 **Planned**: Presets, batch processing, advanced color tools

## Technical Details

### WebAssembly Integration

The image processing algorithms are written in C++ and compiled to WebAssembly using Emscripten. This provides:

- **Performance**: Near-native speed for pixel manipulation
- **Efficiency**: 16KB WASM binary with optimized algorithms
- **Portability**: Runs in any modern browser with WASM support

### Web Worker Architecture

Image processing runs in a separate Web Worker thread to:

- Prevent UI blocking during intensive operations
- Enable smooth real-time preview updates
- Maintain responsive user interface

## Project Structure

```
├── src/
│   ├── app/page.tsx          # Main React component
│   └── wasm/
│       └── image.cpp         # C++ image processing algorithms
├── public/wasm/
│   ├── image.js              # WASM JavaScript bindings
│   ├── image.wasm            # Compiled WebAssembly binary
│   └── worker.js             # Web Worker for processing
└── package.json
```

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [WebAssembly](https://webassembly.org/) - Learn about WASM technology
- [Emscripten](https://emscripten.org/) - C++ to WASM compiler
- [shadcn/ui](https://ui.shadcn.com/) - Component library documentation

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## License

MIT License - feel free to use this project for learning and experimentation.
