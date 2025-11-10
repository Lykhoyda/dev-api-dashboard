# API Dashboard Console

A modern, lightweight API key management and usage analytics dashboard built with React 19, TypeScript, and Vite 7.

## Overview

This is a pragmatic sandbox console for managing pretend API keys and visualizing usage analytics. Built as a take-home assignment with a focus on simplicity and clean code architecture.

## Features

- **API Key Management** - Create, revoke, regenerate, and delete API keys for test and production environments
- **Usage Analytics** - View 14 days of synthetic usage data with realistic patterns
- **Environment Separation** - Separate test (sk_test_*) and production (sk_live_*) API keys
- **Responsive UI** - Modern interface built with shadcn/ui components
- **Type-Safe** - Full TypeScript coverage with strict type checking

## Tech Stack

- **React 19** - Latest React with modern hooks
- **TypeScript 5.7** - Full type safety
- **Vite 7** - Fast build tool and dev server
- **Tailwind CSS 3** - Utility-first styling
- **shadcn/ui** - High-quality UI components
- **Biome** - Fast linter and formatter
- **Radix UI** - Accessible component primitives

## Getting Started

### Prerequisites

- Node.js 18+ (using Node 23.1.0)
- Yarn package manager

### Installation

```bash
# Install dependencies
yarn install

# Generate synthetic usage data
yarn tsx scripts/generateUsageData.ts
```

### Development

```bash
# Start dev server (http://localhost:5173)
yarn dev

# Run TypeScript type checking
yarn tsc --noEmit

# Run linter
yarn biome check

# Format code
yarn format

# Build for production
yarn build
```

## Project Structure

```
api-dashboard/
├── docs/               # Architecture Decision Records and documentation
│   ├── DECISIONS.md    # Technical decisions log (ADRs)
│   ├── ROADMAP.md      # Project roadmap and progress
│   └── ORIGINAL_TASK.md
├── public/data/        # Generated synthetic usage data
│   ├── usage-test.json (~2.2MB, 9.5k requests)
│   └── usage-production.json (~903KB, 3.8k requests)
├── scripts/
│   └── generateUsageData.ts  # Synthetic data generator
├── src/
│   ├── components/     # React components
│   │   ├── layout/     # AppShell, Header
│   │   └── ui/         # shadcn/ui components
│   ├── lib/            # Utilities and business logic
│   │   ├── apiKeys.ts  # API key management (174 lines)
│   │   └── utils.ts    # cn() utility
│   ├── pages/          # Page components
│   ├── types/          # TypeScript type definitions
│   └── main.tsx        # Application entry point
└── package.json
```

## Data Generation

The project includes a synthetic data generator that creates realistic API usage patterns:

```bash
yarn tsx scripts/generateUsageData.ts
```

**Output:**
- 14 days of data (optimized for "tiny" dataset requirement)
- Weekday vs weekend patterns (weekdays have 2.5x traffic)
- Business hour peaks (9am-5pm higher usage)
- Realistic status code distribution (95% 2xx, 3% 4xx, 2% 5xx)
- Response times: 50-500ms typical, occasional outliers up to 3000ms
- Multiple endpoints: `/api/users`, `/api/payments`, `/api/reports`, etc.

## Architecture Decisions

All technical decisions are documented in Architecture Decision Records (ADRs). Key decisions:

- **ADR-031**: YAGNI Simplification - Removed 820+ lines of unused utilities
- **ADR-032**: Simple API Key Management - Functional approach over repository pattern (68% code reduction)
- **ADR-029**: Synthetic Data Generation - 14 days optimized for instant first paint
- **ADR-030**: Modern Clipboard API - Removed legacy fallback

See [docs/DECISIONS.md](./docs/DECISIONS.md) for complete ADR history.

## Security Notes

⚠️ **This is a demo/sandbox console with pretend API keys.**

- API keys are stored in browser localStorage as plain text
- This is acceptable for demo purposes ONLY
- DO NOT use this pattern for real API keys in production
- Production systems should use secure backend storage with encryption at rest

## Code Quality

- **Type Safety**: 100% TypeScript coverage, strict mode enabled
- **Linting**: Biome for fast, consistent code quality
- **Formatting**: Automatic code formatting with Biome
- **Build Size**: ~314 kB gzipped production bundle
- **Code Reduction**: Applied YAGNI principle throughout (removed 820+ unused lines)

## Documentation

- [DECISIONS.md](./docs/DECISIONS.md) - Architecture Decision Records
- [ROADMAP.md](./docs/ROADMAP.md) - Project roadmap and progress
- [ORIGINAL_TASK.md](./docs/ORIGINAL_TASK.md) - Original assignment requirements

## Development Principles

This project follows pragmatic development principles:

1. **YAGNI** (You Aren't Gonna Need It) - Don't build features until needed
2. **Simplicity** - Prefer simple solutions over complex abstractions
3. **Type Safety** - Leverage TypeScript for compile-time safety
4. **Documentation** - ADRs for all architectural decisions
5. **Code Quality** - Consistent linting and formatting

## License

This is a take-home assignment project for demonstration purposes.
