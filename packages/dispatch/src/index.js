"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DispatchEngine = void 0;
const core_1 = require("@pr-alert/core");
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const twilio_1 = __importDefault(require("twilio"));
const mail_1 = __importDefault(require("@sendgrid/mail"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const axios_1 = __importDefault(require("axios"));
const logger = (0, core_1.createEngineLogger)('dispatch');
/**
 * Dispatch Engine
 */
class DispatchEngine {
    config;
    logger = (0, core_1.createEngineLogger)('dispatch');
    redis;
    queue;
    workers = new Map();
    providers = new Map();
    rateLimiters = new Map();
    isRunning = false;
    constructor(config) {
        this.config = {
            redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
            concurrency: 10,
            maxRetries: 3,
            retryDelayMs: 5000,
            twilio: {
                accountSid: process.env.TWILIO_ACCOUNT_SID || '',
                authToken: process.env.TWILIO_AUTH_TOKEN || '',
                fromNumber: process.env.TWILIO_PHONE_NUMBER || '',
            },
            sendgrid: {
                apiKey: process.env.SENDGRID_API_KEY || '',
                fromEmail: process.env.SENDGRID_FROM_EMAIL || 'alerts@pr-alert.org',
                fromName: process.env.SENDGRID_FROM_NAME || 'PR-Alert System',
            },
            fcm: {
                projectId: process.env.FCM_PROJECT_ID || '',
                serverKey: process.env.FCM_SERVER_KEY || '',
            },
            whatsapp: {
                apiUrl: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0',
                accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
                phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
            },
            webhook: {
                defaultTimeoutMs: 10000,
                maxRetries: 3,
            },
            rateLimits: {
                sms: { max: 100, windowMs: 60000 },
                email: { max: 500, windowMs: 60000 },
                push: { max: 1000, windowMs: 60000 },
                whatsapp: { max: 50, windowMs: 60000 },
                webhook: { max: 200, windowMs: 60000 },
            },
            simulate: process.env.ENABLE_REAL_DISPATCH !== 'true',
        };
        // Initialize Redis
        this.redis = new ioredis_1.default(this.config.redisUrl, {
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => Math.min(times * 100, 3000),
        });
        // Initialize queue
        this.queue = new bullmq_1.Queue('dispatch', {
            connection: this.redis,
            defaultJobOptions: {
                attempts: this.config.maxRetries,
                backoff: {
                    type: 'exponential',
                    delay: this.config.retryDelayMs,
                },
                removeOnComplete: 100,
                removeOnFail: 50,
            },
        });
        // Initialize providers
        this.initProviders();
        // Initialize rate limiters
        this.initRateLimiters();
    }
    /**
     * Initialize channel providers
     */
    initProviders() {
        // Twilio SMS
        if (this.config.twilio.accountSid && this.config.twilio.authToken) {
            const twilioClient = (0, twilio_1.default)(this.config.twilio.accountSid, this.config.twilio.authToken);
            this.providers.set('sms', new TwilioProvider(twilioClient, this.config.twilio.fromNumber));
        }
        // SendGrid Email
        if (this.config.sendgrid.apiKey) {
            mail_1.default.setApiKey(this.config.sendgrid.apiKey);
            this.providers.set('email', new SendGridProvider(this.config.sendgrid));
        }
        // FCM Push
        if (this.config.fcm.projectId) {
            try {
                firebase_admin_1.default.initializeApp({
                    credential: firebase_admin_1.default.credential.applicationDefault(),
                    projectId: this.config.fcm.projectId,
                });
                this.providers.set('push', new FCMProvider());
            }
            catch (e) {
                // App might already be initialized
                this.providers.set('push', new FCMProvider());
            }
        }
        // WhatsApp
        if (this.config.whatsapp.accessToken) {
            this.providers.set('whatsapp', new WhatsAppProvider(this.config.whatsapp));
        }
        // Webhook
        this.providers.set('webhook', new WebhookProvider());
        // Siren (simulated)
        this.providers.set('siren', new SirenProvider());
        // Cell Broadcast (simulated)
        this.providers.set('cell_broadcast', new CellBroadcastProvider());
        // Operator Dashboard (WebSocket)
        this.providers.set('operator_dashboard', new OperatorDashboardProvider());
    }
    /**
     * Initialize rate limiters
     */
    initRateLimiters() {
        for (const [channel, limits] of Object.entries(this.config.rateLimits)) {
            this.rateLimiters.set(channel, new RateLimiter(limits.max, limits.windowMs));
        }
    }
    /**
     * Start the dispatch engine
     */
    async start() {
        if (this.isRunning)
            return;
        // Start queue workers for each channel
        const channels = ['sms', 'email', 'push', 'whatsapp', 'webhook', 'siren', 'cell_broadcast', 'operator_dashboard'];
        for (const channel of channels) {
            if (this.providers.has(channel)) {
                const worker = new bullmq_1.Worker(channel, this.processJob.bind(this), {
                    connection: this.redis,
                    concurrency: this.config.concurrency,
                });
                worker.on('completed', (job) => {
                    this.logger.debug({ jobId: job.id, channel }, 'Dispatch job completed');
                });
                worker.on('failed', (job, err) => {
                    this.logger.error({ jobId: job?.id, channel, err }, 'Dispatch job failed');
                });
                this.workers.set(channel, worker);
            }
        }
        this.isRunning = true;
        this.logger.info('Dispatch engine started');
    }
    /**
     * Stop the dispatch engine
     */
    async stop() {
        for (const [channel, worker] of this.workers) {
            await worker.close();
        }
        await this.queue.close();
        await this.redis.quit();
        this.isRunning = false;
        this.logger.info('Dispatch engine stopped');
    }
    /**
     * Process a dispatch job
     */
    async processJob(job) {
        const { alertId, channel, recipient, content, subject, language, priority, metadata } = job.data;
        const provider = this.providers.get(channel);
        if (!provider) {
            return {
                success: false,
                dispatchRecord: { channel, recipient, status: 'failed' },
                error: `No provider for channel: ${channel}`,
            };
        }
        // Check rate limit
        const rateLimiter = this.rateLimiters.get(channel);
        if (rateLimiter && !rateLimiter.tryConsume(1)) {
            // Re-queue with delay
            throw new Error(`Rate limit exceeded for ${channel}`);
        }
        const startTime = Date.now();
        let result;
        if (this.config.simulate) {
            result = await this.simulateDispatch(provider, {
                channel,
                recipient,
                content,
                subject,
                language: job.data.language,
            });
        }
        else {
            result = await provider.send({
                recipient: job.data.recipient,
                content: job.data.content,
                subject: job.data.subject,
                language: job.data.language,
            });
        }
        const duration = Date.now() - startTime;
        // Record metrics
        await this.recordMetrics(channel, result.success, duration);
        return result;
    }
    /**
     * Dispatch an alert to all channels
     */
    async dispatchAlert(alert, messages) {
        const dispatchRecords = [];
        for (const message of messages) {
            const channel = message.channel;
            const recipients = await this.getRecipients(alert, message.channel, message.lang);
            for (const recipient of recipients) {
                const jobData = {
                    alertId: alert._id,
                    channel,
                    recipient,
                    content: message.content,
                    subject: message.subject,
                    language: message.lang,
                    priority: this.getPriority(alert.severity),
                    metadata: {
                        messageId: message.templateId,
                        severity: alert.severity,
                        disasterType: alert.disasterType,
                    },
                };
                const job = await this.queue.add(channel, jobData, {
                    priority: this.getPriorityValue(alert.severity),
                });
                dispatchRecords.push({
                    channel,
                    recipient,
                    status: 'pending',
                    jobId: job.id,
                    sentAt: undefined,
                    deliveredAt: undefined,
                    error: undefined,
                    providerResponse: undefined,
                    retryCount: 0,
                });
            }
        }
        return dispatchRecords;
    }
    /**
     * Get recipients for a channel
     */
    async getRecipients(alert, channel, lang) {
        // In production, this would query the user database
        // For now, return mock recipients based on channel
        switch (channel) {
            case 'sms':
                return ['+91XXXXXXXXXX']; // Mock phone numbers
            case 'email':
                return ['user@example.com'];
            case 'push':
                return ['fcm_token_1', 'fcm_token_2'];
            case 'whatsapp':
                return ['+91XXXXXXXXXX'];
            case 'operator_dashboard':
                return ['operator_1', 'operator_2'];
            default:
                return [];
        }
    }
    /**
     * Get job priority from severity
     */
    getPriority(severity) {
        switch (severity) {
            case 'emergency': return 'critical';
            case 'alert': return 'high';
            case 'warning': return 'normal';
            default: return 'low';
        }
    }
    getPriorityValue(severity) {
        switch (severity) {
            case 'emergency': return 100;
            case 'alert': return 50;
            case 'warning': return 10;
            default: return 1;
        }
    }
    /**
     * Simulate dispatch (for development)
     */
    async simulateDispatch(provider, params) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
        const success = Math.random() > 0.02; // 98% success rate in simulation
        return {
            success,
            dispatchRecord: {
                status: success ? 'sent' : 'failed',
                sentAt: new Date().toISOString(),
            },
            providerResponse: { simulated: true, messageId: `sim_${Date.now()}` },
            error: success ? undefined : 'Simulated failure',
        };
    }
    /**
     * Record metrics
     */
    async recordMetrics(channel, success, durationMs) {
        const key = `metrics:dispatch:${channel}:${new Date().toISOString().split('T')[0]}`;
        await this.redis.hincrby(key, success ? 'success' : 'failed', 1);
        await this.redis.hincrbyfloat(key, 'totalDurationMs', duration);
        await this.redis.expire(key, 86400 * 7); // 7 days
    }
    /**
     * Get queue stats
     */
    async getQueueStats() {
        const stats = {};
        for (const [channel, worker] of this.workers) {
            const counts = await worker.getJobCounts();
            stats[channel] = counts;
        }
        return stats;
    }
    /**
     * Get dispatch history for alert
     */
    async getDispatchHistory(alertId) {
        // Would query database for dispatch records
        return [];
    }
    /**
     * Retry failed dispatches
     */
    async retryFailed(alertId) {
        // Implementation would query failed jobs and re-queue
        return 0;
    }
}
exports.DispatchEngine = DispatchEngine;
/**
 * Pause/resume channel
 async pauseChannel(channel: string): Promise<void> {
  const worker = this.workers.get(channel);
  if (worker) await worker.pause();
}

async resumeChannel(channel: string): Promise<void> {
  const worker = this.workers.get(channel);
  if (worker) await worker.resume();
}
}

/**
* Rate Limiter
*/
class RateLimiter {
    max;
    windowMs;
    requests = [];
    constructor(max, windowMs) {
        this.max = max;
        this.windowMs = windowMs;
    }
    tryConsume(tokens = 1) {
        const now = Date.now();
        const windowStart = now - this.windowMs;
        // Remove old requests
        this.requests = this.requests.filter(t => t > windowStart);
        if (this.requests.length + tokens <= this.max) {
            for (let i = 0; i < tokens; i++) {
                this.requests.push(Date.now());
            }
            return true;
        }
        return false;
    }
    getRemaining() {
        const now = Date.now();
        const windowStart = now - this.windowMs;
        this.requests = this.requests.filter(t => t > windowStart);
        return Math.max(0, this.max - this.requests.length);
    }
}
/**
 * Twilio SMS Provider
 */
class TwilioProvider {
    client;
    fromNumber;
    logger = (0, core_1.createEngineLogger)('provider:twilio');
    constructor(client, fromNumber) {
        this.client = client;
        this.fromNumber = fromNumber;
    }
    async send(params) {
        try {
            const message = await this.client.messages.create({
                body: params.content,
                from: this.fromNumber,
                to: params.recipient,
            });
            return {
                success: true,
                dispatchRecord: {
                    status: 'sent',
                    sentAt: new Date().toISOString(),
                },
                providerResponse: { messageId: message.sid, status: message.status },
            };
        }
        catch (error) {
            return {
                success: false,
                dispatchRecord: { status: 'failed' },
                error: error.message,
            };
        }
    }
}
/**
 * SendGrid Email Provider
 */
class SendGridProvider {
    config;
    logger = (0, core_1.createEngineLogger)('provider:sendgrid');
    constructor(config) {
        this.config = config;
    }
    async send(params) {
        try {
            const msg = {
                to: params.recipient,
                from: { email: this.config.fromEmail, name: this.config.fromName },
                subject: params.subject || 'PR-Alert Disaster Warning',
                text: params.content,
                html: params.content.replace(/\n/g, '<br>'),
            };
            await mail_1.default.send(msg);
            return {
                success: true,
                dispatchRecord: {
                    status: 'sent',
                    sentAt: new Date().toISOString(),
                },
                providerResponse: { messageId: 'sendgrid_sent' },
            };
        }
        catch (error) {
            return {
                success: false,
                dispatchRecord: { status: 'failed' },
                error: error.message,
            };
        }
    }
}
/**
 * FCM Push Provider
 */
class FCMProvider {
    logger = (0, core_1.createEngineLogger)('provider:fcm');
    async send(params) {
        try {
            const message = {
                token: params.recipient,
                notification: {
                    title: params.subject || 'PR-Alert',
                    body: params.content,
                },
                data: {
                    content: params.content,
                    language: params.language,
                },
                android: {
                    priority: 'high',
                    notification: {
                        channelId: 'disaster_alerts',
                        priority: 'high',
                        defaultSound: true,
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            alert: { title: params.subject, body: params.content },
                            sound: 'default',
                            badge: 1,
                        },
                    },
                },
            };
            const response = await firebase_admin_1.default.messaging().send(message);
            return {
                success: true,
                dispatchRecord: {
                    status: 'sent',
                    sentAt: new Date().toISOString(),
                },
                providerResponse: { messageId: response },
            };
        }
        catch (error) {
            return {
                success: false,
                dispatchRecord: { status: 'failed' },
                error: error.message,
            };
        }
    }
}
/**
 * WhatsApp Provider
 */
