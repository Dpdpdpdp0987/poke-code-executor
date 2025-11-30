import Docker from 'dockerode';
import { v4 as uuidv4 } from 'uuid';

const docker = new Docker();

const IMAGE_MAP = {
  python: 'poke-executor-python',
  javascript: 'poke-executor-node'
};

const MAX_EXECUTION_TIME = 30000; // 30 seconds
const MAX_OUTPUT_SIZE = 1024 * 1024; // 1MB

interface ExecutionResult {
  output: string;
  error: any;
  executionTime: number;
}

export async function executeCode(
  code: string,
  language: 'python' | 'javascript'
): Promise<ExecutionResult> {
  const startTime = Date.now();
  const containerId = uuidv4();

  try {
    // Get the appropriate Docker image
    const imageName = IMAGE_MAP[language];
    if (!imageName) {
      throw new Error(`Unsupported language: ${language}`);
    }

    // Create container with resource limits
    const container = await docker.createContainer({
      Image: imageName,
      name: `executor-${containerId}`,
      HostConfig: {
        Memory: 256 * 1024 * 1024, // 256MB
        MemorySwap: 256 * 1024 * 1024,
        CpuQuota: 50000, // 50% CPU
        NetworkMode: 'none', // No network access
        AutoRemove: true,
        ReadonlyRootfs: true,
        SecurityOpt: ['no-new-privileges']
      },
      Tty: false,
      OpenStdin: true,
      StdinOnce: true
    });

    // Start the container
    await container.start();

    // Attach to container and send code
    const stream = await container.attach({
      stream: true,
      stdin: true,
      stdout: true,
      stderr: true
    });

    // Write code to stdin
    stream.write(code);
    stream.end();

    // Set execution timeout
    const timeout = setTimeout(async () => {
      try {
        await container.kill();
      } catch (e) {
        // Container might already be stopped
      }
    }, MAX_EXECUTION_TIME);

    // Wait for container to finish
    const exitCode = await container.wait();
    clearTimeout(timeout);

    // Get output
    const logs = await container.logs({
      stdout: true,
      stderr: true,
      tail: 1000
    });

    const output = logs.toString('utf8').substring(0, MAX_OUTPUT_SIZE);
    const executionTime = Date.now() - startTime;

    // Parse the output (expecting JSON from execute scripts)
    try {
      const result = JSON.parse(output);
      return {
        output: result.output || '',
        error: result.error || null,
        executionTime
      };
    } catch (e) {
      return {
        output,
        error: null,
        executionTime
      };
    }

  } catch (error) {
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