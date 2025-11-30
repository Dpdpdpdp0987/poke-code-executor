import { NextApiRequest } from 'next';
import { RateLimiter } from 'limiter';

interface RateLimitStore {
  [key: string]: RateLimiter;
}

const limiters: RateLimitStore = {};

// Rate limit: 10 requests per minute per IP
const REQUESTS_PER_MINUTE = 10;
const WINDOW_MS = 60000; // 1 minute

function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded
    ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])
    : req.socket.remoteAddress;
  return ip || 'unknown';
}

function getLimiter(ip: string): RateLimiter {
  if (!limiters[ip]) {
    limiters[ip] = new RateLimiter({
      tokensPerInterval: REQUESTS_PER_MINUTE,
      interval: 'minute'
    });
  }
  return limiters[ip];
}

export async function rateLimit(
  req: NextApiRequest
): Promise<{ success: boolean; retryAfter?: number }> {
  const ip = getClientIp(req);
  const limiter = getLimiter(ip);

  const remainingRequests = await limiter.removeTokens(1);

  if (remainingRequests < 0) {
    return {
      success: false,
      retryAfter: 60 // seconds
    };
  }

  return { success: true };
}

// Clean up old limiters every 10 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(limiters).forEach(ip => {
    // Remove limiters that haven't been used in 10 minutes
    delete limiters[ip];
  });
}, 10 * 60 * 1000);