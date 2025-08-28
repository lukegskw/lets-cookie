# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) and Github Copilot when working with code in this repository.

## Common Development Commands

```bash
# Development
npm run watch              # Watch mode for development
npm run build              # Production build
npm run build:pack         # Build and create dist.zip package
npm run release            # Build and package for release

# Testing and Quality
npm test                   # Run Jest tests
npm run lint               # Run ESLint
npm run lint:fix           # Fix linting issues automatically
npm run prettier           # Format code with Prettier

# Utility
npm run clean              # Clean dist directory
npm run prepare            # Setup husky hooks

# Chrome Extension Development
# Load the 'dist' directory in Chrome's extension developer mode after building
```

## Project Architecture

This is a Chrome extension (Manifest v3) that manages cookies.

### Core Structure

- **Content Scripts**:

  - Not implemented

- **Background Service Worker**: `background.ts` handles setting of cookies to target tab.

- **Extension Pages**:
  - Not implemented

### Key Components

- **Settings Management**: Uses Chrome storage API with Yup schema validation (`src/services/getSettings.ts`)
- **Multi-Instance Support**: Supports multiple GitHub instances (Enterprise + GitHub.com) via instance configuration
- **Feature Toggles**: All features are individually toggleable via settings
- **JIRA Integration**: Fetches issue data through background script to bypass CORS

### Build System

- **Webpack**: Multi-entry build with code splitting (vendor chunk for all except background)
- **SASS Modules**: CSS modules with local scope and hash-based class names
- **TypeScript**: Full TypeScript with strict validation
- **Entry Points**: Separate bundles for popup, options, content scripts, and background

### Chrome Extension Permissions

- `storage` - Chrome storage for settings
- `host_permissions: ["<all_urls>"]` - Access to all GitHub instances
- Content scripts inject into `https://*/*` patterns

### Development Workflow

1. Run `npm run watch` for development
2. Load `dist` directory in Chrome extension developer mode
3. Changes auto-reload with webpack watch mode
4. Use `npm run clean` to clear dist before production builds
5. Run `npm test` to execute Jest unit tests
6. Use `npm run lint:fix` to automatically fix linting issues
7. Format code with `npm run prettier` before committing

## Coding Guidelines

- **Type Definitions**: Always use `type` instead of `interface`
- **React Component Props**: Always name component props type as `Props` and never export it
- **Exports**: Never use default exports - always use named exports
- **Component Structure**: Follow existing component folder structure with index.ts barrel exports
- **Type Safety**: Never use `any` type - use proper typing with `unknown` for uncertain types
- **Type Casting**: When type casting is necessary, always include safety checks before casting

## Important Implementation Notes

- Features are conditionally loaded based on current page URL and user settings
- CSS modules prevent style conflicts with GitHub's native styles
- Pre-commit hooks with husky and lint-staged ensure code quality
- All settings are persisted to Chrome's local storage API
- The extension supports hot reloading during development via webpack watch mode
