// tách cái message trả về cho người dùng ra để dễ bảo trì
export const usersMessage = {
  // User errors
  BIO_MUST_BE_STRING: 'Bio must be a string',
  REFRESH_TOKEN_SUCCESS: 'Refresh token success',
  BIO_LENGTH_MUST_BE_FROM_1_TO_1000: 'Bio length must be between 1 and 1000 characters',
  USERNAME_MUST_BE_STRING: 'Username must be a string',
  WEBSITE_MUST_BE_URL: 'Website must be a valid URL',
  USERNAME_LENGTH_MUST_BE_FROM_1_TO_100: 'Username length must be between 1 and 100 characters',
  USERNAME_ALREADY_EXISTS: 'Username already exists',
  AVATAR_MUST_BE_URL: 'Avatar must be a valid URL',
  COVER_PHOTO_MUST_BE_URL: 'Cover photo must be a valid URL',
  LOCATION_MUST_BE_STRING: 'Location must be a string',
  LOCATION_LENGTH_MUST_BE_FROM_1_TO_100: 'Location length must be between 1 and 100 characters',
  GET_USER_PROFILE_SUCCESS: 'Get user profile success',
  FOLLOW_USER_SUCCESS: 'Follow user success',
  INVALID_FOLLOWED_USER_ID: 'Invalid followed user id',
  FOLLOWED: 'Followed',
  INVALID_USER_ID: 'Invalid user id',
  UNFOLLOW_USER_SUCCESS: 'Unfollow user success',
  UNFOLLOWED: 'Unfollowed',
  USERNAME_MUST_BE_ALPHANUMERIC: 'Username must be alphanumeric and can contain underscores and dots only',
  CHANGE_PASSWORD_SUCCESS: 'Change password success',
  // User actions
  REGISTER_SUCCESS: 'Register success',
  LOGIN_SUCCESS: 'Login success',
  LOGOUT_SUCCESS: 'Logout success',
  RESET_PASSWORD_SUCCESS: 'Reset password success',
  RESEND_EMAIL_VERIFY_SUCCESS: 'Resend email verify success',
  GET_USER_INFO_SUCCESS: 'Get user info success',
  UPDATE_USER_INFO_SUCCESS: 'Update user info success',
  UPLOAD_VIDEO_SUCCESS: 'Upload video success',

  OLD_PASSWORD_IS_INCORRECT: 'Old password is incorrect',
  OLD_PASSWORD_MUST_BE_STRING: 'Old password must be a string',
  OLD_PASSWORD_IS_REQUIRED: 'Old password is required',

  // Forgot password flow
  CHECK_EMAIL_TO_RESET_PASSWORD: 'Check your email to reset password',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token is required',
  INVALID_FORGOT_PASSWORD_TOKEN: 'Invalid forgot password token',
  VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS: 'Verify forgot password token success',

  // Email verification flow
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token is required',
  EMAIL_VERIFY_SUCCESS: 'Email verify success',
  EMAIL_ALREADY_VERIFIED_BEFORE: 'Email already verified before',
  GMAIL_NOT_VERIFIED: 'Gmail not verified',
  UPLOAD_IMAGE_SUCCESS: 'Upload image success',

  // Token errors
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  USED_REFRESH_TOKEN_OR_NOT_EXIST: 'Used refresh token or not exist',
  TOKEN_EXPIRED: 'Token expired',

  // Authorization
  UNAUTHORIZED: 'Unauthorized',
  USER_NOT_VERIFIED: 'User not verified',
  // User existence
  EMAIL_DOES_NOT_EXIST: 'Email does not exist',
  USER_NOT_FOUND: 'User not found',
  USER_DOES_NOT_EXIST: 'Email does not exist or password is incorrect',
  EMAIL_ALREADY_EXISTS: 'Email already exists',

  // Validation
  VALIDATION_ERROR: 'Validation error',

  // Name validation
  NAME_IS_REQUIRED: 'Name is required',
  NAME_MUST_BE_STRING: 'Name must be a string',
  NAME_LENGTH_MUST_BE_FROM_1_TO_100: 'Name length must be between 1 and 100 characters',

  // Email validation
  EMAIL_IS_REQUIRED: 'Email is required',
  EMAIL_MUST_BE_VALID: 'Incorrect email format',

  // Password validation
  PASSWORD_IS_REQUIRED: 'Password is required',
  PASSWORD_MUST_BE_STRING: 'Password must be a string',
  PASSWORD_MUST_BE_STRONG:
    'Password must be at least 6 characters and must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 character',

  // Confirm password validation
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
  CONFIRM_PASSWORD_MUST_BE_STRING: 'Confirm password must be a string',
  CONFIRM_PASSWORD_LENGTH: 'Confirm password must be between 6 and 50 characters',
  CONFIRM_PASSWORD_MUST_BE_STRONG:
    'Confirm password must be at least 6 characters and must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 character',
  CONFIRM_PASSWORD_DOES_NOT_MATCH: 'Password confirmation does not match password',

  // Date of birth validation
  DATE_OF_BIRTH_MUST_BE_ISO8601: 'Date of birth is not in yyyy-mm-dd format'
} as const
