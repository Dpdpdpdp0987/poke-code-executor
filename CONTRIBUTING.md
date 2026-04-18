# Contributing to Poke Code Executor

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behaviors:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards others

**Unacceptable behaviors:**
- Harassment, trolling, or derogatory comments
- Personal or political attacks
- Public or private harassment
- Publishing others' private information
- Other unethical or unprofessional conduct

## Getting Started

### Prerequisites

- Node.js 18+
- Git
- GitHub account
- Vercel account (for testing deployments)
- Supabase account (for testing database)

### Types of Contributions

We welcome:
- 🐛 Bug reports
- ✨ Feature requests
- 📝 Documentation improvements
- 🔧 Code improvements
- 🧪 Tests
- 🎨 UI/UX enhancements
- 🌍 Translations (future)

## Development Setup

### 1. Fork the Repository

1. Go to https://github.com/Dpdpdpdp0987/poke-code-executor
2. Click "Fork" button
3. Clone your fork:

```bash
git clone https://github.com/YOUR_USERNAME/poke-code-executor.git
cd poke-code-executor
```

### 2. Add Upstream Remote

```bash
git remote add upstream https://github.com/Dpdpdpdp0987/poke-code-executor.git
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up Environment

```bash
cp .env.example .env
```

Add your Supabase credentials to `.env`.

### 5. Start Development Server

```bash
npm run dev
```

Server runs at http://localhost:3000

## Making Changes

### 1. Create a Branch

Always create a new branch for your changes:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions/changes
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed
- Add tests for new features

### 3. Test Your Changes

```bash
# Start dev server
npm run dev

# Test all endpoints
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -d '{"code": "print('test')", "language": "python"}'

curl http://localhost:3000/api/history

curl http://localhost:3000/api/runtimes
```

### 4. Commit Your Changes

Use clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add support for new language"
```

**Commit message format:**
```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat(api): add support for Go language"
git commit -m "fix(executor): handle timeout errors correctly"
git commit -m "docs(readme): update deployment instructions"
```

## Submitting Changes

### 1. Update Your Branch

Before submitting, ensure your branch is up to date:

```bash
git fetch upstream
git rebase upstream/main
```

### 2. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 3. Create Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill out the PR template:

```markdown
## Description
[Describe your changes]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring

## Testing
- [ ] Tested locally
- [ ] All tests pass
- [ ] Documentation updated

## Screenshots (if applicable)
[Add screenshots]
```

### 4. Wait for Review

- Maintainers will review your PR
- Address any feedback
- Make requested changes
- Push updates to the same branch

## Coding Standards

### TypeScript/JavaScript

```typescript
// ✅ Good
interface ExecutionResult {
  output: string;
  error: any;
  executionTime: number;
}

async function executeCode(
  code: string,
  language: 'python' | 'javascript'
): Promise<ExecutionResult> {
  // Implementation
}

// ❌ Bad
function exec(c, l) {
  // Implementation
}
```

### Code Style

- Use TypeScript for all new code
- Use `const` and `let`, avoid `var`
- Use arrow functions for callbacks
- Use async/await over promises
- Add type annotations
- Use descriptive variable names
- Keep functions small and focused
- Add JSDoc comments for public APIs

### File Structure

```
api/              # Vercel serverless functions
  execute.ts      # One file per endpoint
  history.ts
  runtimes.ts

src/
  lib/            # Shared business logic
    serverlessExecutor.ts
    validation.ts
    database.ts
    ...

docs/             # Documentation
  ARCHITECTURE.md
  MIGRATION_GUIDE.md
  ...
```

### Error Handling

```typescript
// ✅ Good
try {
  const result = await executeCode(code, language);
  return res.status(200).json({ success: true, data: result });
} catch (error: any) {
  logger.error('Execution failed', { error: error.message });
  return res.status(500).json({ 
    error: 'Execution failed',
    message: error.message 
  });
}

// ❌ Bad
try {
  const result = await executeCode(code, language);
  return result;
} catch (e) {
  console.log(e);
}
```

## Testing

### Manual Testing

Test all affected endpoints:

```bash
# Execute endpoint
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -d '{"code": "print('test')", "language": "python"}'

# History endpoint
curl http://localhost:3000/api/history

# Test error cases
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -d '{"code": "invalid code", "language": "python"}'

# Test rate limiting
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/execute \
    -H "Content-Type: application/json" \
    -d '{"code": "print('test')", "language": "python"}'
done
```

### Test Checklist

- [ ] Happy path works correctly
- [ ] Error cases handled properly
- [ ] Rate limiting works
- [ ] Database operations succeed
- [ ] Validation catches invalid input
- [ ] Timeout handling works
- [ ] Response format is correct

## Documentation

### When to Update Documentation

Update documentation when you:
- Add new features
- Change API behavior
- Add new environment variables
- Change configuration
- Fix bugs that affect usage

### Documentation Files

- `README.md` - Main project overview
- `API_DOCUMENTATION.md` - API reference
- `QUICKSTART.md` - Quick start guide
- `docs/ARCHITECTURE.md` - Technical details
- `docs/MIGRATION_GUIDE.md` - Migration instructions
- `docs/VERCEL_DEPLOYMENT.md` - Deployment guide
- `CONTRIBUTING.md` - This file
- `CHANGELOG.md` - Version history

### Documentation Style

- Use clear, concise language
- Include code examples
- Add screenshots where helpful
- Keep formatting consistent
- Test all code examples
- Update table of contents

## Review Process

### What Reviewers Look For

1. **Functionality**: Does it work as intended?
2. **Code Quality**: Is it clean and maintainable?
3. **Tests**: Are there adequate tests?
4. **Documentation**: Is it documented?
5. **Breaking Changes**: Are they necessary and documented?
6. **Performance**: Does it impact performance?
7. **Security**: Are there security implications?

### Review Checklist

- [ ] Code follows project conventions
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Commit messages are clear
- [ ] PR description is complete

## Common Issues

### Issue: "Module not found"

**Solution**: Run `npm install`

### Issue: "Database connection failed"

**Solution**: Check `.env` file has correct Supabase credentials

### Issue: "Vercel deployment fails"

**Solution**: Check `vercel.json` configuration and environment variables

## Getting Help

- **Questions**: Open a [GitHub Discussion](https://github.com/Dpdpdpdp0987/poke-code-executor/discussions)
- **Bugs**: Open a [GitHub Issue](https://github.com/Dpdpdpdp0987/poke-code-executor/issues)
- **Documentation**: Check the [docs/](docs/) folder

## Recognition

Contributors will be:
- Listed in the README.md
- Mentioned in release notes
- Added to GitHub contributors page

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing! 🎉**
