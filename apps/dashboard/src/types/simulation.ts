/**
 * Simulation Dashboard Types
 */
export interface Scenario {
  id: string;
  name: string;
  description: string;
  category: 'positive' | 'boundary' | 'negative' | 'reliability' | 'multi_event';
  disasterType: string;
  severity: 'info' | 'warning' | 'alert' | 'emergency' | 'critical';
}

export interface SimulationState {
  state: 'idle' | 'running' | 'paused' | 'stopped' | 'completed' | 'error';
  currentScenario?: string;
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
  speed: number;
  resultsCount: number;
}

export interface TestResult {
  testCaseId: string;
  scenarioId?: string;
  scenarioName?: string;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  inputEvent: any;
  validation?: {
    status: 'PASS' | 'FAIL' | 'BLOCKED' | 'SKIPPED';
    passedChecks: string[];
    failedChecks: Array<{
      check: string;
      expected: any;
      actual: any;
      message: string;
    }>;
    score?: number;
  };
  detectionResult?: {
    triggered: boolean;
    maxSeverity: string;
    maxConfidence: number;
    triggeredRules: string[];
    recommendedAction: string;
    matches: Array<{
      ruleId: string;
      ruleName: string;
      matched: boolean;
      severity: string;
      confidence: number;
    }>;
  };
  fusionResult?: {
    fusedSeverity: string;
    fusedConfidence: number;
    contributingSources: string[];
    conflicts: Array<{ type: string; resolution: string }>;
  };
  alertGenerated?: {
    alertId?: string;
    severity?: string;
    confidence?: number;
    disasterType?: string;
    messages: Array<{
      lang: string;
      channel: string;
      content: string;
      truncated: boolean;
    }>;
    capXmlGenerated?: boolean;
  };
  notificationsSent: Array<{
    channel: string;
    recipient: string;
    success: boolean;
    messageId?: string;
    error?: string;
    simulated: boolean;
  }>;
  dashboardState?: {
    eventsDisplayed: number;
    alertsDisplayed: number;
    mapMarkers: number;
    activeAlerts: number;
  };
  databaseRecords?: {
    eventsInserted: number;
    alertsInserted: number;
    crowdReportsInserted: number;
    dispatchesRecorded: number;
  };
  errors: Array<{
    stage: string;
    message: string;
    stack?: string;
    timestamp: string;
  }>;
  metadata: {
    simulationMode: boolean;
    simulationSpeed?: number;
    simulationVersion: string;
    notes?: string;
  };
}

export interface TestSuiteResult {
  suiteId: string;
  suiteName: string;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  results: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    blocked: number;
    skipped: number;
    passPercentage: number;
    avgProcessingTimeMs?: number;
    totalAlertsGenerated: number;
    totalNotificationsSent: number;
    totalErrors: number;
  };
}

export interface SimulationCommand {
  command: 'start' | 'pause' | 'resume' | 'stop' | 'reset' | 'step' | 'replay' | 'set_speed' | 'load_scenario' | 'load_custom' | 'clear_results' | 'export_results';
  params?: any;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}