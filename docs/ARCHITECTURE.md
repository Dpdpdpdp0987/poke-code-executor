# Architecture Overview - Serverless Edition

Detailed technical architecture of the Vercel-compatible serverless code executor.

## System Architecture

```
┌──────────────┐
│   Client App   │
│  (Browser/API) │
└───────┤├───────┘
         │
         │ HTTPS
         │
         │
┌────────┴─────────────────────────────────┐
│           Vercel Edge Network              │
│  (CDN, Load Balancing, SSL Termination)   │
└─────────────┤├─────────────────────────┘
                 │
    ┌────────────┼─────────────┐
    │             │              │
    │             │              │
┌───┴───┐    ┌────┴────┐    ┌──┴────┐
│ Execute │    │ History │    │ Runtimes│
│  API    │    │   API   │    │   API   │
│Function │    │Function │    │Function │
└───┬───┘    └───┬────┘    └──┬────┘
    │             │              │
    │   ┌─────────┼─────────────┘
    │   │         │
    │   │    ┌────┴────────────────────┐
    │   │    │   Shared Services Layer    │
    │   │    │ - Validation              │
    │   │    │ - Rate Limiting           │
    │   │    │ - Logging                 │
    │   │    │ - Error Handling          │
    │   │    └─────────┬──────────────┘
    │   │             │
    │   │    ┌────────┴────────┐
    │   └────► Supabase DB     │
    │        │ - executions     │
    │        │ - snippets       │
    │        │ - rate_limits    │
    │        └─────────────────┘
    │
    │        ┌───────────────────────┐
    └───────► Piston API              │
           │ (Code Execution Engine)  │
           │                          │
           │ ┌──────────────────┐ │
           │ │ Docker Container │ │
           │ │  - Python 3.10   │ │
           │ │  - Node.js 18    │ │
           │ │  - Isolated      │ │
           │ └──────────────────┘ │
           └───────────────────────┘
```

## Component Details

### 1. API Layer (`/api`)

Vercel serverless functions that handle incoming requests.

#### `/api/execute.ts`
- **Purpose**: Execute code submissions
- **Method**: POST
- **Runtime**: Node.js 18 (serverless)
- **Memory**: 1024 MB
- **Timeout**: 60 seconds (Pro) / 10 seconds (Hobby)
- **Responsibilities**:
  - Request validation
  - Rate limiting
  - Code validation
  - Execution via Piston API
  - Database logging
  - Response formatting

#### `/api/history.ts`
- **Purpose**: Retrieve execution history
- **Method**: GET
- **Runtime**: Node.js 18 (serverless)
- **Responsibilities**:
  - Query parameter validation
  - Rate limiting
  - Database queries
  - Pagination

#### `/api/runtimes.ts`
- **Purpose**: List available runtimes
- **Method**: GET
- **Runtime**: Node.js 18 (serverless)
- **Responsibilities**:
  - Fetch from Piston API
  - Filter supported languages
  - Cache results

### 2. Service Layer (`/src/lib`)

Reusable business logic modules.

#### `serverlessExecutor.ts`
- **Purpose**: Interface with Piston API
- **Key Functions**:
  - `executeCode()`: Send code to Piston
  - `getAvailableRuntimes()`: Fetch supported languages
- **Features**:
  - Timeout handling
  - Error parsing
  - Output formatting
  - Abort controller for timeouts

#### `validation.ts`
- **Purpose**: Validate code before execution
- **Checks**:
  - Dangerous pattern detection
  - Code length limits
  - Language support
  - Input sanitization
- **Patterns Blocked**:
  - `import os`, `import subprocess` (Python)
  - `eval()`, `exec()`, `__import__`
  - `fs.readFile`, `child_process` (JavaScript)

#### `rateLimit.ts`
- **Purpose**: IP-based rate limiting
- **Strategy**: Token bucket algorithm
- **Storage**: Supabase
- **Configuration**:
  - Window: 60 seconds
  - Limit: 10 requests/minute (configurable)
  - Key: Client IP address