class WhatsAppProvider {
    config;
    httpClient;
    logger = (0, core_1.createEngineLogger)('provider:whatsapp');
    constructor(config) {
        this.config = config;
        this.httpClient = axios_1.default.create({
            baseURL: config.apiUrl,
            headers: {
                Authorization: `Bearer ${config.accessToken}`,
                'Content-Type': 'application/json',
            },
        });
    }
    async send(params) {
        try {
            const response = await this.httpClient.post(`/${this.config.phoneNumberId}/messages`, {
                messaging_product: 'whatsapp',
                to: params.recipient,
                type: 'text',
                text: { body: params.content },
            });
            return {
                success: true,
                dispatchRecord: { status: 'sent', sentAt: new Date().toISOString() },
                providerResponse: response.data,
            };
        }
        catch (error) {
            return {
                success: false,
                dispatchRecord: { status: 'failed' },
                error: error.response?.data?.error?.message || error.message,
            };
        }
    }
}
/**
 * Webhook Provider
 */
class WebhookProvider {
    logger = (0, core_1.createEngineLogger)('provider:webhook');
    async send(params) {
        try {
            const response = await axios_1.default.post(params.recipient, {
                content: params.content,
                subject: params.subject,
                language: params.language,
                timestamp: new Date().toISOString(),
            }, {
                timeout: 10000,
                headers: { 'Content-Type': 'application/json' },
            });
            return {
                success: true,
                dispatchRecord: { status: 'sent', sentAt: new Date().toISOString() },
                providerResponse: { status: response.status, statusText: response.statusText },
            };
        }
        catch (error) {
            return {
                success: false,
                dispatchRecord: { status: 'failed' },
                error: error.message,
            };
        }
    }
}
/**
 * Siren Provider (Simulated)
 */
