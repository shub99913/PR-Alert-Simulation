"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdapterRegistry = exports.IMDAdapter = exports.OpenWeatherAdapter = exports.FIRMSAdapter = exports.GDACSAdapter = exports.USGSAdapter = exports.BaseAdapter = void 0;
exports.createDefaultAdapterRegistry = createDefaultAdapterRegistry;
const core_1 = require("@pr-alert/core");
const axios_1 = __importDefault(require("axios"));
class BaseAdapter {
    name;
    config;
    httpClient;
    logger = (0, core_1.createEngineLogger)(`adapter:${this.name}`);
    pollTimer;
    isRunning = false;
    constructor(adapterConfig) {
        this.config = adapterConfig;
        this.httpClient = axios_1.default.create({
            timeout: this.config.timeoutMs,
            headers: {
                'User-Agent': 'PR-Alert/1.0 (+https://pr-alert.org)',
            },
        });
        // Request interceptor for logging
        this.httpClient.interceptors.request.use((config) => {
            this.logger.debug({ url: config.url, method: config.method }, 'Outgoing request');
            return config;
        });
        // Response interceptor for error handling
        this.httpClient.interceptors.response.use((response) => response, (error) => {
            this.logger.warn({
                url: error.config?.url,
                status: error.response?.status,
                message: error.message
            }, 'Request failed');
            return Promise.reject(error);
        });
    }
    getName() {
        return this.name;
    }
    getConfig() {
        return { ...this.config };
    }
    isEnabled() {
        return this.config.enabled;
    }
    isRunning() {
        return this.isRunning;
    }
    /**
     * Validate if the adapter can handle a given raw event
     */
    canHandle(rawData) {
        return true;
    }
    /**
     * Start polling
     */
    startPolling(onEvents) {
        if (this.isRunning) {
            this.logger.warn('Adapter already running');
            return;
        }
        if (!this.config.enabled) {
            this.logger.info('Adapter disabled, not starting');
            return;
        }
        this.isRunning = true;
        this.logger.info(`Starting polling every ${this.config.pollIntervalMs}ms`);
        // Initial fetch
        this.fetchAndProcess(onEvents).catch(err => this.logger.error({ err }, 'Initial fetch failed'));
        // Set up interval
        this.pollTimer = setInterval(() => {
            this.fetchAndProcess(onEvents).catch(err => this.logger.error({ err }, 'Polling fetch failed'));
        }, this.config.pollIntervalMs);
    }
    /**
     * Stop polling
     */
    stopPolling() {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = undefined;
        }
        this.isRunning = false;
        this.logger.info('Stopped polling');
    }
    /**
     * Fetch and process events with retry logic
     */
    async fetchAndProcess(onEvents) {
        let lastError = null;
        for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
            try {
                const rawEvents = await this.fetchRawEvents();
                if (rawEvents.length === 0) {
                    this.logger.debug('No events returned from source');
                    return;
                }
                const normalizedEvents = [];
                for (const rawEvent of rawEvents) {
                    try {
                        const normalized = this.normalize(rawEvent);
                        if (normalized) {
                            if (Array.isArray(normalized)) {
                                normalizedEvents.push(...normalized);
                            }
                            else {
                                normalizedEvents.push(normalized);
                            }
                        }
                    }
                    catch (err) {
                        this.logger.warn({ err, rawEvent }, 'Failed to normalize event');
                    }
                }
                if (normalizedEvents.length > 0) {
                    this.logger.info({ count: normalizedEvents.length }, 'Normalized events ready');
                    await onEvents(normalizedEvents);
                }
                return; // Success
            }
            catch (error) {
                lastError = error;
                this.logger.warn({ attempt, maxRetries: this.config.maxRetries, error: error.message }, 'Fetch attempt failed');
                if (attempt < this.config.maxRetries) {
                    await this.sleep(this.config.retryDelayMs * attempt);
                }
            }
        }
        this.logger.error({ err: lastError, maxRetries: this.config.maxRetries }, 'All retry attempts failed');
        throw lastError;
    }
    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Health check
     */
    async healthCheck() {
        try {
            const events = await this.fetchRawEvents();
            return { healthy: true, details: { lastEventCount: events.length } };
        }
        catch (error) {
            return { healthy: false, details: { error: error.message } };
        }
    }
}
exports.BaseAdapter = BaseAdapter;
/**
 * USGS Earthquake Adapter
 */
