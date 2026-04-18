# Deployment Checklist

Use this checklist to ensure your Poke Code Executor deployment is production-ready.

## Pre-Deployment

### Environment Setup

- [ ] **Supabase Account Created**
  - Project created and active
  - Database schema deployed
  - Tables verified: `executions`, `rate_limits`, `snippets`
  - Indexes created

- [ ] **Vercel Account Created**
  - Account connected to GitHub
  - Project limits understood (Hobby vs Pro)
  
- [ ] **Environment Variables Prepared**
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` obtained
  - [ ] `SUPABASE_SERVICE_KEY` obtained (service_role, not anon!)
  - [ ] `PISTON_API_URL` configured (if using custom instance)
  - [ ] `RATE_LIMIT_REQUESTS_PER_MINUTE` set (optional)

### Code Review

- [ ] **Latest Code Pulled**
  ```bash
  git checkout feature/vercel-serverless-refactor
  git pull origin feature/vercel-serverless-refactor
  ```

- [ ] **Dependencies Installed**
  ```bash
  npm install
  ```

- [ ] **Local Testing Completed**
  ```bash
  npm run dev
  # Test all endpoints
  ```

- [ ] **No Errors in Console**
  - Check browser console
  - Check terminal logs

## Deployment Steps

### Vercel Deployment

- [ ] **Connect Repository to Vercel**
  - GitHub repository connected
  - Automatic deployments enabled
  - Branch strategy configured

- [ ] **Configure Build Settings**
  - Build command: `npm run build`
  - Output directory: `.next`
  - Install command: `npm install`
  - Node.js version: 18.x

- [ ] **Set Environment Variables**
  - All required variables added
  - Values are correct
  - No trailing spaces or quotes

- [ ] **Configure Function Settings** (in vercel.json)
  - Memory: 1024 MB
  - Max duration: 60s (Pro) or 10s (Hobby)
  - Regions: Optimal for users

- [ ] **Deploy**
  ```bash
  vercel --prod
  ```

### Database Setup

- [ ] **Supabase Schema Deployed**
  ```sql
  -- Run in Supabase SQL Editor
  -- See database/schema.sql
  ```

- [ ] **Database Connection Tested**
  - Connect from Vercel function
  - Test read operations
  - Test write operations

- [ ] **Row Level Security (Optional)**
  - Policies configured if needed
  - Service role key has access

### API Testing

- [ ] **Execute Endpoint Works**
  ```bash
  curl -X POST https://your-app.vercel.app/api/execute \
    -H "Content-Type: application/json" \
    -d '{"code": "print('Hello')", "language": "python"}'
  ```
  - Returns 200 status
  - Output is correct
  - executionId is UUID
  - executionTime is number

- [ ] **History Endpoint Works**
  ```bash
  curl https://your-app.vercel.app/api/history
  ```
  - Returns 200 status
  - Pagination works
  - Data format is correct

- [ ] **Runtimes Endpoint Works**
  ```bash
  curl https://your-app.vercel.app/api/runtimes
  ```
  - Returns available runtimes
  - Python and JavaScript listed

- [ ] **Error Handling Works**
  ```bash
  # Test with invalid code
  curl -X POST https://your-app.vercel.app/api/execute \
    -H "Content-Type: application/json" \
    -d '{"code": "invalid", "language": "python"}'
  ```
  - Returns proper error
  - Error format is correct
  - HTTP status is appropriate

- [ ] **Rate Limiting Works**
  ```bash
  # Send 15 requests quickly
  for i in {1..15}; do
    curl -X POST https://your-app.vercel.app/api/execute \
      -H "Content-Type: application/json" \
      -d '{"code": "print('test')", "language": "python"}'
  done
  ```
  - First 10 succeed
  - 11th returns 429
  - retryAfter header present

## Post-Deployment

### Monitoring Setup

- [ ] **Vercel Analytics Enabled**
  - Go to Project Settings → Analytics
  - Enable Web Analytics
  - Enable Speed Insights

- [ ] **Function Logs Accessible**
  - Functions tab shows logs
  - Can filter by status code
  - Real-time logs work

- [ ] **Error Tracking Configured**
  - Error notifications enabled
  - Email alerts set up
  - Slack integration (optional)

### Performance Verification

- [ ] **Response Times Acceptable**
  - Cold start < 3s
  - Warm requests < 2s
  - Database queries < 200ms

- [ ] **Success Rate High**
  - > 95% success rate
  - Errors are handled gracefully
  - No 500 errors in normal operation

- [ ] **Rate Limits Appropriate**
  - Not too restrictive
  - Prevents abuse
  - Can be adjusted if needed

### Security Verification

- [ ] **HTTPS Only**
  - All requests use HTTPS
  - HTTP redirects to HTTPS
  - SSL certificate valid

- [ ] **Security Headers Present**
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - X-XSS-Protection: 1; mode=block
  - Check with: `curl -I https://your-app.vercel.app/api/execute`

