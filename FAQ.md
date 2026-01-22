# Frequently Asked Questions

## General Questions

### What is WebAssembly Image Editor?

WebAssembly Image Editor is a high-performance, browser-based image editor that combines Next.js with WebAssembly for fast image processing. It offers 10 professional filters with real-time preview capabilities.

### What browsers are supported?

WebAssembly Image Editor works on all modern browsers that support WebAssembly:

- Chrome 57+
- Firefox 52+
- Safari 11+
- Edge 16+

### Is it free to use?

Yes! WebAssembly Image Editor is open-source and released under the MIT License. You can use it for personal and commercial projects.

### Do I need to install anything?

No installation is required. The editor runs entirely in your browser. For development, you'll need Node.js and npm/pnpm.

## Usage Questions

### What image formats are supported?

Currently, the editor supports:

- **Input**: JPEG, PNG, WebP, GIF (static)
- **Output**: PNG (download)

### Are there any file size limits?

There are no strict file size limits, but very large images (>10MB) may cause performance issues. For best results, use images under 5MB.

### Can I save my work?

Currently, you can download the processed image as a PNG file. Future versions will include:

- Project files (.wasmie)
- Undo/redo history
- Batch processing

### How do I reset filters?

- **Individual filters**: Click the "Reset" button next to each filter
- **All filters**: Click the "Reset All" button to restore the original image

## Technical Questions

### How does WebAssembly improve performance?

WebAssembly provides near-native performance for image processing:

- **Speed**: 10-100x faster than JavaScript for pixel manipulation
- **Efficiency**: 16KB binary size with optimized C++ algorithms
- **Parallelism**: Web Workers prevent UI blocking

### What technologies are used?

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI primitives
- **Image Processing**: C++ compiled to WebAssembly
- **Architecture**: Web Workers for non-blocking processing

### Can I contribute to the project?

Absolutely! We welcome contributions. See our [Contributing Guide](CONTRIBUTING.md) for details on:

- Setting up development environment
- Adding new filters
- Reporting bugs
- Code style guidelines

### How do I add a new filter?

1. **Implement in C++** (`src/wasm/image.cpp`)
2. **Rebuild WebAssembly** (`pnpm run build:wasm`)
3. **Update JavaScript bindings** (`public/wasm/image.js`)
4. **Add React controls** (`src/components/editor-components.tsx`)
5. **Update documentation**

See the [Contributing Guide](CONTRIBUTING.md#adding-new-filters) for detailed instructions.

## Troubleshooting

### WebAssembly failed to load

**Symptoms**: Console shows WASM loading errors, filters don't work

**Solutions**:

1. **Check browser compatibility**: Ensure your browser supports WebAssembly
2. **Clear cache**: Clear browser cache and reload
3. **Check HTTPS**: Some browsers require HTTPS for WASM loading
4. **Disable extensions**: Some ad blockers may interfere with WASM

### Image doesn't appear after upload

**Symptoms**: Upload succeeds but no image is visible

**Solutions**:

1. **Check file format**: Ensure it's a supported image format
2. **File size**: Try with a smaller image (<5MB)
3. **Browser console**: Check for error messages
4. **Refresh page**: Try reloading the application

### Filters are slow or laggy

**Symptoms**: Real-time preview is sluggish

**Solutions**:

1. **Image size**: Use smaller images for real-time preview
2. **Browser performance**: Close other tabs/applications
3. **Hardware acceleration**: Ensure GPU acceleration is enabled
4. **Update browser**: Use the latest browser version

### Download doesn't work

**Symptoms**: Clicking download doesn't save the image

**Solutions**:

1. **Browser permissions**: Allow downloads in your browser
2. **Pop-up blocker**: Disable pop-up blocker for this site
3. **File name**: Check your Downloads folder
4. **Browser support**: Try a different browser

## Development Questions

### How do I set up the development environment?

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/wasm-image-editor.git
   cd wasm-image-editor
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Build WebAssembly**:

   ```bash
   pnpm run build:wasm
   ```

4. **Start development server**:
   ```bash
   pnpm dev
   ```

### What tools are used for development?

- **Code Quality**: Biome for linting and formatting
- **Type Checking**: TypeScript
- **Package Manager**: pnpm (but npm/yarn work too)
- **Version Control**: Git with conventional commits

### How do I debug WebAssembly issues?

1. **Browser Console**: Check for WASM-related errors
2. **Network Tab**: Verify WASM files load correctly
3. **Source Maps**: Enable source maps for debugging
4. **Web Worker Console**: Check worker-specific logs

### Can I use this in my own project?

Yes! The project is MIT licensed. You can:

- Fork and modify the code
- Use components in your projects
- Deploy to your own servers
- Create commercial applications

## Performance Questions

### Why use WebAssembly instead of JavaScript?

WebAssembly provides significant advantages for image processing:

- **Performance**: Near-native execution speed
- **Predictability**: Consistent performance across devices
- **Memory**: Efficient memory management
- **Portability**: Runs consistently across browsers

### How is the performance optimized?

- **C++ algorithms**: Optimized image processing code
- **Web Workers**: Non-blocking UI operations
- **Memory management**: Efficient pixel buffer handling
- **Canvas optimization**: Smart canvas rendering

### Can I use this for batch processing?

Current version is designed for single image processing. Future versions will include:

- Batch processing capabilities
- Queue management
- Progress tracking
- Performance monitoring

## Security Questions

### Is my data secure?

Yes. The editor processes images entirely in your browser:

- **No server uploads**: Images never leave your device
- **Local processing**: All processing happens locally
- **No data collection**: We don't track or store your images
- **WebAssembly sandbox**: WASM runs in a secure environment

### Are there any security risks?

WebAssembly provides strong security guarantees:

- **Sandboxed execution**: Limited system access
- **Memory isolation**: Separate memory space
- **Browser security**: Inherits browser security model
- **No network access**: WASM cannot make network requests

## Future Development

### What features are planned?

See our [Development Plan](DEVELOPMENT_PLAN.md) for upcoming features:

- Additional filters and effects
- Image transformations (rotate, crop, resize)
- Advanced color tools
- Batch processing
- Presets and templates
- Undo/redo functionality

### How can I request features?

1. **GitHub Issues**: Open a feature request issue
2. **Discussions**: Start a discussion in GitHub
3. **Community**: Join our community discussions
4. **Contributing**: Implement the feature yourself!

## Support

### Where can I get help?

- **GitHub Issues**: Report bugs and request features
- **Discussions**: General questions and discussions
- **Documentation**: Check our comprehensive docs
- **Community**: Engage with other users

### How do I report bugs?

Please include:

1. **Environment**: Browser, OS, version
2. **Steps to reproduce**: Clear reproduction steps
3. **Expected vs actual**: What you expected vs what happened
4. **Screenshots**: If applicable
5. **Console errors**: Any browser console errors

---

Still have questions? Feel free to [open an issue](https://github.com/your-username/wasm-image-editor/issues) or start a [discussion](https://github.com/your-username/wasm-image-editor/discussions).
