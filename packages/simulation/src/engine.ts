import { EventEmitter } from 'events';
import { 
  SimulationDataSource, 
  SimulationDataSourceConfig,
  FailureInjector 
} from './datasource';
import { 
  SimulationValidator,
  ValidationContext,
  createValidator 
} from './validator';
import { 
  SyntheticEvent, 
  TestScenario, 
  TestResult, 
  TestSuiteResult,
  SimulationConfig,
  SimulationState,
  SimulationCommand,
  NormalizedEvent,
  DetectionResult,
  FusionResult,
  Alert,
  DispatchRecord,
  PREDEFINED_SCENARIOS,
  SIMULATION_MODE,
  SIMULATION_LABEL,
} from './schemas';
import { createEngineLogger } from '@pr-alert/core';
import { RuleEngine, DetectionResult as DetectionResultType } from '@pr-alert/detection';
import { FusionEngine, FusionResult as FusionResultType } from '@pr-alert/fusion';
import { MessageGenerator, CapXmlGenerator } from '@pr-alert/messaging';
import { DispatchEngine, DispatchResult } from '@pr-alert/dispatch';

const logger = createEngineLogger('simulation:engine');

/**
 * =============================================================================
 * SIMULATION ENGINE
 * =============================================================================
 * Main orchestration engine that runs the complete simulation pipeline:
 * Synthetic Event → Validation → Normalization → Detection → Fusion → 
 * Alert Decision → Message Generation → CAP XML → Dispatch → Validation
 * 
 * Provides controls: start, pause, resume, stop, reset, step, replay, speed
 * =============================================================================
 */

export interface SimulationEngineEvents {
  'state_change': (state: SimulationState) => void;
  'event_start': (event: SyntheticEvent) => void;
  'event_complete': (result: TestResult) => void;
  'scenario_start': (scenario: TestScenario) => void;
  'scenario_complete': (suite: TestSuiteResult) => void;
  'error': (error: Error, context?: string) => void;
  'log': (message: string, level: 'info' | 'warn' | 'error') => void;
}

export interface PipelineComponents {
  ruleEngine?: RuleEngine;
  fusionEngine?: FusionEngine;
  messageGenerator?: MessageGenerator;
  capGenerator?: CapXmlGenerator;
  dispatchEngine?: DispatchEngine;
  validator?: SimulationValidator;
}

export class SimulationEngine extends EventEmitter<SimulationEngineEvents> {
  private dataSource: SimulationDataSource;
  private validator: SimulationValidator;
  private components: PipelineComponents = {};
  private currentState: SimulationState = 'idle';
  private currentSuiteId?: string;
  private isInitialized = false;
  private testResults: TestResult[] = [];
  private pendingValidations: Map<string, {
    syntheticEvent: SyntheticEvent;
    normalizedEvent: NormalizedEvent;
    resolve: (result: TestResult) => void;
    startTime: number;
  }> = new Map();
  
  constructor(config: SimulationDataSourceConfig & { 
    components?: PipelineComponents;
    simulationConfig?: SimulationConfig;
    dataSource?: SimulationDataSource; // Allow passing pre-created data source
  } = {}) {
    super();
    
    // CRITICAL SAFETY CHECK
    if (!SIMULATION_MODE) {
      throw new Error(
        `${SIMULATION_LABEL}\n` +
        'SimulationEngine cannot be instantiated in production mode.'
      );
    }
    
    // Use provided dataSource or create new one
    if (config.dataSource) {
      this.dataSource = config.dataSource;
    } else {
      this.validator = config.components?.validator || createValidator(config.simulationConfig?.validationConfig);
      
      this.dataSource = new SimulationDataSource({
        ...config,
        onEventProcessed: this.handleEventProcessed.bind(this),
        onSuiteComplete: this.handleSuiteComplete.bind(this),
      });
    }
    
    // Set up data source event callback to feed into our pipeline
    this.dataSource.setEventCallback(this.processNormalizedEvent.bind(this));
    
    // Initialize pipeline components
    this.initializeComponents(config.components);
    
    logger.info('SimulationEngine initialized');
  }
  
