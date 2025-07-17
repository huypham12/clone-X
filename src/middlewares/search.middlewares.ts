import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'

export const searchValidator = validate(
  checkSchema(
    {
      content: {
        isString: true,
        errorMessage: 'Content must be a string',
        optional: false
      },
      pf: {
        isString: true,
        errorMessage: 'People following must be a string',
        optional: true,
        isIn: {
          options: [['true', 'false']],
          errorMessage: 'People following must be either "true" or "false"'
        }
      },
      media_type: {
        isString: true,
        errorMessage: 'Media type must be a string',
        optional: true,
        isIn: {
          options: [['image', 'video', 'gif', 'all']],
          errorMessage: 'Invalid media type'
        }
      },
      limit: {
        isInt: true,
        toInt: true,
        errorMessage: 'Limit must be an integer',
        optional: true,
        customSanitizer: {
          options: (value) => (value ? Math.min(value, 100) : 10)
        }
      },
      page: {
        isInt: true,
        toInt: true,
        errorMessage: 'Page must be an integer',
        optional: true,
        customSanitizer: {
          options: (value) => (value ? Math.max(value, 1) : 1)
        }
      }
    },
    ['query']
  )
)
