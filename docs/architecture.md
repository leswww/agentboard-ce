# Architecture Overview

This document describes the technical architecture of AgentBoard CE.

## Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with shadcn/ui patterns
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **State Management**: React hooks and context
- **Notifications**: Sonner

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database**: SQLite
- **ORM**: Prisma
- **Validation**: Zod
- **Git Integration**: simple-git

### Development
- **Package Manager**: npm
- **Linting**: ESLint
- **Formatting**: Prettier (via ESLint)
- **Type Checking**: TypeScript

## Project Structure

```
agentboard-ce/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   │   ├── projects/       # Project CRUD
│   │   │   ├── commands/       # Command CRUD
│   │   │   ├── agents/         # Agent CRUD
│   │   │   ├── issues/         # Issue CRUD
│   │   │   ├── pr-reviews/     # PR Review CRUD
│   │   │   ├── release-notes/  # Release Note CRUD
│   │   │   ├── settings/       # Settings
│   │   │   ├── export/         # Data export
│   │   │   ├── import/         # Data import
│   │   │   └── git/            # Git integration
│   │   ├── dashboard/          # Dashboard page
│   │   ├── projects/           # Project pages
│   │   ├── commands/           # Command pages
│   │   ├── terminal/           # Terminal page
│   │   ├── agents/             # Agent pages
│   │   ├── issues/             # Issue pages
│   │   ├── pr-reviews/         # PR Review pages
│   │   ├── release-notes/      # Release Note pages
│   │   ├── docs/               # Documentation
│   │   ├── settings/           # Settings page
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Root page (redirect)
│   │   └── globals.css         # Global styles
│   ├── components/             # React components
│   │   ├── ui/                 # UI components
│   │   ├── layout/             # Layout components
│   │   └── ...                 # Feature components
│   └── lib/                    # Utility functions
│       ├── prisma.ts           # Prisma client
│       ├── utils.ts            # Utility functions
│       └── validations.ts      # Zod schemas
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── seed.ts                 # Seed data
│   └── dev.db                  # SQLite database
├── public/                     # Static assets
├── docs/                       # Documentation
├── .env                        # Environment variables
├── .env.example                # Example environment
├── .gitignore                  # Git ignore rules
├── next.config.ts              # Next.js config
├── tailwind.config.ts          # Tailwind config
├── tsconfig.json               # TypeScript config
├── package.json                # Package config
└── README.md                   # Project readme
```

## Database Schema

### Models

#### Project
- id: String (unique)
- name: String
- slug: String (unique)
- description: String?
- localPath: String?
- repositoryUrl: String?
- techStack: String?
- packageManager: String
- startCommand: String?
- testCommand: String?
- buildCommand: String?
- deployCommand: String?
- notes: String?
- status: String (active/archived)
- createdAt: DateTime
- updatedAt: DateTime
- lastOpenedAt: DateTime?

#### CommandTemplate
- id: String (unique)
- name: String
- description: String?
- command: String
- workingDirectory: String?
- projectId: String? (foreign key)
- category: String (dev/build/test/deploy/git/custom)
- createdAt: DateTime
- updatedAt: DateTime

#### CommandRun
- id: String (unique)
- projectId: String? (foreign key)
- commandTemplateId: String? (foreign key)
- command: String
- workingDirectory: String?
- output: String?
- exitCode: Int?
- status: String (pending/running/success/failed)
- startedAt: DateTime
- endedAt: DateTime?
- durationMs: Int?

#### AgentProfile
- id: String (unique)
- name: String
- slug: String (unique)
- description: String?
- category: String
- recommendedTool: String
- systemPrompt: String
- inputTemplate: String?
- outputFormat: String?
- createdAt: DateTime
- updatedAt: DateTime

#### IssueDraft
- id: String (unique)
- projectId: String? (foreign key)
- issueTitle: String
- issueBody: String?
- environment: String?
- expectedBehavior: String?
- actualBehavior: String?
- screenshots: String?
- additionalNotes: String?
- draftType: String?
- draftPriority: String?
- draftSeverity: String?
- affectedArea: String?
- reproductionSteps: String?
- missingInformation: String?
- suggestedLabels: String?
- suggestedReply: String?
- suggestedAction: String?
- markdownOutput: String?
- createdAt: DateTime
- updatedAt: DateTime

