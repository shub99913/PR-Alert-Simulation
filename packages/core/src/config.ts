import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

// Environment schema
export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  
  // Database
  MONGODB_URI: z.string().url().default('mongodb://localhost:27017/pr-alert'),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  
  // External APIs
  USGS_EARTHQUAKE_URL: z.string().url().default('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson'),
  GDACS_API_URL: z.string().url().default('https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH'),
  FIRMS_API_URL: z.string().url().default('https://firms.modaps.eosdis.nasa.gov/api/area/csv'),
  OPENWEATHER_API_KEY: z.string().optional(),
  OPENWEATHER_API_URL: z.string().url().default('https://api.openweathermap.org/data/2.5'),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM_EMAIL: z.string().email().optional(),
  FCM_SERVER_KEY: z.string().optional(),
  FCM_PROJECT_ID: z.string().optional(),
  
  // ML Service
  ML_SERVICE_URL: z.string().url().default('http://localhost:8000'),
  ML_SERVICE_API_KEY: z.string().optional(),
  
  // Feature flags
  ENABLE_REAL_DISPATCH: z.coerce.boolean().default(false),
  ENABLE_ML_INFERENCE: z.coerce.boolean().default(false),
  ENABLE_CROWD_REPORTS: z.coerce.boolean().default(true),
  
  // SACHET/CAP
  SACHET_API_URL: z.string().url().optional(),
  SACHET_API_KEY: z.string().optional(),
  CAP_SENDER_ID: z.string().default('PR-ALERT'),
  
  // Rate limits
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
});

// Load config from .env file
function loadConfig(): z.infer<typeof EnvSchema> {
  const envPath = path.resolve(process.cwd(), '.env');
  let envConfig: Record<string, string> = {};
  
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    envConfig = Object.fromEntries(
      envFile
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'))
        .map(line => {
          const parts = line.split('=');
          const key = parts[0];
          if (!key) return ['', ''];
          const trimmedKey = key.trim();
          if (!trimmedKey) return ['', ''];
          const value = parts.slice(1).join('=');
          return [trimmedKey, value.trim()];
        })
    );
  }
  
  // Merge with process.env (process.env takes precedence)
  const merged: Record<string, string | undefined> = { ...envConfig, ...process.env };
  
  return EnvSchema.parse(merged);
}

export const config = loadConfig();
export type Config = z.infer<typeof EnvSchema>;

// Feature flags
export const features = {
  realDispatch: config.ENABLE_REAL_DISPATCH,
  mlInference: config.ENABLE_ML_INFERENCE,
  crowdReports: config.ENABLE_CROWD_REPORTS,
} as const;

// Rate limiting config
export const rateLimit = {
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  maxRequests: config.RATE_LIMIT_MAX_REQUESTS,
};