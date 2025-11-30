# Poke Code Executor - API Documentation

## Base URL

```
https://your-domain.vercel.app/api
```

## Authentication

Currently, the API does not require authentication. Rate limiting is applied based on IP address.

## Rate Limits

- **Limit**: 10 requests per minute per IP address
- **Headers**: Rate limit info included in response headers
- **Response Code**: 429 Too Many Requests when limit exceeded

---

## Endpoints

### 1. Execute Code

Execute Python or JavaScript code in a secure Docker container.

**Endpoint**: `POST /api/execute`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "code": "string (required, max 10000 chars)",
  "language": "python | javascript (required)"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "executionId": "uuid",
  "output": "string",
  "error": null,
  "executionTime": 1234
}
```

**Error Response** (with execution error):
```json
{
  "success": true,
  "executionId": "uuid",
  "output": "",
  "error": {
    "type": "NameError",
    "message": "name 'x' is not defined",
    "traceback": "..."
  },
  "executionTime": 1234
}
```

**Validation Error** (400 Bad Request):
```json
{
  "error": "Validation failed",
  "details": [
    "Code contains potentially dangerous pattern: /import\\s+os/i"
  ]
}
```

**Rate Limit Error** (429 Too Many Requests):
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

**Examples**:

**Python Example**:
```bash
curl -X POST https://your-domain.vercel.app/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print('Hello, World!')",
    "language": "python"
  }'
```

**JavaScript Example**:
```bash
curl -X POST https://your-domain.vercel.app/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "console.log('Hello, World!')",
    "language": "javascript"
  }'
```

---

### 2. Get Execution History

Retrieve paginated list of past code executions.

**Endpoint**: `GET /api/history`

**Query Parameters**:
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10, max: 100): Results per page
- `language` (optional): Filter by language (python | javascript)

**Success Response** (200 OK):
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
      "execution_time": 1234,
      "ip_address": "127.0.0.1",
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

**Rate Limit Error** (429 Too Many Requests):
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

**Examples**:

**Get first page**:
```bash
curl https://your-domain.vercel.app/api/history
```

**Get specific page with limit**:
```bash
curl "https://your-domain.vercel.app/api/history?page=2&limit=20"
```

**Filter by language**:
```bash
curl "https://your-domain.vercel.app/api/history?language=python"
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input or validation error |
| 405 | Method Not Allowed - Wrong HTTP method |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## Code Execution Constraints

### Resource Limits
- **Memory**: 256 MB
- **CPU**: 50% of one core
- **Timeout**: 30 seconds
- **Output Size**: 1 MB maximum
- **Code Length**: 10,000 characters maximum

### Security Restrictions

**Blocked Patterns**:
- `import os` (Python)
- `import subprocess` (Python)
- `eval()` calls
- `exec()` calls
- `__import__`
- `fs.readFile` / `fs.writeFile` (JavaScript)
- `child_process` (JavaScript)
- `require('child_process')`

### Network Access
No network access is available within execution containers.

### File System
- Root filesystem is read-only
- No file upload/download support
- Cannot save files between executions

---

## Supported Packages

### Python
- numpy (1.24.3)
- pandas (2.0.3)
- requests (2.31.0)
- matplotlib (3.7.2)
- scipy (1.11.1)

### JavaScript
- lodash (4.17.21)
- axios (1.6.2)
- moment (2.29.4)

---

## Response Headers

All API responses include security headers:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; ...
```

---

## Code Examples

### Python Examples

**Example 1: NumPy Array Operations**
```json
{
  "code": "import numpy as np\narr = np.array([1, 2, 3, 4, 5])\nprint(f'Mean: {arr.mean()}')\nprint(f'Std: {arr.std()}')",
  "language": "python"
}
```

**Example 2: Pandas DataFrame**
```json
{
  "code": "import pandas as pd\ndf = pd.DataFrame({'A': [1, 2, 3], 'B': [4, 5, 6]})\nprint(df)\nprint(df.describe())",
  "language": "python"
}
```

**Example 3: Basic Math**
```json
{
  "code": "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\nfor i in range(10):\n    print(f'F({i}) = {fibonacci(i)}')",
  "language": "python"
}
```

### JavaScript Examples

**Example 1: Array Operations**
```json
{
  "code": "const numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map(x => x * 2);\nconsole.log('Original:', numbers);\nconsole.log('Doubled:', doubled);\nconsole.log('Sum:', doubled.reduce((a, b) => a + b, 0));",
  "language": "javascript"
}
```

**Example 2: Using Lodash**
```json
{
  "code": "const _ = require('lodash');\nconst data = [1, 2, 3, 4, 5, 6, 7, 8, 9];\nconsole.log('Chunk:', _.chunk(data, 3));\nconsole.log('Sum:', _.sum(data));\nconsole.log('Mean:', _.mean(data));",
  "language": "javascript"
}
```

**Example 3: Object Manipulation**
```json
{
  "code": "const users = [\n  { name: 'Alice', age: 30 },\n  { name: 'Bob', age: 25 },\n  { name: 'Charlie', age: 35 }\n];\n\nconst sorted = users.sort((a, b) => a.age - b.age);\nconsole.log('Sorted by age:', sorted);\nconsole.log('Names:', users.map(u => u.name));",
  "language": "javascript"
}
```

---

## WebSocket Support (Future)

Currently not supported. Future versions may include WebSocket connections for real-time output streaming.

---

## SDKs and Client Libraries

Currently, no official SDKs are provided. The API follows standard REST principles and can be easily integrated using any HTTP client.

### JavaScript/TypeScript Client Example

```typescript
interface ExecuteRequest {
  code: string;
  language: 'python' | 'javascript';
}

interface ExecuteResponse {
  success: boolean;
  executionId: string;
  output: string;
  error: any;
  executionTime: number;
}

async function executeCode(request: ExecuteRequest): Promise<ExecuteResponse> {
  const response = await fetch('https://your-domain.vercel.app/api/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Usage
const result = await executeCode({
  code: "print('Hello, World!')",
  language: 'python'
});

console.log(result.output);
```

### Python Client Example

```python
import requests
from typing import Dict, Any

class CodeExecutor:
    def __init__(self, base_url: str):
        self.base_url = base_url
    
    def execute(self, code: str, language: str) -> Dict[str, Any]:
        response = requests.post(
            f"{self.base_url}/api/execute",
            json={"code": code, "language": language},
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        return response.json()
    
    def get_history(self, page: int = 1, limit: int = 10, language: str = None) -> Dict[str, Any]:
        params = {"page": page, "limit": limit}
        if language:
            params["language"] = language
        
        response = requests.get(
            f"{self.base_url}/api/history",
            params=params
        )
        response.raise_for_status()
        return response.json()

# Usage
executor = CodeExecutor("https://your-domain.vercel.app")
result = executor.execute("print('Hello, World!')", "python")
print(result["output"])
```

---

## Support

For API issues or questions:
- GitHub Issues: https://github.com/Dpdpdpdp0987/poke-code-executor/issues
- Email: support@your-domain.com

---

**Last Updated**: November 30, 2025