  /**
   * Initialize pipeline components
   */
  private initializeComponents(components?: PipelineComponents): void {
    this.components = {
      ruleEngine: components?.ruleEngine || new RuleEngine(),
      fusionEngine: components?.fusionEngine || new FusionEngine(),
      messageGenerator: components?.messageGenerator || new MessageGenerator(),
      capGenerator: components?.capGenerator || new CapXmlGenerator(),
      dispatchEngine: components?.dispatchEngine,
      validator: this.validator,
    };
    
    // Load default rules into rule engine
    if (this.components.ruleEngine) {
      // Rules are loaded in RuleEngine constructor
      logger.debug('RuleEngine initialized with default rules');
    }
  }
  
  /**
   * Set pipeline components (for testing with mocks)
   */
  setComponents(components: PipelineComponents): void {
    this.components = { ...this.components, ...components };
  }
  
  /**
   * Get current simulation state
   */
  getState(): SimulationState {
    return this.currentState;
  }
  
  /**
   * Get detailed status
   */
  getStatus() {
    const dsState = this.dataSource.getState();
    return {
      state: this.currentState,
      dataSource: dsState,
      resultsCount: this.testResults.length,
      pendingValidations: this.pendingValidations.size,
      currentSuiteId: this.currentSuiteId,
    };
  }
  
  // ==================== Simulation Controls ====================
  
  /**
   * Start simulation with a predefined scenario
   */
  async startScenario(scenarioId: string): Promise<{ success: boolean; message: string }> {
    this.setState('running');
    this.currentSuiteId = `suite_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.testResults = [];
    
    const result = await this.dataSource.startSimulation(scenarioId);
    
    if (result.success) {
      const scenario = this.dataSource.getScenario(scenarioId);
      this.emit('scenario_start', scenario!);
    }
    
    return result;
  }
  
  /**
   * Start simulation with custom events
   */
  async startCustom(events: SyntheticEvent[]): Promise<{ success: boolean; message: string }> {
    this.setState('running');
    this.currentSuiteId = `suite_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.testResults = [];
    
    return this.dataSource.startCustomSimulation(events);
  }
  
  /**
   * Pause simulation
   */
  pause(): { success: boolean; message: string } {
    const result = this.dataSource.pause();
    if (result.success) {
      this.setState('paused');
    }
    return result;
  }
  
  /**
   * Resume simulation
   */
  resume(): { success: boolean; message: string } {
    const result = this.dataSource.resume();
    if (result.success) {
      this.setState('running');
    }
    return result;
  }
  
  /**
   * Stop simulation
   */
  stop(): { success: boolean; message: string } {
    const result = this.dataSource.stop();
    if (result.success) {
      this.setState('stopped');
    }
    return result;
  }
  
  /**
   * Reset simulation
   */
  reset(): { success: boolean; message: string } {
    const result = this.dataSource.reset();
    if (result.success) {
      this.setState('idle');
      this.testResults = [];
      this.currentSuiteId = undefined;
      this.pendingValidations.clear();
    }
    return result;
  }
  
  /**
   * Step forward one event
   */
  async step(): Promise<{ success: boolean; message: string; result?: TestResult }> {
    if (this.currentState === 'running' && this.dataSource.getState().state !== 'paused') {
      return { success: false, message: 'Cannot step while running. Pause first.' };
    }
    
    return this.dataSource.step();
  }
  
  /**
   * Replay last scenario
   */
  async replay(): Promise<{ success: boolean; message: string }> {
    this.testResults = [];
    return this.dataSource.replay();
  }
  
  /**
   * Set simulation speed
   */
  setSpeed(speed: number): { success: boolean; message: string } {
    return this.dataSource.setSpeed(speed);
  }
  
  /**
   * Load scenario from file
   */
  async loadFromFile(filePath: string): Promise<{ success: boolean; message: string }> {
    return this.dataSource.loadFromFile(filePath);
  }
  
  /**
   * Execute a command
   */
  async executeCommand(command: SimulationCommand, params?: any): Promise<any> {
    switch (command) {
      case 'start':
        return this.startScenario(params.scenarioId);
      case 'pause':
        return this.pause();
      case 'resume':
        return this.resume();
      case 'stop':
        return this.stop();
      case 'reset':
        return this.reset();
      case 'step':
        return this.step();
      case 'replay':
        return this.replay();
      case 'set_speed':
        return this.setSpeed(params.speed);
      case 'load_scenario':
        return this.startScenario(params.scenarioId);
      case 'load_custom':
        return this.startCustom(params.events);
      case 'clear_results':
        this.clearResults();
        return { success: true, message: 'Results cleared' };
      case 'export_results':
        return this.exportResults(params.format, params.filePath);
      default:
        return { success: false, message: `Unknown command: ${command}` };
    }
  }
  
