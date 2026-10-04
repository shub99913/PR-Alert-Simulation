import { 
  TestResult, 
  SyntheticEvent, 
  NormalizedEvent, 
  DetectionResult, 
  FusionResult,
  Alert,
  DispatchRecord,
  TestSuiteResult,
  SimulationConfig,
  SIMULATION_LABEL
} from './schemas';
import { createEngineLogger } from '@pr-alert/core';
import { applyJsonLogic } from 'json-logic-js';

const logger = createEngineLogger('simulation:validator');

/**
 * =============================================================================
 * SIMULATION VALIDATION ENGINE
 * =============================================================================
 * Compares actual pipeline results against expected outcomes defined in
 * synthetic test events. Produces PASS/FAIL/BLOCKED verdicts.
 * =============================================================================
 */

export interface ValidationCheck {
  name: string;
  passed: boolean;
  expected: any;
  actual: any;
  message: string;
  severity: 'critical' | 'major' | 'minor';
}

export interface ValidationContext {
  syntheticEvent: SyntheticEvent;
  normalizedEvent?: NormalizedEvent;
  detectionResult?: DetectionResult;
  fusionResult?: FusionResult;
  alertGenerated?: Alert;
  notificationsSent?: DispatchRecord[];
  dashboardState?: any;
  databaseRecords?: any;
  errors?: Error[];
}

export class SimulationValidator {
  private config: SimulationConfig['validationConfig'];
  private checks: ValidationCheck[] = [];
  
  constructor(config: SimulationConfig['validationConfig'] = {}) {
    this.config = {
      strictMode: config.strictMode ?? false,
      partialMatch: config.partialMatch ?? true,
      ignoreTimestamps: config.ignoreTimestamps ?? true,
      ignoreIds: config.ignoreIds ?? true,
    };
  }
  
  /**
   * Validate a complete test case execution
   */
  async validate(context: ValidationContext): Promise<{
    status: 'PASS' | 'FAIL' | 'BLOCKED';
    checks: ValidationCheck[];
    score: number;
    summary: string;
  }> {
    this.checks = [];
    
    const { syntheticEvent } = context;
    const expected = syntheticEvent.expectedOutcome;
    
    // 1. Validate alert triggering
    if (expected.shouldTriggerAlert !== undefined) {
      this.checkAlertTriggering(context, expected);
    }
    
    // 2. Validate alert severity
    if (expected.expectedAlertLevel) {
      this.checkAlertSeverity(context, expected);
    }
    
    // 3. Validate risk category
    if (expected.expectedRiskCategory) {
      this.checkRiskCategory(context, expected);
    }
    
    // 4. Validate notifications
    if (expected.shouldSendNotification !== undefined) {
      this.checkNotifications(context, expected);
    }
    
    // 5. Validate notification channels
    if (expected.expectedNotificationChannels) {
      this.checkNotificationChannels(context, expected);
    }
    
    // 6. Validate message content
    if (expected.expectedMessageContains) {
      this.checkMessageContent(context, expected);
    }
    
    // 7. Validate expected actions
    if (expected.expectedActions) {
      this.checkExpectedActions(context, expected);
    }
    
    // 8. Validate dashboard state
    if (expected.expectedDashboardState) {
      this.checkDashboardState(context, expected);
    }
    
    // 9. Validate database records
    if (expected.expectedDatabaseRecords !== undefined) {
      this.checkDatabaseRecords(context, expected);
    }
    
    // 10. Validate escalation behavior
    if (expected.expectedEscalation !== undefined) {
      this.checkEscalation(context, expected);
    }
    
    // 11. Validate recovery behavior
    if (expected.expectedRecoveryBehavior) {
      this.checkRecoveryBehavior(context, expected);
    }
    
    // 12. Validate MAP markers
    if (expected.expectedMapMarkers !== undefined) {
      this.checkMapMarkers(context, expected);
    }
    
    // Calculate overall result
    const criticalFailures = this.checks.filter(c => !c.passed && c.severity === 'critical').length;
    const majorFailures = this.checks.filter(c => !c.passed && c.severity === 'major').length;
    const minorFailures = this.checks.filter(c => !c.passed && c.severity === 'minor').length;
    const totalChecks = this.checks.length;
    const passedChecks = this.checks.filter(c => c.passed).length;
    
    let status: 'PASS' | 'FAIL' | 'BLOCKED' = 'PASS';
    let summary = '';
    
    if (context.errors && context.errors.length > 0) {
      status = 'BLOCKED';
      summary = `Blocked due to ${context.errors.length} processing error(s)`;
    } else if (criticalFailures > 0) {
      status = 'FAIL';
      summary = `${criticalFailures} critical failure(s), ${majorFailures} major, ${minorFailures} minor`;
    } else if (majorFailures > 0) {
      status = 'FAIL';
      summary = `${majorFailures} major failure(s), ${minorFailures} minor`;
    } else if (minorFailures > 0) {
      status = this.config.strictMode ? 'FAIL' : 'PASS';
      summary = `${minorFailures} minor issue(s)`;
    } else {
      status = 'PASS';
      summary = 'All checks passed';
    }
    
    const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 100;
    
    logger.info({
      testCaseId: syntheticEvent.testCaseId,
      status,
      score,
      totalChecks,
      passedChecks,
      criticalFailures,
      majorFailures,
      minorFailures,
    }, 'Validation completed');
    
    return { status, checks: this.checks, score, summary };
  }
  
