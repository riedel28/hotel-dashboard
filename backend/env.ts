import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({
  path: '.env'
});

process.env.APP_STAGE = process.env.APP_STAGE || 'dev';

if (isDev()) {
  dotenv.config({
    path: '.env.dev'
  });
} else {
  dotenv.config({
    path: '.env.test'
  });
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  APP_STAGE: z
    .enum(['development', 'production', 'testing'])
    .default('development'),
  PORT: z.coerce.number().positive().default(5001),
  DATABASE_URL: z.string().startsWith('postgresql://')
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Invalid environment variables:');
    console.error(JSON.stringify(z.treeifyError(error), null, 2));

    error.issues.forEach((err) => {
      const path = err.path.join('.');
      console.log(`${path}: ${err.message}`);
    });

    process.exit(1);
  }

  throw error;
}

function isProd() {
  return env.APP_STAGE === 'production';
}
function isDev() {
  return env.APP_STAGE === 'development';
}
function isTest() {
  return env.APP_STAGE === 'testing';
}

export { env, isProd, isDev, isTest };
