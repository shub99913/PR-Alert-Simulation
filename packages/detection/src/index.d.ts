import { DisasterType } from '@pr-alert/schemas';
import { JsonLogicRules } from 'json-logic-js';
/**
 * Rule definition schema
 */
export interface DetectionRule {
    id: string;
    name: string;
    description: string;
    disasterType: DisasterType | '*';
    enabled: boolean;
    priority: number;
    condition: JsonLogicRules;
    severity: 'info' | 'warning' | 'alert' | 'emergency';
    confidence: number;
    cooldownMs: number;
    tags: string[];
}
/**
 * Rule match result
 */
export interface RuleMatch {
    ruleId: string;
    ruleName: string;
    matched: boolean;
    severity: 'info' | 'warning' | 'alert' | 'emergency';
    confidence: number;
    matchedData: Record<string, any>;
    timestamp: Date;
}
/**
 * Detection result
 */
export interface DetectionResult {
    eventId: string;
    matches: RuleMatch[];
    triggered: boolean;
    maxSeverity: 'info' | 'warning' | 'alert' | 'emergency';
    maxConfidence: number;
    triggeredRules: string[];
    recommendedAction: 'none' | 'monitor' | 'issue_alert' | 'immediate_alert';
}
/**
 * Rule engine
 */
export declare class RuleEngine {
    private rules;
    private lastTriggered;
    private logger;
    constructor();
    /**
     * Remove a rule
     */
    removeRule(ruleId: string): boolean;
    /**
     * Get a rule by ID
     */
    getRule(ruleId: string): DetectionRule | undefined;
    /**
     * Enable/disable a rule
     */
    setRuleEnabled(ruleId: string, enabled: boolean): boolean;
    /**
     * Evaluate an event against all applicable rules
     */
    evaluate(event: any): Promise<DetectionResult>;
    /**
     * Build evaluation context from event
     */
    private buildContext;
    /**
     * Extract matched data from condition
     */
    private extractMatchedData;
    /**
     * Build detection result from matches
     */
    private buildResult;
    /**
     * Get maximum severity from list
     */
    private getMaxSeverity;
    /**
     * Generate event key for cooldown tracking
     */
    private getEventKey;
}
/**
 * Default rule set for PR-Alert
 */
export declare function createDefaultRules(): any[];
export { DetectionRule, RuleMatch, DetectionResult, RuleEngine };
//# sourceMappingURL=index.d.ts.map