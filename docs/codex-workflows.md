# Codex/OpenAI-Assisted Maintainer Workflows

This document describes the optional AI-assisted maintainer workflows available in AgentBoard CE v0.4.0+.

## Overview

AgentBoard CE includes optional Codex/OpenAI-assisted workflows to help open-source maintainers with common tasks. These features are fully optional — the app works without any AI configuration.

### Key Design Principles

- **Local-first**: AI settings are stored locally in SQLite
- **Human-in-the-loop**: All AI output is an editable draft requiring human review
- **No automatic GitHub write actions**: AgentBoard CE never posts AI output to GitHub
- **Privacy**: API key stays server-side, never returned to the client
- **Optional**: All non-AI features work without configuration

## Prerequisites

1. An OpenAI API key (or OpenAI-compatible provider)
2. Configure AI Settings in AgentBoard CE Settings page

## Workflows

### 1. Issue Triage Workflow

The AI-assisted issue triage workflow helps maintainers quickly categorize and respond to incoming issues.

**How to use:**

1. Go to **Issue Triage > New Issue Triage**
2. Fill in the issue details (title, body, environment, etc.)
3. Scroll to the **AI Assistant** section
4. Click **"Generate with Codex"**
5. Review the generated triage in the **AI draft** section
6. Click **"Save AI Draft"** to persist with the AI-generated content
7. Alternatively, click **"Copy AI Markdown"** to use elsewhere

**Generated fields:**
- Type (Bug, Feature, Question, Docs, Maintenance)
- Priority (Critical, High, Medium, Low)
- Severity (Critical, Major, Minor, Trivial)
- Affected Area
- Reproduction Steps
- Missing Information
- Suggested Labels
- Suggested Maintainer Reply
- Suggested Next Action

**Safety notices:**
- "AI output is a draft. Review before use." badge on all AI-generated content
- "AgentBoard CE does not automatically write AI output back to GitHub."

### 2. PR Review Workflow

The AI-assisted PR review workflow helps maintainers generate structured code review drafts.

**How to use:**

1. Go to **PR Review > New PR Review**
2. Fill in the PR details (title, summary, changed files, etc.)
3. Scroll to the **AI Assistant** section
4. Click **"Generate with Codex"**
5. Review the generated review in the **AI draft** section
6. Generated content includes risk level and suggested comments
7. Save or copy the generated review

**Generated fields:**
- Review Summary
- Risk Level (Low, Medium, High)
- Required Changes
- Suggested Approval Comment
- Suggested Request-Changes Comment
- Test Focus Areas
- Documentation Impact
- Security Notes

**Important:**
- AI output is a draft only — never posted to GitHub automatically
- No automatic PR approval or merge
- Always review before using

### 3. Release Notes Workflow

The AI-assisted release notes workflow helps maintainers generate structured release notes.

**How to use:**

1. Go to **Release Notes > New Release Note**
2. Enter the version number
3. Optionally fill in existing change notes
4. Scroll to the **AI Assistant** section
5. Click **"Generate with Codex"**
6. Review the generated release notes in the **AI draft** section
7. The AI generates output in Keep a Changelog format
8. Edit, save, or copy the generated content

**Generated fields:**
- Summary / Highlights
- Added
- Changed
- Fixed
- Security
- Breaking Changes
- Migration Guide
- Contributors

### 4. Documentation Suggestions Workflow

The documentation suggestions workflow helps maintainers identify what documentation needs updating based on project changes.

**How to use:**

1. Go to **Docs Suggestions** in the sidebar
2. Enter the project name and a summary of changes
3. Optionally provide affected features, diff summary, and git summary
4. Click **"Generate Documentation Suggestions"**
5. Review each suggestion section
6. Copy sections individually as needed

**Generated sections:**
- README update suggestions
- Changelog update suggestions
- Installation documentation update suggestions
- Migration notes
- FAQ / Troubleshooting notes

**Note:** Suggestions are markdown text only — no files are automatically edited or committed.

## AI Settings

### Provider Options

| Provider | Description |
|----------|-------------|
| Disabled | AI features turned off |
| OpenAI | Standard OpenAI API (api.openai.com) |
| OpenAI-compatible | Any OpenAI-compatible API (e.g., local LLM, Azure OpenAI, etc.) |

### Configuration Fields

- **API Key**: Your OpenAI API key (stored locally, masked in UI)
- **Base URL**: API endpoint URL (default: https://api.openai.com/v1)
- **Model**: Model name (default: gpt-4o)
- **AI enabled**: Toggle all AI features

### Security

- API key stored in SQLite via the Setting table
- Raw API key is never returned to the client
- API key is masked in the UI (password input with toggle)
- API key is never included in:
  - API responses
  - Browser console logs
  - Error messages
  - Copied Markdown output
- AI requests are logged to a local audit log (AiRequestLog table)
- The audit log stores input summaries and output previews only
  - Full prompts and API keys are not stored in the audit log

## Request History / Audit Log

Every AI-assisted workflow request is logged locally for transparency:

- **Workflow type**: Which workflow was used
- **Project**: Optional project name
- **Model**: AI model used
- **Status**: completed / failed
- **Input summary**: Safe summary of the input (no full prompts)
- **Output preview**: Preview of the output (no full content)
- **Error message**: Error details if failed
- **Created at**: Timestamp

Access the AI Request History page from the sidebar.

## Human-in-the-Loop Design

Every AI-assisted workflow follows these principles:

1. **User initiates**: AI generation starts only on explicit user action
2. **Draft only**: AI output populates editable form fields
3. **Review required**: "AI draft" badge and "Review before use" notice are always visible
4. **Manual save**: User explicitly saves or discards the draft
5. **No automation**: AgentBoard CE never:
   - Comments on GitHub issues or PRs
   - Edits GitHub labels
   - Closes GitHub issues
   - Approves or merges PRs
   - Creates commits or branches

## Troubleshooting

### AI request fails

1. Check that AI is enabled in Settings
2. Validate your API key in Settings
3. Check the AI Request History page for error details
4. Verify your Base URL is correct for your provider
5. Check that the model name is valid for your provider

### AI output is low quality

1. Provide more detailed input
2. Try a different model
3. Check the AI Request History for error patterns
4. The generated output is a draft — edit it as needed

### Missing configuration message

If you see "AI is not configured" on an AI-assisted workflow:
1. Go to Settings
2. Configure an AI provider with a valid API key
3. Enable AI features
4. Return to the workflow

## Privacy

- AI requests are sent to your configured AI provider's API
- AgentBoard CE does not collect or transmit any data beyond what you explicitly submit
- No telemetry, no tracking, no cloud sync
- Your API key stays on your machine
- All AI requests are logged locally for your transparency
