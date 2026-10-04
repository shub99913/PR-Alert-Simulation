import { SourceType } from '@pr-alert/schemas';
import { AxiosInstance } from 'axios';
export interface RawEvent {
    sourceId: string;
    disasterType: string;
    rawData: any;
    fetchedAt: Date;
}
export interface AdapterConfig {
    name: SourceType;
    enabled: boolean;
    pollIntervalMs: number;
    timeoutMs: number;
    maxRetries: number;
    retryDelayMs: number;
}
export interface NormalizedEvent {
    source: SourceType;
    sourceId: string;
    disasterType: string;
    severity: 'info' | 'warning' | 'alert' | 'emergency';
    confidence: number;
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    area?: {
        type: 'Polygon';
        coordinates: number[][][];
    };
    properties: Record<string, any>;
    timestamp: Date;
    rawData: any;
}
export declare abstract class BaseAdapter {
    protected name: SourceType;
    protected config: AdapterConfig;
    protected httpClient: AxiosInstance;
    protected logger: import("pino").Logger<never, boolean>;
    private pollTimer?;
    private isRunning;
    constructor(adapterConfig: AdapterConfig);
    getName(): SourceType;
    getConfig(): AdapterConfig;
    isEnabled(): boolean;
    isRunning(): boolean;
    /**
     * Fetch raw events from the source
     */
    abstract fetchRawEvents(): Promise<RawEvent[]>;
    /**
     * Normalize raw event to standard format
     */
    abstract normalize(rawEvent: RawEvent): NormalizedEvent | NormalizedEvent[] | null;
    /**
     * Validate if the adapter can handle a given raw event
     */
    canHandle(rawData: any): boolean;
    /**
     * Start polling
     */
    startPolling(onEvents: (events: NormalizedEvent[]) => Promise<void>): void;
    /**
     * Stop polling
     */
    stopPolling(): void;
    /**
     * Fetch and process events with retry logic
     */
    private fetchAndProcess;
    /**
     * Sleep utility
     */
    private sleep;
    /**
     * Health check
     */
    healthCheck(): Promise<{
        healthy: boolean;
        details?: any;
    }>;
}
/**
 * USGS Earthquake Adapter
 */
export declare class USGSAdapter extends BaseAdapter {
    name: SourceType;
    constructor();
    fetchRawEvents(): Promise<RawEvent[]>;
    normalize(rawEvent: RawEvent): NormalizedEvent | null;
    /**
     * Calculate affected radius in km based on magnitude
     * Using empirical relationships (Wells & Coppersmith, 1994)
     */
    private calculateAffectedRadius;
}
/**
 * GDACS Adapter
 */
export declare class GDACSAdapter extends BaseAdapter {
    name: SourceType;
    constructor();
    fetchRawEvents(): Promise<RawEvent[]>;
    normalize(rawEvent: RawEvent): NormalizedEvent | null;
    private getFromDate;
    private getToDate;
}
/**
 * NASA FIRMS Fire Adapter
 */
export declare class FIRMSAdapter extends BaseAdapter {
    name: SourceType;
    constructor();
    fetchRawEvents(): Promise<RawEvent[]>;
    normalize(rawEvent: RawEvent): NormalizedEvent | null;
}
/**
 * OpenWeatherMap Adapter
 */
export declare class OpenWeatherAdapter extends BaseAdapter {
    name: SourceType;
    constructor();
    fetchRawEvents(): Promise<RawEvent[]>;
    normalize(rawEvent: RawEvent): NormalizedEvent | null;
}
/**
 * IMD (India Meteorological Department) Adapter
 */
export declare class IMDAdapter extends BaseAdapter {
    name: SourceType;
    constructor();
    fetchRawEvents(): Promise<RawEvent[]>;
    normalize(rawEvent: RawEvent): NormalizedEvent | null;
}
/**
 * Adapter Registry
 */
export declare class AdapterRegistry {
    private adapters;
    private logger;
    private eventCallback?;
    register(adapter: BaseAdapter): void;
    unregister(name: SourceType): void;
    get(name: SourceType): BaseAdapter | undefined;
    getAll(): BaseAdapter[];
    getEnabled(): BaseAdapter[];
    setEventCallback(callback: (events: any[]) => Promise<void>): void;
    startAll(): Promise<void>;
    stopAll(): Promise<void>;
    healthCheckAll(): Promise<Record<SourceType, {
        healthy: boolean;
        details?: any;
    }>>;
}
export declare function createDefaultAdapterRegistry(): AdapterRegistry;
export { BaseAdapter, AdapterConfig, RawEvent, NormalizedEvent, AdapterRegistry };
export { USGSAdapter, GDACSAdapter, FIRMSAdapter, OpenWeatherAdapter, IMDAdapter };
//# sourceMappingURL=index.d.ts.map