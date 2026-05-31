# GitHub Release Checklist

Use this checklist before publishing AgentBoard CE to GitHub.

## Pre-Release Checks

### Build and Lint

- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] No TypeScript errors
- [ ] No console errors in development

### Internationalization

- [ ] Default UI language is English
- [ ] Chinese (zh-CN) language switching works
- [ ] Russian (ru) language switching works
- [ ] No raw translation keys visible in the UI
- [ ] Language choice persists after refresh

### Security

- [ ] No secrets in the repository (API keys, passwords, tokens)
- [ ] No local database file committed (`prisma/dev.db` is in `.gitignore`)
- [ ] No private paths in code or seed data
- [ ] No private server IPs or customer data
- [ ] `.env` is in `.gitignore`
- [ ] `.env.example` contains only safe placeholders
- [ ] Dangerous command detection works correctly

### Documentation

- [ ] README.md is complete and accurate
- [ ] LICENSE file exists (MIT)
- [ ] CONTRIBUTING.md exists
- [ ] SECURITY.md exists
- [ ] CODE_OF_CONDUCT.md exists
- [ ] CHANGELOG.md exists with v0.1.0 entry
- [ ] docs/ directory has all planned files

### Repository

- [ ] `.gitignore` covers all local/generated files
- [ ] No `node_modules` directory committed
- [ ] No `.next` directory committed
- [ ] No `.DS_Store` files committed
- [ ] `screenshots/` directory exists with README

### Seed Data

- [ ] Seed data uses generic project names
- [ ] No private paths in seed data
- [ ] No real server IPs in seed data
- [ ] `npm run seed` works correctly

## Release Steps

1. [ ] Create GitHub repository
2. [ ] Push main branch
3. [ ] Create `v0.1.0` tag
4. [ ] Publish first GitHub Release with release notes from CHANGELOG.md
5. [ ] Open roadmap issues for v0.2.0 features
6. [ ] Add screenshots to `screenshots/` directory

## Post-Release

- [ ] Monitor issues for bug reports
- [ ] Respond to community feedback
- [ ] Plan v0.2.0 milestone
