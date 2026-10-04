"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = exports.features = exports.config = exports.EnvSchema = void 0;
const zod_1 = require("zod");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Environment schema
exports.EnvSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.coerce.number().default(3001),
    // Database
    MONGODB_URI: zod_1.z.string().url().default('mongodb://localhost:27017/pr-alert'),
    REDIS_URL: zod_1.z.string().url().default('redis://localhost:6379'),
    // External APIs
    USGS_EARTHQUAKE_URL: zod_1.z.string().url().default('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson'),
    GDACS_API_URL: zod_1.z.string().url().default('https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH'),
    FIRMS_API_URL: zod_1.z.string().url().default('https://firms.modaps.eosdis.nasa.gov/api/area/csv'),
    OPENWEATHER_API_KEY: zod_1.z.string().optional(),
    OPENWEATHER_API_URL: zod_1.z.string().url().default('https://api.openweathermap.org/data/2.5'),
    TWILIO_ACCOUNT_SID: zod_1.z.string().optional(),
    TWILIO_AUTH_TOKEN: zod_1.z.string().optional(),
    TWILIO_PHONE_NUMBER: zod_1.z.string().optional(),
    SENDGRID_API_KEY: zod_1.z.string().optional(),
    SENDGRID_FROM_EMAIL: zod_1.z.string().email().optional(),
    FCM_SERVER_KEY: zod_1.z.string().optional(),
    FCM_PROJECT_ID: zod_1.z.string().optional(),
    // ML Service
    ML_SERVICE_URL: zod_1.z.string().url().default('http://localhost:8000'),
    ML_SERVICE_API_KEY: zod_1.z.string().optional(),
    // Feature flags
    ENABLE_REAL_DISPATCH: zod_1.z.coerce.boolean().default(false),
    ENABLE_ML_INFERENCE: zod_1.z.coerce.boolean().default(false),
    ENABLE_CROWD_REPORTS: zod_1.z.coerce.boolean().default(true),
    // SACHET/CAP
    SACHET_API_URL: zod_1.z.string().url().optional(),
    SACHET_API_KEY: zod_1.z.string().optional(),
    CAP_SENDER_ID: zod_1.z.string().default('PR-ALERT'),
    // Rate limits
    RATE_LIMIT_WINDOW_MS: zod_1.z.coerce.number().default(60000),
    RATE_LIMIT_MAX_REQUESTS: zod_1.z.coerce.number().default(100),
});
// Load config from .env file
function loadConfig() {
    const envPath = path.resolve(process.cwd(), '.env');
    let envConfig = {};
    if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf-8');
        envConfig = Object.fromEntries(envFile
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'))
            .map(line => {
            const parts = line.split('=');
            const key = parts[0];
            if (!key)
                return ['', ''];
            const trimmedKey = key.trim();
            if (!trimmedKey)
                return ['', ''];
            const value = parts.slice(1).join('=');
            return [trimmedKey, value.trim()];
        }));
    }
    // Merge with process.env (process.env takes precedence)
    const merged = { ...envConfig, ...process.env };
    return exports.EnvSchema.parse(merged);
}
exports.config = loadConfig();
// Feature flags
exports.features = {
    realDispatch: exports.config.ENABLE_REAL_DISPATCH,
    mlInference: exports.config.ENABLE_ML_INFERENCE,
    crowdReports: exports.config.ENABLE_CROWD_REPORTS,
};
// Rate limiting config
exports.rateLimit = {
    windowMs: exports.config.RATE_LIMIT_WINDOW_MS,
    maxRequests: exports.config.RATE_LIMIT_MAX_REQUESTS,
};
//# sourceMappingURL=config.js.map