  // ==================== Pipeline Processing ====================
  
  /**
   * Process a normalized event through the full pipeline
   */
  private async processNormalizedEvent(events: NormalizedEvent[]): Promise<void> {
    for (const normalizedEvent of events) {
      // Find matching synthetic event
      const testCaseId = normalizedEvent.properties?.simulationTestCaseId as string;
      const syntheticEvent = this.findSyntheticEvent(testCaseId);
      
      if (!syntheticEvent) {
        logger.warn({ testCaseId }, 'No matching synthetic event found');
        continue;
      }
      
      this.emit('event_start', syntheticEvent);
      
      try {
        // Run full pipeline
        const pipelineResult = await this.runPipeline(syntheticEvent, normalizedEvent);
        
        // Validate results
        const validationContext: ValidationContext = {
          syntheticEvent,
          normalizedEvent,
          detectionResult: pipelineResult.detectionResult,
          fusionResult: pipelineResult.fusionResult,
          alertGenerated: pipelineResult.alertGenerated,
          notificationsSent: pipelineResult.notificationsSent,
          dashboardState: pipelineResult.dashboardState,
          databaseRecords: pipelineResult.databaseRecords,
          errors: pipelineResult.errors,
        };
        
        const validation = await this.validator.validate(validationContext);
        
        // Create complete test result
        const testResult: TestResult = {
          ...pipelineResult.baseResult,
          validation: {
            status: validation.status,
            passedChecks: validation.checks.filter(c => c.passed).map(c => c.name),
            failedChecks: validation.checks.filter(c => !c.passed).map(c => ({
              check: c.name,
              expected: c.expected,
              actual: c.actual,
              message: c.message,
            })),
            score: validation.score,
          },
        };
        
        this.testResults.push(testResult);
        this.emit('event_complete', testResult);
        
      } catch (error) {
        logger.error({ err: error, testCaseId }, 'Pipeline processing failed');
        this.emit('error', error as Error, 'pipeline');
      }
    }
  }
  