#### `database.ts`
- **Purpose**: Supabase integration
- **Operations**:
  - `saveExecution()`: Store execution results
  - `getExecutionHistory()`: Query past executions
  - `checkRateLimit()`: Rate limit queries
  - `updateRateLimit()`: Update rate limit counters

#### `logger.ts`
- **Purpose**: Structured logging
- **Library**: Winston
- **Levels**: error, warn, info, debug
- **Outputs**: Console (in production)

### 3. External Services

#### Piston API
- **URL**: https://emkc.org/api/v2/piston (default)
- **Purpose**: Secure code execution
- **Features**:
  - Multi-language support
  - Docker-based isolation
  - Resource limits
  - Pre-installed packages
- **Rate Limits**: ~5 requests/second (public instance)
- **Timeout**: 30 seconds max execution

#### Supabase
- **Purpose**: PostgreSQL database
- **Tables**:
  - `executions`: Execution logs
  - `snippets`: Saved code snippets
  - `rate_limits`: Rate limit tracking
- **Features**:
  - Connection pooling
  - Real-time subscriptions (future)
  - Row-level security
  - Auto-backup

## Data Flow

### Code Execution Flow

```
1. Client sends POST /api/execute
   ↓
2. Vercel routes to execute.ts function
   ↓
3. Extract client IP
   ↓
4. Check rate limit (Supabase)
   ↓
5. Validate request body
   ↓
6. Validate code (patterns, length)
   ↓
7. Call Piston API with code
   ↓
8. Piston creates isolated Docker container
   ↓
9. Execute code in container
   ↓
10. Collect stdout/stderr
   ↓
11. Return result to our function
   ↓
12. Save execution to Supabase
   ↓
13. Format and return response
   ↓
14. Client receives result
```

### Error Handling Flow

```
Error occurs
   ↓
1. Catch in try-catch block
   ↓
2. Log error (Winston)
   ↓
3. Determine error type:
   - Validation error → 400
   - Rate limit → 429
   - Execution error → 200 with error object
   - System error → 500
   ↓
4. Format error response
   ↓
5. Return to client
```

## Security Architecture

### Defense in Depth

```
┌───────────────────────────────┐
│      Layer 1: Network          │
│  - HTTPS only                 │
│  - Vercel DDoS protection     │
│  - Rate limiting              │
└───────────┬───────────────────┘
            │
┌───────────┴───────────────────┐
│      Layer 2: Application      │
│  - Input validation           │
│  - Code pattern detection     │
│  - Security headers           │
└───────────┬───────────────────┘
            │
┌───────────┴───────────────────┐
│      Layer 3: Execution        │
│  - Piston API isolation       │
│  - Docker containers          │
│  - Resource limits            │
│  - No network access          │
└───────────────────────────────┘
```

### Security Measures

1. **HTTPS Enforcement**
   - All traffic encrypted
   - Managed by Vercel

2. **Rate Limiting**
   - IP-based throttling
   - Configurable limits
   - Stored in Supabase

3. **Input Validation**
   - Joi schema validation
   - Code length limits
   - Language whitelist

4. **Code Validation**
   - Pattern matching for dangerous code
   - Blocks OS access, file system, subprocess

5. **Execution Isolation**
   - Docker containers (via Piston)
   - No network access
   - Resource limits (CPU, memory)
   - Timeout enforcement

6. **Security Headers**
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - X-XSS-Protection: 1; mode=block
   - Referrer-Policy: strict-origin-when-cross-origin

## Scalability

### Auto-Scaling

Vercel automatically scales functions based on demand:

```
Low Traffic:    1-2 function instances
Medium Traffic: 5-10 function instances
High Traffic:   50+ function instances
```

### Performance Characteristics

| Metric | Cold Start | Warm Start |
|--------|------------|------------|
| Function Init | 200-500ms | <10ms |
| Validation | 5-10ms | 5-10ms |
| Piston API Call | 1-3s | 1-3s |
| Database Save | 50-100ms | 50-100ms |
| **Total** | **1.3-3.6s** | **1.1-3.1s** |

### Optimization Strategies

