# Commit Rules & Guidelines

This document defines the commit standards, versioning rules, and development workflow for the WebAssembly Image Editor project.

## Overview

This repository follows **Semantic Versioning** with phase-based development. Each phase corresponds to a minor version increment, while breaking changes require major version bumps.

## Version System

### Current Version: v0.1.0

### Version Pattern

- **Major**: Breaking changes (0.x.x → 1.x.x)
- **Minor**: Phase completion (0.1.x → 0.2.x)
- **Patch**: Bug fixes, documentation, minor improvements (0.1.0 → 0.1.1)

### Phase-Based Versioning

The project follows a structured phase approach where each completed phase triggers a minor version bump:

- **Phase 1**: Essential User Experience (v0.2.0)
- **Phase 2**: Image Transformations (v0.3.0)
- **Phase 3**: Professional Features (v0.4.0)
- **Phase 4**: Performance & UX (v0.5.0)
- **Phase 5**: Advanced Features (v0.6.0)

## Commit Message Format

### Standard Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- **feat**: New features (phase completion, major functionality)
- **fix**: Bug fixes
- **docs**: Documentation updates
- **style**: Code formatting, linting (no functional changes)
- **refactor**: Code refactoring without functional changes
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependency updates
- **perf**: Performance improvements

### Scopes

- **phase**: Phase completion and major milestones
- **wasm**: WebAssembly module and C++ code
- **filters**: Image filters and processing
- **transforms**: Image transformations (rotate, crop, flip)
- **export**: Export and download functionality
- **ui**: User interface components and styling
- **perf**: Performance optimizations
- **api**: API endpoints and server-side code
- **deps**: Dependency updates
- **config**: Configuration changes
- **docs**: Documentation updates
- **pwa**: Progressive Web App features
- **mobile**: Mobile responsiveness and touch support
- **presets**: Preset system and management
- **history**: Undo/redo functionality
- **comparison**: Before/after comparison features

### Examples

#### Phase Completion (Minor Version)

```bash
feat(phase): Complete Phase 1 - Essential User Experience (v0.2.0)
feat(wasm): implement export and undo/redo systems (v0.2.0)
```

#### Documentation Updates

```bash
docs: update CHANGELOG.md for v0.2.0
docs: synchronize README with current implementation
docs: update PLAN.md with progress tracking
```

#### Code Changes

```bash
feat(wasm): implement blur and sharpen filters
feat(transforms): add rotation and flip transformations
feat(export): add multi-format export support
feat(history): implement undo/redo system
fix(wasm): resolve memory leak in image processing
refactor(ui): optimize component structure
style: apply biome formatting rules
```

#### Version Bumps

```bash
chore: bump version to 0.2.0
```

## Complete Development Workflow

### Automated Scripts

The repository now has optimized scripts that handle the complete workflow:

#### Development Commands

```bash
# Start development server
pnpm run dev
# Runs: next dev with hot reload

# Production build with full validation
pnpm run build
# Runs: format → lint → next build

# WebAssembly operations
pnpm run build:wasm      # Build WASM module (Windows)
pnpm run build:wasm:unix # Build WASM module (Unix/Mac)

# Code quality
pnpm run format          # Apply biome formatting
pnpm run lint            # Run biome checks
```

#### Pre-commit Hook (Automatic)

The pre-commit hook automatically handles staged files:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Check if there are staged files
if git diff --cached --quiet; then
  echo "🔄 Staged files detected, running workflow..."

  # 1. Build WASM module if C++ files changed
  if git diff --cached --name-only | grep -q '\.cpp$'; then
    echo "� Building WebAssembly module..."
    pnpm run build:wasm
  fi

  # 2. Format all files
  echo "🎨 Formatting files..."
  pnpm run format

  # 3. Add formatted files to staging
  git add .

  # 4. Final lint check
  echo "🔍 Running lint check..."
  pnpm run lint

  echo "✅ Pre-commit workflow complete"
else
  echo "ℹ️ No staged files, skipping pre-commit workflow"
