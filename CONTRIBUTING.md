# Contributing to WebAssembly Image Editor

Thank you for your interest in contributing to the WebAssembly Image Editor! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Development Workflow](#development-workflow)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). Please read and follow these guidelines to ensure a welcoming environment for all contributors.

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Git
- Basic knowledge of React, TypeScript, and WebAssembly

### Development Setup

1. **Fork the repository**

   ```bash
   # Fork the repository on GitHub, then clone your fork
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

   # On Unix systems
   pnpm run build:wasm:unix
   ```

4. **Start development server**

   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Contributing Guidelines

### Types of Contributions

We welcome the following types of contributions:

- **Bug fixes** - Fix reported issues
- **New features** - Add new image filters or functionality
- **Documentation** - Improve README, code comments, or add examples
- **Performance improvements** - Optimize WebAssembly code or React components
- **UI/UX improvements** - Enhance the user interface and experience
- **Tests** - Add unit tests or integration tests

### Code Style

This project uses:

- **Biome** for linting and formatting
- **TypeScript** for type safety
- **Conventional Commits** for commit messages

#### Linting and Formatting

```bash
# Check for linting issues
pnpm run lint

# Format code
pnpm run format
```

#### Commit Message Format

We use conventional commits:

```
type(scope): description

feat(filters): add blur filter
fix(wasm): resolve memory leak issue
docs(readme): update installation instructions
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### WebAssembly Development

When contributing to WebAssembly code:

1. **Edit C++ source** in `src/wasm/image.cpp`
2. **Rebuild WASM** using the build scripts
3. **Test thoroughly** in different browsers
4. **Update documentation** if adding new filters

#### Adding New Filters

1. **Implement in C++**:

   ```cpp
   // Add your filter function to image.cpp
   extern "C" void apply_your_filter(uint8_t* data, int width, int height, float parameter) {
       // Your filter implementation
   }
   ```

2. **Update JavaScript bindings**:

   ```javascript
   // Update public/wasm/image.js to expose your filter
   Module.apply_your_filter = function (data, width, height, parameter) {
     _apply_your_filter(data, width, height, parameter);
   };
   ```

3. **Add React component**:

   ```typescript
   // Add filter control in src/components/editor-components.tsx
   ```

4. **Update documentation**:
   - Add filter to README.md
   - Update filter table
   - Document parameter ranges

### React/TypeScript Guidelines

- Use functional components with hooks
- Follow TypeScript best practices
- Use shadcn/ui components when possible
- Implement proper error boundaries
- Add loading states for async operations

## Pull Request Process

1. **Create a branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

   - Follow the coding guidelines
   - Add tests if applicable
   - Update documentation

3. **Test your changes**

   ```bash
   # Run linting
   pnpm run lint

   # Test the application
   pnpm dev
   ```

4. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat(filters): add your new filter"
   ```

5. **Push to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Use a descriptive title
   - Fill out the PR template
   - Link any related issues
   - Request review from maintainers

### Pull Request Template

```markdown
## Description

Brief description of your changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Tested locally
- [ ] Added tests
- [ ] Manual testing completed

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No linting errors
```

## Issue Reporting

### Bug Reports

When reporting bugs, please include:

1. **Environment information**

   - Browser and version
   - Operating system
   - Node.js version (if applicable)

2. **Steps to reproduce**

   - Clear, numbered steps
   - Expected vs actual behavior

3. **Additional context**
   - Screenshots if applicable
   - Error messages
   - Related issues

### Feature Requests

For feature requests, please include:

1. **Use case** - Why is this feature needed?
2. **Proposed solution** - How should it work?
3. **Alternatives considered** - Other approaches you've thought of
4. **Additional context** - Any other relevant information

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical fixes

### Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create a git tag
4. Create GitHub release
5. Deploy to production

### Testing

While we don't have automated tests yet, please:

- Test your changes manually
- Test in different browsers (Chrome, Firefox, Safari)
- Test with different image formats and sizes
- Test error scenarios

## Getting Help

- **GitHub Issues** - For bug reports and feature requests
- **Discussions** - For questions and general discussion
- **Maintainers** - Tag maintainers in issues for urgent matters

## Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes
- Annual contributor highlights

Thank you for contributing to WebAssembly Image Editor! 🎉
