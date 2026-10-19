import { config } from 'dotenv';

// Neon CLI and many tools write secrets to .env.local; load before db initializes.
config({ path: '.env.local' });
config();