class SirenProvider {
    logger = (0, core_1.createEngineLogger)('provider:siren');
    async send(params) {
        this.logger.info({ recipient: params.recipient }, 'SIREN ACTIVATED (simulated)');
        return {
            success: true,
            dispatchRecord: { status: 'sent', sentAt: new Date().toISOString() },
            providerResponse: { simulated: true, sirenId: params.recipient, pattern: 'wail' },
        };
    }
}
/**
 * Cell Broadcast Provider (Simulated - SACHET/C-DOT)
 */
class CellBroadcastProvider {
    logger = (0, core_1.createEngineLogger)('provider:cell_broadcast');
    async send(params) {
        this.logger.info({
            recipient: params.recipient,
            contentLength: params.content.length
        }, 'CELL BROADCAST SENT (simulated - requires SACHET/C-DOT authorization)');
        return {
            success: true,
            dispatchRecord: { status: 'sent', sentAt: new Date().toISOString() },
            providerResponse: {
                simulated: true,
                broadcastId: `cb_${Date.now()}`,
                note: 'Real Cell Broadcast requires SACHET/C-DOT authorization'
            },
        };
    }
}
/**
 * Operator Dashboard Provider (WebSocket)
 */
class OperatorDashboardProvider {
    logger = (0, core_1.createEngineLogger)('provider:operator_dashboard');
    async send(params) {
        // In production, this would emit via Socket.io to operator dashboards
        this.logger.debug({ operatorId: params.recipient }, 'Operator dashboard notification sent');
        return {
            success: true,
            dispatchRecord: { status: 'sent', sentAt: new Date().toISOString() },
            providerResponse: { delivered: true, operatorId: params.recipient },
        };
    }
}
//# sourceMappingURL=index.js.map