  /**
   * Check if alert was triggered as expected
   */
  private checkAlertTriggering(context: ValidationContext, expected: any): void {
    const actualTriggered = !!context.alertGenerated;
    const expectedTriggered = expected.shouldTriggerAlert;
    
    this.addCheck({
      name: 'alert_triggered',
      passed: actualTriggered === expectedTriggered,
      expected: expectedTriggered,
      actual: actualTriggered,
      message: expectedTriggered 
        ? `Alert should have been triggered but wasn't`
        : `Alert should NOT have been triggered but was`,
      severity: 'critical',
    });
  }
  
  /**
   * Check alert severity level
   */
  private checkAlertSeverity(context: ValidationContext, expected: any): void {
    const actualSeverity = context.alertGenerated?.severity;
    const expectedSeverity = expected.expectedAlertLevel;
    
    if (!actualSeverity) {
      this.addCheck({
        name: 'alert_severity',
        passed: false,
        expected: expectedSeverity,
        actual: 'none',
        message: `Expected alert severity ${expectedSeverity} but no alert was generated`,
        severity: 'critical',
      });
      return;
    }
    
    const severityOrder = { info: 0, warning: 1, alert: 2, emergency: 3 };
    const expectedLevel = severityOrder[expectedSeverity] ?? 0;
    const actualLevel = severityOrder[actualSeverity] ?? 0;
    
    // In strict mode, exact match required
    // In lenient mode, actual >= expected is acceptable (over-alerting is safer than under-alerting)
    const passed = this.config.strictMode 
      ? actualLevel === expectedLevel
      : actualLevel >= expectedLevel;
    
    this.addCheck({
      name: 'alert_severity',
      passed,
      expected: expectedSeverity,
      actual: actualSeverity,
      message: passed
        ? `Alert severity ${actualSeverity} meets/exceeds expected ${expectedSeverity}`
        : `Alert severity ${actualSeverity} below expected ${expectedSeverity}`,
      severity: 'critical',
    });
  }
  
  /**
   * Check risk category
   */
  private checkRiskCategory(context: ValidationContext, expected: any): void {
    // Risk category would be derived from fusion/detection results
    const actualCategory = this.deriveRiskCategory(context);
    const expectedCategory = expected.expectedRiskCategory;
    
    if (!actualCategory) {
      this.addCheck({
        name: 'risk_category',
        passed: false,
        expected: expectedCategory,
        actual: 'unknown',
        message: 'Could not determine risk category from results',
        severity: 'major',
      });
      return;
    }
    
    const categoryOrder = { low: 0, moderate: 1, high: 2, extreme: 3 };
    const expectedLevel = categoryOrder[expectedCategory] ?? 0;
    const actualLevel = categoryOrder[actualCategory] ?? 0;
    
    const passed = this.config.strictMode
      ? actualLevel === expectedLevel
      : actualLevel >= expectedLevel;
    
    this.addCheck({
      name: 'risk_category',
      passed,
      expected: expectedCategory,
      actual: actualCategory,
      message: passed
        ? `Risk category ${actualCategory} meets/exceeds expected ${expectedCategory}`
        : `Risk category ${actualCategory} below expected ${expectedCategory}`,
      severity: 'major',
    });
  }
  
