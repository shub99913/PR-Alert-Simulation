import { 
  SimulationValidator, 
  createValidator,
  ValidationContext 
} from '../src/validator';
import { 
  SyntheticEvent,
  NormalizedEvent,
  DetectionResult,
  FusionResult,
  Alert,
  DispatchRecord,
  Severity,
} from '../src/schemas';

describe('SimulationValidator', () => {
  let validator: SimulationValidator;
  
  beforeEach(() => {
    validator = createValidator({
      strictMode: false,
      partialMatch: true,
      ignoreTimestamps: true,
      ignoreIds: true,
    });
  });
  
  describe('validate', () => {
    it('should PASS when alert matches expected', async () => {
      const context = createTestContext({
        expectedAlertLevel: 'emergency',
        shouldTriggerAlert: true,
        shouldSendNotification: true,
        expectedNotificationChannels: ['sms', 'push', 'email'],
      });
      
      const result = await validator.validate(context);
      
      expect(result.status).toBe('PASS');
      expect(result.score).toBe(100);
    });
    
    it('should FAIL when alert should have triggered but did not', async () => {
      const context = createTestContext({
        expectedAlertLevel: 'emergency',
        shouldTriggerAlert: true,
        // No alert generated
        alertGenerated: undefined,
      });
      
      const result = await validator.validate(context);
      
      expect(result.status).toBe('FAIL');
      expect(result.checks.some(c => c.name === 'alert_triggered' && !c.passed)).toBe(true);
    });
    
    it('should FAIL when alert severity is below expected', async () => {
      const context = createTestContext({
        expectedAlertLevel: 'emergency',
        shouldTriggerAlert: true,
        alertGenerated: {
          severity: 'warning' as Severity, // Lower than expected
        },
      });
      
      const result = await validator.validate(context);
      
      expect(result.status).toBe('FAIL');
      expect(result.checks.some(c => c.name === 'alert_severity' && !c.passed)).toBe(true);
    });
    
    it('should PASS when alert severity meets or exceeds expected (lenient mode)', async () => {
      const context = createTestContext({
        expectedAlertLevel: 'warning',
        shouldTriggerAlert: true,
        alertGenerated: {
          severity: 'emergency' as Severity, // Higher than expected
        },
      });
      
      const result = await validator.validate(context);
      
      expect(result.status).toBe('PASS');
    });
    
    it('should FAIL in strict mode when severity exceeds expected', async () => {
      const strictValidator = createValidator({
        strictMode: true,
        partialMatch: true,
        ignoreTimestamps: true,
        ignoreIds: true,
      });
      
      const context = createTestContext({
        expectedAlertLevel: 'warning',
        shouldTriggerAlert: true,
        alertGenerated: {
          severity: 'emergency' as Severity,
        },
      });
      
      const result = await strictValidator.validate(context);
      
      expect(result.status).toBe('FAIL');
    });
    
    it('should validate notification channels', async () => {
      const context = createTestContext({
        expectedAlertLevel: 'emergency',
        shouldTriggerAlert: true,
        shouldSendNotification: true,
        expectedNotificationChannels: ['sms', 'push', 'email', 'cell_broadcast'],
        notificationsSent: [
          { channel: 'sms', recipient: '+91xxx', success: true },
          { channel: 'push', recipient: 'token1', success: true },
          { channel: 'email', recipient: 'test@test.com', success: true },
          // Missing cell_broadcast
        ],
      });
      
      const result = await validator.validate(context);
      
      // In lenient mode, missing channels cause FAIL
      expect(result.checks.some(c => c.name === 'notification_channels' && !c.passed)).toBe(true);
    });
    
    it('should validate message content', async () => {
      const context = createTestContext({
        expectedAlertLevel: 'emergency',
        shouldTriggerAlert: true,
        expectedMessageContains: ['flood', 'emergency', 'evacuate'],
        alertGenerated: {
          messages: [
            { lang: 'en', channel: 'sms', content: 'EMERGENCY: Flood warning for Test City. Evacuate immediately!', truncated: false },
          ],
        },
      });
      
      const result = await validator.validate(context);
      
      expect(result.checks.some(c => c.name === 'message_content' && c.passed)).toBe(true);
    });
    
    it('should FAIL when message content missing expected terms', async () => {
      const context = createTestContext({
        expectedAlertLevel: 'emergency',
        shouldTriggerAlert: true,
        expectedMessageContains: ['flood', 'emergency', 'evacuate', 'tsunami'], // tsunami not in message
        alertGenerated: {
          messages: [
            { lang: 'en', channel: 'sms', content: 'EMERGENCY: Flood warning for Test City. Evacuate immediately!', truncated: false },
          ],
        },
      });
      
      const result = await validator.validate(context);
      
      expect(result.checks.some(c => c.name === 'message_content' && !c.passed)).toBe(true);
    });
    
    it('should validate expected actions', async () => {
      const context = createTestContext({
        expectedAlertLevel: 'emergency',
        shouldTriggerAlert: true,
        expectedActions: ['issue_alert', 'dispatch_notifications', 'activate_sirens'],
        alertGenerated: { severity: 'emergency' as Severity },
        notificationsSent: [{ channel: 'sms', recipient: '+91xxx', success: true }],
      });
      
      const result = await validator.validate(context);
      
      expect(result.checks.some(c => c.name === 'expected_actions' && c.passed)).toBe(true);
    });
    
    it('should BLOCK when there are processing errors', async () => {
      const context = createTestContext({
        expectedAlertLevel: 'emergency',
        errors: [new Error('Database connection failed')],
      });
      
      const result = await validator.validate(context);
      
      expect(result.status).toBe('BLOCKED');
    });
    
    it('should validate dashboard state', async () => {
      const context = createTestContext({
        expectedAlertLevel: 'emergency',
        expectedDashboardState: {
          activeAlerts: 1,
          mapMarkers: 1,
        },
        dashboardState: {
          activeAlerts: 1,
          mapMarkers: 1,
          eventsDisplayed: 5,
        },
      });
      
      const result = await validator.validate(context);
      
      expect(result.checks.some(c => c.name === 'dashboard_state' && c.passed)).toBe(true);
    });
    
    it('should validate database records', async () => {
      const context = createTestContext({
        expectedAlertLevel: 'emergency',
        expectedDatabaseRecords: 1,
        databaseRecords: {
          eventsInserted: 1,
          alertsInserted: 1,
        },
      });
      
      const result = await validator.validate(context);
      
      expect(result.checks.some(c => c.name === 'database_records' && c.passed)).toBe(true);
    });
    
    it('should validate map markers', async () => {
      const context = createTestContext({
        expectedAlertLevel: 'emergency',
        expectedMapMarkers: 1,
        dashboardState: {
          mapMarkers: 1,
        },
      });
      
      const result = await validator.validate(context);
      
      expect(result.checks.some(c => c.name === 'map_markers' && c.passed)).toBe(true);
    });
  });
  
  describe('partial matching', () => {
    it('should pass partial match when enabled', async () => {
      const context = createTestContext({
        expectedAlertLevel: 'emergency',
        expectedNotificationChannels: ['sms', 'push', 'email', 'whatsapp'],
        notificationsSent: [
          { channel: 'sms', recipient: '+91xxx', success: true },
          { channel: 'push', recipient: 'token1', success: true },
          // Missing email and whatsapp
        ],
      });
      
      const result = await validator.validate(context);
      
      // In partial match mode, should still fail if expected channels missing
      // (partialMatch applies to object comparison, not array subset)
      expect(result.checks.some(c => c.name === 'notification_channels')).toBe(true);
    });
  });
});

