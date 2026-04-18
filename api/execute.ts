/**
 * Vercel Serverless API Route - Code Execution
 * Moved to /api for proper Vercel routing
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v4 as uuidv4 } from 'uuid';
import { executeCode } from '../src/lib/serverlessExecutor';
import { validateCode } from '../src/lib/validation';
import { checkRateLimit } from '../src/lib/rateLimit';
import { saveExecution } from '../src/lib/database';
import { logger } from '../src/lib/logger';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
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

    // Validate request body
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        error: 'Missing required fields: code and language'
      });
    }

    if (!['python', 'javascript'].includes(language)) {
      return res.status(400).json({
        error: 'Unsupported language. Supported: python, javascript'
      });
    }

    // Validate code for security
    const validation = validateCode(code, language);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Code validation failed',
        details: validation.errors
      });
    }

    // Execute code using serverless executor
    const executionId = uuidv4();
    logger.info(`Executing code [${executionId}] - Language: ${language}, IP: ${clientIp}`);

    const result = await executeCode(code, language);

    // Save execution to database
    try {
      await saveExecution({
        id: executionId,
        code,
        language,
        output: result.output,
        error: result.error,
        execution_time: result.executionTime,
        ip_address: clientIp
      });
    } catch (dbError: any) {
      logger.error('Failed to save execution to database:', dbError);
      // Don't fail the request if database save fails
    }

    logger.info(`Execution completed [${executionId}] - Time: ${result.executionTime}ms`);

    // Return result
    return res.status(200).json({
      success: true,
      executionId,
      output: result.output,
      error: result.error,
      executionTime: result.executionTime
    });

  } catch (error: any) {
    logger.error('Execution error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
