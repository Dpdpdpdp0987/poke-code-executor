# Migration Guide: v1.0 (Docker) to v2.0 (Serverless)

This guide helps you migrate from the Docker-based v1.0 to the serverless v2.0 architecture.

## Overview of Changes

### Architecture Changes

**v1.0 (Docker-based)**:
```
User → API Route → Docker Container → Code Execution → Response
```

**v2.0 (Serverless)**:
```
User → Vercel Function → Piston API → Code Execution → Response
```

### Key Differences

| Feature | v1.0 (Docker) | v2.0 (Serverless) |
|---------|---------------|-------------------|
| **Execution** | Local Docker containers | External Piston API |
| **Deployment** | Requires Docker hosting | Vercel/serverless platforms |
| **Infrastructure** | Docker, Docker Compose | Zero infrastructure |
| **Scaling** | Manual | Auto-scaling |
| **Cost** | VM/server costs | Pay-per-use |
| **Setup Time** | ~30 minutes | ~2 minutes |

## Migration Steps

### Step 1: Update Your Repository

```bash
# Pull the latest changes
git checkout main
git pull origin main

# Switch to the serverless branch
git checkout feature/vercel-serverless-refactor
```

### Step 2: Install New Dependencies

```bash
# Remove old dependencies
npm uninstall dockerode express-rate-limit

# Install new dependencies
npm install @vercel/node

# Or simply reinstall everything
rm -rf node_modules package-lock.json
npm install
```

### Step 3: Update Environment Variables

**Old .env (v1.0)**:
```env
DOCKER_HOST=unix:///var/run/docker.sock
```

**New .env (v2.0)**:
```env
# Docker variables removed!
# Optional: Add custom Piston instance
PISTON_API_URL=https://emkc.org/api/v2/piston
```

All other environment variables remain the same.

### Step 4: Remove Docker Files (Optional)

These files are no longer needed:

```bash
# Remove Docker-related files
rm -rf docker/
rm docker-compose.yml  # if exists

# Remove Docker-specific scripts from package.json
# (already done in v2.0)
```

### Step 5: Update API Routes Location

**v1.0 Location**: `src/pages/api/`  
**v2.0 Location**: `/api/`

The new location is optimized for Vercel's routing.

### Step 6: Test Locally

```bash
# Start local development with Vercel
npm run dev

# Test the API
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -d '{"code": "print('Migration test')", "language": "python"}'
```

### Step 7: Deploy to Vercel

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed deployment instructions.

```bash
# Quick deploy
vercel --prod
```

## API Compatibility

### No Breaking Changes! ✅

The API interface remains **100% compatible** with v1.0:

**Execute Endpoint** - No changes:
```bash
POST /api/execute
{
  "code": "print('hello')",
  "language": "python"
}
```

**History Endpoint** - No changes:
```bash
GET /api/history?page=1&limit=10
```

**Response Format** - No changes:
```json
{
  "success": true,
  "executionId": "uuid",
  "output": "...",
  "error": null,
  "executionTime": 1234
}
```

### Client Code

If you have client applications using the API, **no changes needed**!

```javascript
// This code works with both v1.0 and v2.0
const response = await fetch('https://your-api.com/api/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: "print('Hello')",
    language: 'python'
  })
});
```

## Functional Differences

### What's Different

1. **Execution Engine**:
   - **v1.0**: Local Docker containers
   - **v2.0**: Piston API (still uses Docker, but managed externally)

2. **Package Availability**:
   - **v1.0**: Custom Docker images with pre-installed packages
   - **v2.0**: Uses Piston's default package set
   - **Note**: Most common packages (numpy, pandas, lodash) are available in both

3. **Execution Time**:
   - **v1.0**: Limited by your server resources
   - **v2.0**: Limited by Piston API and Vercel function timeout
   - **Practical impact**: Minimal for most use cases

4. **Scaling**:
   - **v1.0**: Limited by your server capacity
   - **v2.0**: Auto-scales with Vercel

### What's the Same

✅ API interface  
✅ Response format  
✅ Error handling  
✅ Rate limiting  
✅ Database integration  
✅ Security features  
✅ Validation logic  

## Database Migration

**Good news**: No database migration needed! The schema remains the same.

If you're switching Supabase instances:

1. **Export data from old instance**:
   ```sql
   -- In old Supabase SQL editor
   COPY (SELECT * FROM executions) TO STDOUT WITH CSV HEADER;
   COPY (SELECT * FROM snippets) TO STDOUT WITH CSV HEADER;
   ```

2. **Import to new instance**:
   ```sql
   -- In new Supabase SQL editor
   -- First run schema.sql
   -- Then import data
   ```

## Rollback Plan

If you need to rollback to v1.0:

