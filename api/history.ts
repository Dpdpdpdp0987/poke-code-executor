/**
 * Vercel Serverless API Route - Execution History
 * Moved to /api for proper Vercel routing
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getExecutionHistory } from '../src/lib/database';
import { checkRateLimit } from '../src/lib/rateLimit';
import { logger } from '../src/lib/logger';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                   (req.headers['x-real-ip'] as string) || 
                   'unknown';

  try {
    // Check rate limit
    const rateLimitResult = await checkRateLimit(clientIp);
    if (!rateLimitResult.allowed) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: rateLimitResult.retryAfter
      });
    }

    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const language = req.query.language as string | undefined;

    // Get execution history from database
    const result = await getExecutionHistory({
      page,
      limit,
      language: language as 'python' | 'javascript' | undefined
    });

    return res.status(200).json(result);

  } catch (error: any) {
    logger.error('History retrieval error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