  /**
   * Check notifications were sent
   */
  private checkNotifications(context: ValidationContext, expected: any): void {
    const actualSent = context.notificationsSent && context.notificationsSent.length > 0;
    const expectedSent = expected.shouldSendNotification;
    
    this.addCheck({
      name: 'notifications_sent',
      passed: actualSent === expectedSent,
      expected: expectedSent,
      actual: actualSent,
      message: expectedSent
        ? `Notifications should have been sent but weren't`
        : `Notifications should NOT have been sent but were`,
      severity: expectedSent ? 'critical' : 'minor',
    });
  }
  
  /**
   * Check notification channels
   */
  private checkNotificationChannels(context: ValidationContext, expected: any): void {
    const expectedChannels = expected.expectedNotificationChannels || [];
    const actualChannels = context.notificationsSent
      ? [...new Set(context.notificationsSent.map(n => n.channel))]
      : [];
    
    const missingChannels = expectedChannels.filter((c: string) => !actualChannels.includes(c));
    const extraChannels = actualChannels.filter((c: string) => !expectedChannels.includes(c));
    
    // In strict mode, exact match; in lenient mode, all expected must be present
    const passed = this.config.strictMode
      ? missingChannels.length === 0 && extraChannels.length === 0
      : missingChannels.length === 0;
    
    this.addCheck({
      name: 'notification_channels',
      passed,
      expected: expectedChannels,
      actual: actualChannels,
      message: passed
        ? `All expected notification channels used`
        : `Missing channels: ${missingChannels.join(', ')}${extraChannels.length ? `; Extra: ${extraChannels.join(', ')}` : ''}`,
      severity: missingChannels.length > 0 ? 'critical' : 'minor',
    });
  }
  
  /**
   * Check message content contains expected terms
   */
  private checkMessageContent(context: ValidationContext, expected: any): void {
    const expectedTerms = expected.expectedMessageContains || [];
    const actualMessages = context.alertGenerated?.messages || [];
    const allContent = actualMessages.map(m => m.content.toLowerCase()).join(' ');
    
    const missingTerms = expectedTerms.filter((term: string) => 
      !allContent.includes(term.toLowerCase())
    );
    
    const passed = missingTerms.length === 0;
    
    this.addCheck({
      name: 'message_content',
      passed,
      expected: expectedTerms,
      actual: allContent.substring(0, 200),
      message: passed
        ? `All expected terms found in message`
        : `Missing terms in message: ${missingTerms.join(', ')}`,
      severity: 'major',
    });
  }
  
  /**
   * Check expected actions were taken
   */
  private checkExpectedActions(context: ValidationContext, expected: any): void {
    const expectedActions = expected.expectedActions || [];
    const actualActions = this.deriveActionsTaken(context);
    
    const missingActions = expectedActions.filter((a: string) => !actualActions.includes(a));
    const extraActions = actualActions.filter((a: string) => !expectedActions.includes(a));
    
    const passed = this.config.strictMode
      ? missingActions.length === 0 && extraActions.length === 0
      : missingActions.length === 0;
    
    this.addCheck({
      name: 'expected_actions',
      passed,
      expected: expectedActions,
      actual: actualActions,
      message: passed
        ? `All expected actions executed`
        : `Missing actions: ${missingActions.join(', ')}${extraActions.length ? `; Extra: ${extraActions.join(', ')}` : ''}`,
      severity: missingActions.length > 0 ? 'critical' : 'minor',
    });
  }
  
