# Poke Code Executor - Serverless Edition

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Dpdpdpdp0987/poke-code-executor)

A **fully serverless** code execution environment supporting Python and JavaScript with Vercel compatibility, Piston API integration, and Supabase database.

## 🚀 What's New in v2.0

- ✅ **Vercel Compatible**: No Docker dependencies - runs 100% on Vercel's serverless infrastructure
- ✅ **Piston API Integration**: Uses the robust Piston code execution engine
- ✅ **Zero Infrastructure**: No need to manage containers or VMs
- ✅ **Instant Deployment**: Deploy to Vercel in under 2 minutes
- ✅ **Same API Interface**: Backward compatible with v1.0 API
- ✅ **Cost Effective**: Pay only for what you use with serverless pricing

## 🌟 Features

- **Multi-Language Support**: Execute Python and JavaScript code securely
- **Serverless Architecture**: Fully compatible with Vercel's serverless functions
- **External Code Execution**: Uses Piston API for secure code execution
- **Security Features**:
  - Code validation and dangerous pattern detection
  - Resource limits via Piston API
  - Rate limiting (configurable)
  - Security headers
- **Rate Limiting**: IP-based rate limiting (10 requests/minute by default)
- **Database Integration**: Supabase for storing executions and history
- **API Documentation**: RESTful API with comprehensive examples
- **Production Ready**: Optimized for Vercel deployment

## 📋 Prerequisites

- Node.js 18+
- Vercel account (free tier works)
- Supabase account (free tier works)

## 🚀 Quick Start - Deploy to Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Dpdpdpdp0987/poke-code-executor)

1. Click the button above
2. Connect your GitHub account
3. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
4. Deploy!

### Option 2: Manual Deploy

```bash
# 1. Clone the repository
git clone https://github.com/Dpdpdpdp0987/poke-code-executor.git
cd poke-code-executor

# 2. Install dependencies
npm install

# 3. Install Vercel CLI
npm install -g vercel

# 4. Login to Vercel
vercel login

# 5. Deploy
vercel --prod
```

## 🛠️ Local Development

### 1. Clone and Install

```bash
git clone https://github.com/Dpdpdpdp0987/poke-code-executor.git
cd poke-code-executor
npm install
```

### 2. Set up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### 3. Set up Supabase Database

Run the SQL schema in your Supabase SQL editor:

```bash
cat database/schema.sql
```

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000/api`

## 🔌 API Usage

### Execute Code

**Endpoint**: `POST /api/execute`

**Request**:
```bash
curl -X POST https://your-app.vercel.app/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print('Hello, Serverless World!')",
    "language": "python"
  }'
