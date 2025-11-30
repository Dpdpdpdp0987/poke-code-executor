import { NextApiRequest, NextApiResponse } from 'next';
import { executeCode } from '../../lib/executor';
import { validateCode } from '../../lib/validation';
import { rateLimit } from '../../lib/rateLimit';
import { logExecution } from '../../lib/logger';
import { saveExecution } from '../../lib/database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
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

    // Extract and validate input
    const { code, language } = req.body;
    
    const validation = validateCode(code, language);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    // Execute the code
    const result = await executeCode(code, language);

    // Log execution
    await logExecution({
      language,
      codeLength: code.length,
      success: !result.error,
      executionTime: result.executionTime,
      ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress
    });

    // Save to database
    const executionId = await saveExecution({
      code,
      language,
      output: result.output,
      error: result.error,
      timestamp: new Date()
    });

    // Return result
    return res.status(200).json({
      success: true,
      executionId,
      output: result.output,
      error: result.error,
      executionTime: result.executionTime
    });

  } catch (error) {
    console.error('Execution error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}