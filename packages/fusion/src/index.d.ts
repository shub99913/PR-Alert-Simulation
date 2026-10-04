/**
 * Signal from a detection source
 */
export interface FusionSignal {
    source: string;
    eventId: string;
    disasterType: string;
    severity: 'info' | 'warning' | 'alert' | 'emergency';
    confidence: number;
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    timestamp: Date;
    metadata: Record<string, any>;
}
/**
 * Fusion configuration
 */
export interface FusionConfig {
    weights: {
        rules: number;
        ml: number;
        crowd: number;
        social: number;
        operator: number;
    };
    minSignals: number;
    conflictResolution: 'highest_severity' | 'weighted_average' | 'democratic' | 'operator_override';
    thresholds: {
        info: number;
        warning: number;
        alert: number;
        emergency: number;
    };
    temporalWindowMs: number;
    consistencyRequired: boolean;
}
/**
 * Fusion result
 */
export interface FusionResult {
    eventId: string;
    fusedSeverity: 'info' | 'warning' | 'alert' | 'emergency';
    fusedConfidence: number;
    signals: FusionSignal[];
    contributingSources: string[];
    conflicts: ConflictInfo[];
    method: string;
    timestamp: Date;
}
/**
 * Conflict information
 */
export interface ConflictInfo {
    type: 'severity_mismatch' | 'location_mismatch' | 'type_mismatch' | 'time_mismatch';
    signals: FusionSignal[];
    resolution: string;
}
/**
 * Fusion Engine
 */
export declare class FusionEngine {
    private config;
    private signalBuffer;
    private logger;
    constructor(config?: Partial<FusionConfig>);
    /**
     * Add a signal to the buffer
     */
    addSignal(signal: FusionSignal): void;
    /**
     * Get signals for an event
     */
    getSignals(eventId: string): FusionSignal[];
    /**
     * Fuse signals into a unified assessment
     */
    fuse(signals: FusionSignal[]): Promise<FusionResult>;
    /**
     * Fuse signals for an event ID from buffer
     */
    fuseFromBuffer(eventId: string): Promise<FusionResult | null>;
    /**
     * Apply configured fusion method
     */
    private applyFusionMethod;
    /**
     * Weighted average fusion
     */
    private weightedAverageFusion;
    /**
     * Highest severity fusion
     */
    private highestSeverityFusion;
    /**
     * Democratic fusion (majority vote on severity)
     */
    private democraticFusion;
    /**
     * Operator override fusion
     */
    private operatorOverrideFusion;
    /**
     * Check temporal consistency
     */
    private checkTemporalConsistency;
    /**
     * Detect conflicts between signals
     */
    private detectConflicts;
    /**
     * Get signal key for buffering
     */
    private getSignalKey;
    /**
     * Clear buffer for event
     */
    clearBuffer(eventId: string): void;
    /**
     * Clear all buffers
     */
    clearAllBuffers(): void;
    /**
     * Get buffer stats
     */
    getBufferStats(): {
        totalEvents: number;
        totalSignals: number;
        avgSignalsPerEvent: number;
    };
    /**
     * Update config
     */
    updateConfig(config: Partial<FusionConfig>): void;
}
export declare const fusionEngine: FusionEngine;
export { FusionEngine, FusionConfig, FusionSignal, FusionResult, ConflictInfo };
//# sourceMappingURL=index.d.ts.map