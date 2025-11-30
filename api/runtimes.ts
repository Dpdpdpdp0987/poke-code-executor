/**
 * Vercel Serverless API Route - Available Runtimes
 * Returns information about supported languages and versions
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAvailableRuntimes } from '../src/lib/serverlessExecutor';
import { logger } from '../src/lib/logger';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const runtimes = await getAvailableRuntimes();
    
    // Filter to show only Python and JavaScript
    const supportedRuntimes = runtimes.filter((runtime: any) => 
      runtime.language === 'python' || runtime.language === 'javascript'
    );

    return res.status(200).json({
      success: true,
      runtimes: supportedRuntimes,
      count: supportedRuntimes.length
    });

  } catch (error: any) {
    logger.error('Runtimes retrieval error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
