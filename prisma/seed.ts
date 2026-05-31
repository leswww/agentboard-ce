import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.commandRun.deleteMany();
  await prisma.commandTemplate.deleteMany();
  await prisma.agentProfile.deleteMany();
  await prisma.issueDraft.deleteMany();
  await prisma.prReviewDraft.deleteMany();
  await prisma.releaseNote.deleteMany();
  await prisma.project.deleteMany();
  await prisma.setting.deleteMany();

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      name: "Example Next.js App",
      slug: "example-next-app",
      description: "A modern web application built with Next.js, TypeScript, and Tailwind CSS.",
      localPath: "/Users/you/Projects/example-next-app",
      repositoryUrl: "https://github.com/example/next-app",
      techStack: "Next.js, TypeScript, Tailwind CSS, Prisma",
      packageManager: "npm",
      startCommand: "npm run dev",
      testCommand: "npm run test",
      buildCommand: "npm run build",
      status: "active",
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: "Example iOS App",
      slug: "example-ios-app",
      description: "A mobile application built with SwiftUI and Core Data.",
      localPath: "/Users/you/Projects/example-ios-app",
      repositoryUrl: "https://github.com/example/ios-app",
      techStack: "Swift, SwiftUI, Core Data",
      packageManager: "swift",
      startCommand: "open *.xcodeproj",
      testCommand: "xcodebuild test",
      buildCommand: "xcodebuild build",
      status: "active",
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: "Example API Service",
      slug: "example-api-service",
      description: "A high-performance API service written in Go with gRPC.",
      localPath: "/home/ubuntu/example-service",
      repositoryUrl: "https://github.com/example/api-service",
      techStack: "Go, gRPC, PostgreSQL, Docker",
      packageManager: "go",
      startCommand: "go run main.go",
      testCommand: "go test ./...",
      buildCommand: "go build -o service .",
      status: "active",
    },
  });

  // Create agent profiles
  await prisma.agentProfile.createMany({
    data: [
      {
        name: "Bug Fixer",
        slug: "bug-fixer",
        description: "Specialized in diagnosing and fixing bugs. Works well with Codex and Claude for engineering and logic tasks.",
        category: "Bug Fixer",
        recommendedTool: "Claude",
        systemPrompt: `You are a senior software engineer specializing in debugging and bug fixing.

Your approach:
1. Read the error message and stack trace carefully
2. Identify the root cause, not just the symptom
3. Check for similar patterns elsewhere in the codebase
4. Propose a minimal, targeted fix
5. Verify the fix doesn't introduce regressions
6. Explain the fix clearly

Always:
- Ask for reproduction steps if not provided
- Check for edge cases
- Consider the impact on other parts of the system
- Write or update tests to prevent regression`,
        inputTemplate: `## Bug Report
**Title:** {{title}}
**Description:** {{description}}
**Error Message:** {{errorMessage}}
**Stack Trace:** {{stackTrace}}
**Steps to Reproduce:** {{steps}}
**Expected Behavior:** {{expected}}
**Actual Behavior:** {{actual}}`,
        outputFormat: "Root cause analysis, fix proposal, code changes, test suggestions",
      },
      {
        name: "Code Reviewer",
        slug: "code-reviewer",
        description: "Thorough code reviewer focused on quality, security, and best practices. Optimized for Codex.",
        category: "Code Reviewer",
        recommendedTool: "Codex",
        systemPrompt: `You are an expert code reviewer with deep knowledge of software engineering best practices.

Review focus areas:
1. Code quality and readability
2. Security vulnerabilities
3. Performance implications
4. Error handling
5. Test coverage
6. API design
7. Documentation

Your review style:
- Be specific and actionable
- Provide examples of improvements
- Distinguish between must-fix and nice-to-have
- Acknowledge good patterns when you see them
- Consider the broader architectural impact`,
        inputTemplate: `## Code Review Request
**PR Title:** {{prTitle}}
**Summary:** {{summary}}
**Changed Files:** {{changedFiles}}
**Context:** {{context}}`,
        outputFormat: "Structured review with findings, severity levels, and suggested fixes",
      },
      {
        name: "UI Reviewer",
        slug: "ui-reviewer",
        description: "Expert in UI/UX design, visual polish, and interaction design. Best suited for Antigravity.",
        category: "UI Reviewer",
        recommendedTool: "Antigravity",
        systemPrompt: `You are a UI/UX design expert specializing in visual design and interaction polish.

Your review covers:
1. Visual hierarchy and layout
2. Color usage and contrast
3. Typography and spacing
4. Responsive design
5. Animation and transitions
6. Accessibility (WCAG compliance)
7. User flow and interaction patterns
8. Mobile-first considerations

Design principles you enforce:
- Consistency with design system
- Clear visual hierarchy
- Appropriate use of whitespace
- Intuitive navigation
- Smooth micro-interactions`,
        inputTemplate: `## UI Review Request
**Component/Page:** {{component}}
**Description:** {{description}}
**Design Spec:** {{designSpec}}
**Screenshots:** {{screenshots}}`,
        outputFormat: "Visual review with specific improvement suggestions, CSS/styling recommendations",
      },
      {
        name: "Security Checker",
        slug: "security-checker",
        description: "Focused on identifying security vulnerabilities and recommending secure coding practices.",
        category: "Security Checker",
        recommendedTool: "Generic",
        systemPrompt: `You are a security engineer specializing in application security.

Security areas you check:
1. OWASP Top 10 vulnerabilities
2. Input validation and sanitization
3. Authentication and authorization
4. Data encryption and storage
5. API security
6. Dependency vulnerabilities
7. Configuration security
8. SQL injection, XSS, CSRF prevention

Your approach:
- Identify vulnerabilities with severity ratings
- Provide specific remediation steps
- Reference security best practices
- Consider the full attack surface`,
        inputTemplate: `## Security Review
**Codebase/Feature:** {{target}}
**Description:** {{description}}
**Concerns:** {{concerns}}`,
        outputFormat: "Security findings with CVSS-like severity, remediation steps, and code examples",
      },
      {
        name: "Docs Writer",
        slug: "docs-writer",
        description: "Creates clear, comprehensive documentation for codebases and APIs.",
        category: "Docs Writer",
        recommendedTool: "Generic",
        systemPrompt: `You are a technical writer specializing in developer documentation.

Documentation types you create:
1. API documentation
2. Getting started guides
3. Architecture overviews
4. Code comments and docstrings
5. README files
6. Contributing guidelines
7. Migration guides

Your writing style:
- Clear and concise
- Well-structured with headers
- Includes code examples
- Considers the reader's perspective
- Follows documentation best practices`,
        inputTemplate: `## Documentation Request
**Subject:** {{subject}}
**Audience:** {{audience}}
**Scope:** {{scope}}
**Existing Docs:** {{existingDocs}}`,
        outputFormat: "Markdown documentation with clear structure, examples, and cross-references",
      },
      {
        name: "Release Assistant",
        slug: "release-assistant",
        description: "Helps prepare releases, changelogs, and migration guides.",
        category: "Release Assistant",
        recommendedTool: "Generic",
        systemPrompt: `You are a release management specialist.

Your responsibilities:
1. Generate changelogs from git history
2. Identify breaking changes
3. Write migration guides
4. Create release notes
5. Suggest version numbers (semver)
6. Review release checklists

Release process:
- Analyze commit messages and PRs
- Categorize changes (Added, Changed, Fixed, Security, Breaking)
- Write user-friendly descriptions
- Include upgrade instructions when needed`,
        inputTemplate: `## Release Preparation
**Project:** {{project}}
**Version:** {{version}}
**Previous Version:** {{previousVersion}}
**Changes:** {{changes}}`,
        outputFormat: "Changelog, release notes, migration guide, and version recommendation",
      },
      {
        name: "Test Writer",
        slug: "test-writer",
        description: "Creates comprehensive test suites with good coverage and meaningful assertions.",
        category: "Test Writer",
        recommendedTool: "Claude",
        systemPrompt: `You are a test engineering specialist.

Test types you write:
1. Unit tests
2. Integration tests
3. End-to-end tests
4. Performance tests
5. Security tests

Testing principles:
- Test behavior, not implementation
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies appropriately
- Test edge cases and error paths
- Aim for meaningful coverage, not just high percentages`,
        inputTemplate: `## Test Writing Request
**Code to Test:** {{code}}
**Language/Framework:** {{framework}}
**Coverage Goals:** {{goals}}
**Edge Cases:** {{edgeCases}}`,
        outputFormat: "Test code with clear descriptions, setup/teardown, and coverage analysis",
      },
      {
        name: "Refactor Planner",
        slug: "refactor-planner",
        description: "Plans and executes code refactoring with minimal risk and maximum impact.",
        category: "Refactor Planner",
        recommendedTool: "Claude",
        systemPrompt: `You are a software architecture and refactoring specialist.

Refactoring approach:
1. Analyze current code structure
2. Identify code smells and technical debt
3. Propose incremental refactoring steps
4. Ensure each step is safe and testable
5. Maintain backward compatibility when possible
6. Document the refactoring plan

Common refactoring patterns:
- Extract function/class/method
- Rename for clarity
- Simplify conditional logic
- Remove duplication
- Improve naming
- Separate concerns`,
        inputTemplate: `## Refactoring Request
**Target Code:** {{code}}
**Goals:** {{goals}}
**Constraints:** {{constraints}}
**Risk Tolerance:** {{riskLevel}}`,
        outputFormat: "Step-by-step refactoring plan with before/after code examples and risk assessment",
      },
    ],
  });

  // Create command templates
  await prisma.commandTemplate.createMany({
    data: [
      {
        name: "Start Dev Server",
        description: "Start the Next.js development server with Turbopack",
        command: "npm run dev",
        category: "dev",
        projectId: project1.id,
      },
      {
        name: "Run Tests",
        description: "Run the test suite with coverage",
        command: "npm run test -- --coverage",
        category: "test",
        projectId: project1.id,
      },
      {
        name: "Build Production",
        description: "Create a production build",
        command: "npm run build",
        category: "build",
        projectId: project1.id,
      },
      {
        name: "Git Status",
        description: "Check current git status",
        command: "git status",
        category: "git",
      },
      {
        name: "Docker Compose Up",
        description: "Start all services with Docker Compose",
        command: "docker-compose up -d",
        category: "dev",
      },
    ],
  });

  // Create sample issue draft
  await prisma.issueDraft.create({
    data: {
      projectId: project1.id,
      issueTitle: "Dashboard crashes when filtering by date range",
      issueBody: "The dashboard becomes unresponsive when selecting a custom date range larger than 90 days.",
      environment: "macOS 14.2, Chrome 120, Node.js 20.10",
      expectedBehavior: "Date filter should apply smoothly regardless of range size.",
      actualBehavior: "UI freezes and eventually the tab crashes with out-of-memory error.",
      additionalNotes: "Seems to be related to the chart re-rendering logic.",
      draftType: "Bug",
      draftPriority: "High",
      draftSeverity: "Major",
      affectedArea: "Dashboard - Date Filtering",
      reproductionSteps: "1. Open dashboard\n2. Click date range picker\n3. Select 'Custom Range'\n4. Set start date to 90+ days ago\n5. Apply filter",
      missingInformation: "Browser console logs, memory profiling data",
      suggestedLabels: "bug, dashboard, performance",
      suggestedReply: "Thank you for reporting this issue. We've identified it as a performance problem with large date ranges. We'll investigate the chart rendering logic and optimize for large datasets.",
      suggestedAction: "Investigate chart rendering optimization, consider pagination or data aggregation for large date ranges",
      markdownOutput: `## Bug Report: Dashboard crashes when filtering by date range

**Type:** Bug
**Priority:** High
**Severity:** Major
**Affected Area:** Dashboard - Date Filtering

### Description
The dashboard becomes unresponsive when selecting a custom date range larger than 90 days.

### Environment
- macOS 14.2
- Chrome 120
- Node.js 20.10

### Steps to Reproduce
1. Open dashboard
2. Click date range picker
3. Select 'Custom Range'
4. Set start date to 90+ days ago
5. Apply filter

### Expected Behavior
Date filter should apply smoothly regardless of range size.

### Actual Behavior
UI freezes and eventually the tab crashes with out-of-memory error.

### Additional Notes
Seems to be related to the chart re-rendering logic.

### Suggested Labels
bug, dashboard, performance

### Suggested Next Action
Investigate chart rendering optimization, consider pagination or data aggregation for large date ranges.`,
    },
  });

  // Create sample PR review draft
  await prisma.prReviewDraft.create({
    data: {
      projectId: project1.id,
      prTitle: "feat: Add real-time notifications system",
      prSummary: "Implements WebSocket-based real-time notifications for dashboard updates.",
      changedFilesSummary: "15 files changed: 3 new API routes, 2 new React hooks, 4 component updates, 6 test files",
      testResults: "All 47 tests passing, 2 new integration tests added",
      riskNotes: "Introduces new WebSocket dependency, may need load testing",
      documentationImpact: "API docs updated, README needs WebSocket setup instructions",
      reviewSummary: "Well-structured implementation with good test coverage. The WebSocket integration follows existing patterns. Minor concerns about connection cleanup on unmount.",
      riskLevel: "Medium",
      requiredChanges: "1. Add connection cleanup in useEffect cleanup\n2. Add error boundary for WebSocket failures\n3. Update README with WebSocket setup",
      suggestedApproval: "This is a solid implementation with good test coverage. The WebSocket integration is clean and follows our patterns. Once the minor cleanup items are addressed, this is ready to merge. Great work!",
      suggestedChanges: "Please address the following before merging:\n1. Add proper cleanup for WebSocket connections in the useEffect return\n2. Add an error boundary to handle WebSocket connection failures gracefully\n3. Update the README with WebSocket configuration instructions",
      markdownOutput: `## PR Review: feat: Add real-time notifications system

### Summary
Implements WebSocket-based real-time notifications for dashboard updates.

### Changes
- 15 files changed
- 3 new API routes
- 2 new React hooks
- 4 component updates
- 6 test files

### Test Results
All 47 tests passing, 2 new integration tests added.

### Risk Assessment
**Level:** Medium

Introduces new WebSocket dependency, may need load testing.

### Required Changes
1. Add connection cleanup in useEffect cleanup
2. Add error boundary for WebSocket failures
3. Update README with WebSocket setup

### Suggested Approval Comment
This is a solid implementation with good test coverage. The WebSocket integration is clean and follows our patterns. Once the minor cleanup items are addressed, this is ready to merge. Great work!

### Suggested Request-Changes Comment
Please address the following before merging:
1. Add proper cleanup for WebSocket connections in the useEffect return
2. Add an error boundary to handle WebSocket connection failures gracefully
3. Update the README with WebSocket configuration instructions`,
    },
  });

  // Create sample release note
  await prisma.releaseNote.create({
    data: {
      projectId: project1.id,
      version: "v1.2.0",
      releaseDate: "2024-01-15",
      summary: "Major performance improvements and new notification system.",
      added: "- Real-time notifications via WebSocket\n- Dark mode support\n- Export dashboard data as CSV\n- Keyboard shortcuts for common actions",
      changed: "- Migrated from REST to tRPC for internal APIs\n- Updated dashboard layout for better mobile support\n- Improved search algorithm performance by 3x",
      fixed: "- Fixed date filter crash with large ranges\n- Fixed memory leak in chart component\n- Fixed incorrect timezone handling in reports",
      security: "- Updated all dependencies to latest secure versions\n- Added rate limiting to API endpoints\n- Implemented CSP headers",
      deprecated: "- Legacy REST API endpoints (will be removed in v2.0)",
      removed: "- Removed support for Node.js 16 (minimum now 18)",
      breakingChanges: "- API response format changed for /api/metrics\n- Database schema migration required (run prisma migrate)\n- Minimum Node.js version is now 18",
      migrationGuide: "1. Update Node.js to version 18+\n2. Run \`npx prisma migrate deploy\`\n3. Update API clients to handle new response format\n4. See MIGRATION.md for detailed instructions",
      contributors: "@alice, @bob, @charlie, @dave",
      markdownOutput: `# Release Notes - v1.2.0

**Release Date:** January 15, 2024

## Highlights
Major performance improvements and new notification system.

## Added
- Real-time notifications via WebSocket
- Dark mode support
- Export dashboard data as CSV
- Keyboard shortcuts for common actions

## Changed
- Migrated from REST to tRPC for internal APIs
- Updated dashboard layout for better mobile support
- Improved search algorithm performance by 3x

## Fixed
- Fixed date filter crash with large ranges
- Fixed memory leak in chart component
- Fixed incorrect timezone handling in reports

## Security
- Updated all dependencies to latest secure versions
- Added rate limiting to API endpoints
- Implemented CSP headers

## Deprecated
- Legacy REST API endpoints (will be removed in v2.0)

## Removed
- Removed support for Node.js 16 (minimum now 18)

## Breaking Changes
- API response format changed for /api/metrics
- Database schema migration required (run prisma migrate)
- Minimum Node.js version is now 18

## Migration Guide
1. Update Node.js to version 18+
2. Run \`npx prisma migrate deploy\`
3. Update API clients to handle new response format
4. See MIGRATION.md for detailed instructions

## Contributors
@alice, @bob, @charlie, @dave`,
    },
  });

  // Create default settings
  await prisma.setting.createMany({
    data: [
      { key: "theme", value: "system" },
      { key: "defaultProjectPath", value: "/Users/you/Projects" },
      { key: "defaultPackageManager", value: "npm" },
      { key: "commandRunnerMode", value: "streamed" },
      { key: "dangerousCommandConfirmation", value: "true" },
    ],
  });

  console.log("Seed completed successfully!");
  console.log(`Created ${3} projects`);
  console.log(`Created ${8} agent profiles`);
  console.log(`Created ${5} command templates`);
  console.log(`Created ${1} issue draft`);
  console.log(`Created ${1} PR review draft`);
  console.log(`Created ${1} release note`);
  console.log(`Created ${5} settings`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
