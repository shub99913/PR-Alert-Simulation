import { z } from 'zod';
import { 
  DisasterTypeSchema, 
  SeveritySchema, 
  ChannelSchema,
  SourceTypeSchema,
  PointSchema 
} from '@pr-alert/schemas';

/**
 * =============================================================================
 * SIMULATION MODE - CRITICAL SAFETY SEPARATION
 * =============================================================================
 * This flag MUST be checked before ANY synthetic data enters the pipeline.
 * Never mix synthetic data with production data.
 * =============================================================================
 */
export const SIMULATION_MODE = process.env.SIMULATION_MODE === 'true' || process.env.NODE_ENV === 'test';
export const SIMULATION_LABEL = 'SIMULATION / TEST MODE — NOT REAL-WORLD DATA';

/**
 * Synthetic Event Schema - Core data structure for simulation events
 */
export const SyntheticEventSchema = z.object({
  // Unique identifier for this test case
  testCaseId: z.string().min(1),
  
  // Scenario metadata
  scenarioType: DisasterTypeSchema,
  scenarioName: z.string().min(1),
  description: z.string().optional(),
  
  // Location information
  location: z.object({
    name: z.string().min(1),
    coordinates: z.tuple([z.number(), z.number()]), // [lon, lat]
    district: z.string().optional(),
    state: z.string().optional(),
    country: z.string().default('India'),
    adminLevel1: z.string().optional(), // State/Province
    adminLevel2: z.string().optional(), // District
  }),
  
  // Temporal information
  timestamp: z.string().datetime(), // Event occurrence time
  endTime: z.string().datetime().optional(), // Event end time
  durationMinutes: z.number().int().positive().optional(),
  
  // Severity and confidence
  severity: z.enum(['info', 'warning', 'alert', 'emergency', 'critical']),
  confidence: z.number().min(0).max(1).default(0.9),
  detectionThreshold: z.number().min(0).max(1).optional(),
  
  // Status
  status: z.enum(['active', 'monitoring', 'resolved', 'expired', 'cancelled']).default('active'),
  
  // Sensor readings (scenario-specific, all optional)
  sensorData: z.object({
    // Flood / Rainfall
    rainfallMmPerHour: z.number().nonnegative().optional(),
    riverLevelMeters: z.number().optional(),
    soilMoisturePercent: z.number().min(0).max(100).optional(),
    waterLevelTrend: z.enum(['rising', 'rapidly_rising', 'stable', 'falling', 'rapidly_falling']).optional(),
    floodDepthMeters: z.number().nonnegative().optional(),
    inundationAreaKm2: z.number().nonnegative().optional(),
    
    // Earthquake / Seismic
    seismicMagnitude: z.number().min(0).optional(),
    seismicIntensity: z.number().min(0).max(12).optional(), // MMI scale
    depthKm: z.number().nonnegative().optional(),
    pga: z.number().nonnegative().optional(), // Peak ground acceleration
    pgv: z.number().nonnegative().optional(), // Peak ground velocity
    aftershockProbability: z.number().min(0).max(1).optional(),
    
    // Landslide
    groundMovementMm: z.number().nonnegative().optional(),
    slopeAngleDegrees: z.number().min(0).max(90).optional(),
    soilSaturationPercent: z.number().min(0).max(100).optional(),
    crackWidthMm: z.number().nonnegative().optional(),
    
    // Cyclone / Storm
    windSpeedKmh: z.number().nonnegative().optional(),
    windGustKmh: z.number().nonnegative().optional(),
    centralPressureHpa: z.number().positive().optional(),
    stormCategory: z.number().min(0).max(5).optional(),
    stormSurgeMeters: z.number().nonnegative().optional(),
    landfallTime: z.string().datetime().optional(),
    
    // Wildfire
    fireAreaHectares: z.number().nonnegative().optional(),
    firePerimeterKm: z.number().nonnegative().optional(),
    fireTemperatureC: z.number().optional(),
    smokeDensity: z.number().min(0).max(1).optional(),
    fuelMoisturePercent: z.number().min(0).max(100).optional(),
    rateOfSpreadKmh: z.number().nonnegative().optional(),
    
    // Heatwave / Drought
    temperatureC: z.number().optional(),
    heatIndexC: z.number().optional(),
    humidityPercent: z.number().min(0).max(100).optional(),
    droughtIndex: z.number().min(0).max(1).optional(),
    consecutiveDaysAboveThreshold: z.number().int().nonnegative().optional(),
    
    // Tsunami
    waveHeightMeters: z.number().nonnegative().optional(),
    waveArrivalTime: z.string().datetime().optional(),
    tsunamiTravelTimeMinutes: z.number().nonnegative().optional(),
    
    // Air Quality
    aqi: z.number().min(0).max(500).optional(),
    pm25: z.number().nonnegative().optional(),
    pm10: z.number().nonnegative().optional(),
    co: z.number().nonnegative().optional(),
    no2: z.number().nonnegative().optional(),
    so2: z.number().nonnegative().optional(),
    o3: z.number().nonnegative().optional(),
  }).default({}),
  
  // Weather conditions
  weatherConditions: z.object({
    temperatureC: z.number().optional(),
    humidityPercent: z.number().min(0).max(100).optional(),
    windSpeedKmh: z.number().nonnegative().optional(),
    windDirectionDegrees: z.number().min(0).max(360).optional(),
    pressureHpa: z.number().positive().optional(),
    visibilityKm: z.number().nonnegative().optional(),
    cloudCoverPercent: z.number().min(0).max(100).optional(),
    precipitationMm: z.number().nonnegative().optional(),
  }).default({}),
  
  // Population and impact estimates
  impactEstimate: z.object({
    affectedPopulation: z.number().int().nonnegative().optional(),
    affectedAreaKm2: z.number().nonnegative().optional(),
    vulnerablePopulation: z.number().int().nonnegative().optional(),
    displacedPersons: z.number().int().nonnegative().optional(),
    injuredEstimate: z.number().int().nonnegative().optional(),
    fatalitiesEstimate: z.number().int().nonnegative().optional(),
    economicLossUsd: z.number().nonnegative().optional(),
    infrastructureDamage: z.enum(['none', 'minor', 'moderate', 'severe', 'catastrophic']).optional(),
  }).default({}),
  
  // Expected outcomes for validation
  expectedOutcome: z.object({
    shouldTriggerAlert: z.boolean().default(true),
    expectedAlertLevel: SeveritySchema.optional(),
    expectedRiskCategory: z.enum(['low', 'moderate', 'high', 'extreme']).optional(),
    shouldSendNotification: z.boolean().default(true),
    expectedNotificationChannels: z.array(ChannelSchema).optional(),
    expectedMessageContains: z.array(z.string()).optional(),
    expectedActions: z.array(z.string()).optional(),
    expectedDashboardState: z.record(z.unknown()).optional(),
    expectedMapMarkers: z.number().int().nonnegative().optional(),
    expectedDatabaseRecords: z.number().int().nonnegative().optional(),
    expectedEscalation: z.boolean().optional(),
    expectedRecoveryBehavior: z.string().optional(),
  }).default({}),
  
  // Scenario timeline for multi-step events
  timeline: z.array(z.object({
    stepId: z.string(),
    timestamp: z.string().datetime(),
    description: z.string(),
    sensorData: z.record(z.unknown()).optional(),
    expectedIntermediateOutcome: z.record(z.unknown()).optional(),
  })).optional(),
  
  // Metadata
  metadata: z.object({
    createdAt: z.string().datetime().default(() => new Date().toISOString()),
    createdBy: z.string().optional(),
    version: z.string().default('1.0'),
    tags: z.array(z.string()).default([]),
    testCategory: z.enum(['positive', 'boundary', 'negative', 'reliability', 'multi_event']).default('positive'),
    priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    notes: z.string().optional(),
  }).default({}),
});

