import { 
  BaseAdapter, 
  AdapterConfig, 
  RawEvent, 
  NormalizedEvent,
  AdapterRegistry 
} from '@pr-alert/adapters';
import { 
  SyntheticEvent, 
  TestScenario, 
  TestResult, 
  TestSuiteResult,
  SimulationConfig,
  SimulationState,
  SimulationCommand,
  PREDEFINED_SCENARIOS,
  SIMULATION_MODE,
  SIMULATION_LABEL,
  SimulationSchemas 
} from './schemas';
import { createEngineLogger } from '@pr-alert/core';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

const logger = createEngineLogger('simulation:datasource');

/**
 * =============================================================================
 * SIMULATION DATA SOURCE
 * =============================================================================
 * Implements the same interface as production adapters (BaseAdapter)
 * but generates synthetic test data instead of fetching from real sources.
 * 
 * CRITICAL: This class MUST only be used when SIMULATION_MODE is true.
 * It will throw an error if instantiated in production mode.
 * =============================================================================
 */

export interface SimulationEventCallback {
  (events: NormalizedEvent[]): Promise<void>;
}

export interface SimulationDataSourceConfig extends AdapterConfig {
  // Simulation-specific config
  scenarios?: TestScenario[];
  config?: SimulationConfig;
  onEventProcessed?: (result: TestResult) => void;
  onSuiteComplete?: (suite: TestSuiteResult) => void;
  dataSource?: SimulationDataSource; // Allow passing pre-created data source
}

export class SimulationDataSource extends BaseAdapter {
  name: 'simulation' = 'simulation';
  
  private scenarios: Map<string, TestScenario> = new Map();
  private eventCallback?: SimulationEventCallback;
  private simulationState: SimulationState = 'idle';
  private simulationConfig: SimulationConfig;
  private currentScenario?: TestScenario;
  private currentEventIndex = 0;
  private timelineEvents: SyntheticEvent[] = [];
  private simulationTimer?: NodeJS.Timeout;
  private speedMultiplier = 1.0;
  private isProcessing = false;
  private results: TestResult[] = [];
  private currentSuiteId?: string;
  private onEventProcessed?: (result: TestResult) => void;
  private onSuiteComplete?: (suite: TestSuiteResult) => void;
  private failureInjector: FailureInjector;
  private eventQueue: SyntheticEvent[] = [];
  private paused = false;
  
  constructor(config: SimulationDataSourceConfig) {
    // CRITICAL SAFETY CHECK: Prevent accidental production use
    if (!SIMULATION_MODE) {
      throw new Error(
        `${SIMULATION_LABEL}\n` +
        'SimulationDataSource cannot be instantiated in production mode.\n' +
        'Set SIMULATION_MODE=true or NODE_ENV=test to enable.'
      );
    }
    
    super({
      name: 'simulation',
      enabled: true,
      pollIntervalMs: config.pollIntervalMs || 1000,
      timeoutMs: config.timeoutMs || 5000,
      maxRetries: config.maxRetries || 1,
      retryDelayMs: config.retryDelayMs || 100,
    });
    
    this.simulationConfig = config.config || {
      speed: 1.0,
      autoAdvance: true,
      eventIntervalMs: 1000,
      maxEvents: 0,
      dataSource: 'predefined',
      injectFailures: false,
      failureConfig: {},
      outputConfig: {},
      validationConfig: {},
    };
    
    this.failureInjector = new FailureInjector(this.simulationConfig.failureConfig);
    
    // Load scenarios
    const scenarios = config.scenarios || PREDEFINED_SCENARIOS;
    for (const scenario of scenarios) {
      this.scenarios.set(scenario.id, scenario);
    }
    
    this.onEventProcessed = config.onEventProcessed;
    this.onSuiteComplete = config.onSuiteComplete;
    
    logger.info({ 
      scenarioCount: this.scenarios.size,
      simulationMode: SIMULATION_MODE,
    }, 'SimulationDataSource initialized');
  }
  
  /**
   * Set the event callback (called by AdapterRegistry)
   */
  setEventCallback(callback: SimulationEventCallback): void {
    this.eventCallback = callback;
  }
  
