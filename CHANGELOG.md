# Changelog

All notable changes to the Poke Code Executor project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-30

### 🎉 Major Release - Serverless Architecture

Complete refactor to serverless architecture, fully compatible with Vercel deployment.

### Added

#### New Features
- ✨ Piston API integration for code execution
- ✨ Vercel serverless functions architecture
- ✨ New `/api/runtimes` endpoint to list available language runtimes
- ✨ One-click Vercel deployment support
- ✨ Auto-scaling capabilities

#### Documentation
- 📚 `QUICKSTART.md` - 5-minute setup guide
- 📚 `docs/VERCEL_DEPLOYMENT.md` - Complete deployment guide
- 📚 `docs/MIGRATION_GUIDE.md` - v1.0 to v2.0 migration instructions
- 📚 `docs/ARCHITECTURE.md` - Detailed technical architecture
- 📚 Completely rewritten `README.md` for serverless focus
- 📚 `CHANGELOG.md` - This file
- 📚 `CONTRIBUTING.md` - Contribution guidelines

#### API Endpoints
- `/api/execute` - Moved from `src/pages/api/execute.ts` to `/api/execute.ts`
- `/api/history` - Moved from `src/pages/api/history.ts` to `/api/history.ts`
- `/api/runtimes` - New endpoint for runtime information

#### Infrastructure
- Serverless executor using Piston API (`src/lib/serverlessExecutor.ts`)
- Optimized Vercel configuration (`vercel.json`)
- Support for custom Piston instances via `PISTON_API_URL` env var

### Changed

#### Architecture
- 🏗️ Replaced Docker-based execution with Piston API calls
- 🏗️ Migrated from traditional API routes to Vercel serverless functions
- 🏗️ Moved API routes from `src/pages/api/` to `/api/` for Vercel compatibility

#### Dependencies
- ⬆️ Added `@vercel/node` for Vercel serverless functions
- ⬆️ Updated function configurations in `vercel.json`
- ⬇️ Removed `dockerode` (no longer needed)
- ⬇️ Removed `express-rate-limit` (using custom implementation)

#### Configuration
- Updated `.env.example` with `PISTON_API_URL` option
- Removed Docker-specific environment variables
- Optimized `vercel.json` for serverless functions

#### Documentation
- Updated `README.md` with serverless-first approach
- Updated deployment instructions for Vercel
- Added cost comparison between v1.0 and v2.0

### Removed

- ❌ Docker container management (`docker/` directory)
- ❌ Local Docker execution logic
- ❌ Docker build scripts from `package.json`
- ❌ Docker Compose configuration
- ❌ `dockerode` dependency
- ❌ Local container lifecycle management

### Deprecated

- Docker-based execution (v1.0) - Still available in `main` branch but not recommended for new deployments

### Fixed

- 🐛 Vercel deployment compatibility issues
- 🐛 Serverless function timeout handling
- 🐛 Cold start optimization

### Security

- 🔒 Maintained all security features from v1.0:
  - Code validation and pattern detection
  - Rate limiting (IP-based)
  - Input sanitization
  - Security headers
- 🔒 Added external execution isolation via Piston API
- 🔒 Removed local Docker attack surface

### Performance

- ⚡ Auto-scaling with Vercel (unlimited concurrent executions)
- ⚡ Optimized function memory allocation (1024MB)
- ⚡ Edge-ready architecture
- ⚠️ Added cold start latency (~200-500ms)

### Breaking Changes

**None** - API is 100% backward compatible with v1.0

---

## [1.0.0] - 2025-11-15

### Added

#### Initial Release
- 🎉 Docker-based code execution for Python and JavaScript
- 🎉 RESTful API with Express
- 🎉 Supabase database integration
- 🎉 Rate limiting (IP-based)
- 🎉 Security features:
  - Code validation
  - Dangerous pattern detection
  - Resource limits
  - Container isolation
- 🎉 Execution history tracking
- 🎉 Comprehensive API documentation

#### Features
- Execute Python code in isolated Docker containers
- Execute JavaScript code in isolated Docker containers
- Custom Docker images with pre-installed packages
- CPU and memory limits per execution
- Execution timeout (30 seconds)
- No network access in containers
- Read-only root filesystem
- Non-root user execution

#### API Endpoints
- `POST /api/execute` - Execute code
- `GET /api/history` - Get execution history

#### Security
- Docker container isolation
- Code validation before execution
- Resource limits (CPU, memory, time)
- Security headers
- Input sanitization with Joi

#### Documentation
- `README.md` - Project overview and setup
- `API_DOCUMENTATION.md` - Complete API reference
- Database schema documentation

---

## Migration Guide

For detailed migration instructions from v1.0 to v2.0, see [docs/MIGRATION_GUIDE.md](docs/MIGRATION_GUIDE.md).

## Version History

- **v2.0.0** (2025-11-30) - Serverless architecture with Vercel compatibility
- **v1.0.0** (2025-11-15) - Initial release with Docker-based execution

## Upgrade Path

### From v1.0.0 to v2.0.0

1. Pull latest changes
2. Run `npm install` to update dependencies
3. Remove Docker configuration (optional)
4. Deploy to Vercel
5. No client code changes needed!

Detailed steps: [docs/MIGRATION_GUIDE.md](docs/MIGRATION_GUIDE.md)

## Support

For questions and support:
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/Dpdpdpdp0987/poke-code-executor/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Dpdpdpdp0987/poke-code-executor/discussions)
- 📖 **Documentation**: See [docs/](docs/) folder

---

**[2.0.0]**: https://github.com/Dpdpdpdp0987/poke-code-executor/releases/tag/v2.0.0  
**[1.0.0]**: https://github.com/Dpdpdpdp0987/poke-code-executor/releases/tag/v1.0.0
