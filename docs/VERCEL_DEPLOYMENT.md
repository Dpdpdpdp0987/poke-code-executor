# Vercel Deployment Guide

Complete guide to deploying Poke Code Executor to Vercel.

## Prerequisites

- GitHub account
- Vercel account (sign up at https://vercel.com)
- Supabase account (sign up at https://supabase.com)

## Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. Fork or clone this repository to your GitHub account
2. Ensure you're on the `feature/vercel-serverless-refactor` branch or `main` (after merge)

### Step 2: Set Up Supabase

1. **Create a new Supabase project**:
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Name your project (e.g., "poke-code-executor")
   - Set a strong database password
   - Choose a region close to your users
   - Wait for setup to complete (~2 minutes)

2. **Run the database schema**:
   - Open SQL Editor in Supabase dashboard
   - Copy contents of `database/schema.sql`
   - Paste and run in SQL Editor
   - Verify tables were created

3. **Get your credentials**:
   - Go to Project Settings → API
   - Copy `Project URL` (for `NEXT_PUBLIC_SUPABASE_URL`)
   - Copy `service_role` key (for `SUPABASE_SERVICE_KEY`)
   - **Important**: Use the `service_role` key, not the `anon` key

### Step 3: Deploy to Vercel

#### Option A: One-Click Deploy (Recommended)

1. Click the deploy button:
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Dpdpdpdp0987/poke-code-executor)

2. Vercel will ask you to:
   - Connect your GitHub account
   - Choose a repository name
   - Select your Git scope (personal or organization)

3. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_KEY`: Your Supabase service role key

4. Click "Deploy"

5. Wait for deployment (usually 1-2 minutes)

6. You're live! 🎉

#### Option B: Manual Deploy via CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Navigate to project directory**:
   ```bash
   cd poke-code-executor
   ```

4. **Deploy**:
   ```bash
   vercel
   ```

5. **Answer the prompts**:
   - Set up and deploy? `Y`
   - Which scope? Choose your account
   - Link to existing project? `N`
   - What's your project's name? `poke-code-executor`
   - In which directory is your code located? `./`
   - Want to modify settings? `N`

6. **Set environment variables**:
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   # Paste your Supabase URL
   
   vercel env add SUPABASE_SERVICE_KEY
   # Paste your Supabase service key
   ```

7. **Deploy to production**:
   ```bash
   vercel --prod
   ```

### Step 4: Verify Deployment

1. **Test the API**:
   ```bash
   curl -X POST https://your-app.vercel.app/api/execute \
     -H "Content-Type: application/json" \
     -d '{"code": "print('Hello Vercel!')", "language": "python"}'
   ```

2. **Check the response**:
   ```json
   {
     "success": true,
     "executionId": "...",
     "output": "Hello Vercel!\n",
     "error": null,
     "executionTime": 1234
   }
   ```

3. **Verify database**:
   - Check Supabase Table Editor
   - Look for new entry in `executions` table

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | `eyJhbGc...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|----------|
| `PISTON_API_URL` | Custom Piston API instance | `https://emkc.org/api/v2/piston` |
| `RATE_LIMIT_REQUESTS_PER_MINUTE` | Rate limit per IP | `10` |
| `MAX_EXECUTION_TIME` | Max execution time (ms) | `30000` |
| `MAX_CODE_LENGTH` | Max code length (chars) | `10000` |
| `LOG_LEVEL` | Logging level | `info` |

## Vercel Configuration

The `vercel.json` file configures your deployment:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ],
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 60
    }
  }
}
```

### Key Settings:

- **memory**: 1024 MB per function
- **maxDuration**: 60 seconds (requires Pro plan; Hobby plan: 10s)
- **regions**: Automatically optimized by Vercel

## Custom Domain Setup

1. **Add domain in Vercel**:
   - Go to Project Settings → Domains
   - Click "Add"
   - Enter your domain name
   - Follow DNS configuration instructions

2. **Update DNS records**:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **Wait for DNS propagation** (can take up to 48 hours)

## Production Checklist

- [ ] Supabase database schema deployed
- [ ] Environment variables configured
- [ ] API endpoints tested
- [ ] Rate limiting configured
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up (Vercel Analytics)
- [ ] Error tracking configured
- [ ] Backup strategy for Supabase

## Monitoring & Logs

### Vercel Logs

1. Go to your project in Vercel dashboard
2. Click "Functions" tab
3. Select a function to view logs
4. Filter by status code, time range

### Real-time Monitoring

```bash
vercel logs --follow
```

### Supabase Logs

1. Open Supabase dashboard
2. Go to Database → Logs
3. Monitor queries and errors

## Troubleshooting

### Issue: "Module not found"

**Solution**: Ensure all dependencies are in `package.json` and run:
```bash
vercel --force
```

### Issue: "Function timeout"

**Solutions**:
1. Upgrade to Vercel Pro for 60s timeout
2. Optimize code execution
3. Use custom Piston instance closer to Vercel region

### Issue: "Rate limit from Piston API"

**Solutions**:
1. Deploy your own Piston instance
2. Implement request queuing
3. Add caching layer

### Issue: "Database connection failed"

**Solutions**:
1. Verify environment variables are set
2. Check Supabase service key (use `service_role`, not `anon`)
3. Ensure Supabase project is active

### Issue: "CORS errors"

**Solution**: Vercel API routes have CORS enabled by default. If issues persist:
```typescript
// Add to API route
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
```

## Performance Optimization

### 1. Use Edge Functions (Experimental)

Vercel Edge Functions run closer to users:

```typescript
// api/execute.ts
export const config = {
  runtime: 'edge',
};
```

### 2. Enable Caching

Cache runtime information:

```typescript
res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
```

### 3. Deploy Custom Piston Instance

Deploy Piston in the same region as Vercel:
- Reduces latency
- No rate limits
- Full control

### 4. Database Connection Pooling

Supabase handles this automatically, but you can optimize:
- Use connection pooler: `[PROJECT_REF].pooler.supabase.com`
- Configure pool size in Supabase settings

## Scaling Considerations

### Hobby Plan Limits
- 100 GB bandwidth/month
- 10s function timeout
- Unlimited deployments
- Good for: Development, small projects, demos

### Pro Plan Benefits
- 1 TB bandwidth/month
- 60s function timeout
- Team collaboration
- Good for: Production apps, higher traffic

### Enterprise Requirements
- Custom SLA
- Dedicated support
- Custom regions
- Good for: Large-scale applications

## Cost Estimation

### Vercel Costs (Hobby Plan: Free)
- Serverless functions: Free
- Bandwidth: 100 GB/month free
- Build time: 100 hours/month free

### Vercel Costs (Pro Plan: $20/month)
- Everything in Hobby
- 1 TB bandwidth
- 60s function timeout
- Team features

### Supabase Costs (Free Tier)
- 500 MB database
- 1 GB file storage
- 2 GB bandwidth
- Good for up to 50,000 monthly active users

### Piston API
- Public instance: Free (rate limited)
- Self-hosted: Infrastructure costs (Docker hosting)

## Next Steps

1. **Set up monitoring**: Enable Vercel Analytics
2. **Configure alerts**: Set up error notifications
3. **Add authentication**: Integrate with NextAuth.js
4. **Build frontend**: Create a web UI for the API
5. **Add features**: Implement code sharing, snippets library

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **GitHub Issues**: https://github.com/Dpdpdpdp0987/poke-code-executor/issues

---

**Happy deploying! 🚀**
