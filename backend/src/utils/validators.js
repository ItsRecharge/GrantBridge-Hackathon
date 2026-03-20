import Joi from 'joi';

export const authSchema = {
  signup: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'Password must be at least 8 characters',
      'any.required': 'Password is required',
    }),
    confirmPassword: Joi.string().required().messages({
      'any.required': 'Please confirm your password',
    }),
  }).custom((value, helpers) => {
    if (value.password !== value.confirmPassword) {
      return helpers.error('any.invalid');
    }
    return value;
  }).messages({
    'any.invalid': 'Passwords do not match',
  }),
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required',
    }),
  }),
};

export const profileSchema = {
  create: Joi.object({
    full_name: Joi.string(),
    age: Joi.number().integer().min(13).max(100).messages({
      'number.min': 'Age must be at least 13',
      'number.max': 'Age must be 100 or less',
      'number.base': 'Age must be a number',
    }),
    gender: Joi.string(),
    ethnicity: Joi.array().items(Joi.string()),
    citizenship_status: Joi.string(),
    gpa: Joi.number().min(0).precision(2).messages({
      'number.min': 'GPA cannot be negative',
    }),
    gpa_weighted: Joi.number().min(0).precision(2).messages({
      'number.min': 'Weighted GPA cannot be negative',
    }),
    gpa_unweighted: Joi.number().min(0).precision(2).messages({
      'number.min': 'Unweighted GPA cannot be negative',
    }),
    sat_score: Joi.number().integer().min(400).max(1600).messages({
      'number.min': 'SAT score must be at least 400',
      'number.max': 'SAT score must be at most 1600',
    }),
    act_score: Joi.number().integer().min(1).max(36).messages({
      'number.min': 'ACT score must be at least 1',
      'number.max': 'ACT score must be at most 36',
    }),
    major: Joi.string(),
    graduation_year: Joi.number().integer().min(2024).messages({
      'number.min': 'Graduation year must be 2024 or later',
    }),
    current_education_level: Joi.string(),
    high_school: Joi.string(),
    family_income: Joi.string(),
    household_size: Joi.number().integer().min(1).messages({
      'number.min': 'Household size must be at least 1',
    }),
    num_dependents: Joi.number().integer().min(0).messages({
      'number.min': 'Number of dependents cannot be negative',
    }),
    state: Joi.string(),
    city: Joi.string(),
    zip_code: Joi.string(),
    extracurriculars: Joi.array().items(Joi.string()),
    awards: Joi.array().items(Joi.string()),
    special_circumstances: Joi.object(),
    self_description: Joi.string().allow('').max(5000),
  }),
  update: Joi.object({
    full_name: Joi.string(),
    age: Joi.number().integer().min(13).max(100).messages({
      'number.min': 'Age must be at least 13',
      'number.max': 'Age must be 100 or less',
    }),
    gender: Joi.string(),
    ethnicity: Joi.array().items(Joi.string()),
    citizenship_status: Joi.string(),
    gpa: Joi.number().min(0).precision(2),
    gpa_weighted: Joi.number().min(0).precision(2),
    gpa_unweighted: Joi.number().min(0).precision(2),
    sat_score: Joi.number().integer().min(400).max(1600),
    act_score: Joi.number().integer().min(1).max(36),
    major: Joi.string(),
    graduation_year: Joi.number().integer().min(2024),
    current_education_level: Joi.string(),
    high_school: Joi.string(),
    family_income: Joi.string(),
    household_size: Joi.number().integer().min(1),
    num_dependents: Joi.number().integer().min(0),
    state: Joi.string(),
    city: Joi.string(),
    zip_code: Joi.string(),
    extracurriculars: Joi.array().items(Joi.string()),
    awards: Joi.array().items(Joi.string()),
    special_circumstances: Joi.object(),
    self_description: Joi.string().allow('').max(5000),
  }),
};

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.details.map((d) => ({
          field: d.path.join('.'),
          message: d.message,
        })),
      });
    }
    req.validatedBody = value;
    next();
  };
};
