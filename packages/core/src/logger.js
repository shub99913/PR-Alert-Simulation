"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogger = void 0;
exports.createEngineLogger = createEngineLogger;
exports.requestLogger = requestLogger;
exports.logError = logError;
exports.auditLog = auditLog;
const pino_1 = __importDefault(require("pino"));
const isDevelopment = process.env['NODE_ENV'] !== 'production';
const logger = (0, pino_1.default)({
    level: process.env['LOG_LEVEL'] || (isDevelopment ? 'debug' : 'info'),
    base: {
        service: 'pr-alert',
        pid: process.pid,
        hostname: process.env['HOSTNAME'] || 'localhost',
    },
    timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
    formatters: {
        level: (label) => ({ level: label.toUpperCase() }),
    },
    transport: isDevelopment
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
            },
        }
        : undefined,
});
// Child logger factory for engines
function createEngineLogger(engineName) {
    return logger.child({ engine: engineName });
}
// Request logger middleware
function requestLogger() {
    return (req, res, next) => {
        const start = Date.now();
        const requestId = req.headers['x-request-id'] || crypto.randomUUID();
        req.logger = logger.child({
            requestId,
            method: req.method,
            url: req.url,
            ip: req.ip,
        });
        res.on('finish', () => {
            const duration = Date.now() - start;
            req.logger.info({
                statusCode: res.statusCode,
                durationMs: duration,
                contentLength: res.get('content-length'),
            }, 'HTTP request completed');
        });
        next();
    };
}
// Structured error logging
function logError(logger, error, context) {
    logger.error({
        err: {
            message: error.message,
            stack: error.stack,
            name: error.name,
        },
        ...context,
    }, error.message);
}
// Audit logger for critical operations
exports.auditLogger = logger.child({ category: 'audit' });
function auditLog(action, details, userId) {
    exports.auditLogger.info({
        action,
        userId,
        ...details,
        timestamp: new Date().toISOString(),
    }, `AUDIT: ${action}`);
}
exports.default = logger;
//# sourceMappingURL=logger.js.map