1. **Function Warming**
   ```javascript
   // Periodic health check to keep functions warm
   setInterval(() => fetch('/api/health'), 5 * 60 * 1000);
   ```

2. **Database Connection Pooling**
   - Supabase handles automatically
   - Use `[project].pooler.supabase.com` endpoint

3. **Response Caching**
   ```typescript
   // Cache runtime information
   res.setHeader('Cache-Control', 's-maxage=3600');
   ```

4. **Regional Deployment**
   - Deploy close to users
   - Deploy Piston close to Vercel region

## Monitoring & Observability

### Logging Strategy

```typescript
// Structured logging with Winston
logger.info('Execution started', {
  executionId,
  language,
  ipAddress,
  timestamp: new Date().toISOString()
});

logger.error('Execution failed', {
  executionId,
  error: error.message,
  stack: error.stack
});
```

### Metrics to Monitor

1. **Request Metrics**
   - Request rate
   - Response times
   - Error rates
   - Status code distribution

2. **Execution Metrics**
   - Execution times
   - Success/failure ratio
   - Language usage
   - Code length distribution

3. **Resource Metrics**
   - Function memory usage
   - Function duration
   - Cold start frequency
   - Database query times

4. **Business Metrics**
   - Daily active users
   - Executions per user
   - Popular languages
   - Error patterns

### Vercel Analytics Integration

```bash
# Enable in Vercel dashboard
# Provides:
- Real-time function logs
- Performance metrics
- Error tracking
- Usage analytics
```

## Deployment Pipeline

```
Developer
   ↓
1. git push to GitHub
   ↓
2. GitHub webhook triggers Vercel
   ↓
3. Vercel builds project
   - npm install
   - TypeScript compilation
   - Function bundling
   ↓
4. Deploy to edge network
   - Preview deployment (PRs)
   - Production deployment (main)
   ↓
5. Health checks
   ↓
6. Route traffic to new deployment
   ↓
7. Keep previous deployment for rollback
```

### Rollback Strategy

```bash
# Instant rollback via Vercel CLI
vercel rollback

# Or via dashboard
# Deployments → Select previous → Promote to Production
```

## Cost Analysis

### Per-Request Cost Breakdown

**Assumptions**: 1000 requests/day, average execution time 2s

| Service | Cost | Calculation |
|---------|------|-------------|
| Vercel Functions | $0.60 | 1000 * 30 * 2s * $0.000001 |
| Supabase Database | $0.00 | Within free tier |
| Piston API (public) | $0.00 | Free |
| **Total/month** | **$0.60** | Well within free tier |

### Scaling Costs

| Requests/Month | Vercel Cost | Supabase Cost | Total |
|----------------|-------------|---------------|--------|
| 10,000 | $0 (free tier) | $0 (free tier) | $0 |
| 100,000 | $20 (Pro plan) | $0 | $20 |
| 1,000,000 | $20 + compute | $25 (Pro) | ~$60 |

## Technology Stack

### Runtime
- **Platform**: Vercel Serverless Functions
- **Language**: TypeScript/Node.js 18
- **Framework**: Next.js 14

### External Services
- **Execution**: Piston API
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel

### Libraries
- **Validation**: Joi
- **Logging**: Winston
- **UUID**: uuid
- **Rate Limiting**: Custom implementation with Supabase

## Future Enhancements

### Short Term
1. **WebSocket Support**
   - Real-time output streaming
   - Progress indicators

2. **Enhanced Caching**
   - Cache common code patterns
   - Memoize runtime info

3. **Better Error Messages**
   - Parse and format Piston errors
   - Provide helpful hints

### Long Term
1. **Multi-Region Deployment**
   - Deploy Piston in multiple regions
   - Route to nearest instance

2. **Custom Package Support**
   - Allow users to specify packages
   - Build custom execution environments

3. **Execution Optimization**
   - Parallel execution
   - Batch processing
   - Smart queueing

## References

- **Piston API**: https://github.com/engineer-man/piston
- **Vercel Docs**: https://vercel.com/docs/functions/serverless-functions
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

**Last Updated**: November 30, 2025
