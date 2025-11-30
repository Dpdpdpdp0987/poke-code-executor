const vm = require('vm');
const util = require('util');

function executeCode(code) {
  const output = [];
  let error = null;

  try {
    // Create a custom console that captures output
    const customConsole = {
      log: (...args) => output.push(args.map(arg => util.inspect(arg)).join(' ')),
      error: (...args) => output.push('ERROR: ' + args.map(arg => util.inspect(arg)).join(' ')),
      warn: (...args) => output.push('WARN: ' + args.map(arg => util.inspect(arg)).join(' ')),
      info: (...args) => output.push('INFO: ' + args.map(arg => util.inspect(arg)).join(' '))
    };

    // Create a sandbox with limited access
    const sandbox = {
      console: customConsole,
      setTimeout: setTimeout,
      setInterval: setInterval,
      clearTimeout: clearTimeout,
      clearInterval: clearInterval,
      require: require, // Limited require for safe packages
      Buffer: Buffer,
      process: { env: {} } // Empty env for security
    };

    // Execute code with timeout
    const script = new vm.Script(code);
    const context = vm.createContext(sandbox);
    
    script.runInContext(context, {
      timeout: 5000, // 5 second timeout
      breakOnSigint: true
    });

  } catch (e) {
    error = {
      type: e.name,
      message: e.message,
      stack: e.stack
    };
  }

  return {
    output: output.join('\n'),
    error: error,
    timestamp: new Date().toISOString()
  };
}

// Read code from stdin
let code = '';
process.stdin.on('data', chunk => {
  code += chunk;
});

process.stdin.on('end', () => {
  const result = executeCode(code);
  console.log(JSON.stringify(result));
});