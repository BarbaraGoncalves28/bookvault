import 'dotenv/config';

function getRequiredEnv(key: string) {
  const value = process.env[key];

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}`,
    );
  }

  return value;
}

export const env = {
  nodeEnv:
    process.env.NODE_ENV ?? 'development',

  port:
    Number(process.env.PORT ?? 3333),

  databaseUrl:
    getRequiredEnv('DATABASE_URL'),

  jwtSecret:
    getRequiredEnv('JWT_SECRET'),

  jwtExpiresIn:
    process.env.JWT_EXPIRES_IN ?? '7d',

  corsOrigin:
    process.env.CORS_ORIGIN ??
    'http://localhost:8081',

  cookieName:
    'bookvault_token',

  cookieSecure:
    process.env.NODE_ENV === 'production',

  cloudinaryCloudName:
    getRequiredEnv(
      'CLOUDINARY_CLOUD_NAME',
    ),

  cloudinaryApiKey:
    getRequiredEnv(
      'CLOUDINARY_API_KEY',
    ),

  cloudinaryApiSecret:
    getRequiredEnv(
      'CLOUDINARY_API_SECRET',
    ),
} as const;