export type SyntheticEvent = z.infer<typeof SyntheticEventSchema>;

/**
 * Test Scenario Definition - Predefined scenarios for quick testing
 */
export const TestScenarioSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  category: z.enum(['positive', 'boundary', 'negative', 'reliability', 'multi_event']),
  disasterType: DisasterTypeSchema,
  severity: z.enum(['info', 'warning', 'alert', 'emergency', 'critical']),
  // Base event template with placeholders
  baseEvent: SyntheticEventSchema.omit({ testCaseId: true }).partial(),
  // Variations for boundary testing
  variations: z.array(z.object({
    name: z.string(),
    description: z.string(),
    overrides: SyntheticEventSchema.partial(),
    expectedOutcome: SyntheticEventSchema.shape.expectedOutcome,
  })).optional(),
  // Multi-event sequences
  sequence: z.array(SyntheticEventSchema.omit({ testCaseId: true }).partial()).optional(),
});

export type TestScenario = z.infer<typeof TestScenarioSchema>;

/**
 * Simulation Control Commands
 */
export const SimulationCommandSchema = z.enum([
  'start',
  'pause',
  'resume',
  'stop',
  'reset',
  'step',       // Single event
  'replay',     // Replay last scenario
  'speed_up',
  'slow_down',
  'set_speed',
  'load_scenario',
  'load_custom',
  'clear_results',
  'export_results',
]);

export type SimulationCommand = z.infer<typeof SimulationCommandSchema>;

/**
 * Simulation State
 */
export const SimulationStateSchema = z.enum([
  'idle',
  'running',
  'paused',
  'stopped',
  'completed',
  'error',
]);

export type SimulationState = z.infer<typeof SimulationStateSchema>;

/**
 * Simulation Configuration
 */
export const SimulationConfigSchema = z.object({
  // Speed multiplier (1.0 = real-time)
  speed: z.number().positive().default(1.0),
  
  // Auto-advance timeline
  autoAdvance: z.boolean().default(true),
  
  // Delay between events in ms (at 1x speed)
  eventIntervalMs: z.number().int().nonnegative().default(1000),
  
  // Maximum events to process in one run (0 = unlimited)
  maxEvents: z.number().int().nonnegative().default(0),
  
  // Simulation data source
  dataSource: z.enum(['predefined', 'custom', 'file', 'stream']).default('predefined'),
  
  // Input file path (for file source)
  inputFile: z.string().optional(),
  
  // Enable failure injection
  injectFailures: z.boolean().default(false),
  
  // Failure injection config
  failureConfig: z.object({
    networkFailureRate: z.number().min(0).max(1).default(0),
    apiFailureRate: z.number().min(0).max(1).default(0),
    notificationFailureRate: z.number().min(0).max(1).default(0),
    duplicateRate: z.number().min(0).max(1).default(0),
    delayRate: z.number().min(0).max(1).default(0),
    missingFieldRate: z.number().min(0).max(1).default(0),
    invalidValueRate: z.number().min(0).max(1).default(0),
    offlineMode: z.boolean().default(false),
  }).default({}),
  
  // Output configuration
  outputConfig: z.object({
    logToConsole: z.boolean().default(true),
    logToFile: z.boolean().default(false),
    logFilePath: z.string().optional(),
    exportFormat: z.enum(['json', 'csv', 'both']).default('json'),
    exportPath: z.string().optional(),
    detailedLogs: z.boolean().default(true),
  }).default({}),
  
  // Validation configuration
  validationConfig: z.object({
    strictMode: z.boolean().default(false),
    partialMatch: z.boolean().default(true),
    ignoreTimestamps: z.boolean().default(true),
    ignoreIds: z.boolean().default(true),
  }).default({}),
});

export type SimulationConfig = z.infer<typeof SimulationConfigSchema>;

/**
 * Test Result - Result of a single test case execution
 */
export const TestResultSchema = z.object({
  testCaseId: z.string(),
  scenarioId: z.string().optional(),
  scenarioName: z.string().optional(),
  
  // Timing
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  durationMs: z.number().int().nonnegative().optional(),
  
  // Input
  inputEvent: SyntheticEventSchema,
  
  // Processing results
  validationResult: z.object({
    valid: z.boolean(),
    errors: z.array(z.string()).default([]),
    warnings: z.array(z.string()).default([]),
  }).optional(),
  
  detectionResult: z.object({
    triggered: z.boolean(),
    maxSeverity: SeveritySchema.optional(),
    maxConfidence: z.number().optional(),
    triggeredRules: z.array(z.string()).default([]),
    recommendedAction: z.enum(['none', 'monitor', 'issue_alert', 'immediate_alert']).optional(),
    matches: z.array(z.object({
      ruleId: z.string(),
      ruleName: z.string(),
      matched: z.boolean(),
      severity: SeveritySchema,
      confidence: z.number(),
    })).default([]),
  }).optional(),
  
  fusionResult: z.object({
    fusedSeverity: SeveritySchema.optional(),
    fusedConfidence: z.number().optional(),
    contributingSources: z.array(z.string()).default([]),
    conflicts: z.array(z.object({
      type: z.string(),
      resolution: z.string(),
    })).default([]),
  }).optional(),
  
  alertGenerated: z.object({
    alertId: z.string().optional(),
    severity: SeveritySchema.optional(),
    confidence: z.number().optional(),
    disasterType: DisasterTypeSchema.optional(),
    messages: z.array(z.object({
      lang: z.string(),
      channel: z.string(),
      content: z.string(),
      truncated: z.boolean(),
    })).default([]),
    capXmlGenerated: z.boolean().optional(),
  }).optional(),
  
  notificationsSent: z.array(z.object({
    channel: ChannelSchema,
    recipient: z.string(),
    success: z.boolean(),
    messageId: z.string().optional(),
    error: z.string().optional(),
    simulated: z.boolean(),
  })).default([]),
  
  // Dashboard/UI state changes
  dashboardState: z.object({
    eventsDisplayed: z.number().int().nonnegative().optional(),
    alertsDisplayed: z.number().int().nonnegative().optional(),
    mapMarkers: z.number().int().nonnegative().optional(),
    activeAlerts: z.number().int().nonnegative().optional(),
  }).optional(),
  
  // Database records
  databaseRecords: z.object({
    eventsInserted: z.number().int().nonnegative().default(0),
    alertsInserted: z.number().int().nonnegative().default(0),
    crowdReportsInserted: z.number().int().nonnegative().default(0),
    dispatchesRecorded: z.number().int().nonnegative().default(0),
  }).default({}),
  
  // Validation against expected outcomes
  validation: z.object({
    status: z.enum(['PASS', 'FAIL', 'BLOCKED', 'SKIPPED']),
    passedChecks: z.array(z.string()).default([]),
    failedChecks: z.array(z.object({
      check: z.string(),
      expected: z.unknown(),
      actual: z.unknown(),
      message: z.string(),
    })).default([]),
    blockedReason: z.string().optional(),
    score: z.number().min(0).max(100).optional(),
  }).optional(),
  
  // Errors
  errors: z.array(z.object({
    stage: z.string(),
    message: z.string(),
    stack: z.string().optional(),
    timestamp: z.string().datetime(),
  })).default([]),
  
  // Metadata
  metadata: z.object({
    simulationMode: z.boolean().default(true),
    simulationSpeed: z.number().optional(),
    simulationVersion: z.string().default('1.0'),
    notes: z.string().optional(),
  }).default({}),
});

export type TestResult = z.infer<typeof TestResultSchema>;

/**
 * Test Suite Result - Aggregate results for a test run
 */