#### PrReviewDraft
- id: String (unique)
- projectId: String? (foreign key)
- prTitle: String
- prSummary: String?
- changedFilesSummary: String?
- testResults: String?
- riskNotes: String?
- documentationImpact: String?
- reviewSummary: String?
- riskLevel: String?
- requiredChanges: String?
- suggestedApproval: String?
- suggestedChanges: String?
- markdownOutput: String?
- createdAt: DateTime
- updatedAt: DateTime

#### ReleaseNote
- id: String (unique)
- projectId: String? (foreign key)
- version: String
- releaseDate: String?
- summary: String?
- added: String?
- changed: String?
- fixed: String?
- security: String?
- deprecated: String?
- removed: String?
- breakingChanges: String?
- migrationGuide: String?
- contributors: String?
- markdownOutput: String?
- createdAt: DateTime
- updatedAt: DateTime

#### Setting
- id: String (unique)
- key: String (unique)
- value: String

### Relationships

- Project has many CommandTemplates
- Project has many CommandRuns
- CommandTemplate has many CommandRuns
- Project has many IssueDrafts
- Project has many PrReviewDrafts
- Project has many ReleaseNotes

## API Design

### RESTful Endpoints

All API endpoints follow REST conventions:

- `GET /api/resource` - List all resources
- `POST /api/resource` - Create a new resource
- `GET /api/resource/[id]` - Get a specific resource
- `PUT /api/resource/[id]` - Update a resource
- `DELETE /api/resource/[id]` - Delete a resource

### Special Endpoints

- `POST /api/commands/run` - Execute a command
- `POST /api/git` - Get git status
- `GET /api/export` - Export all data
- `POST /api/import` - Import data

### Request/Response Format

All requests and responses use JSON format.

#### Request Example

```json
{
  "name": "My Project",
  "slug": "my-project",
  "description": "A sample project"
}
```

#### Response Example

```json
{
  "id": "clx1234567890",
  "name": "My Project",
  "slug": "my-project",
  "description": "A sample project",
  "createdAt": "2024-01-15T00:00:00.000Z",
  "updatedAt": "2024-01-15T00:00:00.000Z"
}
```

### Error Handling

Errors return appropriate HTTP status codes:

- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error

Error response format:

```json
{
  "error": "Error message"
}
```

## Component Architecture

### UI Components

Reusable UI components in `src/components/ui/`:

- Button
- Input
- Textarea
- Select
- Card
- Badge
- Dialog
- Label
- Checkbox
- Tabs
- Separator
- EmptyState
- Loading

### Layout Components

Layout components in `src/components/layout/`:

- Sidebar
- Header

### Feature Components

Feature-specific components:

- ProjectForm
- CommandForm
- AgentForm
- IssueForm
- PrReviewForm
- ReleaseNoteForm
- TerminalWorkspace
- GitStatusSection
- CopyButton
- RunCommandButton
- DeleteButton
- ThemeToggle

## State Management

### Client State

- React hooks (useState, useEffect)
- Context for theme and settings
- Form state with React Hook Form

### Server State

- Server components for data fetching
- API routes for mutations
- Prisma for database operations

## Styling

### Tailwind CSS

- Utility-first CSS framework
- Custom theme configuration
- Dark mode support
- Responsive design

### CSS Variables

- Custom properties for colors
- HSL color format
- Dark/light mode variants

### Component Styling

- Tailwind utility classes
- CVA for component variants
- Conditional classes

## Security Considerations

### Command Execution

- Commands require explicit user action
- Dangerous command detection
- Confirmation modal for risky commands
- Timeout for long-running commands

### Data Storage

- Local SQLite database
- No external API calls (v0.1)
- No telemetry or tracking
- No sensitive data storage

### Input Validation

- Zod schemas for validation
- Server-side validation
- Client-side validation
- Sanitized outputs

## Performance Optimizations

### Database

- SQLite for fast local storage
- Indexed fields for queries
- Connection pooling
- Query optimization

### Frontend

- Server components where possible
- Code splitting
- Image optimization
- Font optimization

### API

- Efficient queries
- Pagination support
- Caching headers
- Compression

## Testing Strategy

### Unit Tests

- Component testing
- Utility function testing
- Validation testing

### Integration Tests

- API endpoint testing
- Database testing
- Form submission testing

### E2E Tests

- User flow testing
- Cross-browser testing
- Performance testing

## Deployment

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm run start
```

### Docker (Future)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Future Considerations

### Scalability

- Database migrations for schema changes
- API versioning
- Caching strategies
- Load balancing

### Extensibility

- Plugin system
- Custom themes
- API extensions
- Webhook support

### Monitoring

- Error tracking
- Performance monitoring
- Usage analytics
- Health checks