fi
```

### AI-Assisted Commit Workflow

### Complete Automated Commit Process

When you're ready to commit changes, use this AI-assisted workflow that handles the complete process:

```bash
# Trigger the AI commit workflow
ai: run commit rules
```

#### Workflow Steps (Executed in Order)

1. **WebAssembly Build (if needed)**

   ```bash
   pnpm run build:wasm
   ```

   - Builds the WASM module from C++ source files
   - Only runs when C++ files are modified
   - Ensures compiled binary is up-to-date

2. **Markdown Files Validation**

   - Scans all `.md` files for consistency
   - Validates documentation structure and formatting
   - Checks for broken links and references
   - Ensures all docs follow project standards

3. **Development Plan Progress Check**

   - Analyzes current progress against DEVELOPMENT_PLAN.md
   - Identifies completed tasks and milestones
   - Checks phase completion status
   - Validates implementation progress

4. **Documentation Updates**

   - Updates version numbers in relevant files
   - Marks completed tasks in DEVELOPMENT_PLAN.md
   - Updates README.md with current state
   - Updates any other documentation files as needed

5. **Code Formatting**

   ```bash
   pnpm run format
   ```

   - Applies consistent formatting across all files
   - Uses Biome for optimal performance
   - Ensures code style consistency

6. **Linting**

   ```bash
   pnpm run lint
   ```

   - Runs comprehensive linting checks
   - Validates code quality and standards
   - Catches potential issues early

7. **Build Validation**

   ```bash
   pnpm run build
   ```

   - Builds the entire application
   - Validates all components and dependencies
   - Ensures production readiness

8. **Git Operations**

   ```bash
   git add .
   git commit -m "<commit-message>"
   ```

   - Stages all changes
   - Creates commit with appropriate message
   - Ensures all generated files are included

9. **Version Tagging**

   ```bash
   git tag v<version>
   ```

   - Creates version tag for the commit
   - Follows semantic versioning rules
   - Enables easy rollback and tracking

10. **Tag Verification and Updates**

- **Critical**: Ensure version tag points to the latest commit containing all version changes
- If additional commits are made after version bump, update the tag:
  ```bash
  git tag -d v<version>        # Delete old tag
  git tag v<version>            # Recreate tag on latest commit
  ```
- Verify tag points to correct commit:
  ```bash
  git show v<version> --oneline
  ```
- Tag must include ALL changes for that version (documentation, code, version bump)
- Never push outdated tags to remote

#### Usage Examples

##### Regular Development Commit

```bash
ai: run commit rules
# Output: feat(filters): add blur and sharpen filters (v0.1.1)
```

##### Phase Completion Commit

```bash
ai: run commit rules
# Output: feat(phase): Complete Phase 1 - Essential User Experience (v0.2.0)
```

##### Bug Fix Commit

```bash
ai: run commit rules
# Output: fix(wasm): resolve memory leak in image processing (v0.1.1)
```

#### AI Commit Message Generation

The AI will automatically generate appropriate commit messages based on:

- **Type of changes** (feat, fix, docs, etc.)
- **Scope** (phase, wasm, filters, transforms, export, ui, perf, etc.)
- **Version impact** (patch, minor, major)
- **Content analysis** of modified files
- **Progress status** from DEVELOPMENT_PLAN.md

#### Error Handling

If any step fails:

- Process stops immediately
- Clear error message provided
- Suggestions for fixing the issue
- Resume from failed step after fixes

#### Quality Gates

The workflow enforces these quality standards:

- WASM builds succeed (when C++ files are modified)
- All markdown files are valid
- Documentation is consistent
- Code formatting is applied
- Linting passes without errors
- Build completes successfully
- Git operations complete cleanly

## Manual Development Process

### For Regular Development

```bash
# 1. Make your changes
# Edit files, add features, fix bugs

# 2. Stage your changes
git add <specific-files>
# OR git add . for all changes

# 3. Commit (automatic pre-commit runs)
git commit -m "feat(task): add new component"