  /**
   * Start simulation with a specific scenario
   */
  async startSimulation(scenarioId: string): Promise<{ success: boolean; message: string }> {
    const scenario = this.scenarios.get(scenarioId);
    if (!scenario) {
      return { success: false, message: `Scenario not found: ${scenarioId}` };
    }
    
    if (this.simulationState === 'running') {
      return { success: false, message: 'Simulation already running' };
    }
    
    this.currentScenario = scenario;
    this.currentSuiteId = `suite_${Date.now()}_${uuidv4().slice(0, 8)}`;
    this.results = [];
    this.currentEventIndex = 0;
    
    // Build timeline events from scenario
    this.timelineEvents = this.buildTimelineEvents(scenario);
    
    this.simulationState = 'running';
    this.paused = false;
    
    logger.info({ 
      scenarioId, 
      scenarioName: scenario.name,
      eventCount: this.timelineEvents.length,
      suiteId: this.currentSuiteId,
    }, 'Starting simulation');
    
    // Start processing events
    this.processNextEvent();
    
    return { success: true, message: `Started simulation: ${scenario.name}` };
  }
  
  /**
   * Start simulation with custom events
   */
  async startCustomSimulation(events: SyntheticEvent[]): Promise<{ success: boolean; message: string }> {
    if (this.simulationState === 'running') {
      return { success: false, message: 'Simulation already running' };
    }
    
    this.currentScenario = {
      id: `custom_${Date.now()}`,
      name: 'Custom Simulation',
      description: 'User-provided synthetic events',
      category: 'positive',
      disasterType: events[0]?.scenarioType || 'flood',
      severity: events[0]?.severity || 'info',
      baseEvent: {},
    };
    
    this.currentSuiteId = `suite_${Date.now()}_${uuidv4().slice(0, 8)}`;
    this.results = [];
    this.currentEventIndex = 0;
    this.timelineEvents = events;
    
    this.simulationState = 'running';
    this.paused = false;
    
    logger.info({ 
      eventCount: events.length,
      suiteId: this.currentSuiteId,
    }, 'Starting custom simulation');
    
    this.processNextEvent();
    
    return { success: true, message: `Started custom simulation with ${events.length} events` };
  }
  
  /**
   * Pause simulation
   */
  pause(): { success: boolean; message: string } {
    if (this.simulationState !== 'running') {
      return { success: false, message: 'Simulation not running' };
    }
    
    this.paused = true;
    this.simulationState = 'paused';
    
    if (this.simulationTimer) {
      clearTimeout(this.simulationTimer);
      this.simulationTimer = undefined;
    }
    
    logger.info('Simulation paused');
    return { success: true, message: 'Simulation paused' };
  }
  
  /**
   * Resume simulation
   */
  resume(): { success: boolean; message: string } {
    if (this.simulationState !== 'paused') {
      return { success: false, message: 'Simulation not paused' };
    }
    
    this.paused = false;
    this.simulationState = 'running';
    
    this.processNextEvent();
    
    logger.info('Simulation resumed');
    return { success: true, message: 'Simulation resumed' };
  }
  
  /**
   * Stop simulation
   */
  stop(): { success: boolean; message: string } {
    this.simulationState = 'stopped';
    this.paused = false;
    
    if (this.simulationTimer) {
      clearTimeout(this.simulationTimer);
      this.simulationTimer = undefined;
    }
    
    // Complete current suite
    this.completeSuite();
    
    logger.info('Simulation stopped');
    return { success: true, message: 'Simulation stopped' };
  }
  
  /**
   * Reset simulation
   */
  reset(): { success: boolean; message: string } {
    this.stop();
    this.currentScenario = undefined;
    this.currentSuiteId = undefined;
    this.timelineEvents = [];
    this.currentEventIndex = 0;
    this.results = [];
    this.eventQueue = [];
    this.simulationState = 'idle';
    
    logger.info('Simulation reset');
    return { success: true, message: 'Simulation reset' };
  }
  
