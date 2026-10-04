"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fusionEngine = exports.FusionEngine = void 0;
const core_1 = require("@pr-alert/core");
const logger = (0, core_1.createEngineLogger)('fusion');
/**
 * Fusion Engine
 */
class FusionEngine {
    config;
    signalBuffer = new Map();
    logger = (0, core_1.createEngineLogger)('fusion');
    constructor(config) {
        this.config = {
            weights: {
                rules: 0.35,
                ml: 0.25,
                crowd: 0.20,
                social: 0.10,
                operator: 0.10,
            },
            minSignals: 2,
            conflictResolution: 'weighted_average',
            thresholds: {
                info: 0.2,
                warning: 0.4,
                alert: 0.65,
                emergency: 0.85,
            },
            temporalWindowMs: 10 * 60 * 1000, // 10 minutes
            consistencyRequired: true,
            ...config,
        };
    }
    /**
     * Add a signal to the buffer
     */
    addSignal(signal) {
        const key = this.getSignalKey(signal);
        const signals = this.signalBuffer.get(key) || [];
        signals.push(signal);
        // Keep only recent signals within temporal window
        const cutoff = Date.now() - this.config.temporalWindowMs;
        const recent = signals.filter(s => s.timestamp.getTime() > cutoff);
        this.signalBuffer.set(key, recent);
    }
    /**
     * Get signals for an event
     */
    getSignals(eventId) {
        return this.signalBuffer.get(eventId) || [];
    }
    /**
     * Fuse signals into a unified assessment
     */
    async fuse(signals) {
        if (signals.length === 0) {
            throw new Error('No signals to fuse');
        }
        if (signals.length < this.config.minSignals) {
            logger.warn({ eventId: signals[0].eventId, count: signals.length }, 'Below minimum signal threshold');
        }
        // Check temporal consistency
        const consistent = this.checkTemporalConsistency(signals);
        if (!consistent && this.config.consistencyRequired) {
            logger.warn({ eventId: signals[0].eventId }, 'Temporal inconsistency detected');
        }
        // Detect conflicts
        const conflicts = this.detectConflicts(signals);
        // Apply fusion method
        const fused = await this.applyFusionMethod(signals, conflicts);
        const result = {
            eventId: signals[0].eventId,
            fusedSeverity: fused.severity,
            fusedConfidence: fused.confidence,
            signals,
            contributingSources: [...new Set(signals.map(s => s.source))],
            conflicts,
            method: this.config.conflictResolution,
            timestamp: new Date(),
        };
        logger.info({
            eventId: result.eventId,
            severity: result.fusedSeverity,
            confidence: result.fusedConfidence,
            sources: result.contributingSources,
            conflicts: conflicts.length,
        }, 'Fusion completed');
        return result;
    }
    /**
     * Fuse signals for an event ID from buffer
     */
    async fuseFromBuffer(eventId) {
        const signals = this.getSignals(eventId);
        if (signals.length === 0)
            return null;
        return this.fuse(signals);
    }
    /**
     * Apply configured fusion method
     */
    async applyFusionMethod(signals, conflicts) {
        switch (this.config.conflictResolution) {
            case 'weighted_average':
                return this.weightedAverageFusion(signals);
            case 'highest_severity':
                return this.highestSeverityFusion(signals);
            case 'democratic':
                return this.democraticFusion(signals);
            case 'operator_override':
                return this.operatorOverrideFusion(signals);
            default:
                return this.weightedAverageFusion(signals);
        }
    }
    /**
     * Weighted average fusion
     */
    weightedAverageFusion(signals) {
        let weightedSeveritySum = 0;
        let totalWeight = 0;
        let weightedConfidenceSum = 0;
        let totalConfWeight = 0;
        const severityValues = { info: 0, warning: 1, alert: 2, emergency: 3 };
        for (const signal of signals) {
            const weight = this.config.weights[signal.source] || 0.1;
            weightedSeveritySum += severityValues[signal.severity] * weight;
            totalWeight += weight;
            weightedConfidenceSum += signal.confidence * weight;
            totalConfWeight += weight;
        }
        const avgSeverityValue = totalWeight > 0 ? weightedSeveritySum / totalWeight : 0;
        const avgConfidence = totalConfWeight > 0 ? weightedConfidenceSum / totalConfWeight : 0;
        // Map back to severity
        const severityNames = ['info', 'warning', 'alert', 'emergency'];
        const severityIndex = Math.round(avgSeverityValue);
        const clampedIndex = Math.max(0, Math.min(3, severityIndex));
        return {
            severity: severityNames[clampedIndex],
            confidence: Math.min(1, Math.max(0, avgConfidence)),
        };
    }
    /**
     * Highest severity fusion
     */
    highestSeverityFusion(signals) {
        const severityOrder = { info: 0, warning: 1, alert: 2, emergency: 3 };
        let maxSeverity = 'info';
        let maxConfidence = 0;
        for (const signal of signals) {
            if (severityOrder[signal.severity] > severityOrder[maxSeverity]) {
                maxSeverity = signal.severity;
            }
            maxConfidence = Math.max(maxConfidence, signal.confidence);
        }
        // Confidence is the max of contributing signals
        return {
            severity: maxSeverity,
            confidence: maxConfidence,
        };
    }
    /**
     * Democratic fusion (majority vote on severity)
     */
    democraticFusion(signals) {
        const severityCounts = { info: 0, warning: 0, alert: 0, emergency: 0 };
        let totalConfidence = 0;
        for (const signal of signals) {
            severityCounts[signal.severity]++;
            totalConfidence += signal.confidence;
        }
        // Find majority
        let maxCount = 0;
        let majoritySeverity = 'info';
        for (const [sev, count] of Object.entries(severityCounts)) {
            if (count > maxCount) {
                maxCount = count;
                majoritySeverity = sev;
            }
        }
        return {
            severity: majoritySeverity,
            confidence: totalConfidence / signals.length,
        };
    }
    /**
     * Operator override fusion
     */
    operatorOverrideFusion(signals) {
        const operatorSignal = signals.find(s => s.source === 'operator');
        if (operatorSignal) {
            return {
                severity: operatorSignal.severity,
                confidence: operatorSignal.confidence,
            };
        }
        return this.weightedAverageFusion(signals);
    }
    /**
     * Check temporal consistency
     */
    checkTemporalConsistency(signals) {
        if (signals.length < 2)
            return true;
        const times = signals.map(s => s.timestamp.getTime());
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        const spread = maxTime - minTime;
        // All signals should be within temporal window
        return spread <= this.config.temporalWindowMs;
    }
    /**
     * Detect conflicts between signals
     */
    detectConflicts(signals) {
        const conflicts = [];
        // Severity mismatch
        const severities = [...new Set(signals.map(s => s.severity))];
        if (severities.length > 1) {
            const severityOrder = { info: 0, warning: 1, alert: 2, emergency: 3 };
            const maxSev = severities.reduce((a, b) => severityOrder[a] > severityOrder[b] ? a : b);
            const minSev = severities.reduce((a, b) => severityOrder[a] < severityOrder[b] ? a : b);
            if (severityOrder[maxSev] - severityOrder[minSev] >= 2) {
                conflicts.push({
                    type: 'severity_mismatch',
                    signals,
                    resolution: `Severity range: ${minSev} to ${maxSev}, using ${this.config.conflictResolution}`,
                });
            }
        }
        // Location mismatch (if signals have different locations)
        const locations = signals.map(s => s.location.coordinates);
        const uniqueLocations = [...new Set(locations.map(l => `${l[0]},${l[1]}`))];
        if (uniqueLocations.length > 1) {
            conflicts.push({
                type: 'location_mismatch',
                signals,
                resolution: `${uniqueLocations.length} different locations reported`,
            });
        }
        // Disaster type mismatch
        const types = [...new Set(signals.map(s => s.disasterType))];
        if (types.length > 1) {
            conflicts.push({
                type: 'type_mismatch',
                signals,
                resolution: `Types: ${types.join(', ')}`,
            });
        }
        return conflicts;
    }
    /**
     * Get signal key for buffering
     */
    getSignalKey(signal) {
        return signal.eventId;
    }
    /**
     * Clear buffer for event
     */
    clearBuffer(eventId) {
        this.signalBuffer.delete(eventId);
    }
    /**
     * Clear all buffers
     */
    clearAllBuffers() {
        this.signalBuffer.clear();
    }
    /**
     * Get buffer stats
     */
    getBufferStats() {
        let totalSignals = 0;
        for (const signals of this.signalBuffer.values()) {
            totalSignals += signals.length;
        }
        return {
            totalEvents: this.signalBuffer.size,
            totalSignals,
            avgSignalsPerEvent: this.signalBuffer.size > 0 ? totalSignals / this.signalBuffer.size : 0,
        };
    }
    /**
     * Update config
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
}
exports.FusionEngine = FusionEngine;
// Default instance
exports.fusionEngine = new FusionEngine();
//# sourceMappingURL=index.js.map