```bash
# Switch back to main branch (or your v1.0 branch)
git checkout main

# Reinstall dependencies
npm install

# Rebuild Docker images
npm run docker:build:all

# Start with Docker
npm run dev
```

## Performance Comparison

### Benchmarks

| Metric | v1.0 (Docker) | v2.0 (Serverless) |
|--------|---------------|-------------------|
| **Cold Start** | N/A (always warm) | ~200-500ms |
| **Execution Time** | ~1-2s | ~1-3s |
| **Scalability** | Limited by server | Unlimited |
| **Cost (1000 req/day)** | ~$5-20/month | ~$0-5/month |

### Cold Start Mitigation

Vercel serverless functions have cold starts (~200-500ms). To mitigate:

1. **Upgrade to Pro**: Longer function warm-up time
2. **Implement warming**: Periodic health checks
3. **Use Edge Functions**: Faster cold starts (experimental)

## Cost Comparison

### v1.0 (Docker) Monthly Costs

- **Basic VPS**: $5-10/month
- **Docker hosting**: $10-20/month
- **Total**: ~$15-30/month

### v2.0 (Serverless) Monthly Costs

**Free Tier Usage** (up to ~10,000 requests/month):
- Vercel: $0
- Supabase: $0
- Piston (public): $0
- **Total**: $0

**High Traffic** (~100,000 requests/month):
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- Custom Piston: $10-20/month
- **Total**: ~$55-65/month

## Feature Parity Checklist

- ✅ Code execution (Python, JavaScript)
- ✅ Rate limiting
- ✅ Database storage
- ✅ Execution history
- ✅ Error handling
- ✅ Security validation
- ✅ API compatibility
- ⚠️ Custom packages (limited to Piston's defaults)
- ⚠️ Execution timeout (now limited to Vercel's limits)

## Advanced: Self-Hosted Piston

For full control, deploy your own Piston instance:

### Deploy Piston to DigitalOcean

```bash
# 1. Create a droplet
# 2. SSH into droplet
ssh root@your-droplet-ip

# 3. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 4. Clone and run Piston
git clone https://github.com/engineer-man/piston
cd piston
docker-compose up -d

# 5. Configure firewall
ufw allow 2000/tcp

# 6. Update your .env
PISTON_API_URL=http://your-droplet-ip:2000/api/v2/piston
```

### Deploy Piston to Docker Hub + Cloud Run

For better scalability:

```bash
# Deploy to Google Cloud Run
gcloud run deploy piston \
  --image ghcr.io/engineer-man/piston \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Get the URL and update .env
PISTON_API_URL=https://piston-xxxxx-uc.a.run.app/api/v2/piston
```

## Testing After Migration

### Test Suite

```bash
# Test Python execution
curl -X POST https://your-app.vercel.app/api/execute \
  -H "Content-Type: application/json" \
  -d '{"code": "print(2+2)", "language": "python"}'

# Test JavaScript execution
curl -X POST https://your-app.vercel.app/api/execute \
  -H "Content-Type: application/json" \
  -d '{"code": "console.log(2+2)", "language": "javascript"}'

# Test error handling
curl -X POST https://your-app.vercel.app/api/execute \
  -H "Content-Type: application/json" \
  -d '{"code": "print(undefined_variable)", "language": "python"}'

# Test rate limiting
for i in {1..15}; do
  curl -X POST https://your-app.vercel.app/api/execute \
    -H "Content-Type: application/json" \
    -d '{"code": "print('test')", "language": "python"}'
done

# Test history
curl https://your-app.vercel.app/api/history?page=1&limit=5
```

## FAQ

### Q: Will my existing API clients break?
**A**: No! The API is 100% backward compatible.

### Q: Do I need to rebuild Docker images?
**A**: No! v2.0 doesn't use Docker at all.

### Q: Can I use custom Python/Node packages?
**A**: You're limited to Piston's pre-installed packages, or deploy your own Piston instance with custom packages.

### Q: Is v2.0 slower than v1.0?
**A**: Slightly slower due to cold starts (~200-500ms), but similar execution time.

### Q: Should I migrate?
**A**: Yes, if you want:
- Easier deployment
- Better scaling
- Lower costs for low-medium traffic
- Zero infrastructure management

### Q: When should I stick with v1.0?
**A**: If you need:
- Custom package installations
- Very high request volume (>1M/month)
- Guaranteed warm functions
- Full control over execution environment

## Support

- **Migration Issues**: [Open an issue](https://github.com/Dpdpdpdp0987/poke-code-executor/issues)
- **Questions**: Check [Discussions](https://github.com/Dpdpdpdp0987/poke-code-executor/discussions)
- **Documentation**: See [docs/](../docs/) folder

---

**Happy migrating! 🚀**
