// tách cái message trả về cho người dùng ra để dễ bảo trì
export const usersMessage = {
  REGISTER_SUCCESS: 'Register success',
  LOGIN_SUCCESS: 'Login success',
  LOGOUT_SUCCESS: 'Logout success',
  RESEND_EMAIL_VERIFY_SUCCESS: 'Resend email verify success',
  EMAIL_DOES_NOT_EXIST: 'Email does not exist',
  CHECK_EMAIL_TO_RESET_PASSWORD: 'Check your email to reset password',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token is required',
  INVALID_FORGOT_PASSWORD_TOKEN: 'Invalid forgot password token',
  VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS: 'Verify forgot password token success',

  VALIDATION_ERROR: 'Validation error',
  UNAUTHORIZED: 'Unauthorized',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token is required',
  USED_REFRESH_TOKEN_OR_NOT_EXIST: 'Used refresh token or not exist',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_VERIFIED_BEFORE: 'Email already verified before',
  EMAIL_VERIFY_SUCCESS: 'Email verify success',

  // Name
  NAME_IS_REQUIRED: 'Name is required',
  NAME_MUST_BE_STRING: 'Name must be a string',
  NAME_LENGTH_MUST_BE_FROM_1_TO_100: 'Name length must be between 1 and 100 characters',

  // Email
  EMAIL_IS_REQUIRED: 'Email is required',
  EMAIL_MUST_BE_VALID: 'Incorrect email format',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  USER_DOES_NOT_EXIST: 'Email does not exist or password is incorrect',

  // Password
  PASSWORD_IS_REQUIRED: 'Password is required',
  PASSWORD_MUST_BE_STRING: 'Password must be a string',
  PASSWORD_MUST_BE_STRONG:
    'Password must be at least 6 characters and must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 character',

  // Confirm password
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
  CONFIRM_PASSWORD_MUST_BE_STRING: 'Confirm password must be a string',
  CONFIRM_PASSWORD_LENGTH: 'Confirm password must be between 6 and 50 characters',
  CONFIRM_PASSWORD_MUST_BE_STRONG:
    'Confirm password must be at least 6 characters and must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 character',
  CONFIRM_PASSWORD_DOES_NOT_MATCH: 'Password confirmation does not match password',

  // Date of birth
  DATE_OF_BIRTH_MUST_BE_ISO8601: 'Date of birth is not in yyyy-mm-dd format'
} as const
