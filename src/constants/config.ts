import { config } from 'dotenv'
import argv from 'minimist'

// Parse command-line arguments
const args = argv(process.argv.slice(2))
console.log(args)
export const isProduction = Boolean(args.env === 'production')

console.log(args.env, isProduction)
// Load the correct .env file
config({
  path: args.env ? `.env.${args.env}` : '.env'
})

// Helper to safely get env vars with fallback
const getEnvVar = (key: string, required = true): string => {
  const value = process.env[key]
  if (!value && required) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value || ''
}

// Export config object
export const getEnvConfig = () => ({
  PORT: parseInt(getEnvVar('PORT')),
  HOST: getEnvVar('HOST'),
  DB: {
    USERNAME: getEnvVar('DB_USERNAME'),
    PASSWORD: getEnvVar('DB_PASSWORD'),
    NAME: getEnvVar('DB_NAME'),
    USERS_COLLECTION: getEnvVar('DB_USERS_COLLECTION'),
    REFRESH_TOKEN_COLLECTION: getEnvVar('DB_REFRESH_TOKEN_COLLECTION'),
    FOLLOWERS_COLLECTION: getEnvVar('DB_FOLLOWERS_COLLECTION'),
    TWEETS_COLLECTION: getEnvVar('DB_TWEETS_COLLECTION'),
    HASHTAGS_COLLECTION: getEnvVar('DB_HASHTAGS_COLLECTION'),
    BOOKMARKS_COLLECTION: getEnvVar('DB_BOOKMARKS_COLLECTION'),
    LIKES_COLLECTION: getEnvVar('DB_LIKES_COLLECTION'),
    CONVERSATIONS_COLLECTION: getEnvVar('DB_CONVERSATIONS_COLLECTION')
  },
  GOOGLE: {
    CLIENT_ID: getEnvVar('GOOGLE_CLIENT_ID'),
    CLIENT_SECRET: getEnvVar('GOOGLE_CLIENT_SECRET'),
    REDIRECT_URI: getEnvVar('GOOGLE_REDIRECT_URI')
  },
  CLIENT_REDIRECT_URI: getEnvVar('CLIENT_REDIRECT_URI'),
  SECRETS: {
    PASSWORD: getEnvVar('PASSWORD_SECRET'),
    JWT_ACCESS: getEnvVar('JWT_SECRET_ACCESS_TOKEN'),
    JWT_REFRESH: getEnvVar('JWT_SECRET_REFRESH_TOKEN'),
    JWT_EMAIL_VERIFY: getEnvVar('JWT_SECRET_EMAIL_VERIFY_TOKEN'),
    JWT_FORGOT_PASSWORD: getEnvVar('JWT_SECRET_FORGOT_PASSWORD_TOKEN')
  },
  TOKEN_EXPIRES: {
    ACCESS: getEnvVar('ACCESS_TOKEN_EXPIRES_IN'),
    REFRESH: getEnvVar('REFRESH_TOKEN_EXPIRES_IN'),
    EMAIL_VERIFY: getEnvVar('EMAIL_VERIFY_TOKEN_EXIPIRES_IN'),
    FORGOT_PASSWORD: getEnvVar('FORGOT_PASSWORD_TOKEN_EXIPIRES_IN')
  }
})
