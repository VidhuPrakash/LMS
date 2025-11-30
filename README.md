# LSM Application

> A modern fullstack Learning Management System built with cutting-edge technologies

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-latest-red)](https://turbo.build/)

## 🚀 Tech Stack

### Backend

- **Runtime**: Bun - High-performance JavaScript runtime
- **Framework**: Hono - Lightweight and fast web framework
- **Database**: Neon Serverless PostgreSQL
- **ORM**: Drizzle ORM with drizzle-kit
- **Real-time**: WebSocket support via `ws` library

### Frontend

- **Framework**: Next.js 16 with App Router
- **UI Library**: React 19
- **Styling**: TailwindCSS
- **Type Safety**: TypeScript 5.0+

### Developer Tools

- **Monorepo**: Turborepo for task orchestration
- **Code Quality**: Biome (replaces ESLint + Prettier)
- **Git Hooks**: Husky for pre-commit checks
- **Package Manager**: Bun/pnpm workspaces

## 📁 Project Structure

```

.
├── apps/
│ ├── server/ # Backend API (Bun + Hono)
│ └── client/ # Frontend app (Next.js + React)
├── packages/ # Shared packages (if any)
├── .husky/ # Git hooks configuration
├── turbo.json # Turborepo configuration
├── biome.json # Biome linting/formatting config
├── package.json # Root workspace config
└── README.md

```

## 🛠️ Getting Started

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0.0
- [Node.js](https://nodejs.org/) >= 20.0.0 (for Next.js)
- Git (use Git CLI for commits)

### Installation

1. **Clone the repository**

```

git clone https://github.com/hafizjaleel/LMS
cd LSM

```

2. **Install dependencies**

```

pnpm install

```

3. **Set up environment variables**

Create `.env` file in `apps/server/`:

```

DATABASE_URL=your_neon_db_url
AUTH_SECRET=your_secret_key
PORT=3001

```

4. **Set up the database**

```

pnpm run db:generate # Generate migrations
pnpm run db:migrate # Run migrations

```

5. **Start development servers**

```

pnpm run dev # Starts both client and server

```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/docs

## 📜 Available Scripts

### Root Commands (run from project root)

| Command               | Description                        |
| --------------------- | ---------------------------------- |
| `pnpm run dev`        | Start all apps in development mode |
| `pnpm run build`      | Build all apps for production      |
| `pnpm run lint`       | Lint all packages with Biome       |
| `pnpm run type-check` | Run TypeScript type checking       |
| `pnpm run format`     | Format code with Biome             |
| `pnpm run check`      | Run Biome checks and auto-fix      |

### Backend Commands (apps/server)

```

cd apps/server

pnpm run dev # Start development server
pnpm run build # Build for production
pnpm run start # Start production server
pnpm run type-check # TypeScript type checking
pnpm run lint # Lint with Biome

```

### Database Commands (Drizzle)

```

pnpm run db:generate # Generate migration files
pnpm run db:migrate # Apply migrations to database
pnpm run db:push # Push schema changes directly
pnpm run db:studio # Open Drizzle Studio (GUI)

```

### Frontend Commands (apps/client)

```

pnpm run --filter=client dev # Start Next.js dev server
pnpm run --filter=client build # Build for production
pnpm run --filter=client start # Start production server
pnpm run --filter=client lint # Lint Next.js app

```

## 🔧 Development Workflow

### Making Changes

1. Create a new branch for your feature

```

git checkout -b feature/your-feature-name

```

2. Make your changes and ensure code quality

```

pnpm run check # Run Biome checks
pnpm run type-check # Verify TypeScript

```

3. **Use Git CLI for commits** (required)

```

git add .
git commit # Triggers Husky hooks automatically

```

Husky will automatically:

- Format code with Biome
- Run linting checks
- Build the web app
- Validate commit message format

### Pre-commit Hooks

The project uses Husky to enforce code quality:

- ✅ Biome formatting and linting
- ✅ TypeScript type checking
- ✅ Build validation for `apps/web`
- ✅ Conventional commit message format

## 📚 API Documentation

Interactive API documentation is available via Swagger UI when the server is running:

🔗 http://localhost:3001/docs

## 🏗️ Build for Production

```

# Build all apps

pnpm run build

# Start backend in production

cd apps/server && pnpm run start

# Start frontend in production

cd apps/client && pnpm run start

```

## Caution

1. Ensure all code passes linting and type checks
2. **Always use Git CLI** for commits (GUI commits may bypass hooks)
3. Follow the conventional commit format
4. Write meaningful commit messages
