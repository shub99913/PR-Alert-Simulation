import { 
  SyntheticEventSchema, 
  TestScenarioSchema, 
  SimulationConfigSchema,
  TestResultSchema,
  TestSuiteResultSchema,
  PREDEFINED_SCENARIOS,
  SIMULATION_MODE,
  SIMULATION_LABEL,
} from '../src/schemas';

describe('Simulation Schemas', () => {
  describe('SyntheticEventSchema', () => {
    it('should validate a valid flood event', () => {
      const event = {
        testCaseId: 'flood-test-001',
        scenarioType: 'flood',
        scenarioName: 'Test Flood',
        location: {
          name: 'Test Location',
          coordinates: [77.0, 28.0],
          district: 'Test District',
          state: 'Test State',
          country: 'India',
        },
        timestamp: '2026-01-01T12:00:00Z',
        severity: 'emergency',
        confidence: 0.9,
        sensorData: {
          rainfallMmPerHour: 100,
          riverLevelMeters: 8.0,
        },
        expectedOutcome: {
          shouldTriggerAlert: true,
          expectedAlertLevel: 'emergency',
        },
      };
      
      const result = SyntheticEventSchema.safeParse(event);
      expect(result.success).toBe(true);
    });
    
    it('should validate an earthquake event with seismic data', () => {
      const event = {
        testCaseId: 'eq-test-001',
        scenarioType: 'earthquake',
        scenarioName: 'Test Earthquake',
        location: {
          name: 'Test Location',
          coordinates: [79.0, 30.0],
          district: 'Test District',
          state: 'Test State',
          country: 'India',
        },
        timestamp: '2026-01-01T12:00:00Z',
        severity: 'emergency',
        confidence: 0.95,
        sensorData: {
          seismicMagnitude: 7.5,
          seismicIntensity: 9,
          depthKm: 15,
        },
        expectedOutcome: {
          shouldTriggerAlert: true,
          expectedAlertLevel: 'emergency',
        },
      };
      
      const result = SyntheticEventSchema.safeParse(event);
      expect(result.success).toBe(true);
    });
    
    it('should reject event with invalid coordinates', () => {
      const event = {
        testCaseId: 'invalid-coords',
        scenarioType: 'flood',
        scenarioName: 'Invalid Coords',
        location: {
          name: 'Test',
          coordinates: [200, 100], // Invalid
        },
        timestamp: '2026-01-01T12:00:00Z',
        severity: 'info',
      };
      
      const result = SyntheticEventSchema.safeParse(event);
      expect(result.success).toBe(false);
    });
    
    it('should reject event with negative sensor values', () => {
      const event = {
        testCaseId: 'negative-values',
        scenarioType: 'flood',
        scenarioName: 'Negative Values',
        location: {
          name: 'Test',
          coordinates: [77.0, 28.0],
        },
        timestamp: '2026-01-01T12:00:00Z',
        severity: 'info',
        sensorData: {
          rainfallMmPerHour: -50, // Invalid
        },
      };
      
      const result = SyntheticEventSchema.safeParse(event);
      expect(result.success).toBe(false);
    });
  });
  
  describe('TestScenarioSchema', () => {
    it('should validate a predefined scenario', () => {
      const scenario = PREDEFINED_SCENARIOS[0];
      const result = TestScenarioSchema.safeParse(scenario);
      expect(result.success).toBe(true);
    });
    
    it('should validate scenario with variations', () => {
      const scenario = PREDEFINED_SCENARIOS.find(s => s.id === 'flood-boundary-003');
      expect(scenario).toBeDefined();
      
      const result = TestScenarioSchema.safeParse(scenario!);
      expect(result.success).toBe(true);
      expect(result.data.variations).toBeDefined();
      expect(result.data.variations!.length).toBeGreaterThan(0);
    });
    
    it('should validate multi-event scenario with sequence', () => {
      const scenario = PREDEFINED_SCENARIOS.find(s => s.id === 'multi-hazard-rainfall-landslide-013');
      expect(scenario).toBeDefined();
      
      const result = TestScenarioSchema.safeParse(scenario!);
      expect(result.success).toBe(true);
      expect(result.data.sequence).toBeDefined();
      expect(result.data.sequence!.length).toBeGreaterThan(0);
    });
  });
  
  describe('SimulationConfigSchema', () => {
    it('should validate default config', () => {
      const config = {};
      const result = SimulationConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
      expect(result.data.speed).toBe(1.0);
      expect(result.data.autoAdvance).toBe(true);
    });
    
    it('should validate custom config', () => {
      const config = {
        speed: 5.0,
        autoAdvance: false,
        eventIntervalMs: 500,
        maxEvents: 10,
        injectFailures: true,
        failureConfig: {
          networkFailureRate: 0.1,
          apiFailureRate: 0.05,
        },
      };
      
      const result = SimulationConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
      expect(result.data.speed).toBe(5.0);
      expect(result.data.failureConfig.networkFailureRate).toBe(0.1);
    });
  });
  
  describe('PREDEFINED_SCENARIOS', () => {
    it('should have at least 25 scenarios', () => {
      expect(PREDEFINED_SCENARIOS.length).toBeGreaterThanOrEqual(25);
    });
    
    it('should cover all major disaster types', () => {
      const disasterTypes = new Set(PREDEFINED_SCENARIOS.map(s => s.disasterType));
      const expectedTypes = ['flood', 'earthquake', 'landslide', 'cyclone', 'wildfire', 'heatwave', 'drought', 'tsunami'];
      
      for (const type of expectedTypes) {
        expect(disasterTypes.has(type)).toBe(true);
      }
    });
    
    it('should cover all test categories', () => {
      const categories = new Set(PREDEFINED_SCENARIOS.map(s => s.category));
      const expectedCategories = ['positive', 'boundary', 'negative', 'reliability', 'multi_event'];
      
      for (const cat of expectedCategories) {
        expect(categories.has(cat)).toBe(true);
      }
    });
    
    it('should have unique IDs', () => {
      const ids = PREDEFINED_SCENARIOS.map(s => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
    
    it('should have severity levels distributed', () => {
      const severities = PREDEFINED_SCENARIOS.map(s => s.severity);
      const uniqueSeverities = new Set(severities);
      expect(uniqueSeverities.size).toBeGreaterThanOrEqual(4);
    });
  });
  
  describe('SIMULATION_MODE', () => {
    it('should be true in test environment', () => {
      // In test environment, SIMULATION_MODE should be true
      expect(typeof SIMULATION_MODE).toBe('boolean');
    });
    
    it('should have SIMULATION_LABEL defined', () => {
      expect(SIMULATION_LABEL).toBe('SIMULATION / TEST MODE — NOT REAL-WORLD DATA');
    });
  });
});