  /**
   * Set simulation speed
   */
  setSpeed(speed: number): { success: boolean; message: string } {
    if (speed <= 0) {
      return { success: false, message: 'Speed must be positive' };
    }
    
    this.speedMultiplier = speed;
    this.simulationConfig.speed = speed;
    
    logger.info({ speed }, 'Simulation speed changed');
    return { success: true, message: `Speed set to ${speed}x` };
  }
  
  /**
   * Step forward one event
   */
  async step(): Promise<{ success: boolean; message: string; result?: TestResult }> {
    if (this.simulationState === 'running' && !this.paused) {
      return { success: false, message: 'Cannot step while running. Pause first.' };
    }
    
    if (this.currentEventIndex >= this.timelineEvents.length) {
      return { success: false, message: 'No more events to process' };
    }
    
    const event = this.timelineEvents[this.currentEventIndex];
    const result = await this.processEvent(event);
    this.currentEventIndex++;
    
    return { success: true, message: 'Step completed', result };
  }
  
  /**
   * Replay last scenario
   */
  async replay(): Promise<{ success: boolean; message: string }> {
    if (!this.currentScenario) {
      return { success: false, message: 'No previous scenario to replay' };
    }
    
    return this.startSimulation(this.currentScenario.id);
  }
  
  /**
   * Load scenario from file
   */
  async loadFromFile(filePath: string): Promise<{ success: boolean; message: string }> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      // Validate against schema
      const events = SimulationSchemas.SyntheticEvent.array().parse(data.events || data);
      