export const TestSuiteResultSchema = z.object({
  suiteId: z.string(),
  suiteName: z.string(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  durationMs: z.number().int().nonnegative().optional(),
  
  config: SimulationConfigSchema,
  
  results: z.array(TestResultSchema),
  
  summary: z.object({
    total: z.number().int().nonnegative(),
    passed: z.number().int().nonnegative(),
    failed: z.number().int().nonnegative(),
    blocked: z.number().int().nonnegative(),
    skipped: z.number().int().nonnegative(),
    passPercentage: z.number().min(0).max(100),
    avgProcessingTimeMs: z.number().nonnegative().optional(),
    totalAlertsGenerated: z.number().int().nonnegative(),
    totalNotificationsSent: z.number().int().nonnegative(),
    totalErrors: z.number().int().nonnegative(),
  }),
  
  metadata: z.object({
    simulationMode: z.boolean().default(true),
    environment: z.string().default('test'),
    version: z.string().default('1.0'),
  }).default({}),
});

export type TestSuiteResult = z.infer<typeof TestSuiteResultSchema>;

/**
 * Predefined Disaster Scenarios
 */
export const PREDEFINED_SCENARIOS: TestScenario[] = [
  // ==================== FLOOD SCENARIOS ====================
  {
    id: 'flood-critical-001',
    name: 'Critical Flash Flood - Urban Area',
    description: 'Rapidly rising flood waters in urban area with extreme rainfall',
    category: 'positive',
    disasterType: 'flood',
    severity: 'emergency',
    baseEvent: {
      scenarioType: 'flood',
      scenarioName: 'Critical Flash Flood - Urban Area',
      location: {
        name: 'Test City Downtown',
        coordinates: [77.2090, 28.6139], // Delhi coordinates
        district: 'Central Delhi',
        state: 'Delhi',
        country: 'India',
      },
      timestamp: '2026-07-15T14:30:00Z',
      durationMinutes: 180,
      severity: 'emergency',
      confidence: 0.95,
      sensorData: {
        rainfallMmPerHour: 150,
        riverLevelMeters: 8.5,
        soilMoisturePercent: 95,
        waterLevelTrend: 'rapidly_rising',
        floodDepthMeters: 2.5,
        inundationAreaKm2: 15,
      },
      weatherConditions: {
        temperatureC: 28,
        humidityPercent: 90,
        windSpeedKmh: 25,
        precipitationMm: 150,
      },
      impactEstimate: {
        affectedPopulation: 50000,
        affectedAreaKm2: 15,
        vulnerablePopulation: 15000,
        displacedPersons: 5000,
        infrastructureDamage: 'severe',
      },
      expectedOutcome: {
        shouldTriggerAlert: true,
        expectedAlertLevel: 'emergency',
        expectedRiskCategory: 'extreme',
        shouldSendNotification: true,
        expectedNotificationChannels: ['sms', 'push', 'email', 'whatsapp', 'cell_broadcast', 'siren', 'operator_dashboard'],
        expectedMessageContains: ['flood', 'emergency', 'Test City', 'evacuate', 'higher ground'],
        expectedActions: ['issue_alert', 'dispatch_notifications', 'activate_sirens', 'cell_broadcast'],
        expectedDashboardState: { activeAlerts: 1, mapMarkers: 1 },
        expectedDatabaseRecords: 1,
        expectedEscalation: true,
      },
      metadata: {
        testCategory: 'positive',
        priority: 'critical',
        tags: ['flood', 'urban', 'flash-flood', 'critical'],
      },
    },
  },
  
  {
    id: 'flood-moderate-002',
    name: 'Moderate Riverine Flood - Rural Area',
    description: 'Gradual river flooding in rural agricultural area',
    category: 'positive',
    disasterType: 'flood',
    severity: 'warning',
    baseEvent: {
      scenarioType: 'flood',
      scenarioName: 'Moderate Riverine Flood - Rural Area',
      location: {
        name: 'Test Village River Basin',
        coordinates: [76.40, 29.80], // Haryana
        district: 'Karnal',
        state: 'Haryana',
        country: 'India',
      },
      timestamp: '2026-07-15T10:00:00Z',
      durationMinutes: 720,
      severity: 'warning',
      confidence: 0.85,
      sensorData: {
        rainfallMmPerHour: 45,
        riverLevelMeters: 5.2,
        soilMoisturePercent: 80,
        waterLevelTrend: 'rising',
        floodDepthMeters: 0.8,
        inundationAreaKm2: 8,
      },
      weatherConditions: {
        temperatureC: 30,
        humidityPercent: 85,
        windSpeedKmh: 15,
        precipitationMm: 45,
      },
      impactEstimate: {
        affectedPopulation: 8000,
        affectedAreaKm2: 8,
        vulnerablePopulation: 2000,
        infrastructureDamage: 'moderate',
      },
      expectedOutcome: {
        shouldTriggerAlert: true,
        expectedAlertLevel: 'warning',
        expectedRiskCategory: 'moderate',
        shouldSendNotification: true,
        expectedNotificationChannels: ['sms', 'push', 'email', 'operator_dashboard'],
        expectedMessageContains: ['flood', 'warning', 'Test Village', 'higher ground'],
        expectedActions: ['issue_alert', 'dispatch_notifications'],
      },
      metadata: {
        testCategory: 'positive',
        priority: 'medium',
        tags: ['flood', 'rural', 'riverine', 'moderate'],
      },
    },
  },
  
  {
    id: 'flood-boundary-003',
    name: 'Flood Threshold Boundary Test',
    description: 'Rainfall exactly at alert threshold - should trigger warning',
    category: 'boundary',
    disasterType: 'flood',
    severity: 'warning',
    baseEvent: {
      scenarioType: 'flood',
      scenarioName: 'Flood Threshold Boundary Test',
      location: {
        name: 'Boundary Test Location',
        coordinates: [77.0, 28.5],
        district: 'Test District',
        state: 'Test State',
        country: 'India',
      },
      timestamp: '2026-07-15T12:00:00Z',
      severity: 'warning',
      confidence: 0.8,
      sensorData: {
        rainfallMmPerHour: 50, // Exactly at typical warning threshold
        riverLevelMeters: 4.0, // Exactly at warning level
        waterLevelTrend: 'rising',
      },
      expectedOutcome: {
        shouldTriggerAlert: true,
        expectedAlertLevel: 'warning',
        shouldSendNotification: true,
      },
      metadata: {
        testCategory: 'boundary',
        priority: 'high',
        tags: ['flood', 'boundary', 'threshold'],
      },
    },
    variations: [
      {
        name: 'Just Below Threshold',
        description: 'Rainfall just below warning threshold - should NOT trigger',
        overrides: {
          sensorData: { rainfallMmPerHour: 49 },
        },
        expectedOutcome: {
          shouldTriggerAlert: false,
          expectedAlertLevel: 'info',
        },
      },
      {
        name: 'Just Above Threshold',
        description: 'Rainfall just above warning threshold - should trigger',
        overrides: {
          sensorData: { rainfallMmPerHour: 51 },
        },
        expectedOutcome: {
          shouldTriggerAlert: true,
          expectedAlertLevel: 'warning',
        },
      },
    ],
  },
  
  // ==================== EARTHQUAKE SCENARIOS ====================
  {
    id: 'earthquake-major-004',
    name: 'Major Earthquake M7.5 - Himalayan Region',
    description: 'Major earthquake in Himalayan region with high magnitude and shallow depth',
    category: 'positive',
    disasterType: 'earthquake',
    severity: 'emergency',
    baseEvent: {
      scenarioType: 'earthquake',
      scenarioName: 'Major Earthquake M7.5 - Himalayan Region',
      location: {
        name: 'Himalayan Test Region',
        coordinates: [79.5, 30.5], // Uttarakhand
        district: 'Chamoli',
        state: 'Uttarakhand',
        country: 'India',
      },
      timestamp: '2026-03-15T05:30:00Z',
      severity: 'emergency',
      confidence: 0.95,
      sensorData: {
        seismicMagnitude: 7.5,
        seismicIntensity: 9,
        depthKm: 15,
        pga: 0.5,
        pgv: 50,
        aftershockProbability: 0.8,
      },
      weatherConditions: {
        temperatureC: 5,
        windSpeedKmh: 10,
      },
      impactEstimate: {
        affectedPopulation: 200000,
        affectedAreaKm2: 500,
        vulnerablePopulation: 50000,
        displacedPersons: 30000,
        injuredEstimate: 10000,
        fatalitiesEstimate: 1000,
        infrastructureDamage: 'catastrophic',
      },
      expectedOutcome: {
        shouldTriggerAlert: true,
        expectedAlertLevel: 'emergency',
        expectedRiskCategory: 'extreme',
        shouldSendNotification: true,
        expectedNotificationChannels: ['sms', 'push', 'email', 'whatsapp', 'cell_broadcast', 'siren', 'radio', 'tv', 'operator_dashboard'],
        expectedMessageContains: ['earthquake', 'emergency', 'M7.5', 'Himalayan', 'aftershock', 'drop cover hold'],
        expectedActions: ['immediate_alert', 'dispatch_notifications', 'activate_sirens', 'cell_broadcast', 'broadcast_media'],
        expectedDashboardState: { activeAlerts: 1, mapMarkers: 1 },
        expectedDatabaseRecords: 1,
        expectedEscalation: true,
      },
      metadata: {
        testCategory: 'positive',
        priority: 'critical',
        tags: ['earthquake', 'major', 'himalayan', 'shallow', 'aftershock-risk'],
      },
    },
  },
  
  {
    id: 'earthquake-moderate-005',
    name: 'Moderate Earthquake M5.5 - Peninsula',
    description: 'Moderate earthquake in peninsular India region',
    category: 'positive',
    disasterType: 'earthquake',
    severity: 'alert',
    baseEvent: {
      scenarioType: 'earthquake',
      scenarioName: 'Moderate Earthquake M5.5 - Peninsula',
      location: {
        name: 'Deccan Plateau Test',
        coordinates: [76.5, 18.5], // Maharashtra
        district: 'Latur',
        state: 'Maharashtra',
        country: 'India',
      },
      timestamp: '2026-09-30T03:15:00Z',
      severity: 'alert',
      confidence: 0.9,
      sensorData: {
        seismicMagnitude: 5.5,
        seismicIntensity: 6,
        depthKm: 10,
        pga: 0.15,
        pgv: 15,
        aftershockProbability: 0.4,
      },
      impactEstimate: {
        affectedPopulation: 50000,
        affectedAreaKm2: 100,
        infrastructureDamage: 'moderate',
      },
      expectedOutcome: {
        shouldTriggerAlert: true,
        expectedAlertLevel: 'alert',
        expectedRiskCategory: 'high',
        shouldSendNotification: true,
        expectedNotificationChannels: ['sms', 'push', 'email', 'operator_dashboard'],
        expectedMessageContains: ['earthquake', 'alert', 'M5.5', 'aftershock'],
        expectedActions: ['issue_alert', 'dispatch_notifications'],
      },
      metadata: {
        testCategory: 'positive',
        priority: 'high',
        tags: ['earthquake', 'moderate', 'peninsula'],
      },
    },
  },
  
  {
    id: 'earthquake-tsunami-006',
    name: 'Undersea Earthquake M8.0 with Tsunami Risk',
    description: 'Major undersea earthquake in Indian Ocean with tsunami potential',
    category: 'positive',
    disasterType: 'earthquake',
    severity: 'emergency',
    baseEvent: {
      scenarioType: 'earthquake',
      scenarioName: 'Undersea Earthquake M8.0 with Tsunami Risk',
      location: {
        name: 'Andaman Sea Test',
        coordinates: [92.5, 10.5], // Andaman Sea
        district: 'Port Blair',
        state: 'Andaman and Nicobar Islands',
        country: 'India',
      },
      timestamp: '2026-12-26T00:58:00Z',
      severity: 'emergency',
      confidence: 0.95,
      sensorData: {
        seismicMagnitude: 8.0,
        seismicIntensity: 10,
        depthKm: 25,
        pga: 0.8,
        pgv: 80,
        aftershockProbability: 0.9,
      },
      weatherConditions: {
        temperatureC: 28,
        windSpeedKmh: 20,
      },
      impactEstimate: {
        affectedPopulation: 500000,
        affectedAreaKm2: 2000,
        vulnerablePopulation: 150000,
        displacedPersons: 100000,
        infrastructureDamage: 'catastrophic',
      },
      expectedOutcome: {
        shouldTriggerAlert: true,
        expectedAlertLevel: 'emergency',
        expectedRiskCategory: 'extreme',
        shouldSendNotification: true,
        expectedNotificationChannels: ['sms', 'push', 'email', 'whatsapp', 'cell_broadcast', 'siren', 'radio', 'tv', 'operator_dashboard'],
        expectedMessageContains: ['earthquake', 'tsunami', 'emergency', 'M8.0', 'high ground', 'evacuate'],
        expectedActions: ['immediate_alert', 'dispatch_notifications', 'activate_sirens', 'cell_broadcast', 'broadcast_media', 'tsunami_warning'],
        expectedDashboardState: { activeAlerts: 2, mapMarkers: 2 }, // Earthquake + Tsunami
        expectedDatabaseRecords: 2,
        expectedEscalation: true,
      },
      metadata: {
        testCategory: 'positive',
        priority: 'critical',
        tags: ['earthquake', 'tsunami', 'undersea', 'major', 'multi-hazard'],
      },
    },
  },
  
  // ==================== LANDSLIDE SCENARIOS ====================
  {
    id: 'landslide-critical-007',
    name: 'Catastrophic Landslide - Hill Station',
    description: 'Large landslide triggered by extreme rainfall in hill station area',
    category: 'positive',
    disasterType: 'landslide',
    severity: 'emergency',
    baseEvent: {
      scenarioType: 'landslide',
      scenarioName: 'Catastrophic Landslide - Hill Station',
      location: {
        name: 'Test Hill Station',
        coordinates: [77.2, 30.5], // Himachal Pradesh
        district: 'Shimla',
        state: 'Himachal Pradesh',
        country: 'India',
      },
      timestamp: '2026-08-15T22:00:00Z',
      durationMinutes: 60,
      severity: 'emergency',
      confidence: 0.9,
      sensorData: {
        groundMovementMm: 500,
        slopeAngleDegrees: 45,
        soilSaturationPercent: 98,
        crackWidthMm: 50,
        rainfallMmPerHour: 120,
      },
      weatherConditions: {
        temperatureC: 15,
        humidityPercent: 95,
        windSpeedKmh: 10,
        precipitationMm: 120,
      },
      impactEstimate: {
        affectedPopulation: 2000,
        affectedAreaKm2: 2,
        vulnerablePopulation: 500,
        displacedPersons: 300,
        injuredEstimate: 50,
        fatalitiesEstimate: 10,
        infrastructureDamage: 'severe',
      },
      expectedOutcome: {
        shouldTriggerAlert: true,
        expectedAlertLevel: 'emergency',
        expectedRiskCategory: 'extreme',
        shouldSendNotification: true,
        expectedNotificationChannels: ['sms', 'push', 'email', 'whatsapp', 'siren', 'operator_dashboard'],
        expectedMessageContains: ['landslide', 'emergency', 'Test Hill Station', 'evacuate', 'move away'],
        expectedActions: ['immediate_alert', 'dispatch_notifications', 'activate_sirens'],
      },
      metadata: {
        testCategory: 'positive',
        priority: 'critical',
        tags: ['landslide', 'rainfall-triggered', 'hill-station', 'night-time'],
      },
    },
  },
  
  // ==================== CYCLONE SCENARIOS ====================
  {
    id: 'cyclone-severe-008',
    name: 'Severe Cyclone Category 4 - East Coast',
    description: 'Severe cyclonic storm approaching east coast with high winds and storm surge',
    category: 'positive',
    disasterType: 'cyclone',
    severity: 'emergency',
    baseEvent: {
      scenarioType: 'cyclone',
      scenarioName: 'Severe Cyclone Category 4 - East Coast',
      location: {
        name: 'Odisha Coast Test',
        coordinates: [85.5, 19.5], // Odisha coast
        district: 'Puri',
        state: 'Odisha',
        country: 'India',
      },
      timestamp: '2026-10-15T12:00:00Z',
      durationMinutes: 2880, // 48 hours
      severity: 'emergency',
      confidence: 0.92,
      sensorData: {
        windSpeedKmh: 210,
        windGustKmh: 260,
        centralPressureHpa: 930,
        stormCategory: 4,
        stormSurgeMeters: 4,
        landfallTime: '2026-10-16T06:00:00Z',
      },
      weatherConditions: {
        temperatureC: 29,
        humidityPercent: 90,
        windSpeedKmh: 210,
        windDirectionDegrees: 225,
        pressureHpa: 930,
        cloudCoverPercent: 100,
        precipitationMm: 300,
      },
      impactEstimate: {
        affectedPopulation: 1000000,
        affectedAreaKm2: 5000,
        vulnerablePopulation: 300000,
        displacedPersons: 200000,
        infrastructureDamage: 'catastrophic',
      },
      expectedOutcome: {
        shouldTriggerAlert: true,
        expectedAlertLevel: 'emergency',
        expectedRiskCategory: 'extreme',
        shouldSendNotification: true,
        expectedNotificationChannels: ['sms', 'push', 'email', 'whatsapp', 'cell_broadcast', 'siren', 'radio', 'tv', 'operator_dashboard'],
        expectedMessageContains: ['cyclone', 'emergency', 'category 4', 'Odisha', 'evacuate', 'storm surge', '210 km/h'],
        expectedActions: ['immediate_alert', 'dispatch_notifications', 'activate_sirens', 'cell_broadcast', 'broadcast_media', 'evacuation_order'],
        expectedDashboardState: { activeAlerts: 1, mapMarkers: 1 },
        expectedDatabaseRecords: 1,
        expectedEscalation: true,
      },
      metadata: {
        testCategory: 'positive',
        priority: 'critical',
        tags: ['cyclone', 'category-4', 'east-coast', 'storm-surge', 'landfall'],
      },
    },
  },
  
  // ==================== WILDFIRE SCENARIOS ====================
  {
    id: 'wildfire-large-009',
    name: 'Large Wildfire - Forest Area',
    description: 'Large wildfire spreading in forest area with dry conditions',
    category: 'positive',
    disasterType: 'wildfire',
    severity: 'alert',
    baseEvent: {
      scenarioType: 'wildfire',
      scenarioName: 'Large Wildfire - Forest Area',
      location: {
        name: 'Test Forest Reserve',
        coordinates: [78.5, 22.5], // Madhya Pradesh
        district: 'Seoni',
        state: 'Madhya Pradesh',
        country: 'India',
      },
      timestamp: '2026-04-15T14:00:00Z',
      durationMinutes: 4320, // 72 hours
      severity: 'alert',
      confidence: 0.85,
      sensorData: {
        fireAreaHectares: 500,
        firePerimeterKm: 40,
        fireTemperatureC: 800,
        smokeDensity: 0.8,
        fuelMoisturePercent: 10,
        rateOfSpreadKmh: 2,
      },
      weatherConditions: {
        temperatureC: 42,
        humidityPercent: 15,
        windSpeedKmh: 25,
        windDirectionDegrees: 270,
        precipitationMm: 0,
      },
      impactEstimate: {
        affectedPopulation: 5000,
        affectedAreaKm2: 50,
        vulnerablePopulation: 1000,
        displacedPersons: 200,
        infrastructureDamage: 'moderate',
      },
      expectedOutcome: {
        shouldTriggerAlert: true,
        expectedAlertLevel: 'alert',
        expectedRiskCategory: 'high',
        shouldSendNotification: true,
        expectedNotificationChannels: ['sms', 'push', 'email', 'operator_dashboard'],
        expectedMessageContains: ['wildfire', 'alert', 'Test Forest', 'evacuate', 'smoke', 'cover nose'],
        expectedActions: ['issue_alert', 'dispatch_notifications', 'evacuation_advisory'],
      },
      metadata: {
        testCategory: 'positive',
        priority: 'high',
        tags: ['wildfire', 'forest', 'dry-season', 'fast-spreading'],
      },
    },
  },
  
  // ==================== HEATWAVE SCENARIOS ====================
  {
    id: 'heatwave-extreme-010',
    name: 'Extreme Heatwave - North India',
    description: 'Extreme heatwave with temperatures exceeding 47°C',
    category: 'positive',
    disasterType: 'heatwave',
    severity: 'emergency',
    baseEvent: {
      scenarioType: 'heatwave',
      scenarioName: 'Extreme Heatwave - North India',
      location: {
        name: 'Rajasthan Desert Test',
        coordinates: [74.5, 26.5], // Rajasthan
        district: 'Jaisalmer',
        state: 'Rajasthan',
        country: 'India',
      },
      timestamp: '2026-05-20T12:00:00Z',
      durationMinutes: 10080, // 7 days
      severity: 'emergency',
      confidence: 0.9,
      sensorData: {
        temperatureC: 48,
        heatIndexC: 52,
        humidityPercent: 20,
        consecutiveDaysAboveThreshold: 5,
      },
      weatherConditions: {
        temperatureC: 48,
        humidityPercent: 20,
        windSpeedKmh: 15,
        cloudCoverPercent: 0,
      },
      impactEstimate: {
        affectedPopulation: 500000,
        affectedAreaKm2: 10000,
        vulnerablePopulation: 100000,
        infrastructureDamage: 'none',
      },
      expectedOutcome: {
        shouldTriggerAlert: true,
        expectedAlertLevel: 'emergency',
        expectedRiskCategory: 'extreme',
        shouldSendNotification: true,
        expectedNotificationChannels: ['sms', 'push', 'email', 'radio', 'tv', 'operator_dashboard'],
        expectedMessageContains: ['heatwave', 'emergency', '48°C', 'stay indoors', 'hydration', 'vulnerable'],
        expectedActions: ['issue_alert', 'dispatch_notifications', 'health_advisory'],
      },
      metadata: {
        testCategory: 'positive',
        priority: 'critical',
        tags: ['heatwave', 'extreme', 'desert', 'prolonged'],
      },
    },
  },
  
  // ==================== DROUGHT SCENARIOS ====================
  {
    id: 'drought-severe-011',
    name: 'Severe Meteorological Drought',
    description: 'Prolonged rainfall deficit leading to severe drought conditions',
    category: 'positive',
    disasterType: 'drought',
    severity: 'alert',
    baseEvent: {
      scenarioType: 'drought',
      scenarioName: 'Severe Meteorological Drought',
      location: {
        name: 'Marathwada Region Test',
        coordinates: [76.5, 18.5], // Maharashtra
        district: 'Beed',
        state: 'Maharashtra',
        country: 'India',
      },
      timestamp: '2026-09-01T00:00:00Z',
      durationMinutes: 43200, // 30 days
      severity: 'alert',
      confidence: 0.8,
      sensorData: {
        droughtIndex: 0.85,
        rainfallMmPerHour: 0,
        soilMoisturePercent: 15,
        temperatureC: 38,
      },
      weatherConditions: {
        temperatureC: 38,
        humidityPercent: 30,
        precipitationMm: 0,
        cloudCoverPercent: 10,
      },
      impactEstimate: {
        affectedPopulation: 2000000,
        affectedAreaKm2: 25000,
        vulnerablePopulation: 500000,
        economicLossUsd: 1000000000,
        infrastructureDamage: 'none',
      },
      expectedOutcome: {
        shouldTriggerAlert: true,
        expectedAlertLevel: 'alert',
        expectedRiskCategory: 'high',
        shouldSendNotification: true,
        expectedNotificationChannels: ['sms', 'push', 'email', 'radio', 'operator_dashboard'],
        expectedMessageContains: ['drought', 'alert', 'water conservation', 'rationing', 'agriculture'],
        expectedActions: ['issue_alert', 'dispatch_notifications', 'water_advisory'],
      },
      metadata: {
        testCategory: 'positive',
        priority: 'high',
        tags: ['drought', 'prolonged', 'agricultural', 'water-scarcity'],
      },
    },
  },
  
  // ==================== TSUNAMI SCENARIOS ====================
  {
    id: 'tsunami-warning-012',
    name: 'Tsunami Warning - Indian Ocean',
    description: 'Tsunami warning following undersea earthquake',
    category: 'positive',
    disasterType: 'tsunami',
    severity: 'emergency',
    baseEvent: {
      scenarioType: 'tsunami',
      scenarioName: 'Tsunami Warning - Indian Ocean',
      location: {
        name: 'Tamil Nadu Coast Test',
        coordinates: [80.5, 11.0], // Tamil Nadu coast
        district: 'Nagapattinam',
        state: 'Tamil Nadu',
        country: 'India',
      },
      timestamp: '2026-12-26T01:30:00Z',
      durationMinutes: 360,
      severity: 'emergency',
      confidence: 0.9,
      sensorData: {
        waveHeightMeters: 3,
        waveArrivalTime: '2026-12-26T02:15:00Z',
        tsunamiTravelTimeMinutes: 45,
        seismicMagnitude: 8.0,
      },
      weatherConditions: {
        temperatureC: 28,
        windSpeedKmh: 15,
      },
      impactEstimate: {
        affectedPopulation: 500000,
        affectedAreaKm2: 500,
        vulnerablePopulation: 150000,
        displacedPersons: 50000,
        infrastructureDamage: 'severe',
      },
      expectedOutcome: {
        shouldTriggerAlert: true,
        expectedAlertLevel: 'emergency',
        expectedRiskCategory: 'extreme',
        shouldSendNotification: true,
        expectedNotificationChannels: ['sms', 'push', 'email', 'whatsapp', 'cell_broadcast', 'siren', 'radio', 'tv', 'operator_dashboard'],
        expectedMessageContains: ['tsunami', 'emergency', 'high ground', 'evacuate immediately', 'wave', '3 meter'],
        expectedActions: ['immediate_alert', 'dispatch_notifications', 'activate_sirens', 'cell_broadcast', 'broadcast_media', 'evacuation_order'],
      },
      metadata: {
        testCategory: 'positive',
        priority: 'critical',
        tags: ['tsunami', 'indian-ocean', 'earthquake-triggered', 'coastal'],
      },
    },
  },
  
  // ==================== MULTI-HAZARD SCENARIOS ====================
  {
    id: 'multi-hazard-rainfall-landslide-013',
    name: 'Heavy Rainfall Triggering Landslide',
    description: 'Multi-hazard: Extreme rainfall followed by landslide in hilly area',
    category: 'multi_event',
    disasterType: 'flood', // Primary
    severity: 'emergency',
    baseEvent: {
      scenarioType: 'flood',
      scenarioName: 'Heavy Rainfall Triggering Landslide',
      location: {
        name: 'Western Ghats Test',
        coordinates: [75.5, 15.5], // Karnataka
        district: 'Kodagu',
        state: 'Karnataka',
        country: 'India',
      },
      timestamp: '2026-07-20T18:00:00Z',
      severity: 'emergency',
      confidence: 0.88,
      sensorData: {
        rainfallMmPerHour: 200,
        soilMoisturePercent: 99,
        groundMovementMm: 100,
        slopeAngleDegrees: 40,
      },
      expectedOutcome: {
        shouldTriggerAlert: true,
        expectedAlertLevel: 'emergency',
        expectedRiskCategory: 'extreme',
        shouldSendNotification: true,
        expectedNotificationChannels: ['sms', 'push', 'email', 'whatsapp', 'siren', 'operator_dashboard'],
      },
      metadata: {
        testCategory: 'multi_event',
        priority: 'critical',
        tags: ['multi-hazard', 'rainfall', 'landslide', 'western-ghats', 'compound'],
      },
    },
    sequence: [
      {
        scenarioType: 'flood',
        scenarioName: 'Initial Extreme Rainfall',
        timestamp: '2026-07-20T18:00:00Z',
        severity: 'alert',
        sensorData: { rainfallMmPerHour: 150, soilMoisturePercent: 95 },
        expectedOutcome: { shouldTriggerAlert: true, expectedAlertLevel: 'alert' },
      },
      {
        scenarioType: 'landslide',
        scenarioName: 'Subsequent Landslide',
        timestamp: '2026-07-20T20:30:00Z',
        severity: 'emergency',
        sensorData: { groundMovementMm: 500, soilSaturationPercent: 99 },
        expectedOutcome: { shouldTriggerAlert: true, expectedAlertLevel: 'emergency', expectedEscalation: true },
      },
    ],
  },
  
  {
    id: 'multi-hazard-earthquake-tsunami-014',
    name: 'Earthquake Followed by Tsunami',
    description: 'Undersea earthquake triggering tsunami warning',
    category: 'multi_event',
    disasterType: 'earthquake',
    severity: 'emergency',
    baseEvent: {
      scenarioType: 'earthquake',
      scenarioName: 'Earthquake Followed by Tsunami',
      location: {
        name: 'Andaman Sea Test',
        coordinates: [92.5, 10.5],
        district: 'Port Blair',
        state: 'Andaman and Nicobar Islands',
        country: 'India',
      },
      timestamp: '2026-12-26T00:58:00Z',
      severity: 'emergency',
      confidence: 0.95,
      sensorData: {
        seismicMagnitude: 7.8,
        depthKm: 20,
        pga: 0.6,
      },
      expectedOutcome: {
        shouldTriggerAlert: true,
        expectedAlertLevel: 'emergency',
        expectedEscalation: true,
      },
      metadata: {
        testCategory: 'multi_event',
        priority: 'critical',
        tags: ['multi-hazard', 'earthquake', 'tsunami', 'cascading'],
      },
    },
    sequence: [
      {
        scenarioType: 'earthquake',
        scenarioName: 'Main Shock',
        timestamp: '2026-12-26T00:58:00Z',
        severity: 'emergency',
        sensorData: { seismicMagnitude: 7.8, depthKm: 20 },
        expectedOutcome: { shouldTriggerAlert: true, expectedAlertLevel: 'emergency' },
      },
      {
        scenarioType: 'tsunami',
        scenarioName: 'Tsunami Warning',
        timestamp: '2026-12-26T01:15:00Z',
        severity: 'emergency',
        sensorData: { waveHeightMeters: 4, tsunamiTravelTimeMinutes: 30 },
        expectedOutcome: { shouldTriggerAlert: true, expectedAlertLevel: 'emergency', expectedEscalation: true },
      },
    ],
  },
  
  // ==================== NEGATIVE TEST SCENARIOS ====================
  {
    id: 'negative-missing-fields-015',
    name: 'Missing Required Fields',
    description: 'Event with missing required fields should be rejected',
    category: 'negative',
    disasterType: 'flood',
    severity: 'info',
    baseEvent: {
      scenarioType: 'flood',
      scenarioName: 'Missing Required Fields',
      location: {
        name: 'Test Location',
        coordinates: [77.0, 28.0],
        district: 'Test',
        state: 'Test',
        country: 'India',
      },
      timestamp: '2026-01-01T12:00:00Z',
      severity: 'info',
      // Missing sensorData, expectedOutcome
    },
    expectedOutcome: {
      shouldTriggerAlert: false,
    },
    metadata: {
      testCategory: 'negative',
      priority: 'medium',
      tags: ['negative', 'validation', 'missing-fields'],
    },
  },
  
  {
    id: 'negative-invalid-coordinates-016',
    name: 'Invalid Coordinates',
    description: 'Event with impossible coordinates (lat > 90, lon > 180)',
    category: 'negative',
    disasterType: 'earthquake',
    severity: 'info',
    baseEvent: {
      scenarioType: 'earthquake',
      scenarioName: 'Invalid Coordinates',
      location: {
        name: 'Invalid Location',
        coordinates: [200, 100], // Impossible coordinates
        district: 'Test',
        state: 'Test',
        country: 'India',
      },
      timestamp: '2026-01-01T12:00:00Z',
      severity: 'info',
      sensorData: {
        seismicMagnitude: 5.0,
      },
    },
    expectedOutcome: {
      shouldTriggerAlert: false,
    },
    metadata: {
      testCategory: 'negative',
      priority: 'medium',
      tags: ['negative', 'validation', 'invalid-coordinates'],
    },
  },
  
  {
    id: 'negative-negative-values-017',
    name: 'Negative Sensor Values',
    description: 'Event with negative values where not allowed',
    category: 'negative',
    disasterType: 'flood',
    severity: 'info',
    baseEvent: {
      scenarioType: 'flood',
      scenarioName: 'Negative Sensor Values',
      location: {
        name: 'Test Location',
        coordinates: [77.0, 28.0],
        district: 'Test',
        state: 'Test',
        country: 'India',
      },
      timestamp: '2026-01-01T12:00:00Z',
      severity: 'info',
      sensorData: {
        rainfallMmPerHour: -50, // Invalid
        riverLevelMeters: -2,   // Invalid
        soilMoisturePercent: -10, // Invalid
      },
    },
    expectedOutcome: {
      shouldTriggerAlert: false,
    },
    metadata: {
      testCategory: 'negative',
      priority: 'medium',
      tags: ['negative', 'validation', 'negative-values'],
    },
  },
  
  {
    id: 'negative-future-timestamp-018',
    name: 'Future Timestamp',
    description: 'Event with timestamp far in the future',
    category: 'negative',
    disasterType: 'cyclone',
    severity: 'info',
    baseEvent: {
      scenarioType: 'cyclone',
      scenarioName: 'Future Timestamp',
      location: {
        name: 'Test Location',
        coordinates: [77.0, 28.0],
        district: 'Test',
        state: 'Test',
        country: 'India',
      },
      timestamp: '2099-01-01T12:00:00Z', // Far future
      severity: 'info',
      sensorData: {
        windSpeedKmh: 100,
      },
    },
    expectedOutcome: {
      shouldTriggerAlert: false,
    },
    metadata: {
      testCategory: 'negative',
      priority: 'medium',
      tags: ['negative', 'validation', 'future-timestamp'],
    },
  },
  
  {
    id: 'negative-unknown-disaster-type-019',
    name: 'Unknown Disaster Type',
    description: 'Event with unsupported disaster type',
    category: 'negative',
    disasterType: 'flood', // Valid type for schema, but will test unknown handling
    severity: 'info',
    baseEvent: {
      scenarioType: 'unknown_hazard' as any, // Intentionally invalid
      scenarioName: 'Unknown Disaster Type',
      location: {
        name: 'Test Location',
        coordinates: [77.0, 28.0],
        district: 'Test',
        state: 'Test',
        country: 'India',
      },
      timestamp: '2026-01-01T12:00:00Z',
      severity: 'info',
    },
    expectedOutcome: {
      shouldTriggerAlert: false,
    },
    metadata: {
      testCategory: 'negative',
      priority: 'medium',
      tags: ['negative', 'validation', 'unknown-type'],
    },
  },
  
  {
    id: 'negative-duplicate-event-020',
    name: 'Duplicate Event ID',
    description: 'Two events with same deduplication key',
    category: 'negative',
    disasterType: 'earthquake',
    severity: 'warning',
    baseEvent: {
      scenarioType: 'earthquake',
      scenarioName: 'Duplicate Event - First',
      location: {
        name: 'Test Location',
        coordinates: [77.0, 28.0],
        district: 'Test',
        state: 'Test',
        country: 'India',
      },
      timestamp: '2026-01-01T12:00:00Z',
      severity: 'warning',
      sensorData: {
        seismicMagnitude: 5.5,
      },
      expectedOutcome: {
        shouldTriggerAlert: true,
        expectedAlertLevel: 'warning',
      },
      metadata: {
        testCategory: 'negative',
        priority: 'medium',
        tags: ['negative', 'deduplication', 'duplicate'],
      },
    },
  },
  
  // ==================== RELIABILITY SCENARIOS ====================
  {
    id: 'reliability-network-failure-021',
    name: 'Network Failure During Processing',
    description: 'Simulate network failure during event processing',
    category: 'reliability',
    disasterType: 'flood',
    severity: 'alert',
    baseEvent: {
      scenarioType: 'flood',
      scenarioName: 'Network Failure During Processing',
      location: {
        name: 'Test Location',
        coordinates: [77.0, 28.0],
        district: 'Test',
        state: 'Test',
        country: 'India',
      },
      timestamp: '2026-01-01T12:00:00Z',
      severity: 'alert',
      sensorData: {
        rainfallMmPerHour: 80,
      },
      expectedOutcome: {
        shouldTriggerAlert: true,
        expectedAlertLevel: 'alert',
      },
      metadata: {
        testCategory: 'reliability',
        priority: 'high',
        tags: ['reliability', 'network-failure', 'resilience'],
      },
    },
  },
  
  {
    id: 'reliability-offline-mode-022',
    name: 'Offline Mode Operation',
    description: 'System operating in offline mode with local processing only',
    category: 'reliability',
    disasterType: 'earthquake',
    severity: 'alert',
    baseEvent: {
      scenarioType: 'earthquake',
      scenarioName: 'Offline Mode Operation',
      location: {
        name: 'Remote Test Location',
        coordinates: [78.0, 30.0],
        district: 'Remote',
        state: 'Uttarakhand',
        country: 'India',
      },
      timestamp: '2026-01-01T12:00:00Z',
      severity: 'alert',
      sensorData: {
        seismicMagnitude: 6.0,
      },
      expectedOutcome: {
        shouldTriggerAlert: true,
        expectedAlertLevel: 'alert',
      },
      metadata: {
        testCategory: 'reliability',
        priority: 'high',
        tags: ['reliability', 'offline', 'local-processing'],
      },
    },
  },
  
  // ==================== NO-RISK / NORMAL CONDITIONS ====================
  {
    id: 'normal-conditions-023',
    name: 'Normal Conditions - No Hazard',
    description: 'Baseline normal conditions with no hazard indicators',
    category: 'positive',
    disasterType: 'flood', // Type doesn't matter for normal
    severity: 'info',
    baseEvent: {
      scenarioType: 'flood',
      scenarioName: 'Normal Conditions - No Hazard',
      location: {
        name: 'Normal Test Location',
        coordinates: [77.0, 28.0],
        district: 'Test',
        state: 'Test',
        country: 'India',
      },
      timestamp: '2026-01-01T12:00:00Z',
      severity: 'info',
      confidence: 0.99,
      sensorData: {
        rainfallMmPerHour: 0,
        riverLevelMeters: 1.0,
        soilMoisturePercent: 40,
        waterLevelTrend: 'stable',
      },
      weatherConditions: {
        temperatureC: 25,
        humidityPercent: 60,
        windSpeedKmh: 10,
        precipitationMm: 0,
      },
      expectedOutcome: {
        shouldTriggerAlert: false,
        expectedAlertLevel: 'info',
        shouldSendNotification: false,
      },
      metadata: {
        testCategory: 'positive',
        priority: 'low',
        tags: ['normal', 'baseline', 'no-hazard', 'safe-conditions'],
      },
    },
  },
  
  {
    id: 'normal-low-rainfall-024',
    name: 'Light Rainfall - Below Threshold',
    description: 'Light rainfall well below flood thresholds',
    category: 'positive',
    disasterType: 'flood',
    severity: 'info',
    baseEvent: {
      scenarioType: 'flood',
      scenarioName: 'Light Rainfall - Below Threshold',
      location: {
        name: 'Light Rain Test',
        coordinates: [77.0, 28.0],
        district: 'Test',
        state: 'Test',
        country: 'India',
      },
      timestamp: '2026-07-01T12:00:00Z',
      severity: 'info',
      confidence: 0.9,
      sensorData: {
        rainfallMmPerHour: 5, // Well below threshold
        riverLevelMeters: 2.0,
        soilMoisturePercent: 50,
        waterLevelTrend: 'stable',
      },
      expectedOutcome: {
        shouldTriggerAlert: false,
        expectedAlertLevel: 'info',
        shouldSendNotification: false,
      },
      metadata: {
        testCategory: 'positive',
        priority: 'low',
        tags: ['normal', 'light-rain', 'below-threshold'],
      },
    },
  },
  
  // ==================== RECOVERY SCENARIOS ====================
  {
    id: 'recovery-flood-receding-025',
    name: 'Flood Waters Receding - Recovery',
    description: 'Flood event transitioning to recovery phase',
    category: 'positive',
    disasterType: 'flood',
    severity: 'warning', // Downgraded from emergency
    baseEvent: {
      scenarioType: 'flood',
      scenarioName: 'Flood Waters Receding - Recovery',
      location: {
        name: 'Recovery Test Location',
        coordinates: [77.0, 28.0],
        district: 'Test',
        state: 'Test',
        country: 'India',
      },
      timestamp: '2026-07-20T12:00:00Z',
      severity: 'warning',
      confidence: 0.85,
      sensorData: {
        rainfallMmPerHour: 5,
        riverLevelMeters: 3.5, // Dropping from 8.5
        soilMoisturePercent: 70,
        waterLevelTrend: 'falling',
        floodDepthMeters: 0.5, // Decreasing
      },
      expectedOutcome: {
        shouldTriggerAlert: true,
        expectedAlertLevel: 'warning', // Downgraded
        shouldSendNotification: true,
        expectedRecoveryBehavior: 'alert_downgrade',
      },
      metadata: {
        testCategory: 'positive',
        priority: 'medium',
        tags: ['recovery', 'flood', 'receding', 'downgrade'],
      },
    },
  },
  
  {
    id: 'recovery-alert-cancelled-026',
    name: 'Alert Cancellation - Hazard Resolved',
    description: 'Complete resolution and alert cancellation',
    category: 'positive',
    disasterType: 'cyclone',
    severity: 'info',
    baseEvent: {
      scenarioType: 'cyclone',
      scenarioName: 'Alert Cancellation - Cyclone Dissipated',
      location: {
        name: 'Cyclone Dissipation Test',
        coordinates: [85.0, 19.0],
        district: 'Test',
        state: 'Odisha',
        country: 'India',
      },
      timestamp: '2026-10-18T06:00:00Z', // After landfall
      severity: 'info',
      confidence: 0.95,
      sensorData: {
        windSpeedKmh: 30, // Well below threshold
        centralPressureHpa: 1005,
        stormCategory: 0,
      },
      expectedOutcome: {
        shouldTriggerAlert: false,
        expectedAlertLevel: 'info',
        shouldSendNotification: true, // Cancellation notice
        expectedRecoveryBehavior: 'alert_cancelled',
      },
      metadata: {
        testCategory: 'positive',
        priority: 'medium',
        tags: ['recovery', 'cancellation', 'cyclone', 'dissipated'],
      },
    },
  },
  
  // ==================== RAPID ESCALATION ====================
  {
    id: 'escalation-rapid-027',
    name: 'Rapid Escalation - Warning to Emergency',
    description: 'Conditions rapidly worsening from warning to emergency in short time',
    category: 'multi_event',
    disasterType: 'flood',
    severity: 'emergency',
    baseEvent: {
      scenarioType: 'flood',
      scenarioName: 'Rapid Escalation - Warning to Emergency',
      location: {
        name: 'Rapid Escalation Test',
        coordinates: [77.0, 28.0],
        district: 'Test',
        state: 'Test',
        country: 'India',
      },
      timestamp: '2026-07-15T10:00:00Z',
      severity: 'emergency',
      confidence: 0.9,
      sensorData: {
        rainfallMmPerHour: 200,
        riverLevelMeters: 9.0,
        waterLevelTrend: 'rapidly_rising',
      },
      expectedOutcome: {
        shouldTriggerAlert: true,
        expectedAlertLevel: 'emergency',
        expectedEscalation: true,
      },
      metadata: {
        testCategory: 'multi_event',
        priority: 'critical',
        tags: ['escalation', 'rapid', 'warning-to-emergency'],
      },
    },
    sequence: [
      {
        scenarioType: 'flood',
        scenarioName: 'Initial Warning Level',
        timestamp: '2026-07-15T10:00:00Z',
        severity: 'warning',
        sensorData: { rainfallMmPerHour: 60, riverLevelMeters: 5.0, waterLevelTrend: 'rising' },
        expectedOutcome: { shouldTriggerAlert: true, expectedAlertLevel: 'warning' },
      },
      {
        scenarioType: 'flood',
        scenarioName: 'Rapid Escalation to Alert',
        timestamp: '2026-07-15T10:30:00Z',
        severity: 'alert',
        sensorData: { rainfallMmPerHour: 120, riverLevelMeters: 7.0, waterLevelTrend: 'rapidly_rising' },
        expectedOutcome: { shouldTriggerAlert: true, expectedAlertLevel: 'alert', expectedEscalation: true },
      },
      {
        scenarioType: 'flood',
        scenarioName: 'Emergency Level',
        timestamp: '2026-07-15T11:00:00Z',
        severity: 'emergency',
        sensorData: { rainfallMmPerHour: 200, riverLevelMeters: 9.0, waterLevelTrend: 'rapidly_rising' },
        expectedOutcome: { shouldTriggerAlert: true, expectedAlertLevel: 'emergency', expectedEscalation: true },
      },
    ],
  },
];

/**
 * Export all schemas and types
 */
export const SimulationSchemas = {
  SyntheticEvent: SyntheticEventSchema,
  TestScenario: TestScenarioSchema,
  SimulationCommand: SimulationCommandSchema,
  SimulationState: SimulationStateSchema,
  SimulationConfig: SimulationConfigSchema,
  TestResult: TestResultSchema,
  TestSuiteResult: TestSuiteResultSchema,
};

export type {
  SyntheticEvent,
  TestScenario,
  SimulationCommand,
  SimulationState,
  SimulationConfig,
  TestResult,
  TestSuiteResult,
};

export { SIMULATION_MODE, SIMULATION_LABEL, PREDEFINED_SCENARIOS };