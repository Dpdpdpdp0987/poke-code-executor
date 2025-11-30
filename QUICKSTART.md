# Quick Start Guide

Get your serverless code executor running in under 5 minutes!

## Option 1: Deploy to Vercel (Fastest! 🚀)

### Step 1: Click Deploy Button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Dpdpdpdp0987/poke-code-executor)

### Step 2: Set Environment Variables

When prompted, add these two variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...
```

Don't have Supabase credentials? Get them here: 👇

#### Quick Supabase Setup (2 minutes)

1. Go to https://supabase.com
2. Click "Start your project" (free)
3. Create new project
4. Wait for setup (~2 minutes)
5. Go to **Settings** → **API**
6. Copy:
   - **URL** (for `NEXT_PUBLIC_SUPABASE_URL`)
   - **service_role key** (for `SUPABASE_SERVICE_KEY`)
7. Go to **SQL Editor**
8. Run this SQL:

```sql
-- Create executions table
CREATE TABLE executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  language VARCHAR(50) NOT NULL,
  output TEXT,
  error JSONB,
  execution_time INTEGER,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_executions_created_at ON executions(created_at DESC);
CREATE INDEX idx_executions_language ON executions(language);

-- Create rate limits table
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address VARCHAR(45) NOT NULL UNIQUE,
  request_count INTEGER DEFAULT 0,
  window_start TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for rate limiting
CREATE INDEX idx_rate_limits_ip ON rate_limits(ip_address);
```

### Step 3: Deploy!

Click "Deploy" and wait ~1 minute.

### Step 4: Test Your API

Once deployed, test with:

```bash
curl -X POST https://your-app.vercel.app/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print('Hello, World!')",
    "language": "python"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "executionId": "uuid-here",
  "output": "Hello, World!\n",
  "error": null,
  "executionTime": 1234
}
```

✅ **Done! Your API is live!**

---

## Option 2: Local Development

### Prerequisites
- Node.js 18+
- Git

### Step 1: Clone Repository

```bash
git clone https://github.com/Dpdpdpdp0987/poke-code-executor.git
cd poke-code-executor
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Environment

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials (see above for how to get them):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...
```

### Step 4: Start Development Server

```bash
npm run dev
```

Server runs at: http://localhost:3000

### Step 5: Test Locally

```bash
# Test Python
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -d '{"code": "print(2+2)", "language": "python"}'

# Test JavaScript
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -d '{"code": "console.log(2+2)", "language": "javascript"}'

# Get history
curl http://localhost:3000/api/history
```

---

## Common Use Cases

### 1. Execute Python Code

```bash
curl -X POST https://your-app.vercel.app/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "for i in range(5):\n    print(i ** 2)",
    "language": "python"
  }'
```

### 2. Execute JavaScript Code

```bash
curl -X POST https://your-app.vercel.app/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "const arr = [1,2,3]; console.log(arr.map(x => x*2));",
    "language": "javascript"
  }'
```

### 3. Get Execution History

```bash
# Get recent executions
curl https://your-app.vercel.app/api/history

# With pagination
curl https://your-app.vercel.app/api/history?page=2&limit=20

# Filter by language
curl https://your-app.vercel.app/api/history?language=python
```

### 4. Get Available Runtimes

```bash
curl https://your-app.vercel.app/api/runtimes
```

---

## JavaScript Client Example

```javascript
class CodeExecutor {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }

  async execute(code, language) {
    const response = await fetch(`${this.apiUrl}/api/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language })
    });
    return await response.json();
  }

  async getHistory(page = 1, limit = 10) {
    const response = await fetch(
      `${this.apiUrl}/api/history?page=${page}&limit=${limit}`
    );
    return await response.json();
  }
}

// Usage
const executor = new CodeExecutor('https://your-app.vercel.app');

const result = await executor.execute(
  "print('Hello from Python!')",
  'python'
);

console.log(result.output); // Hello from Python!
```

---

## Python Client Example

```python
import requests

class CodeExecutor:
    def __init__(self, api_url):
        self.api_url = api_url
    
    def execute(self, code, language):
        response = requests.post(
            f"{self.api_url}/api/execute",
            json={"code": code, "language": language}
        )
        return response.json()
    
    def get_history(self, page=1, limit=10):
        response = requests.get(
            f"{self.api_url}/api/history",
            params={"page": page, "limit": limit}
        )
        return response.json()

# Usage
executor = CodeExecutor('https://your-app.vercel.app')

result = executor.execute(
    "console.log('Hello from JavaScript!')",
    'javascript'
)

print(result['output'])  # Hello from JavaScript!
```

---

## Troubleshooting

### Issue: "Module not found" during deployment

**Solution**: Make sure `package.json` is committed:
```bash
git add package.json
git commit -m "Update dependencies"
git push
```

### Issue: "Database connection failed"

**Solution**: 
1. Verify Supabase credentials in Vercel dashboard
2. Ensure you're using `service_role` key, not `anon` key
3. Check Supabase project is active

### Issue: "Rate limit exceeded"

**Solution**: Wait 60 seconds, or increase limit:
```env
RATE_LIMIT_REQUESTS_PER_MINUTE=20
```

### Issue: "Execution timeout"

**Solutions**:
- Hobby plan: 10s max (upgrade to Pro for 60s)
- Simplify your code
- Use custom Piston instance

---

## Next Steps

✅ **You're up and running!** Here's what to explore next:

1. **Read Full Documentation**: See `README.md`
2. **Check API Docs**: See `API_DOCUMENTATION.md`
3. **Learn Architecture**: See `docs/ARCHITECTURE.md`
4. **Customize Configuration**: Edit `.env`
5. **Add Authentication**: Integrate NextAuth.js
6. **Build a Frontend**: Create a web UI
7. **Monitor Usage**: Enable Vercel Analytics

---

## Support

- **Issues**: https://github.com/Dpdpdpdp0987/poke-code-executor/issues
- **Docs**: See `docs/` folder
- **Vercel Help**: https://vercel.com/docs
- **Supabase Help**: https://supabase.com/docs

---

**Happy coding! 🚀**
