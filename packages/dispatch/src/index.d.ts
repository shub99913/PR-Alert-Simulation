import { DispatchRecord } from '@pr-alert/schemas';
import { Job } from 'bullmq';
/**
 * Dispatch configuration
 */
export interface DispatchConfig {
    redisUrl: string;
    concurrency: number;
    maxRetries: number;
    retryDelayMs: number;
    twilio: {
        accountSid: string;
        authToken: string;
        fromNumber: string;
    };
    sendgrid: {
        apiKey: string;
        fromEmail: string;
        fromName: string;
    };
    fcm: {
        projectId: string;
        serverKey: string;
    };
    whatsapp: {
        apiUrl: string;
        accessToken: string;
        phoneNumberId: string;
    };
    webhook: {
        defaultTimeoutMs: number;
        maxRetries: number;
    };
    rateLimits: Record<string, {
        max: number;
        windowMs: number;
    }>;
    simulate: boolean;
}
/**
 * Dispatch job data
 */
export interface DispatchJobData {
    alertId: string;
    channel: string;
    recipient: string;
    content: string;
    subject?: string;
    language: string;
    priority: 'low' | 'normal' | 'high' | 'critical';
    metadata?: Record<string, any>;
}
/**
 * Dispatch result
 */
export interface DispatchResult {
    success: boolean;
    dispatchRecord: Partial<any>;
    providerResponse?: any;
    error?: string;
}
/**
 * Dispatch Engine
 */
export declare class DispatchEngine {
    private config;
    private logger;
    private redis;
    private queue;
    private workers;
    private providers;
    private rateLimiters;
    private isRunning;
    constructor(config?: Partial<DispatchConfig>);
    /**
     * Initialize channel providers
     */
    private initProviders;
    /**
     * Initialize rate limiters
     */
    private initRateLimiters;
    /**
     * Start the dispatch engine
     */
    start(): Promise<void>;
    /**
     * Stop the dispatch engine
     */
    stop(): Promise<void>;
    /**
     * Process a dispatch job
     */
    processJob(job: Job<DispatchJobData>): Promise<DispatchResult>;
    /**
     * Dispatch an alert to all channels
     */
    dispatchAlert(alert: any, messages: any[]): Promise<DispatchRecord[]>;
    /**
     * Get recipients for a channel
     */
    private getRecipients;
    /**
     * Get job priority from severity
     */
    private getPriority;
    private getPriorityValue;
    /**
     * Simulate dispatch (for development)
     */
    private simulateDispatch;
    /**
     * Record metrics
     */
    private recordMetrics;
    /**
     * Get queue stats
     */
    getQueueStats(): Promise<Record<string, any>>;
    /**
     * Get dispatch history for alert
     */
    getDispatchHistory(alertId: string): Promise<any[]>;
    /**
     * Retry failed dispatches
     */
    retryFailed(alertId: string): Promise<number>;
}
/**
 * Channel Provider Interface
 */
interface ChannelProvider {
    send(params: {
        recipient: string;
        content: string;
        subject?: string;
        language: string;
    }): Promise<DispatchResult>;
}
export { DispatchEngine, DispatchConfig, DispatchJobData, DispatchResult, ChannelProvider };
//# sourceMappingURL=index.d.ts.map