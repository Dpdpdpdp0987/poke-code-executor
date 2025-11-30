import Joi from 'joi';

const DANGEROUS_PATTERNS = [
  /import\s+os/i,
  /import\s+subprocess/i,
  /eval\s*\(/i,
  /exec\s*\(/i,
  /__import__/i,
  /fs\.readFile/i,
  /fs\.writeFile/i,
  /child_process/i,
  /require\s*\(\s*['"]child_process['"]\s*\)/i
];

const MAX_CODE_LENGTH = 10000; // 10KB

const codeSchema = Joi.object({
  code: Joi.string().required().max(MAX_CODE_LENGTH),
  language: Joi.string().valid('python', 'javascript').required()
});

export function validateCode(
  code: string,
  language: string
): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];

  // Validate schema
  const { error } = codeSchema.validate({ code, language });
  if (error) {
    errors.push(...error.details.map(d => d.message));
  }

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(code)) {
      errors.push(`Code contains potentially dangerous pattern: ${pattern}`);
    }
  }

  // Check code length
  if (code.length > MAX_CODE_LENGTH) {
    errors.push(`Code exceeds maximum length of ${MAX_CODE_LENGTH} characters`);
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}