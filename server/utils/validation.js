const { z } = require('zod');

// Authentication Schemas
const loginSchema = z.object({
  email: z.string().email('Invalid institutional email format').toLowerCase().trim(),
  password: z.string().min(6, 'Access key must be at least 6 characters'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Full name required').trim(),
  email: z.string().email('Invalid institutional email format').toLowerCase().trim(),
  password: z.string().min(8, 'Access key must be at least 8 characters (high-entropy)'),
  role: z.enum(['STUDENT', 'FACULTY', 'HOD', 'ADMIN', 'DIRECTOR', 'CHAIRMAN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'FINANCE']).optional(),
});

const otpSchema = z.object({
  token: z.string().length(6, 'Temporal key must be exactly 6 digits').regex(/^\d+$/, 'Numeric input required'),
  userId: z.string().optional(),
  pendingAuthToken: z.string().optional(),
});

// Validation Middleware Helper
const validate = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse(req.body);
    req.body = validated; // Use cleaned data
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        code: 'VALIDATION_FAILED',
        msg: error.errors[0].message,
        details: error.errors,
        requestId: req.id
      });
    }
    next(error);
  }
};

module.exports = {
  loginSchema,
  registerSchema,
  otpSchema,
  validate
};