class USGSAdapter extends BaseAdapter {
    name = 'usgs';
    constructor() {
        super({
            name: 'usgs',
            enabled: true,
            pollIntervalMs: 5 * 60 * 1000, // 5 minutes
            timeoutMs: 30000,
            maxRetries: 3,
            retryDelayMs: 5000,
        });
    }
    async fetchRawEvents() {
        const url = core_1.config.USGS_EARTHQUAKE_URL;
        this.logger.debug({ url }, 'Fetching USGS earthquake data');
        const response = await this.httpClient.get(url, {
            headers: { Accept: 'application/json' },
        });
        if (!response.data.features) {
            throw new Error('Invalid USGS response: missing features');
        }
        return response.data.features.map((feature) => ({
            sourceId: feature.id,
            disasterType: 'earthquake',
            rawData: feature,
            fetchedAt: new Date(),
        }));
    }
    normalize(rawEvent) {
        const feature = rawEvent.rawData;
        const props = feature.properties;
        const coords = feature.geometry.coordinates;
        if (!coords || coords.length < 2) {
            this.logger.warn({ id: feature.id }, 'Missing coordinates');
            return null;
        }
        const [lon, lat, depth] = coords;
        const magnitude = props.mag ?? 0;
        const time = props.time ? new Date(props.time) : new Date();
        // Determine severity based on magnitude
        let severity = 'info';
        if (magnitude >= 7.0)
            severity = 'emergency';
        else if (magnitude >= 6.0)
            severity = 'alert';
        else if (magnitude >= 5.0)
            severity = 'warning';
        else if (magnitude >= 4.0)
            severity = 'info';
        // Confidence based on data quality
        let confidence = 0.9;
        if (props.status === 'reviewed')
            confidence = 0.95;
        else if (props.status === 'automatic')
            confidence = 0.8;
        // Reduce confidence for low-quality data
        if (props.gap && props.gap > 180)
            confidence -= 0.1;
        if (props.rms && props.rms > 1.0)
            confidence -= 0.1;
        if (props.nst && props.nst < 6)
            confidence -= 0.1;
        confidence = Math.max(0.3, Math.min(1.0, confidence));
        // Calculate affected radius based on magnitude (km)
        const affectedRadiusKm = this.calculateAffectedRadius(magnitude);
        return {
            source: 'usgs',
            sourceId: feature.id,
            disasterType: 'earthquake',
            severity,
            confidence,
            location: { type: 'Point', coordinates: [lon, lat] },
            properties: {
                magnitude,
                depth: depth ?? null,
                place: props.place,
                type: props.type,
                status: props.status,
                nst: props.nst,
                gap: props.gap,
                rms: props.rms,
                net: props.net,
                id: props.ids?.split(',')[0] || feature.id,
                affectedRadiusKm,
                mmi: props.mmi,
                cdi: props.cdi,
                alert: props.alert,
                tsunami: props.tsunami ?? 0,
            },
            timestamp: time,
            rawData: feature,
        };
    }
    /**
     * Calculate affected radius in km based on magnitude
     * Using empirical relationships (Wells & Coppersmith, 1994)
     */
    calculateAffectedRadius(magnitude) {
        if (magnitude < 4.0)
            return 10;
        if (magnitude < 5.0)
            return 20;
        if (magnitude < 6.0)
            return 50;
        if (magnitude < 7.0)
            return 100;
        if (magnitude < 8.0)
            return 200;
        return 300;
    }
}
exports.USGSAdapter = USGSAdapter;
/**
 * GDACS Adapter
 */
class GDACSAdapter extends BaseAdapter {
    name = 'gdacs';
    constructor() {
        super({
            name: 'gdacs',
            enabled: true,
            pollIntervalMs: 15 * 60 * 1000, // 15 minutes
            timeoutMs: 30000,
            maxRetries: 3,
            retryDelayMs: 10000,
        });
    }
    async fetchRawEvents() {
        const url = `${core_1.config.GDACS_API_URL}?fromdate=${this.getFromDate()}&todate=${this.getToDate()}`;
        this.logger.debug({ url }, 'Fetching GDACS events');
        try {
            const response = await this.httpClient.get(url, {
                headers: { Accept: 'application/json' },
            });
            // GDACS returns XML, parse it
            // This is a simplified version - real implementation would use xml2js
            return [];
        }
        catch (error) {
            this.logger.warn({ error: error.message }, 'GDACS fetch failed');
            return [];
        }
    }
    normalize(rawEvent) {
        // Implement GDACS-specific normalization
        return null;
    }
    getFromDate() {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        return date.toISOString().split('T')[0];
    }
    getToDate() {
        return new Date().toISOString().split('T')[0];
    }
}
exports.GDACSAdapter = GDACSAdapter;
/**
 * NASA FIRMS Fire Adapter
 */
