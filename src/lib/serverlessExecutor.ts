/**
 * Serverless Code Executor using Piston API
 * This replaces Docker-based execution for Vercel compatibility
 */

interface PistonExecuteRequest {
  language: string;
  version: string;
  files: Array<{
    name?: string;
    content: string;
  }>;
  stdin?: string;
  args?: string[];
  compile_timeout?: number;
  run_timeout?: number;
  compile_memory_limit?: number;
  run_memory_limit?: number;
}

interface PistonExecuteResponse {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
  compile?: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
}

interface ExecutionResult {
  output: string;
  error: any;
  executionTime: number;
}

// Language mapping for Piston API
const LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
  python: { language: 'python', version: '3.10.0' },
  javascript: { language: 'javascript', version: '18.15.0' }
};

const PISTON_API_URL = process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston';
const MAX_OUTPUT_SIZE = 1024 * 1024; // 1MB
const EXECUTION_TIMEOUT = 30000; // 30 seconds

export async function executeCode(
  code: string,
  language: 'python' | 'javascript'
): Promise<ExecutionResult> {
  const startTime = Date.now();

  try {
    const languageConfig = LANGUAGE_MAP[language];
    if (!languageConfig) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const requestBody: PistonExecuteRequest = {
      language: languageConfig.language,
      version: languageConfig.version,
      files: [
        {
          content: code
        }
      ],
      stdin: '',
      args: [],
      compile_timeout: 10000, // 10 seconds compile timeout
      run_timeout: 30000, // 30 seconds run timeout
      run_memory_limit: 256 * 1024 * 1024 // 256MB
    };

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), EXECUTION_TIMEOUT);

    try {
      const response = await fetch(`${PISTON_API_URL}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Piston API error: ${response.status} ${response.statusText}`);
      }

      const result: PistonExecuteResponse = await response.json();
      const executionTime = Date.now() - startTime;

      // Combine stdout and stderr
      const output = result.run.stdout || '';
      const errorOutput = result.run.stderr || '';

      // Check if there was an execution error
      if (result.run.code !== 0 || errorOutput) {
        return {
          output: output.substring(0, MAX_OUTPUT_SIZE),
          error: {
            type: 'RuntimeError',
            message: errorOutput.substring(0, MAX_OUTPUT_SIZE),
            code: result.run.code
          },
          executionTime
        };
      }

      return {
        output: output.substring(0, MAX_OUTPUT_SIZE),
        error: null,
        executionTime
      };
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        return {
          output: '',
          error: {
            type: 'TimeoutError',
            message: `Execution exceeded ${EXECUTION_TIMEOUT / 1000} seconds timeout`
          },
          executionTime: Date.now() - startTime
        };
      }
      
      throw fetchError;
    }
  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    return {
      output: '',
      error: {
        type: 'ExecutionError',
        message: error.message || 'Unknown error occurred'
      },
      executionTime
    };
  }
}

/**
 * Get available runtimes from Piston API
 */
export async function getAvailableRuntimes() {
  try {
    const response = await fetch(`${PISTON_API_URL}/runtimes`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch runtimes: ${response.status}`);
    }
    
    return await response.json();
  } catch (error: any) {
    console.error('Error fetching runtimes:', error);
    return [];
  }
}
