# Installation Guide

## Prerequisites

Before installing AgentBoard CE, make sure you have the following:

- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher (or yarn/pnpm)
- **Git**: For version control features

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/agentboard-ce.git
cd agentboard-ce
```

### 2. Install Dependencies

```bash
npm install
```

Or using yarn:

```bash
yarn install
```

Or using pnpm:

```bash
pnpm install
```

### 3. Set Up Environment

Copy the example environment file:

```bash
cp .env.example .env
```

The default configuration should work for local development.

### 4. Set Up Database

Run the database migrations:

```bash
npx prisma migrate dev
```

This will create the SQLite database and apply all migrations.

### 5. Seed Sample Data

```bash
npm run seed
```

This will populate the database with sample projects, agent profiles, and command templates.

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Build

To create a production build:

```bash
npm run build
npm run start
```

## Database Management

### View Database

```bash
npx prisma studio
```

This opens a web interface to view and edit your data.

### Reset Database

```bash
npx prisma migrate reset
npm run seed
```

### Backup Database

The database file is located at `prisma/dev.db`. You can back it up by copying this file.

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database path | `file:./dev.db` |

### Settings

You can configure the following in the Settings page:

- **Theme**: Light, Dark, or System
- **Default Project Path**: Where your projects are located
- **Default Package Manager**: npm, yarn, pnpm, or bun
- **Command Runner Mode**: Streamed or Terminal
- **Dangerous Command Confirmation**: Enable/disable

## Troubleshooting

### Database Errors

If you encounter database errors:

```bash
npx prisma migrate reset
npx prisma migrate dev
npm run seed
```

### Port Already in Use

If port 3000 is already in use:

```bash
npm run dev -- -p 3001
```

### Build Errors

If you encounter build errors:

```bash
rm -rf .next node_modules
npm install
npm run build
```

### Permission Errors

On macOS/Linux, you might need to adjust permissions:

```bash
chmod +x node_modules/.bin/*
```

## Updating

To update to the latest version:

```bash
git pull origin main
npm install
npx prisma migrate dev
npm run seed
```

## Uninstalling

To remove AgentBoard CE:

1. Delete the project directory
2. Remove the database file if desired

## Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Search existing [GitHub Issues](https://github.com/YOUR_USERNAME/agentboard-ce/issues)
3. Create a new issue with details about your problem

## Next Steps

- [Quick Start Guide](quick-start.md)
- [Architecture Overview](architecture.md)
- [Contributing Guide](../CONTRIBUTING.md)