# Pre-commit automatically runs:
# - build:wasm (if C++ files changed) → format → lint
```

### For Releases (Phase Completion or Bug Fixes)

```bash
# 1. Complete your work
# Finish phase or fix bugs

# 2. Update documentation FIRST
git add README.md DEVELOPMENT_PLAN.md package.json

# 3. Commit documentation updates
git commit -m "docs: update README.md for v0.2.0"

# 4. Bump version
git commit -m "chore: bump version to 0.2.0"

# 5. Phase completion/Bug fix commit
git commit -m "feat(phase): Complete Phase 1 - Essential User Experience (v0.2.0)"

# 6. Create tag
git tag v0.2.0

# 7. Push everything
git push origin main v0.2.0
```

### Key Workflow Features

- WASM Build: Runs before dev/build when C++ files change
- Smart Staging: Automatically adds generated WASM files to staging
- Sequential Processing: build:wasm → format → lint
- No Conflicts: Handles generated files properly
- Git Add Awareness: Checks what changes before staging

## Version Release Process

### 1. Phase Completion

When a phase is complete:

1. **Update Documentation**

   ```bash
   docs: update README.md for v0.2.0
   docs: update DEVELOPMENT_PLAN.md to mark Phase 1 complete
   docs: update project documentation with current features
   ```

2. **Version Bump**

   ```bash
   chore: bump version to 0.2.0
   ```

3. **Phase Completion Commit**

   ```bash
   feat(phase): Complete Phase 1 - Essential User Experience (v0.2.0)
   ```

4. **Create Tag**
   ```bash
   git tag v0.2.0
   ```

### 2. Patch Releases

For bug fixes and minor improvements:

1. **Fix Implementation**

   ```bash
   fix(wasm): resolve memory leak in image processing
   ```

2. **Version Bump**

   ```bash
   chore: bump version to 0.1.1
   ```

3. **Documentation Update**

   ```bash
   docs: update README.md for v0.1.1
   ```

4. **Create Tag**
   ```bash
   git tag v0.1.1
   ```

## Documentation Updates Required

### For Every Release

Always update these files in order:

1. **README.md** - Update current state and implemented features
2. **DEVELOPMENT_PLAN.md** - Update phase completion status if applicable
3. **package.json** - Version number (automated with bump commit)

### Documentation Consistency Requirements

**CRITICAL**: All documentation files must show consistent version information:

- **package.json version** must match **DEVELOPMENT_PLAN.md current state**
- **README.md** must reflect current implemented features
- **Version tag** must point to commit containing ALL documentation updates
- **Version verification checklist**:

  ```bash
  # Check package.json version
  grep '"version"' package.json

  # Check DEVELOPMENT_PLAN.md status
  grep "Current State Analysis" DEVELOPMENT_PLAN.md

  # Verify README.md reflects current state
  grep "## Current State" README.md

  # Verify tag points to latest commit
  git show v<version> --oneline
  ```

- **If inconsistencies found**: Update documentation BEFORE creating final tag
- **Never push**: Inconsistent version information across files

### README.md Format

```markdown
## Features

- **10 Professional Filters**: Invert, Grayscale, Brightness, Contrast, Gamma, Sepia, Saturation, Temperature, Fade, Solarize
- **Real-time Preview**: Instant visual feedback as you adjust filter parameters
- **WebAssembly Performance**: C++-compiled image processing for maximum speed
- **Non-blocking UI**: Web Worker architecture prevents interface freezing
- **Modern UI**: Clean, responsive interface built with shadcn/ui components
- **Dark/Light Theme**: Automatic theme switching support

## Current State

