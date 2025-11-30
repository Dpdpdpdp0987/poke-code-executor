import { NextApiRequest, NextApiResponse } from 'next';
import { getExecutionHistory } from '../../lib/database';
import { rateLimit } from '../../lib/rateLimit';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(req);
    if (!rateLimitResult.success) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: rateLimitResult.retryAfter
      });
    }

    const { page = 1, limit = 10, language } = req.query;

    const history = await getExecutionHistory({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      language: language as string
    });

    return res.status(200).json({
      success: true,
      data: history.executions,
      pagination: {
        page: history.page,
        limit: history.limit,
        total: history.total,
        totalPages: Math.ceil(history.total / history.limit)
      }
    });

  } catch (error) {
    console.error('History fetch error:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}