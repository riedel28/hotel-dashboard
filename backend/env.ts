import { env as loadEnv } from 'custom-env';
import { z } from 'zod';

process.env.APP_STAGE = process.env.APP_STAGE || 'dev';

const isProduction = process.env.APP_STAGE === 'production';
const isDevelopment = process.env.APP_STAGE === 'dev';
const isTest = process.env.APP_STAGE === 'test';

// Load .env file
if (isDevelopment) {
  loadEnv();
} else if (isTest) {
  loadEnv('test');
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  APP_STAGE: z
    .enum(['development', 'production', 'testing'])
    .default('development'),
  PORT: z.coerce.number().positive().default(5001),
  DATABASE_URL: z.string().startsWith('postgresql://')
});

// Type for the validated environment
export type Env = z.infer<typeof envSchema>;

// Parse and validate environment variables
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

// Export the validated environment object
export { env, isProduction, isDevelopment, isTest };

// Default export for convenience
export default env;