- ✅ **Core Feature**: 10 professional filters with real-time preview
- ✅ **Performance**: WebAssembly + Web Worker architecture
- ✅ **UI**: Modern shadcn/ui components
- 🚧 **In Development**: Export, undo/redo, transformations
- 📋 **Planned**: Presets, batch processing, advanced color tools
```

## Progress Tracking

### Phase Progress

Track progress in DEVELOPMENT_PLAN.md:

- Completed phases
- Current phase in development
- Planned phases

### Implementation Status

In README.md:

- Implemented features
- In development
- Planned features

## Quality Gates

### Pre-Commit Checks

All commits must pass:

```bash
pnpm run lint      # Biome formatting and linting
pnpm run build     # Next.js build
pnpm run build:wasm # WASM build (if C++ files changed)
```

### Pre-Release Checks

Before creating a release tag:

1. All tests pass
2. Build succeeds
3. WASM module builds (if applicable)
4. Documentation is updated
5. README.md is current
6. Version is bumped in package.json

## Template-Specific Rules

### What to Commit

- WebAssembly module improvements
- Image filters and processing algorithms
- Image transformations (rotate, crop, flip, resize)
- Export and download functionality
- UI/UX enhancements
- Performance optimizations
- Mobile responsiveness
- Preset system implementation
- Undo/redo functionality
- Documentation updates
- Bug fixes

### What NOT to Commit

- Test images or sample files
- User-specific configurations
- Temporary build artifacts
- Hardcoded credentials or secrets
- One-off hacks or temporary fixes

### Breaking Changes

- Require major version bump (0.x.x → 1.x.x)
- Must be documented in README.md
- Must update DEVELOPMENT_PLAN.md
- Should be avoided when possible

## Development Workflow

### Feature Development

1. Create feature branch from main
2. Implement changes following commit rules
3. Update documentation as needed
4. Run quality gates
5. Open pull request
6. Merge to main after review

### Phase Completion

1. Ensure all phase tasks are complete
2. Update all documentation files
3. Bump version in package.json
4. Update README.md with new features
5. Update DEVELOPMENT_PLAN.md phase status
6. Create git tag

### Emergency Fixes

1. Create hotfix branch from latest tag
2. Implement fix with proper commit message
3. Bump patch version
4. Update changelog
5. Create new tag
6. Merge back to main

## Commit Message Validation

### Required Format

- Type must be one of: feat, fix, docs, style, refactor, test, chore, perf
- Scope should be relevant to the change
- Description should be concise and clear
- Phase completions must include version number

### Examples of Good Commits

```bash
feat(wasm): implement blur and sharpen filters
feat(transforms): add rotation and flip transformations
feat(export): add multi-format export support
feat(history): implement undo/redo system
fix(wasm): resolve memory leak in image processing
docs: update README.md for v0.2.0
refactor(ui): optimize component structure
chore: bump version to 0.1.1
```

### Examples of Bad Commits

```bash
fixed stuff
update docs
wip
bug fix
add feature
```

## Release Automation

### Manual Release Steps

1. Ensure all changes are committed
2. Update package.json version
3. Update README.md if needed
4. Update DEVELOPMENT_PLAN.md if phase complete
5. Create git tag: `git tag v0.2.0`
6. Push tag: `git push origin v0.2.0`

### Version Bump Commands

```bash
# Patch version (0.1.0 → 0.1.1)
npm version patch

# Minor version (0.1.0 → 0.2.0)
npm version minor

# Major version (0.1.0 → 1.0.0)
npm version major
```

## Checklist for Commits

### Before Committing

- [ ] Code follows project conventions
- [ ] Linting passes (`pnpm run lint`)
- [ ] Build succeeds (`pnpm run build`)
- [ ] WASM builds (if C++ files changed)
- [ ] Documentation is updated if needed
- [ ] Commit message follows format

### Before Release

- [ ] All quality gates pass
- [ ] README.md is updated
- [ ] DEVELOPMENT_PLAN.md is updated if phase complete
- [ ] Version is bumped in package.json
- [ ] Git tag is created
- [ ] Tag is pushed to remote

## History & Context

This commit system is based on:

- **Semantic Versioning** for predictable releases
- **Phase-based development** for structured progress
- **Conventional Commits** for clear history
- **WebAssembly architecture** for high-performance image processing

The current version (v0.1.0) represents the initial foundation with basic image filters, WebAssembly processing, and modern UI ready for Phase 1 implementation.
