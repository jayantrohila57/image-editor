# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2025-01-22

### Fixed

- **Memory Allocation**: Fixed WebAssembly worker memory pool to prevent "offset is out of bounds" errors
- **File Upload**: Fixed file input element pointer events to enable image uploads
- **Filter Implementation**: Implemented actual image processing algorithms for all 10 filters
- **Buffer Transfer**: Fixed buffer handling between worker and UI using subarray instead of slice
- **Contrast Filter**: Corrected contrast algorithm formula for proper visual effect
- **Error Handling**: Added comprehensive error handling and buffer size validation in image context

## [0.1.0] - 2025-01-22

### Fixed

- Implemented debugging layer and error boundaries
- Fixed WASM loading issues
- Improved UI layout and debugging with comprehensive logging
- Enhanced image upload with drag & drop support
- Resolved all lint errors and improved code quality
- Ensured image appears in visible canvas after loading

## [0.1.0] - 2025-01-22

### Added

- Initial WebAssembly Image Editor release
- 10 professional image filters:
  - Invert
  - Grayscale
  - Brightness
  - Contrast
  - Gamma
  - Sepia
  - Saturation
  - Temperature
  - Fade
  - Solarize
- Real-time preview functionality
- WebAssembly performance optimization
- Non-blocking UI with Web Worker architecture
- Modern UI with shadcn/ui components
- Error protection with granular Error Boundaries
- System logging and filter history
- Download functionality for processed images
- Dark/Light theme support
- Responsive design

### Technical Features

- C++ backend compiled to WebAssembly
- Web Worker for non-blocking image processing
- 16KB WASM binary for efficient pixel manipulation
- Next.js 16 with React 19 and TypeScript
- Tailwind CSS v4 styling
- Comprehensive error handling
- Canvas API integration

---

## Version History

| Version | Release Date | Key Features                                          |
| ------- | ------------ | ----------------------------------------------------- |
| v0.1.1  | 2025-01-22   | Bug fixes, stability improvements, enhanced debugging |
| v0.1.0  | 2025-01-22   | Initial release with core image editing features      |

---

## Breaking Changes

### v0.1.1

- No breaking changes introduced

### v0.1.0

- Initial release - no prior versions

---

## Deprecations

No features are currently deprecated.

---

## Security Updates

No security updates have been required to date.

---

## Performance Improvements

### v0.1.1

- Improved WebAssembly loading reliability
- Enhanced canvas rendering performance
- Optimized error boundary performance

### v0.1.0

- WebAssembly implementation for near-native image processing speed
- Web Worker architecture to prevent UI blocking
- Efficient 16KB WASM binary size

---

## Known Issues

No known issues at this time.

---

## Contributors

- [@jayantrohila57](https://github.com/jayantrohila57) - Project creator and maintainer

---

## Migration Guide

### From v0.1.0 to v0.1.1

No migration required - this is a patch release with bug fixes only.

---

## Support

For support, please open an issue on the [GitHub repository](https://github.com/your-username/wasm-image-editor/issues).
