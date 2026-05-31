# Changelog

All notable changes to AgentBoard CE will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v0.2.0 - Git Repository Insights

### Added
- Git Insights section on project detail pages
- Local branch and working tree status display
- Remote origin URL display
- Modified, staged, and untracked file lists
- Recent commits overview (last 5 commits)
- Copy Git Summary action for AI coding tools (Codex, Claude, Cursor)
- Refresh Git Status button
- Graceful handling of invalid paths and non-Git folders
- Translations for Git Insights in English, Simplified Chinese, and Russian

## v0.1.0 - Initial MVP

### Added

#### Core Features
- Dashboard with overview statistics and quick actions
- Project registry with CRUD operations
- Command templates with categories (dev, build, test, deploy, git, custom)
- Terminal workspace with command execution and output streaming
- Agent profiles library with 8 pre-configured profiles
- Issue triage workspace with structured draft creation
- PR review workspace with risk assessment
- Release notes generator following Keep a Changelog format
- Settings page with theme, language, and project defaults
- Data export/import as JSON

#### Agent Profiles
- Bug Fixer
- Code Reviewer
- UI Reviewer
- Security Checker
- Docs Writer
- Release Assistant
- Test Writer
- Refactor Planner

#### Internationalization
- Multilingual UI: English (default), Simplified Chinese, Russian
- Language selector in header and settings
- Cookie + localStorage locale persistence
- All UI strings fully translated

#### Technical
- Next.js 15 with App Router
- TypeScript throughout
- SQLite with Prisma ORM
- Tailwind CSS with dark mode support
- Responsive design
- Dangerous command detection and confirmation
- RESTful API routes with Zod validation
- Open-source documentation (README, LICENSE, CONTRIBUTING, SECURITY, CODE_OF_CONDUCT)
