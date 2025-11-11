# Dev Console - API Dashboard

A modern, lightweight sandbox console for managing API keys and visualizing usage analytics.

## 🚀 Deployed Demo on Vercel

**Live URL:** https://api-dashboard-fo9z0pmow-lykhoydas-projects.vercel.app

---

## 📋 Table of Contents

- [Core Questions](#core-questions-from-the-task-description)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [Tech Stack](#tech-stack)

---


## Core questions from the task description
1) Auth - Sign in and sign out options.

I chose Option C: Local mock session stored in localStorage. As it suits better to serverless style of the app and easiest
configuration in comparison to the other options. It will be also easier to review as it doesn't require to pass any data to the app. 
Option A with External provider will be redundant here as there is no real backend. Option B with serverless functions 
would add unnecessary complexity for this demo app to manage cookie lifecycle plus additional setup for e2e testing.

2) If I had more time: What would you extend or polish, and why?

Some of the data reflected on the dashboard like API calls, Error rate, and Recent Activity is static, so I would implement
proper reflection of the Test data on those cards as it shows the quick feedback about the state of API. Also, the simplicity of the local storage comes with 
tradeoffs, for example in data inconsistency across multiple tabs or private browsing mode. So I would implement a more robust data
with, for example, PostgreSQL to persist the keys, profile information and feature flags. In case of DB implementation and backend
it would make sense to cover the app with integration tests in addition to the e2e tests.

3) AI coding assistance. If you used tools like Copilot or ChatGPT, what worked well and what did not for this task?

I used the AI coding assistance from Claude Code + MCP servers including Linear for the project management. AI tools worked 
well for this task as it has relatively small scope and clear requirements. The serverless architecture set this project
to the proof of concept category, so the AI tools can help well to prototype the app.

What worked well:
- Analyzing and generating the design for the app using Stitch tool
- Iterative approach to coding with small focused tasks (Spec based approach)
- Generating test data
- Code reviews and suggestions for improvements

What did not work well:
- Need to manage the context window carefully as the conversations can get long
- Suboptimal suggestions for architecture decisions - like over engineering for a simple task
- UI inconsistencies in some generated components

4) State management
State is managed with React Context API for Auth, Environment and Feature Flags contexts. For the small app is sufficient to
use React core API without introducing additional dependencies like Redux or Zustand for more complex state updates.


5) Routing
For routing React Router v7 is used for a simple routing with Layout and protected routes.


6) Testing strategy
For testing Playwright is used for E2E tests covering the happy paths of the core requirements. We don't have any
complex business logic here that would require unit tests, so E2E tests provide sufficient coverage for the user flows.
And absence of backend makes the integration tests redundant as well.


7) Feature Toggle
Feature flag is demonstrated with Card vs Table View toggle for the API Keys page. The need is in such
toggle is more artificial for this demo app, but it shows the clear pattern for feature flag implementation. In the
real scenario it would be probably related to a special key management feature or key type. 

### Time Estimate

**Total Development Time:** Approximately **18-20 hours**

## Getting Started

### Prerequisites

- **Node.js 20+** (tested with Node 23.1.0)
- **Yarn 4** (Berry) package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd api-dashboard

# Install dependencies
yarn install

# Generate mock data (API keys + usage data)
yarn seed:all
```

### Development

```bash
# Start dev server (http://localhost:5173)
yarn dev

# Run TypeScript type checking
yarn tsc --noEmit

# Run linter
yarn check

# Format code
yarn format

# Build for production
yarn build

# Preview production build
yarn preview
```

## Generating Test Data

This project uses **static mock data** (no backend required). All data is pre-generated and stored in `public/data/`:

```bash
# Generate all mock data (API keys + usage data)
yarn seed:all
```

This creates:
- **API Keys** (`public/data/api-keys.json`) - 6 sample keys (4 test, 2 production, 1 revoked)
- **Usage Data** (`public/data/usage-test.json`) - ~9.5k requests over 14 days
- **Usage Data** (`public/data/usage-production.json`) - ~3.8k requests over 14 days

### How It Works

1. **Build Time**: Run `yarn seed:all` to generate static JSON files
2. **Runtime**: App loads keys from JSON into localStorage on first visit
3. **Persistence**: Keys cached in localStorage, usage data fetched as needed

### Data Characteristics

- **Realistic patterns**: Weekday peaks, business hours (9am-5pm), error spikes
- **Referential integrity**: Usage requests reference actual key IDs
- **Type safety**: Shared TypeScript types between generator and app

## Testing

### E2E Tests (Playwright)

The project includes comprehensive end-to-end tests covering all required functionality:

```bash
# Run all E2E tests
yarn test:e2e

# Run tests with UI mode (interactive)
yarn test:e2e:ui

# Debug tests
yarn test:e2e:debug
```

## Tech Stack
**Core:**
- **React 19** - Latest React with modern hooks and concurrent features
- **TypeScript 5.7** - Strict type safety throughout
- **Vite 7** - Lightning-fast dev server and build tool
- **React Router v7** - Client-side routing with layout routes

**UI & Styling:**
- **Tailwind CSS v4** - Utility-first styling with design tokens
- **shadcn/ui** - High-quality components (New York style)
- **Radix UI** - Accessible component primitives
- **Lucide React** - Modern icon library

**Data & Charts:**
- **Recharts** - Composable charting library
- **localStorage** - Client-side persistence
- **Synthetic data** - Realistic usage patterns (14 days)

**Quality & Testing:**
- **Biome** - Fast linter and formatter (~25x faster than ESLint)
- **Playwright** - E2E testing framework
- **TypeScript strict mode** - Maximum type safety

**Deployment:**
- **Vercel** - Platform for frontend deployment

---