      return this.startCustomSimulation(events);
    } catch (error) {
      return { 
        success: false, 
        message: `Failed to load file: ${(error as Error).message}` 
      };
    }
  }
  
  /**
   * Get current simulation state
   */
  getState(): {
    state: SimulationState;
    currentScenario?: string;
    progress: { current: number; total: number; percentage: number };
    speed: number;
    resultsCount: number;
  } {
    return {
      state: this.simulationState,
      currentScenario: this.currentScenario?.name,
      progress: {
        current: this.currentEventIndex,
        total: this.timelineEvents.length,
        percentage: this.timelineEvents.length > 0 
          ? Math.round((this.currentEventIndex / this.timelineEvents.length) * 100)
          : 0,
      },
      speed: this.speedMultiplier,
      resultsCount: this.results.length,
    };
  }
  
  /**
   * Get all available scenarios
   */
  getScenarios(): TestScenario[] {
    return Array.from(this.scenarios.values());
  }
  
  /**
   * Get scenario by ID
   */
  getScenario(id: string): TestScenario | undefined {
    return this.scenarios.get(id);
  }
  
  /**
   * Get test results
   */
  getResults(): TestResult[] {
    return [...this.results];
  }
  
  /**
   * Export results
   */
  exportResults(format: 'json' | 'csv' = 'json', filePath?: string): { success: boolean; data?: string; filePath?: string; message: string } {
    let data: string;
    
    if (format === 'json') {
      const suite = this.createSuiteResult();
      data = JSON.stringify(suite, null, 2);
    } else {
      data = this.resultsToCSV(this.results);
    }
    
    if (filePath) {
      fs.writeFileSync(filePath, data);
      return { success: true, filePath, message: `Results exported to ${filePath}` };
    }
    
    return { success: true, data, message: 'Results exported' };
  }
  
  /**
   * Clear results
   */
  clearResults(): void {
    this.results = [];
    logger.info('Results cleared');
  }
  
  // ==================== BaseAdapter Implementation ====================
  
  async fetchRawEvents(): Promise<RawEvent[]> {
    // In simulation mode, we don't fetch - we generate from timeline
    // This method is kept for interface compatibility
    return [];
  }
  
  normalize(rawEvent: RawEvent): NormalizedEvent | NormalizedEvent[] | null {
    // Not used in simulation mode
    return null;
  }
  
  // Override startPolling to do nothing (we control simulation manually)
  startPolling(onEvents: (events: NormalizedEvent[]) => Promise<void>): void {
    this.eventCallback = onEvents;
    // Don't start automatic polling - simulation is manually controlled
  }
  
  // Override stopPolling
  stopPolling(): void {
    this.stop();
  }
  
  // ==================== Private Methods ====================
  
  private buildTimelineEvents(scenario: TestScenario): SyntheticEvent[] {
    const events: SyntheticEvent[] = [];
    
    // If scenario has a sequence, use that
    if (scenario.sequence && scenario.sequence.length > 0) {
      for (let i = 0; i < scenario.sequence.length; i++) {
        const step = scenario.sequence[i];
        const baseEvent = scenario.baseEvent || {};
        
        const event: SyntheticEvent = {
          testCaseId: `${scenario.id}-step-${i + 1}`,
          scenarioType: step.scenarioType || scenario.disasterType,
          scenarioName: step.scenarioName || `${scenario.name} - Step ${i + 1}`,
          location: step.location || baseEvent.location || { 
            name: 'Unknown', 
            coordinates: [77, 28] 
          },
          timestamp: step.timestamp || baseEvent.timestamp || new Date().toISOString(),
          durationMinutes: step.durationMinutes || baseEvent.durationMinutes,
          severity: step.severity || baseEvent.severity || scenario.severity,
          confidence: step.confidence || baseEvent.confidence || 0.9,
          status: step.status || 'active',
          sensorData: { ...baseEvent.sensorData, ...step.sensorData },
          weatherConditions: { ...baseEvent.weatherConditions, ...step.weatherConditions },
          impactEstimate: { ...baseEvent.impactEstimate, ...step.impactEstimate },
          expectedOutcome: { ...baseEvent.expectedOutcome, ...step.expectedOutcome },
          metadata: {
            ...baseEvent.metadata,
            ...step.metadata,
            testCategory: scenario.category,
          },
        };
        
        events.push(event);
      }
    } else {
      // Single event from baseEvent
      const baseEvent = scenario.baseEvent;
      const event: SyntheticEvent = {
        testCaseId: scenario.id,
        scenarioType: scenario.disasterType,
        scenarioName: scenario.name,
        location: baseEvent.location || { name: 'Unknown', coordinates: [77, 28] },
        timestamp: baseEvent.timestamp || new Date().toISOString(),
        durationMinutes: baseEvent.durationMinutes,
        severity: baseEvent.severity || scenario.severity,
        confidence: baseEvent.confidence || 0.9,
        status: baseEvent.status || 'active',
        sensorData: baseEvent.sensorData || {},
        weatherConditions: baseEvent.weatherConditions || {},
        impactEstimate: baseEvent.impactEstimate || {},
        expectedOutcome: baseEvent.expectedOutcome || {},
        metadata: {
          ...baseEvent.metadata,
          testCategory: scenario.category,
        },
      };
      events.push(event);
    }
    
    // Add variations if present
    if (scenario.variations) {
      for (const variation of scenario.variations) {
        const baseEvent = scenario.baseEvent || {};
        const event: SyntheticEvent = {
          testCaseId: `${scenario.id}-${variation.name.toLowerCase().replace(/\s+/g, '-')}`,
          scenarioType: scenario.disasterType,
          scenarioName: `${scenario.name} - ${variation.name}`,
          location: variation.overrides.location || baseEvent.location || { name: 'Unknown', coordinates: [77, 28] },
          timestamp: variation.overrides.timestamp || baseEvent.timestamp || new Date().toISOString(),
          severity: variation.overrides.severity || baseEvent.severity || scenario.severity,
          confidence: variation.overrides.confidence || baseEvent.confidence || 0.9,
          sensorData: { ...baseEvent.sensorData, ...variation.overrides.sensorData },
          weatherConditions: { ...baseEvent.weatherConditions, ...variation.overrides.weatherConditions },
          impactEstimate: { ...baseEvent.impactEstimate, ...variation.overrides.impactEstimate },
          expectedOutcome: { ...baseEvent.expectedOutcome, ...variation.expectedOutcome },
          metadata: {
            ...baseEvent.metadata,
            testCategory: 'boundary',
            tags: [...(baseEvent.metadata?.tags || []), 'variation', variation.name],
          },
        };
        events.push(event);
      }
    }
    
    return events;
  }
  
  private async processNextEvent(): Promise<void> {
    if (this.paused || this.simulationState !== 'running') {
      return;
    }
    
    if (this.currentEventIndex >= this.timelineEvents.length) {
      // All events processed
      this.completeSuite();
      return;
    }
    
    if (this.simulationConfig.maxEvents > 0 && this.currentEventIndex >= this.simulationConfig.maxEvents) {
      this.completeSuite();
      return;
    }
    
    const event = this.timelineEvents[this.currentEventIndex];
    
    // Apply failure injection if enabled
    const injectedEvent = this.failureInjector.inject(event);
    
    await this.processEvent(injectedEvent);
    
    this.currentEventIndex++;
    
    // Schedule next event
    if (this.simulationConfig.autoAdvance && this.simulationState === 'running') {
      const interval = this.simulationConfig.eventIntervalMs / this.speedMultiplier;
      this.simulationTimer = setTimeout(() => {
        this.processNextEvent();
      }, interval);
    }
  }
  
  private async processEvent(event: SyntheticEvent): Promise<TestResult> {
    if (this.isProcessing) {
      // Queue the event
      this.eventQueue.push(event);
      return this.createPendingResult(event);
    }
    
    this.isProcessing = true;
    const startTime = Date.now();
    
    try {
      // Convert synthetic event to normalized event for pipeline
      const normalizedEvent = this.convertToNormalizedEvent(event);
      
      // Inject failures if configured
      const processedEvent = this.failureInjector.injectEvent(normalizedEvent);
      
      // Send to pipeline via callback
      if (this.eventCallback) {
        await this.eventCallback([processedEvent]);
      }
      
      // Validate against expected outcomes
      const result = await this.validateEvent(event, processedEvent, startTime);
      
      this.results.push(result);
      
      // Callback for each processed event
      if (this.onEventProcessed) {
        this.onEventProcessed(result);
      }
      
      return result;
    } catch (error) {
      const result = this.createErrorResult(event, error as Error, startTime);
      this.results.push(result);
      
      if (this.onEventProcessed) {
        this.onEventProcessed(result);
      }
      
      return result;
    } finally {
      this.isProcessing = false;
      
      // Process queued events
      if (this.eventQueue.length > 0) {
        const nextEvent = this.eventQueue.shift()!;
        setImmediate(() => this.processEvent(nextEvent));
      }
    }
  }
  
  private convertToNormalizedEvent(synthetic: SyntheticEvent): NormalizedEvent {
    const [lon, lat] = synthetic.location.coordinates;
    
    // Map scenario severity to standard severity
    const severityMap: Record<string, 'info' | 'warning' | 'alert' | 'emergency'> = {
      'info': 'info',
      'warning': 'warning',
      'alert': 'alert',
      'emergency': 'emergency',
      'critical': 'emergency',
    };
    
    return {
      source: 'simulation',
      sourceId: synthetic.testCaseId,
      disasterType: synthetic.scenarioType,
      severity: severityMap[synthetic.severity] || 'info',
      confidence: synthetic.confidence,
      location: { type: 'Point', coordinates: [lon, lat] },
      properties: {
        ...synthetic.sensorData,
        ...synthetic.weatherConditions,
        ...synthetic.impactEstimate,
        simulationTestCaseId: synthetic.testCaseId,
        simulationScenarioName: synthetic.scenarioName,
        SIMULATION_LABEL,
      },
      timestamp: new Date(synthetic.timestamp),
      rawData: synthetic,
    };
  }
  
  private async validateEvent(
    synthetic: SyntheticEvent, 
    normalized: NormalizedEvent, 
    startTime: number
  ): Promise<TestResult> {
    const durationMs = Date.now() - startTime;
    const expected = synthetic.expectedOutcome;
    
    // This will be populated by the actual pipeline processing
    // For now, we create a result structure that will be updated
    // when the actual processing completes via callbacks
    
    const result: TestResult = {
      testCaseId: synthetic.testCaseId,
      scenarioId: this.currentScenario?.id,
      scenarioName: this.currentScenario?.name,
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString(),
      durationMs,
      inputEvent: synthetic,
      validation: {
        status: 'PASS', // Will be updated after full pipeline
        passedChecks: [],
        failedChecks: [],
        score: 100,
      },
      metadata: {
        simulationMode: true,
        simulationSpeed: this.speedMultiplier,
      },
    };
    
    // Note: Actual validation happens after pipeline processing
    // This is a placeholder that gets updated by the validation engine
    
    return result;
  }
  
  private createPendingResult(event: SyntheticEvent): TestResult {
    return {
      testCaseId: event.testCaseId,
      scenarioId: this.currentScenario?.id,
      scenarioName: this.currentScenario?.name,
      startedAt: new Date().toISOString(),
      durationMs: 0,
      inputEvent: event,
      validation: {
        status: 'PASS',
        passedChecks: [],
        failedChecks: [],
      },
      metadata: { simulationMode: true },
    };
  }
  
  private createErrorResult(event: SyntheticEvent, error: Error, startTime: number): TestResult {
    return {
      testCaseId: event.testCaseId,
      scenarioId: this.currentScenario?.id,
      scenarioName: this.currentScenario?.name,
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      inputEvent: event,
      errors: [{
        stage: 'processing',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      }],
      validation: {
        status: 'BLOCKED',
        passedChecks: [],
        failedChecks: [],
        blockedReason: error.message,
      },
      metadata: { simulationMode: true },
    };
  }
  
  private completeSuite(): void {
    if (!this.currentSuiteId) return;
    
    const suite = this.createSuiteResult();
    
    this.simulationState = 'completed';
    
    if (this.onSuiteComplete) {
      this.onSuiteComplete(suite);
    }
    
    logger.info({ 
      suiteId: this.currentSuiteId,
      total: suite.summary.total,
      passed: suite.summary.passed,
      failed: suite.summary.failed,
      passPercentage: suite.summary.passPercentage,
    }, 'Simulation suite completed');
  }
  
  private createSuiteResult(): TestSuiteResult {
    const total = this.results.length;
    const passed = this.results.filter(r => r.validation?.status === 'PASS').length;
    const failed = this.results.filter(r => r.validation?.status === 'FAIL').length;
    const blocked = this.results.filter(r => r.validation?.status === 'BLOCKED').length;
    const skipped = this.results.filter(r => r.validation?.status === 'SKIPPED').length;
    
    const totalAlerts = this.results.reduce((sum, r) => sum + (r.alertGenerated ? 1 : 0), 0);
    const totalNotifications = this.results.reduce((sum, r) => sum + r.notificationsSent.length, 0);
    const totalErrors = this.results.reduce((sum, r) => sum + r.errors.length, 0);
    const avgTime = this.results.length > 0
      ? this.results.reduce((sum, r) => sum + (r.durationMs || 0), 0) / this.results.length
      : 0;
    
    return {
      suiteId: this.currentSuiteId!,
      suiteName: this.currentScenario?.name || 'Custom Simulation',
      startedAt: this.results[0]?.startedAt || new Date().toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - new Date(this.results[0]?.startedAt || Date.now()).getTime(),
      config: this.simulationConfig,
      results: this.results,
      summary: {
        total,
        passed,
        failed,
        blocked,
        skipped,
        passPercentage: total > 0 ? Math.round((passed / total) * 100) : 0,
        avgProcessingTimeMs: avgTime,
        totalAlertsGenerated: totalAlerts,
        totalNotificationsSent: totalNotifications,
        totalErrors,
      },
      metadata: {
        simulationMode: true,
        environment: 'test',
        version: '1.0',
      },
    };
  }
  
  private resultsToCSV(results: TestResult[]): string {
    const headers = [
      'testCaseId', 'scenarioId', 'scenarioName', 'status', 'durationMs',
      'expectedAlert', 'actualAlert', 'expectedNotification', 'actualNotifications',
      'passedChecks', 'failedChecks', 'errors',
    ];
    
    const rows = results.map(r => [
      r.testCaseId,
      r.scenarioId || '',
      r.scenarioName || '',
      r.validation?.status || 'UNKNOWN',
      r.durationMs || 0,
      r.inputEvent.expectedOutcome.expectedAlertLevel || '',
      r.alertGenerated?.severity || '',
      r.inputEvent.expectedOutcome.shouldSendNotification ? 'yes' : 'no',
      r.notificationsSent.length > 0 ? 'yes' : 'no',
      r.validation?.passedChecks.length || 0,
      r.validation?.failedChecks.length || 0,
      r.errors.length,
    ]);
    
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}

