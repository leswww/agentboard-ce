# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in AgentBoard CE, please report it responsibly.

### How to Report

1. **Do NOT** create a public GitHub issue
2. Open a private security advisory on GitHub, or email the maintainers
3. Include a detailed description of the vulnerability
4. Provide steps to reproduce if possible

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 1 week
- **Fix Timeline**: Depends on severity

## Security Measures

### Data Storage

- All data is stored locally in SQLite
- No data is sent to external servers
- No telemetry or tracking

### Command Execution

- Dangerous commands require explicit confirmation
- Commands are executed in isolated processes
- Output is captured and displayed safely
- Commands never run automatically — always require explicit user action

### Dangerous Command Detection

The following patterns trigger a confirmation dialog:

- `rm -rf`, `rm -r`
- `sudo`
- `chmod -R`
- `curl | sh`, `curl | bash`
- `wget | sh`, `wget | bash`
- `mkfs`
- `dd if=`
- `> /dev/`
- `shutdown`, `reboot`, `halt`, `poweroff`

### Authentication

- No authentication required (local-only)
- No API keys needed for core features
- No user accounts or sessions

## Best Practices

### For Users

1. Keep your installation updated
2. Review commands before execution
3. Use strong passwords for any external services
4. Regularly backup your data (copy `prisma/dev.db`)

### For Contributors

1. Follow secure coding practices
2. Validate all user inputs
3. Use parameterized queries (Prisma handles this)
4. Avoid command injection
5. Handle errors gracefully

## Dependencies

We regularly update dependencies to address security vulnerabilities. Run:

```bash
npm audit
npm audit fix
```

## Acknowledgments

We appreciate security researchers who responsibly disclose vulnerabilities.
