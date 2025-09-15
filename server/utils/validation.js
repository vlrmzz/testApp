const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('username')
    .isLength({ min: 3, max: 20 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-20 characters and contain only letters, numbers, and underscores'),
  body('first_name')
    .optional()
    .isLength({ max: 100 })
    .trim(),
  body('last_name')
    .optional()
    .isLength({ max: 100 })
    .trim()
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const habitValidation = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .trim()
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .trim(),
  body('frequency')
    .optional()
    .isIn(['daily', 'weekly'])
    .withMessage('Frequency must be either daily or weekly'),
  body('target_count')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Target count must be between 1 and 100'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex code')
];

const habitEntryValidation = [
  body('completed_count')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Completed count must be a positive integer'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .trim(),
  body('entry_date')
    .optional()
    .isISO8601()
    .withMessage('Entry date must be a valid date')
];

module.exports = {
  handleValidationErrors,
  registerValidation,
  loginValidation,
  habitValidation,
  habitEntryValidation
};