- [ ] **Environment Variables Secure**
  - Not exposed in client-side code
  - Not in error messages
  - Not in logs

- [ ] **Code Validation Active**
  - Dangerous patterns blocked
  - Input sanitization working
  - Length limits enforced

### Documentation

- [ ] **API Documentation Updated**
  - Correct endpoint URLs
  - Examples work
  - Response formats accurate

- [ ] **README Updated**
  - Deployment instructions accurate
  - Environment variables documented
  - Contact information current

- [ ] **Changelog Updated**
  - Version number correct
  - Changes documented
  - Release date set

### Domain & DNS (Optional)

- [ ] **Custom Domain Configured**
  - Domain added in Vercel
  - DNS records updated
  - SSL certificate issued

- [ ] **DNS Propagated**
  - Domain resolves correctly
  - HTTPS works on custom domain
  - www redirect configured

### Backup & Recovery

- [ ] **Database Backup Strategy**
  - Supabase automatic backups enabled
  - Backup retention period set
  - Restore procedure documented

- [ ] **Deployment Rollback Plan**
  - Previous deployment available
  - Rollback procedure tested
  - Rollback time < 5 minutes

- [ ] **Disaster Recovery Plan**
  - Recovery Time Objective (RTO) defined
  - Recovery Point Objective (RPO) defined
  - Contact list for emergencies

## Production Readiness

### Performance

- [ ] **Load Testing Completed**
  - Handles expected traffic
  - Auto-scaling works
  - No memory leaks

- [ ] **Piston API Performance**
  - Response times acceptable
  - No rate limit errors
  - Custom instance deployed (if needed)

### Compliance

- [ ] **Terms of Service**
  - Usage limits documented
  - Acceptable use policy defined
  - Privacy policy (if needed)

- [ ] **Rate Limiting**
  - Fair usage policy
  - Clear error messages
  - Documented in API docs

### User Experience

- [ ] **API is Intuitive**
  - Clear request/response format
  - Helpful error messages
  - Examples provided

- [ ] **Documentation is Complete**
  - Getting started guide
  - API reference
  - Troubleshooting section

### Maintenance

- [ ] **Update Process Defined**
  - How to deploy updates
  - Testing procedure
  - Rollback procedure

- [ ] **Monitoring Dashboard**
  - Key metrics visible
  - Alerts configured
  - Historical data available

- [ ] **Support Process**
  - Issue reporting method
  - Response time commitment
  - Escalation process

## Cost Management

- [ ] **Current Plan Sufficient**
  - Within bandwidth limits
  - Within function duration limits
  - Within database limits

- [ ] **Cost Monitoring**
  - Vercel usage dashboard checked
  - Supabase usage dashboard checked
  - Upgrade triggers defined

- [ ] **Optimization Strategy**
  - Caching implemented where possible
  - Database queries optimized
  - Function memory optimized

## Launch

### Pre-Launch

- [ ] **All Tests Pass**
- [ ] **Documentation Complete**
- [ ] **Monitoring Active**
- [ ] **Team Notified**

### Launch

- [ ] **Announce Launch**
  - Update README with live URL
  - Post in discussions
  - Share on social media (optional)

- [ ] **Monitor for Issues**
  - Watch logs for first hour
  - Check error rates
  - Verify user feedback

### Post-Launch

- [ ] **Monitor Performance**
  - First 24 hours
  - First week
  - First month

- [ ] **Collect Feedback**
  - User feedback
  - Performance metrics
  - Error patterns

- [ ] **Plan Improvements**
  - Feature roadmap
  - Performance optimizations
  - User requests

## Troubleshooting

### Common Issues Checklist

- [ ] **"Module not found"**
  - [ ] Dependencies in package.json
  - [ ] Deployed with `vercel --prod`

- [ ] **"Database connection failed"**
  - [ ] Environment variables correct
  - [ ] Using service_role key
  - [ ] Supabase project active

- [ ] **"Function timeout"**
  - [ ] Upgrade to Pro plan
  - [ ] Optimize execution time
  - [ ] Use custom Piston instance

- [ ] **"Rate limit exceeded"**
  - [ ] Check Piston API limits
  - [ ] Increase rate limit config
  - [ ] Deploy custom Piston

## Success Criteria

Your deployment is successful when:

- ✅ All endpoints return correct responses
- ✅ Error rate < 5%
- ✅ Response time < 3s (cold start), < 2s (warm)
- ✅ Database operations succeed
- ✅ Rate limiting works
- ✅ Security headers present
- ✅ Monitoring active
- ✅ Documentation complete
- ✅ Team trained on maintenance

## Support Contacts

- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Piston API**: https://github.com/engineer-man/piston/issues
- **Project Issues**: https://github.com/Dpdpdpdp0987/poke-code-executor/issues

---

**Deployment Date**: _____________

**Deployed By**: _____________

**Production URL**: _____________

**Notes**: 

_____________________________________________

_____________________________________________

_____________________________________________

---

**Congratulations on your deployment! 🚀**