  /**
   * Run the complete detection → alert → dispatch pipeline
   */
  private async runPipeline(
    syntheticEvent: SyntheticEvent,
    normalizedEvent: NormalizedEvent
  ): Promise<{
    baseResult: Omit<TestResult, 'validation'>;
    detectionResult?: DetectionResultType;
    fusionResult?: FusionResultType;
    alertGenerated?: Alert;
    notificationsSent?: DispatchRecord[];
    dashboardState?: any;
    databaseRecords?: any;
    errors: Error[];
  }> {
    const errors: Error[] = [];
    const startTime = Date.now();
    
    // Base result structure
    const baseResult: Omit<TestResult, 'validation'> = {
      testCaseId: syntheticEvent.testCaseId,
      scenarioId: this.dataSource.getState().currentScenario,
      scenarioName: syntheticEvent.scenarioName,
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: 0,
      inputEvent: syntheticEvent,
      metadata: {
        simulationMode: true,
        simulationSpeed: this.dataSource.getState().speed,
      },
    };
    
    let detectionResult: DetectionResultType | undefined;
    let fusionResult: FusionResultType | undefined;
    let alertGenerated: Alert | undefined;
    let notificationsSent: DispatchRecord[] = [];
    let dashboardState: any = {};
    let databaseRecords: any = {
      eventsInserted: 0,
      alertsInserted: 0,
      crowdReportsInserted: 0,
      dispatchesRecorded: 0,
    };
    
    try {
      // 1. Rule Detection
      if (this.components.ruleEngine) {
        detectionResult = await this.components.ruleEngine.evaluate(normalizedEvent);
        baseResult.detectionResult = {
          triggered: detectionResult.triggered,
          maxSeverity: detectionResult.maxSeverity,
          maxConfidence: detectionResult.maxConfidence,
          triggeredRules: detectionResult.triggeredRules,
          recommendedAction: detectionResult.recommendedAction,
          matches: detectionResult.matches.map(m => ({
            ruleId: m.ruleId,
            ruleName: m.ruleName,
            matched: m.matched,
            severity: m.severity,
            confidence: m.confidence,
          })),
        };
      }
      
      // 2. Fusion (if multiple signals)
      if (this.components.fusionEngine && detectionResult?.triggered) {
        // Create fusion signals from detection result
        const signals = [{
          source: 'rules',
          eventId: normalizedEvent.sourceId,
          disasterType: normalizedEvent.disasterType,
          severity: detectionResult.maxSeverity,
          confidence: detectionResult.maxConfidence,
          location: normalizedEvent.location,
          timestamp: new Date(),
          metadata: { rules: detectionResult.triggeredRules },
        }];
        
        fusionResult = await this.components.fusionEngine.fuse(signals);
        baseResult.fusionResult = {
          fusedSeverity: fusionResult.fusedSeverity,
          fusedConfidence: fusionResult.fusedConfidence,
          contributingSources: fusionResult.contributingSources,
          conflicts: fusionResult.conflicts,
        };
      }
      
      // 3. Alert Generation (if detection triggered)
      const finalSeverity = fusionResult?.fusedSeverity || detectionResult?.maxSeverity;
      const finalConfidence = fusionResult?.fusedConfidence || detectionResult?.maxConfidence;
      
      if (detectionResult?.triggered && this.components.messageGenerator) {
        // Generate alert object
        const alertId = `alert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        
        // Generate messages
        const messages = await this.components.messageGenerator.generateAll(
          {
            _id: alertId,
            eventIds: [normalizedEvent.sourceId],
            disasterType: normalizedEvent.disasterType,
            severity: finalSeverity,
            confidence: finalConfidence,
            location: normalizedEvent.location,
            messages: [], // Will be populated
            capXml: '',
            status: 'issued',
            issuedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
          {
            languages: ['en', 'hi'],
            channels: ['sms', 'push', 'email', 'whatsapp', 'operator_dashboard'],
          }
        );
        
        // Generate CAP XML
        const capXml = this.components.capGenerator!.generate({
          _id: alertId,
          eventIds: [normalizedEvent.sourceId],
          disasterType: normalizedEvent.disasterType,
          severity: finalSeverity,
          confidence: finalConfidence,
          location: normalizedEvent.location,
          messages: messages.map(m => ({
            lang: m.lang,
            channel: m.channel,
            content: m.content,
            templateId: m.templateId,
          })),
          status: 'issued',
          issuedAt: new Date().toISOString(),
        });
        
        alertGenerated = {
          _id: alertId,
          eventIds: [normalizedEvent.sourceId],
          disasterType: normalizedEvent.disasterType,
          severity: finalSeverity,
          confidence: finalConfidence,
          location: normalizedEvent.location,
          messages: messages.map(m => ({
            lang: m.lang,
            channel: m.channel,
            content: m.content,
            templateId: m.templateId,
          })),
          capXml,
          status: 'issued',
          issuedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          dispatches: [],
        } as Alert;
        
        baseResult.alertGenerated = {
          alertId,
          severity: finalSeverity,
          confidence: finalConfidence,
          disasterType: normalizedEvent.disasterType,
          messages: messages.map(m => ({
            lang: m.lang,
            channel: m.channel,
            content: m.content,
            truncated: m.truncated,
          })),
          capXmlGenerated: true,
        };
        
        databaseRecords.alertsInserted = 1;
        
        // 4. Dispatch
        if (this.components.dispatchEngine) {
          const dispatchRecords = await this.components.dispatchEngine.dispatchAlert(
            alertGenerated,
            messages
          );
          
          notificationsSent = dispatchRecords;
          baseResult.notificationsSent = dispatchRecords.map(d => ({
            channel: d.channel as any,
            recipient: d.recipient,
            success: d.status === 'sent',
            messageId: d.jobId,
            simulated: true,
          }));
          
          databaseRecords.dispatchesRecorded = dispatchRecords.length;
        }
        
        databaseRecords.eventsInserted = 1;
        
      }
      
      // Dashboard state
      dashboardState = {
        eventsDisplayed: 1,
        alertsDisplayed: alertGenerated ? 1 : 0,
        mapMarkers: detectionResult?.triggered ? 1 : 0,
        activeAlerts: alertGenerated ? 1 : 0,
      };
      
      baseResult.dashboardState = dashboardState;
      baseResult.databaseRecords = databaseRecords;
      baseResult.durationMs = Date.now() - startTime;
      baseResult.errors = errors.map(e => ({
        stage: 'pipeline',
        message: e.message,
        stack: e.stack,
        timestamp: new Date().toISOString(),
      }));
      
      return {
        baseResult,
        detectionResult,
        fusionResult,
        alertGenerated,
        notificationsSent,
        dashboardState,
        databaseRecords,
        errors,
      };
      
    } catch (error) {
      errors.push(error as Error);
      baseResult.errors = errors.map(e => ({
        stage: 'pipeline',
        message: e.message,
        stack: e.stack,
        timestamp: new Date().toISOString(),
      }));
      baseResult.durationMs = Date.now() - startTime;
      
      return {
        baseResult,
        detectionResult,
        fusionResult,
        alertGenerated,
        notificationsSent,
        dashboardState,
        databaseRecords,
        errors,
      };
    }
  }
  
  /**
   * Find synthetic event by testCaseId
   */
  private findSyntheticEvent(testCaseId: string): SyntheticEvent | undefined {
    // Search in data source timeline
    // This is a simplified version - in practice would have a direct lookup
    return undefined; // Would be implemented with actual lookup
  }
  
  // ==================== Event Handlers ====================
  
  private handleEventProcessed(result: TestResult): void {
    // Called by data source after event processing
    this.testResults.push(result);
  }
  
  private handleSuiteComplete(suite: TestSuiteResult): void {
    this.setState('completed');
    this.emit('scenario_complete', suite);
  }
  
  private setState(state: SimulationState): void {
    if (this.currentState !== state) {
      this.currentState = state;
      this.emit('state_change', state);
      logger.info({ state }, 'Simulation state changed');
    }
  }
  
  // ==================== Results & Export ====================
  
  /**
   * Get all test results
   */
  getResults(): TestResult[] {
    return [...this.testResults];
  }
  
  /**
   * Get test suite result
   */
  getSuiteResult(): TestSuiteResult | null {
    if (this.testResults.length === 0) return null;
    
    const total = this.testResults.length;
    const passed = this.testResults.filter(r => r.validation?.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.validation?.status === 'FAIL').length;
    const blocked = this.testResults.filter(r => r.validation?.status === 'BLOCKED').length;
    const skipped = this.testResults.filter(r => r.validation?.status === 'SKIPPED').length;
    
    return {
      suiteId: this.currentSuiteId || `suite_${Date.now()}`,
      suiteName: this.dataSource.getState().currentScenario || 'Unknown',
      startedAt: this.testResults[0]?.startedAt || new Date().toISOString(),
      completedAt: new Date().toISOString(),
      config: {} as SimulationConfig, // Would include actual config
      results: this.testResults,
      summary: {
        total,
        passed,
        failed,
        blocked,
        skipped,
        passPercentage: total > 0 ? Math.round((passed / total) * 100) : 0,
        totalAlertsGenerated: this.testResults.filter(r => r.alertGenerated).length,
        totalNotificationsSent: this.testResults.reduce((sum, r) => sum + r.notificationsSent.length, 0),
        totalErrors: this.testResults.reduce((sum, r) => sum + r.errors.length, 0),
      },
      metadata: {
        simulationMode: true,
        environment: 'test',
        version: '1.0',
      },
    };
  }
  
  /**
   * Export results
   */
  exportResults(format: 'json' | 'csv' = 'json', filePath?: string): { success: boolean; data?: string; filePath?: string; message: string } {
    return this.dataSource.exportResults(format, filePath);
  }
  
  /**
   * Clear results
   */
  clearResults(): void {
    this.testResults = [];
    this.dataSource.clearResults();
  }
  
  // ==================== Scenario Management ====================
  
  /**
   * Get all available scenarios
   */
  getScenarios(): TestScenario[] {
    return this.dataSource.getScenarios();
  }
  
  /**
   * Get scenario by ID
   */
  getScenario(id: string): TestScenario | undefined {
    return this.dataSource.getScenario(id);
  }
  
  /**
   * Add a custom scenario
   */
  addScenario(scenario: TestScenario): void {
    // Would need to add to dataSource scenarios map
    // This requires exposing a method on dataSource
  }
  
  // ==================== Static Factory ====================
  
  static create(config?: Partial<SimulationDataSourceConfig> & { 
    components?: PipelineComponents;
    simulationConfig?: SimulationConfig;
  }): SimulationEngine {
    return new SimulationEngine(config);
  }
}

export { SimulationEngine, PipelineComponents };