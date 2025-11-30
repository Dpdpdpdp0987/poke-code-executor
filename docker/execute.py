#!/usr/bin/env python3
import sys
import io
import contextlib
import json
import traceback
from datetime import datetime

def execute_code(code):
    """Execute Python code in a controlled environment."""
    output = io.StringIO()
    error = None
    result = None
    
    try:
        # Capture stdout
        with contextlib.redirect_stdout(output):
            # Create restricted globals
            restricted_globals = {
                '__builtins__': __builtins__,
                'print': print,
            }
            
            # Execute the code
            exec(code, restricted_globals)
            result = output.getvalue()
            
    except Exception as e:
        error = {
            'type': type(e).__name__,
            'message': str(e),
            'traceback': traceback.format_exc()
        }
    
    return {
        'output': output.getvalue(),
        'error': error,
        'timestamp': datetime.utcnow().isoformat()
    }

if __name__ == '__main__':
    # Read code from stdin
    code = sys.stdin.read()
    
    # Execute and return results
    result = execute_code(code)
    print(json.dumps(result))