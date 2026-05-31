# Contributing to AgentBoard CE

Thank you for your interest in contributing to AgentBoard CE! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guide](#style-guide)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature or fix
4. Make your changes
5. Submit a pull request

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

When creating a bug report, include:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, Node.js version)

### Suggesting Features

Feature suggestions are welcome! Please include:

- A clear, descriptive title
- Detailed description of the feature
- Use cases and motivation
- Potential implementation approach (if you have one)

### Pull Requests

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes
4. Add or update tests as needed
5. Update documentation if needed
6. Ensure all tests pass
7. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/agentboard-ce.git
cd agentboard-ce

# Install dependencies
npm install

# Set up the database
npx prisma migrate dev

# Seed with sample data
npm run seed

# Start development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database
- `npx prisma migrate` - Run migrations
- `npx prisma studio` - Open Prisma Studio

## Pull Request Process

1. Update the README.md if needed
2. Update documentation if needed
3. Add tests for new features
4. Ensure all tests pass
5. Ensure the build passes
6. Request review from maintainers

## Style Guide

### Code Style

- Use TypeScript for all new code
- Follow existing code patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Commit Messages

Use conventional commit messages:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

Examples:
```
feat(projects): add project filtering
fix(commands): fix command execution timeout
docs(readme): update installation instructions
```

### Branch Naming

Use descriptive branch names:

```
feature/add-project-filtering
fix/command-execution-timeout
docs/update-readme
```

## Reporting Bugs

### Before Submitting

1. Check existing issues
2. Try the latest version
3. Reproduce the issue

### Bug Report Template

```markdown
## Description
[Clear description of the bug]

## Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- OS: [e.g., macOS 14.2]
- Browser: [e.g., Chrome 120]
- Node.js: [e.g., 20.10]

## Screenshots
[If applicable]
```

## Suggesting Features

### Feature Request Template

```markdown
## Description
[Clear description of the feature]

## Use Cases
[How would this feature be used?]

## Motivation
[Why is this feature needed?]

## Potential Implementation
[Optional: How could this be implemented?]
```

## Questions?

If you have questions, feel free to:

1. Open an issue
2. Start a discussion
3. Contact the maintainers

Thank you for contributing to AgentBoard CE!