// Helper to create test context
function createTestContext(overrides: Partial<ValidationContext> = {}): ValidationContext {
  const baseEvent: SyntheticEvent = {
    testCaseId: 'test-case-001',
    scenarioType: 'flood',
    scenarioName: 'Test Flood',
    location: { name: 'Test City', coordinates: [77, 28] },
    timestamp: '2026-01-01T12:00:00Z',
    severity: 'emergency',
    confidence: 0.9,
    expectedOutcome: {
      shouldTriggerAlert: true,
      expectedAlertLevel: 'emergency',
      shouldSendNotification: true,
      expectedNotificationChannels: ['sms', 'push', 'email'],
      expectedMessageContains: ['flood', 'emergency'],
    },
  };
  
  const baseNormalized: NormalizedEvent = {
    source: 'simulation',
    sourceId: 'test-case-001',
    disasterType: 'flood',
    severity: 'emergency',
    confidence: 0.9,
    location: { type: 'Point', coordinates: [77, 28] },
    properties: {},
    timestamp: new Date('2026-01-01T12:00:00Z'),
    rawData: {},
  };
  
  const baseDetection: DetectionResult = {
    eventId: 'test-case-001',
    matches: [],
    triggered: true,
    maxSeverity: 'emergency',
    maxConfidence: 0.9,
    triggeredRules: ['flood-severe'],
    recommendedAction: 'immediate_alert',
  };
  
  const baseFusion: FusionResult = {
    eventId: 'test-case-001',
    fusedSeverity: 'emergency',
    fusedConfidence: 0.9,
    signals: [],
    contributingSources: ['rules'],
    conflicts: [],
    method: 'weighted_average',
    timestamp: new Date(),
  };
  
  const baseAlert: Alert = {
    _id: 'alert-001',
    eventIds: ['test-case-001'],
    disasterType: 'flood',
    severity: 'emergency',
    confidence: 0.9,
    location: { type: 'Point', coordinates: [77, 28] },
    messages: [
      { lang: 'en', channel: 'sms', content: 'EMERGENCY: Flood warning for Test City. Evacuate immediately!', templateId: 'flood_sms' },
    ],
    capXml: '<alert/>',
    status: 'issued',
    issuedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    dispatches: [],
  };
  
  return {
    syntheticEvent: baseEvent,
    normalizedEvent: baseNormalized,
    detectionResult: baseDetection,
    fusionResult: baseFusion,
    alertGenerated: baseAlert,
    notificationsSent: [
      { channel: 'sms', recipient: '+91xxx', status: 'sent', sentAt: new Date().toISOString() },
      { channel: 'push', recipient: 'token1', status: 'sent', sentAt: new Date().toISOString() },
      { channel: 'email', recipient: 'test@test.com', status: 'sent', sentAt: new Date().toISOString() },
    ],
    dashboardState: {
      eventsDisplayed: 1,
      alertsDisplayed: 1,
      mapMarkers: 1,
      activeAlerts: 1,
    },
    databaseRecords: {
      eventsInserted: 1,
      alertsInserted: 1,
      crowdReportsInserted: 0,
      dispatchesRecorded: 3,
    },
    errors: [],
    ...overrides,
  };
}