# Local Verification Checklist

Use this checklist to verify AgentBoard CE works correctly after a fresh clone.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```
   - [ ] No errors during install

2. **Run database migration**
   ```bash
   npx prisma migrate dev
   ```
   - [ ] Migration completes successfully
   - [ ] `prisma/dev.db` is created

3. **Seed sample data**
   ```bash
   npm run seed
   ```
   - [ ] Seed completes without errors
   - [ ] Projects, agents, and commands are created

4. **Start development server**
   ```bash
   npm run dev
   ```
   - [ ] Server starts on http://localhost:3000

## UI Language Verification

5. **Verify English default UI**
   - [ ] App opens in English on first visit
   - [ ] Sidebar navigation is in English
   - [ ] Page titles are in English
   - [ ] Buttons and labels are in English

6. **Switch to Simplified Chinese**
   - [ ] Click globe icon in header, select "简体中文"
   - [ ] UI switches to Chinese
   - [ ] Sidebar navigation is in Chinese
   - [ ] Toast message appears in Chinese

7. **Switch to Russian**
   - [ ] Click globe icon in header, select "Русский"
   - [ ] UI switches to Russian
   - [ ] Sidebar navigation is in Russian
   - [ ] Toast message appears in Russian

8. **Verify language persistence**
   - [ ] Refresh the page
   - [ ] Language choice is preserved

## Feature Verification

9. **Add a project**
   - [ ] Navigate to Projects
   - [ ] Click "Add Project"
   - [ ] Fill in project details
   - [ ] Project is created successfully

10. **Run a command**
    - [ ] Navigate to Terminal
    - [ ] Select a project
    - [ ] Enter a command (e.g., `echo "hello"`)
    - [ ] Click Run
    - [ ] Output is displayed

11. **Generate issue triage**
    - [ ] Navigate to Issue Triage
    - [ ] Click "New Issue Triage"
    - [ ] Fill in issue details
    - [ ] Click "Generate Triage Draft"
    - [ ] Draft is generated with labels and suggestions

12. **Generate PR review**
    - [ ] Navigate to PR Review
    - [ ] Click "New PR Review"
    - [ ] Fill in PR details
    - [ ] Click "Generate Review Draft"
    - [ ] Review draft is generated

13. **Generate release notes**
    - [ ] Navigate to Release Notes
    - [ ] Click "New Release Note"
    - [ ] Fill in release details
    - [ ] Click "Generate Release Notes"
    - [ ] Release notes are generated

## Git Insights Verification

13. **Verify Git Insights on project detail**
    - [ ] Navigate to Projects
    - [ ] Click on a project with a valid local path
    - [ ] Git Insights section appears in the sidebar
    - [ ] Current branch is displayed
    - [ ] Working tree status (Clean/Dirty) is shown
    - [ ] Remote URL is displayed (if configured)
    - [ ] Recent commits are listed

14. **Test Refresh Git Status**
    - [ ] Click the refresh button in Git Insights
    - [ ] Status updates and last refreshed time changes

15. **Test Copy Git Summary**
    - [ ] Click the copy button in Git Insights
    - [ ] Toast message "Git summary copied" appears
    - [ ] Paste clipboard — Markdown summary is correct

16. **Test invalid path handling**
    - [ ] Edit a project to have an invalid local path
    - [ ] Navigate to project detail
    - [ ] "Invalid local path" message appears (no crash)

17. **Test non-Git folder**
    - [ ] Edit a project to point to a non-Git folder
    - [ ] Navigate to project detail
    - [ ] "Not a Git repository" message appears (no crash)

## GitHub Issues Verification

18. **Configure GitHub token**
    - [ ] Navigate to Settings
    - [ ] Enter a GitHub Personal Access Token
    - [ ] Click "Save Token"
    - [ ] Token status shows "Token is valid" with username
    - [ ] Raw token is not displayed (masked input)

19. **Link project to GitHub repository**
    - [ ] Navigate to a project, click Edit
    - [ ] Enter GitHub owner and repository name
    - [ ] Click "Parse from URL" if repository URL is set
    - [ ] Save project
    - [ ] GitHub fields are preserved

20. **Fetch open issues**
    - [ ] Navigate to GitHub Issues in sidebar
    - [ ] Select the linked project
    - [ ] Click "Fetch Issues"
    - [ ] Open issues are listed with number, title, author, labels
    - [ ] Pull requests are excluded from the list

21. **View issue detail**
    - [ ] Click on an issue in the list
    - [ ] Issue detail page shows title, body, labels, metadata
    - [ ] "Open on GitHub" button links to github.com
    - [ ] "Copy Issue Markdown" copies formatted markdown

22. **Create local triage draft**
    - [ ] Click "Create Local Triage Draft" on an issue
    - [ ] Local issue draft is created
    - [ ] Navigate to the draft detail page
    - [ ] Draft contains GitHub issue metadata in additional notes

23. **Remove GitHub token**
    - [ ] Navigate to Settings
    - [ ] Click "Remove Token"
    - [ ] Token status shows "Not Configured"
    - [ ] GitHub Issues page shows missing token warning

## GitHub Pull Requests Verification

24. **Fetch open pull requests**
    - [ ] Navigate to GitHub PRs in sidebar
    - [ ] Select the linked project
    - [ ] Click "Fetch Pull Requests"
    - [ ] Open pull requests are listed with number, title, author, branches, and stats
    - [ ] Draft PRs show draft badge

25. **Filter pull requests**
    - [ ] Change state filter to "Closed"
    - [ ] Click "Fetch Pull Requests"
    - [ ] Closed pull requests are listed
    - [ ] Change to "All" and verify both open and closed appear

26. **Search pull requests**
    - [ ] Type in the search box
    - [ ] PR list filters by title in real-time

27. **View PR detail**
    - [ ] Click on a pull request in the list
    - [ ] PR detail page shows title, body, branches, metadata
    - [ ] Changed files list shows filenames, status, additions/deletions
    - [ ] Patch preview is shown for files
    - [ ] Commits list shows recent commits
    - [ ] "Open on GitHub" button links to github.com

28. **Copy PR Markdown**
    - [ ] Click "Copy PR Markdown" on a PR detail
    - [ ] Toast message appears
    - [ ] Paste clipboard — formatted markdown with PR info, files, and commits

29. **Copy Review Checklist**
    - [ ] Click "Copy Review Checklist" on a PR detail
    - [ ] Toast message appears
    - [ ] Paste clipboard — review checklist markdown

30. **Create local PR review draft**
    - [ ] Click "Create Local PR Review Draft" on a PR detail
    - [ ] Local PR review draft is created
    - [ ] Navigate to the draft detail page
    - [ ] Draft contains GitHub PR metadata in summary

## Build Verification

14. **Run lint**
    ```bash
    npm run lint
    ```
    - [ ] No errors

15. **Run build**
    ```bash
    npm run build
    ```
    - [ ] Build completes successfully
    - [ ] No errors or warnings

## Dark Mode

16. **Verify dark mode**
    - [ ] Click theme toggle in header
    - [ ] UI switches to dark mode
    - [ ] All pages look correct in dark mode
    - [ ] Switch back to light mode works