```

**Response**:
```json
{
  "success": true,
  "executionId": "uuid",
  "output": "Hello, Serverless World!\n",
  "error": null,
  "executionTime": 1234
}
```

### Get Execution History

**Endpoint**: `GET /api/history`

```bash
curl https://your-app.vercel.app/api/history?page=1&limit=10
```

### Get Available Runtimes

**Endpoint**: `GET /api/runtimes`

```bash
curl https://your-app.vercel.app/api/runtimes
```

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

## 🏗️ Architecture

### Old Architecture (v1.0 - Docker-based)
```
User Request → Next.js API → Docker Container → Code Execution → Response
❌ Not compatible with Vercel serverless functions
```

### New Architecture (v2.0 - Serverless)
```
User Request → Vercel Serverless Function → Piston API → Code Execution → Response
✅ Fully compatible with Vercel
✅ No infrastructure to manage
✅ Auto-scaling
```

## 📁 Project Structure

```
poke-code-executor/
├── api/                           # Vercel serverless functions
│   ├── execute.ts                 # Code execution endpoint
│   ├── history.ts                 # Execution history endpoint
│   └── runtimes.ts                # Available runtimes endpoint
├── src/
│   └── lib/
│       ├── serverlessExecutor.ts  # Piston API integration
│       ├── validation.ts          # Code validation
│       ├── rateLimit.ts           # Rate limiting
│       ├── database.ts            # Supabase integration
│       └── logger.ts              # Winston logger
├── database/
│   └── schema.sql                 # Database schema
├── docs/
│   ├── MIGRATION_GUIDE.md         # v1 to v2 migration
│   └── VERCEL_DEPLOYMENT.md       # Deployment guide
├── package.json
├── vercel.json                    # Vercel configuration
└── README.md
```

## 🔒 Security Features

1. **Code Validation**: Detects dangerous patterns before execution
2. **Piston API Isolation**: Code runs in isolated containers via Piston
3. **Resource Limits**: Memory and time constraints
4. **Rate Limiting**: IP-based request throttling
5. **Security Headers**: Comprehensive HTTP security headers
6. **Input Sanitization**: Joi schema validation
7. **No Direct Execution**: All code runs through external Piston API

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL | - |
| `SUPABASE_SERVICE_KEY` | Yes | Supabase service role key | - |
| `PISTON_API_URL` | No | Custom Piston API URL | `https://emkc.org/api/v2/piston` |
| `RATE_LIMIT_REQUESTS_PER_MINUTE` | No | Rate limit threshold | `10` |
| `MAX_EXECUTION_TIME` | No | Max execution timeout (ms) | `30000` |
| `MAX_CODE_LENGTH` | No | Max code length | `10000` |

### Using Custom Piston Instance

You can deploy your own Piston instance for better control:

```bash
# Deploy Piston to your infrastructure
git clone https://github.com/engineer-man/piston
cd piston
docker-compose up -d

# Set custom URL in .env
PISTON_API_URL=https://your-piston-instance.com/api/v2/piston
```

## 🧪 Testing

### Test Python Execution

```bash
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "import sys\nprint(f'Python {sys.version}')",
    "language": "python"
  }'
```

### Test JavaScript Execution

```bash
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "console.log(process.version)",
    "language": "javascript"
  }'
```

## 📊 Performance & Limits

### Vercel Limits (Hobby Plan)
- **Function Duration**: 10 seconds max
- **Function Memory**: 1024 MB
- **Deployments**: Unlimited
- **Bandwidth**: 100 GB/month

### Piston API Limits (Public Instance)
- **Request Rate**: ~5 requests/second
- **Execution Time**: 30 seconds max
- **Memory**: 256 MB per execution

**For production**: Consider deploying your own Piston instance or upgrading Vercel plan.

## 🔄 Migration from v1.0

If you're upgrading from the Docker-based v1.0:

1. **API remains the same** - No client-side changes needed
2. **Remove Docker** - No need for Docker installation
3. **Update deployment** - Switch from Docker hosting to Vercel
4. **Configure Piston** - Optionally deploy custom Piston instance

See [MIGRATION_GUIDE.md](./docs/MIGRATION_GUIDE.md) for detailed steps.

## 🐛 Known Limitations

1. Execution time limited by Vercel function timeout (10s on Hobby, 60s on Pro)
2. Using public Piston API (rate limits apply)
3. No support for custom package installation during runtime
4. Limited to languages supported by Piston API

## 🔮 Roadmap

- [ ] WebSocket support for real-time output streaming
- [ ] Support for more languages (Go, Rust, Java, C++)
- [ ] User authentication and personal snippet libraries
- [ ] Collaborative coding features
- [ ] Custom package installation support
- [ ] Web-based code editor interface
- [ ] Analytics dashboard

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/Dpdpdpdp0987/poke-code-executor/issues)
- **Documentation**: See [docs/](./docs/) folder
- **API Docs**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 🙏 Credits

- **Piston API**: [engineer-man/piston](https://github.com/engineer-man/piston)
- **Vercel**: Serverless hosting platform
- **Supabase**: Database and authentication

---

**Built with ❤️ using Next.js, Vercel, Piston API, and Supabase**

**Now fully serverless and ready for production! 🚀**
