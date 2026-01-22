# WebAssembly Image Editor

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.1.1-blue.svg)](https://github.com/your-username/wasm-image-editor/releases)
[![WebAssembly](https://img.shields.io/badge/WebAssembly-654FF0?style=flat&logo=webassembly)](https://webassembly.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)

A high-performance web-based image editor built with Next.js and WebAssembly. This application demonstrates the power of combining modern web technologies with low-level performance optimizations for smooth image processing directly in the browser.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/wasm-image-editor.git
cd wasm-image-editor

# Install dependencies
pnpm install

# Build WebAssembly (required)
pnpm run build:wasm

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to start editing images!

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

## 📖 Documentation

- **[Getting Started Guide](#getting-started)** - Quick setup and installation
- **[User Guide](#usage)** - How to use the image editor
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to the project
- **[FAQ](FAQ.md)** - Frequently asked questions
- **[Changelog](CHANGELOG.md)** - Version history and changes
- **[Roadmap](ROADMAP.md)** - Future development plans
- **[Security Policy](SECURITY.md)** - Security information and reporting
- **[Code of Conduct](CODE_OF_CONDUCT.md)** - Community guidelines

## 🛠️ Getting Started

### Prerequisites

- **Node.js 18+** - [Download Node.js](https://nodejs.org/)
- **pnpm** (recommended) or npm/yarn - [Install pnpm](https://pnpm.io/installation)
- **Git** - [Install Git](https://git-scm.com/)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/wasm-image-editor.git
   cd wasm-image-editor
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Build WebAssembly**

   ```bash
   # On Windows
   pnpm run build:wasm

   # On Unix systems (macOS/Linux)
   pnpm run build:wasm:unix
   ```

4. **Start development server**

   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Development Commands

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server

# WebAssembly
pnpm run build:wasm    # Build WebAssembly (Windows)
pnpm run build:wasm:unix # Build WebAssembly (Unix)

# Code Quality
pnpm run lint         # Check for linting issues
pnpm run format       # Format code with Biome
```

## Usage

1. Click "Choose Image" to upload an image
2. Use the slider controls to adjust filters in real-time
3. Click "Reset" on individual filters to restore defaults
4. Use "Reset All" to restore the original image

## Current State

- ✅ **Core Feature**: 10 professional filters with real-time preview fully working
- ✅ **Infrastructure**: WebAssembly + Web Worker with proper memory management
- ✅ **File Upload**: Image upload functionality with pointer events fixed
- ✅ **Image Processing**: All filter algorithms implemented and functioning correctly
- ✅ **Error Handling**: Buffer validation and error recovery system in place
- ✅ **Export**: Core download functionality (PNG)
- 🚧 **In Development**: Undo/redo, transformations, multi-format export
- 📋 **Planned**: Presets, batch processing, advanced color tools
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

## 🌟 Show Your Support

If you find this project useful, please consider:

- ⭐ **Star the repository** - It helps others discover the project
- 🐛 **Report issues** - Help us improve by reporting bugs
- 💡 **Suggest features** - Share your ideas for new features
- 📝 **Improve documentation** - Help make the docs better
- 🤝 **Contribute code** - See our [Contributing Guide](CONTRIBUTING.md)

## 🤝 Contributing

We welcome contributions of all kinds! Whether you're fixing a bug, adding a feature, or improving documentation, we'd love your help.

### Quick Ways to Contribute

- **Report Bugs**: [Open an issue](https://github.com/your-username/wasm-image-editor/issues)
- **Request Features**: [Start a discussion](https://github.com/your-username/wasm-image-editor/discussions)
- **Submit Pull Requests**: See our [Contributing Guide](CONTRIBUTING.md)
- **Improve Docs**: Help us improve documentation

### Development Setup

```bash
# Fork the repository
git clone https://github.com/your-username/wasm-image-editor.git
cd wasm-image-editor

# Install dependencies and build
pnpm install
pnpm run build:wasm

# Start development
pnpm dev
```

Read our [Contributing Guide](CONTRIBUTING.md) for detailed instructions.

## 📊 Project Status

### Current Version: v0.1.1

- ✅ **Core Features**: 10 professional filters with real-time preview
- ✅ **Infrastructure**: WebAssembly + Web Worker with loading states
- ✅ **Reliability**: Error Boundaries and processing canvas stabilization
- ✅ **Logging**: Real-time system log and operation history
- ✅ **Export**: Core download functionality (PNG)
- 🚧 **In Development**: Multi-format export, undo/redo, transformations
- 📋 **Planned**: Presets, batch processing, advanced color tools

### Browser Compatibility

| Browser | Version | Status          |
| ------- | ------- | --------------- |
| Chrome  | 57+     | ✅ Full Support |
| Firefox | 52+     | ✅ Full Support |
| Safari  | 11+     | ✅ Full Support |
| Edge    | 16+     | ✅ Full Support |

## 🗺️ Roadmap

Want to know what's coming next? Check out our detailed [Roadmap](ROADMAP.md):

### Upcoming Features

- **v0.2.0**: Image transformations (rotate, crop, resize)
- **v0.3.0**: Advanced filters and creative effects
- **v0.4.0**: Batch processing and automation
- **v0.5.0**: Professional tools and layer system
- **v1.0.0**: Production release with enterprise features

## 📄 License

This project is licensed under the [MIT License](LICENSE) - feel free to use it for personal and commercial projects.

## 🔗 Links

- **[Live Demo](https://your-username.github.io/wasm-image-editor/)** _(coming soon)_
- **[GitHub Repository](https://github.com/your-username/wasm-image-editor)**
- **[Report Issues](https://github.com/your-username/wasm-image-editor/issues)**
- **[Request Features](https://github.com/your-username/wasm-image-editor/discussions)**
- **[View Changelog](CHANGELOG.md)**
- **[Security Policy](SECURITY.md)**

## 🙏 Acknowledgments

- **[Next.js](https://nextjs.org/)** - The React framework for production
- **[WebAssembly](https://webassembly.org/)** - The web's binary instruction format
- **[Emscripten](https://emscripten.org/)** - C++ to WebAssembly compiler
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful component library
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework

---

**Built with ❤️ using WebAssembly and Next.js**

_If you have any questions or need help, don't hesitate to [open an issue](https://github.com/your-username/wasm-image-editor/issues) or [start a discussion](https://github.com/your-username/wasm-image-editor/discussions)._