  /**
   * Check dashboard state
   */
  private checkDashboardState(context: ValidationContext, expected: any): void {
    const expectedState = expected.expectedDashboardState || {};
    const actualState = context.dashboardState || {};
    
    let allPassed = true;
    const failures: string[] = [];
    
    for (const [key, expectedValue] of Object.entries(expectedState)) {
      const actualValue = (actualState as any)[key];
      
      if (this.config.ignoreTimestamps && key.includes('Time')) continue;
      if (this.config.ignoreIds && key.includes('Id')) continue;
      
      const passed = this.compareValues(expectedValue, actualValue);
      if (!passed) {
        allPassed = false;
        failures.push(`${key}: expected ${JSON.stringify(expectedValue)}, got ${JSON.stringify(actualValue)}`);
      }
    }
    
    this.addCheck({
      name: 'dashboard_state',
      passed: allPassed,
      expected: expectedState,
      actual: actualState,
      message: allPassed
        ? `Dashboard state matches expected`
        : `Dashboard state mismatches: ${failures.join('; ')}`,
      severity: 'minor',
    });
  }
  
  /**
   * Check database records
   */
  private checkDatabaseRecords(context: ValidationContext, expected: any): void {
    const expectedCount = expected.expectedDatabaseRecords;
    const actualCount = context.databaseRecords?.eventsInserted || 0;
    
    const passed = actualCount >= expectedCount; // At least expected count
    
    this.addCheck({
      name: 'database_records',
      passed,
      expected: expectedCount,
      actual: actualCount,
      message: passed
        ? `Database has ${actualCount} records (expected at least ${expectedCount})`
        : `Database has ${actualCount} records, expected at least ${expectedCount}`,
      severity: 'major',
    });
  }
  
  /**
   * Check escalation behavior
   */
  private checkEscalation(context: ValidationContext, expected: any): void {
    const expectedEscalation = expected.expectedEscalation;
    const actualEscalation = this.detectEscalation(context);
    
    this.addCheck({
      name: 'escalation_behavior',
      passed: actualEscalation === expectedEscalation,
      expected: expectedEscalation,
      actual: actualEscalation,
      message: actualEscalation === expectedEscalation
        ? `Escalation behavior as expected`
        : `Escalation mismatch: expected ${expectedEscalation}, got ${actualEscalation}`,
      severity: 'major',
    });
  }
  
  /**
   * Check recovery behavior
   */
  private checkRecoveryBehavior(context: ValidationContext, expected: any): void {
    const expectedBehavior = expected.expectedRecoveryBehavior;
    const actualBehavior = this.detectRecoveryBehavior(context);
    
    const passed = actualBehavior === expectedBehavior || 
      (expectedBehavior === 'alert_downgrade' && actualBehavior.includes('downgrade')) ||
      (expectedBehavior === 'alert_cancelled' && actualBehavior.includes('cancel'));
    
    this.addCheck({
      name: 'recovery_behavior',
      passed,
      expected: expectedBehavior,
      actual: actualBehavior,
      message: passed
        ? `Recovery behavior as expected: ${actualBehavior}`
        : `Recovery behavior mismatch: expected ${expectedBehavior}, got ${actualBehavior}`,
      severity: 'minor',
    });
  }
  
  /**
   * Check map markers
   */
  private checkMapMarkers(context: ValidationContext, expected: any): void {
    const expectedMarkers = expected.expectedMapMarkers || 0;
    const actualMarkers = context.dashboardState?.mapMarkers || 0;
    
    const passed = actualMarkers >= expectedMarkers;
    
    this.addCheck({
      name: 'map_markers',
      passed,
      expected: expectedMarkers,
      actual: actualMarkers,
      message: passed
        ? `Map shows ${actualMarkers} markers (expected at least ${expectedMarkers})`
        : `Map shows ${actualMarkers} markers, expected at least ${expectedMarkers}`,
      severity: 'minor',
    });
  }
  
  // ==================== Helper Methods ====================
  
  private addCheck(check: Omit<ValidationCheck, 'severity'> & { severity: ValidationCheck['severity'] }): void {
    this.checks.push(check);
  }
  