/**
 * Failure Injector - Simulates various failure modes
 */
class FailureInjector {
  private config: SimulationConfig['failureConfig'];
  
  constructor(config: SimulationConfig['failureConfig'] = {}) {
    this.config = {
      networkFailureRate: 0,
      apiFailureRate: 0,
      notificationFailureRate: 0,
      duplicateRate: 0,
      delayRate: 0,
      missingFieldRate: 0,
      invalidValueRate: 0,
      offlineMode: false,
      ...config,
    };
  }
  
  inject(event: SyntheticEvent): SyntheticEvent {
    if (!this.config.offlineMode && Math.random() > 0.5) {
      return event; // No injection most of the time
    }
    
    const injected = { ...event };
    
    // Network failure - delay or drop
    if (Math.random() < (this.config.networkFailureRate || 0)) {
      if (Math.random() < 0.5) {
        // Drop event (return null-like)
        return { ...injected, metadata: { ...injected.metadata, dropped: true } };
      } else {
        // Delay
        return { ...injected, metadata: { ...injected.metadata, delayed: true } };
      }
    }
    
    // Duplicate
    if (Math.random() < (this.config.duplicateRate || 0)) {
      return { ...injected, metadata: { ...injected.metadata, duplicated: true } };
    }
    
    // Missing fields
    if (Math.random() < (this.config.missingFieldRate || 0)) {
      const fields = Object.keys(injected.sensorData);
      if (fields.length > 0) {
        const fieldToRemove = fields[Math.floor(Math.random() * fields.length)];
        const newSensorData = { ...injected.sensorData };
        delete newSensorData[fieldToRemove as keyof typeof newSensorData];
        return { ...injected, sensorData: newSensorData };
      }
    }
    
    // Invalid values
    if (Math.random() < (this.config.invalidValueRate || 0)) {
      const newSensorData = { ...injected.sensorData };
      const fields = Object.keys(newSensorData);
      if (fields.length > 0) {
        const fieldToCorrupt = fields[Math.floor(Math.random() * fields.length)];
        (newSensorData as any)[fieldToCorrupt] = 'INVALID';
        return { ...injected, sensorData: newSensorData };
      }
    }
    
    return injected;
  }
  
  injectEvent(event: NormalizedEvent): NormalizedEvent {
    // Similar injection for normalized events
    return event;
  }
  
  shouldFailNotification(): boolean {
    return Math.random() < (this.config.notificationFailureRate || 0);
  }
  
  shouldFailAPI(): boolean {
    return Math.random() < (this.config.apiFailureRate || 0);
  }
}

/**
 * Create a simulation data source for testing
 */
export function createSimulationDataSource(config?: Partial<SimulationDataSourceConfig>): SimulationDataSource {
  return new SimulationDataSource({
    pollIntervalMs: 1000,
    timeoutMs: 5000,
    maxRetries: 1,
    retryDelayMs: 100,
    ...config,
  });
}

/**
 * Create a simulation-enabled adapter registry
 */
export function createSimulationAdapterRegistry(
  simulationDataSource: SimulationDataSource
): AdapterRegistry {
  const registry = new AdapterRegistry();
  
  // Register simulation data source as primary
  registry.register(simulationDataSource);
  
  // Can still register other adapters but they won't poll in simulation mode
  // registry.register(new USGSAdapter());
  // etc.
  
  return registry;
}

export { SimulationDataSource, FailureInjector, createSimulationDataSource, createSimulationAdapterRegistry };