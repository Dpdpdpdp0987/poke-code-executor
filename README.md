# Poke Code Executor

A secure, scalable code execution environment supporting Python and JavaScript with Docker containerization, rate limiting, and Supabase integration.

## 🚀 Features

- **Multi-Language Support**: Execute Python and JavaScript code securely
- **Docker Isolation**: Each execution runs in an isolated Docker container
- **Security Features**:
  - Code validation and dangerous pattern detection
  - Resource limits (CPU, memory, execution time)
  - No network access in containers
  - Non-root user execution
  - Read-only root filesystem
- **Rate Limiting**: IP-based rate limiting (10 requests/minute)
- **Database Integration**: Supabase for storing executions and snippets
- **API Documentation**: RESTful API with comprehensive examples
- **Production Ready**: Configured for Vercel deployment

## 📋 Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Supabase account (or self-hosted instance)
- Vercel account (for deployment)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/Dpdpdpdp0987/poke-code-executor.git
cd poke-code-executor
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### 4. Set up Supabase database

Run the SQL schema in your Supabase SQL editor:

```bash
cat database/schema.sql
```

Copy and execute the SQL in your Supabase project.

### 5. Build Docker images

```bash
npm run docker:build:all
```

This will build both Python and Node.js execution containers.

### 6. Start the development server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔌 API Documentation

### Execute Code

**Endpoint**: `POST /api/execute`

**Request Body**:
```json
{
  "code": "print('Hello, World!')",
  "language": "python"
}
```

**Response**:
```json
{
  "success": true,
  "executionId": "uuid",
  "output": "Hello, World!\n",
  "error": null,
  "executionTime": 1234
}
```

**Supported Languages**: `python`, `javascript`

### Get Execution History

**Endpoint**: `GET /api/history`

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10, max: 100)
- `language` (optional): Filter by language

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "code": "print('test')",
      "language": "python",
      "output": "test\n",
      "error": null,
      "created_at": "2025-11-30T18:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

## 🐳 Docker Configuration

### Python Container
- Base image: `python:3.11-slim`
- Pre-installed packages: numpy, pandas, requests, matplotlib, scipy
- Resource limits: 256MB RAM, 50% CPU
- Execution timeout: 30 seconds
- Network: Disabled

### Node.js Container
- Base image: `node:18-alpine`
- Pre-installed packages: lodash, axios, moment
- Resource limits: 256MB RAM, 50% CPU
- Execution timeout: 30 seconds
- Network: Disabled

## 🔒 Security Features

1. **Code Validation**: Detects dangerous patterns before execution
2. **Container Isolation**: Each execution in isolated Docker container
3. **Resource Limits**: CPU, memory, and time constraints
4. **No Network Access**: Containers run without network connectivity
5. **Non-Root Execution**: Code runs as unprivileged user
6. **Read-Only Filesystem**: Root filesystem is read-only
7. **Rate Limiting**: IP-based request throttling
8. **Security Headers**: Comprehensive HTTP security headers
9. **Input Sanitization**: Joi schema validation

## 📊 Database Schema

The application uses three main tables:

1. **executions**: Stores all code execution records
2. **snippets**: Stores saved code snippets
3. **rate_limits**: Tracks rate limiting per IP

See `database/schema.sql` for the complete schema.

## 🚀 Deployment to Vercel

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Deploy

```bash
vercel
```

### 3. Set environment variables

In the Vercel dashboard, add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

### 4. Configure Docker (Important)

⚠️ **Note**: Vercel's serverless functions don't support Docker. For production use with Docker:

**Option 1**: Deploy to a platform that supports Docker:
- Railway
- Render
- DigitalOcean App Platform
- AWS ECS/Fargate
- Google Cloud Run

**Option 2**: Use a separate microservice for code execution:
- Deploy Docker containers to a separate service
- Update API routes to call the external execution service

## 🧪 Testing

### Test Python Execution

```bash
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "import numpy as np\nprint(np.array([1,2,3]))",
    "language": "python"
  }'
```

### Test JavaScript Execution

```bash
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "console.log([1,2,3].map(x => x * 2))",
    "language": "javascript"
  }'
```

## 📝 Example Usage

### Python Example

```python
import numpy as np
import pandas as pd

# Create a simple array
arr = np.array([1, 2, 3, 4, 5])
print(f"Array: {arr}")
print(f"Mean: {arr.mean()}")

# Create a DataFrame
df = pd.DataFrame({'A': [1, 2, 3], 'B': [4, 5, 6]})
print(df)
```

### JavaScript Example

```javascript
const _ = require('lodash');

// Use lodash
const numbers = [1, 2, 3, 4, 5];
const doubled = _.map(numbers, n => n * 2);
console.log('Doubled:', doubled);

// Array operations
const sum = numbers.reduce((a, b) => a + b, 0);
console.log('Sum:', sum);
```

## 🛡️ Rate Limiting

- **Default**: 10 requests per minute per IP
- **Window**: Rolling 60-second window
- **Response**: HTTP 429 with `retryAfter` header

## 📦 Project Structure

```
poke-code-executor/
├── src/
│   ├── pages/
│   │   └── api/
│   │       ├── execute.ts      # Main execution endpoint
│   │       └── history.ts      # Execution history
│   ├── lib/
│   │   ├── executor.ts         # Docker execution logic
│   │   ├── validation.ts       # Code validation
│   │   ├── rateLimit.ts        # Rate limiting
│   │   ├── database.ts         # Supabase integration
│   │   └── logger.ts           # Winston logger
│   └── middleware.ts           # Security middleware
├── docker/
│   ├── Dockerfile.python       # Python container
│   ├── Dockerfile.node         # Node.js container
│   ├── execute.py              # Python executor
│   └── execute.js              # JavaScript executor
├── database/
│   └── schema.sql              # Database schema
├── package.json
├── tsconfig.json
├── next.config.js
├── vercel.json
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🐛 Known Limitations

1. Docker execution doesn't work on Vercel's serverless platform
2. Maximum execution time is 30 seconds
3. No support for file uploads/downloads in code
4. Network access is disabled in containers
5. Limited to pre-installed packages

## 🔮 Future Enhancements

- [ ] Add support for more languages (Go, Rust, Java)
- [ ] User authentication and personal snippet libraries
- [ ] Package installation support
- [ ] Collaborative coding features
- [ ] Syntax highlighting and code editor
- [ ] WebSocket support for real-time output
- [ ] Code sharing and embedding
- [ ] Analytics dashboard

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js, Docker, and Supabase