class FIRMSAdapter extends BaseAdapter {
    name = 'firms';
    constructor() {
        super({
            name: 'firms',
            enabled: true,
            pollIntervalMs: 60 * 60 * 1000, // 1 hour
            timeoutMs: 60000,
            maxRetries: 2,
            retryDelayMs: 30000,
        });
    }
    async fetchRawEvents() {
        // FIRMS provides CSV data
        // This is a placeholder - real implementation would parse CSV
        this.logger.debug('FIRMS adapter not fully implemented');
        return [];
    }
    normalize(rawEvent) {
        return null;
    }
}
exports.FIRMSAdapter = FIRMSAdapter;
/**
 * OpenWeatherMap Adapter
 */
class OpenWeatherAdapter extends BaseAdapter {
    name = 'openweather';
    constructor() {
        super({
            name: 'openweather',
            enabled: !!core_1.config.OPENWEATHER_API_KEY,
            pollIntervalMs: 10 * 60 * 1000, // 10 minutes
            timeoutMs: 20000,
            maxRetries: 3,
            retryDelayMs: 10000,
        });
    }
    async fetchRawEvents() {
        if (!core_1.config.OPENWEATHER_API_KEY) {
            this.logger.warn('OpenWeather API key not configured');
            return [];
        }
        // Would fetch weather alerts for India region
        // This is a placeholder
        return [];
    }
    normalize(rawEvent) {
        return null;
    }
}
exports.OpenWeatherAdapter = OpenWeatherAdapter;
/**
 * IMD (India Meteorological Department) Adapter
 */
class IMDAdapter extends BaseAdapter {
    name = 'imd';
    constructor() {
        super({
            name: 'imd',
            enabled: false, // Requires API access
            pollIntervalMs: 10 * 60 * 1000,
            timeoutMs: 30000,
            maxRetries: 3,
            retryDelayMs: 10000,
        });
    }
    async fetchRawEvents() {
        // IMD weather alerts and cyclone warnings
        // Requires official API access
        return [];
    }
    normalize(rawEvent) {
        return null;
    }
}
exports.IMDAdapter = IMDAdapter;
/**
 * Adapter Registry
 */
class AdapterRegistry {
    adapters = new Map();
    logger = (0, core_1.createEngineLogger)('adapter-registry');
    eventCallback;
    register(adapter) {
        if (this.adapters.has(adapter.getName())) {
            this.logger.warn({ name: adapter.getName() }, 'Adapter already registered, replacing');
        }
        this.adapters.set(adapter.getName(), adapter);
        this.logger.info({ name: adapter.getName() }, 'Adapter registered');
    }
    unregister(name) {
        const adapter = this.adapters.get(name);
        if (adapter) {
            adapter.stopPolling();
            this.adapters.delete(name);
            this.logger.info({ name }, 'Adapter unregistered');
        }
    }
    get(name) {
        return this.adapters.get(name);
    }
    getAll() {
        return Array.from(this.adapters.values());
    }
    getEnabled() {
        return this.getAll().filter(a => a.isEnabled());
    }
    setEventCallback(callback) {
        this.eventCallback = callback;
    }
    async startAll() {
        if (!this.eventCallback) {
            throw new Error('Event callback not set');
        }
        for (const adapter of this.getEnabled()) {
            try {
                adapter.startPolling(this.eventCallback);
                this.logger.info({ name: adapter.getName() }, 'Adapter started');
            }
            catch (error) {
                this.logger.error({ err: error, name: adapter.getName() }, 'Failed to start adapter');
            }
        }
    }
    async stopAll() {
        for (const adapter of this.getAll()) {
            adapter.stopPolling();
        }
        this.logger.info('All adapters stopped');
    }
    async healthCheckAll() {
        const results = {};
        for (const [name, adapter] of this.adapters) {
            results[name] = await adapter.healthCheck();
        }
        return results;
    }
}
exports.AdapterRegistry = AdapterRegistry;
// Factory function to create default registry
function createDefaultAdapterRegistry() {
    const registry = new AdapterRegistry();
    registry.register(new USGSAdapter());
    registry.register(new GDACSAdapter());
    registry.register(new FIRMSAdapter());
    registry.register(new OpenWeatherAdapter());
    registry.register(new IMDAdapter());
    return registry;
}
//# sourceMappingURL=index.js.map