  private compareValues(expected: any, actual: any): boolean {
    if (expected === actual) return true;
    
    // Handle numeric comparison with tolerance
    if (typeof expected === 'number' && typeof actual === 'number') {
      return Math.abs(expected - actual) < 0.01;
    }
    
    // Handle array comparison
    if (Array.isArray(expected) && Array.isArray(actual)) {
      if (expected.length !== actual.length) return false;
      return expected.every((v, i) => this.compareValues(v, actual[i]));
    }
    
    // Handle object comparison
    if (typeof expected === 'object' && typeof actual === 'object' && expected && actual) {
      const expectedKeys = Object.keys(expected);
      const actualKeys = Object.keys(actual);
      
      if (this.config.ignoreIds) {
        const filteredExpected = expectedKeys.filter(k => !k.includes('Id') && !k.includes('id'));
        const filteredActual = actualKeys.filter(k => !k.includes('Id') && !k.includes('id'));
        if (filteredExpected.length !== filteredActual.length) return false;
        return filteredExpected.every(k => this.compareValues(expected[k], actual[k]));
      }
      
      if (expectedKeys.length !== actualKeys.length) return false;
      return expectedKeys.every(k => this.compareValues(expected[k], actual[k]));
    }
    
    return false;
  }
  
  private deriveRiskCategory(context: ValidationContext): string | null {
    // Derive from fusion result or detection result
    if (context.fusionResult?.fusedConfidence !== undefined) {
      const confidence = context.fusionResult.fusedConfidence;
      const severity = context.fusionResult.fusedSeverity;
      
      if (severity === 'emergency' && confidence > 0.8) return 'extreme';
      if (severity === 'alert' && confidence > 0.7) return 'high';
      if (severity === 'warning' && confidence > 0.5) return 'moderate';
      return 'low';
    }
    
    if (context.detectionResult?.maxConfidence !== undefined) {
      const confidence = context.detectionResult.maxConfidence;
      const severity = context.detectionResult.maxSeverity;
      
      if (severity === 'emergency' && confidence > 0.8) return 'extreme';
      if (severity === 'alert' && confidence > 0.7) return 'high';
      if (severity === 'warning' && confidence > 0.5) return 'moderate';
      return 'low';
    }
    
    return null;
  }
  
  private deriveActionsTaken(context: ValidationContext): string[] {
    const actions: string[] = [];
    
    if (context.alertGenerated) {
      actions.push('issue_alert');
      if (context.alertGenerated.severity === 'emergency') {
        actions.push('immediate_alert');
      }
    }
    
    if (context.notificationsSent && context.notificationsSent.length > 0) {
      actions.push('dispatch_notifications');
      
      const channels = [...new Set(context.notificationsSent.map(n => n.channel))];
      if (channels.includes('siren')) actions.push('activate_sirens');
      if (channels.includes('cell_broadcast')) actions.push('cell_broadcast');
      if (channels.includes('radio') || channels.includes('tv')) actions.push('broadcast_media');
    }
    
    if (context.detectionResult?.recommendedAction) {
      if (context.detectionResult.recommendedAction === 'monitor') actions.push('monitor');
    }
    
    return actions;
  }
  
  private detectEscalation(context: ValidationContext): boolean {
    // Check if multiple alerts with increasing severity were generated
    // This is simplified - in reality would track alert history
    return context.detectionResult?.triggeredRules.length > 1 && 
      context.detectionResult.maxSeverity === 'emergency';
  }
  
  private detectRecoveryBehavior(context: ValidationContext): string {
    if (!context.alertGenerated) return 'none';
    
    // Check if alert was cancelled or downgraded
    if (context.alertGenerated.status === 'cancelled') return 'alert_cancelled';
    if (context.alertGenerated.status === 'expired') return 'alert_expired';
    
    // Check if severity is lower than previous (would need history)
    // For now, return based on current state
    return 'ongoing';
  }
}

/**
 * Validate a test suite result
 */
export function validateSuite(
  suite: TestSuiteResult,
  validator: SimulationValidator
): TestSuiteResult {
  // Re-validate all results with current validator config
  // This would be called after all events are processed
  return suite;
}

/**
 * Create validator with default config
 */
export function createValidator(config?: Partial<SimulationConfig['validationConfig']>): SimulationValidator {
  return new SimulationValidator(config);
}

export { SimulationValidator, ValidationCheck, ValidationContext };