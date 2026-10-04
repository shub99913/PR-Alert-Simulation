import { 
  SimulationEngine, 
  SimulationDataSource,
  PREDEFINED_SCENARIOS 
} from '../src/index';
import { SimulationConfig } from '../src/schemas';

describe('SimulationEngine Integration', () => {
  let engine: SimulationEngine;
  let dataSource: SimulationDataSource;
  
  beforeEach(() => {
    dataSource = new SimulationDataSource({
      pollIntervalMs: 100,
      timeoutMs: 1000,
      maxRetries: 1,
      retryDelayMs: 10,
      scenarios: PREDEFINED_SCENARIOS.slice(0, 3), // Use first 3 scenarios
    });
    
    engine = new SimulationEngine({
      dataSource,
      simulationConfig: {
        speed: 10.0, // Fast for tests
        autoAdvance: true,
        eventIntervalMs: 50,
        maxEvents: 0,
        dataSource: 'predefined',
        injectFailures: false,
      },
    });
  });
  
  afterEach(async () => {
    engine.reset();
  });
  
  describe('basic lifecycle', () => {
    it('should start, pause, resume, stop, reset', async () => {
      // Start
      const startResult = await engine.startScenario('flood-critical-001');
      expect(startResult.success).toBe(true);
      expect(engine.getState()).toBe('running');
      
      // Wait a bit for events to process
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Pause
      const pauseResult = engine.pause();
      expect(pauseResult.success).toBe(true);
      expect(engine.getState()).toBe('paused');
      
      // Resume
      const resumeResult = engine.resume();
      expect(resumeResult.success).toBe(true);
      expect(engine.getState()).toBe('running');
      
      // Wait a bit more
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Stop
      const stopResult = engine.stop();
      expect(stopResult.success).toBe(true);
      expect(engine.getState()).toBe('stopped');
      
      // Check results exist
      const results = engine.getResults();
      expect(results.length).toBeGreaterThan(0);
      
      // Reset
      const resetResult = engine.reset();
      expect(resetResult.success).toBe(true);
      expect(engine.getState()).toBe('idle');
      expect(engine.getResults().length).toBe(0);
    });
    
    it('should execute step command when paused', async () => {
      await engine.startScenario('flood-critical-001');
      engine.pause();
      
      const stepResult = await engine.step();
      expect(stepResult.success).toBe(true);
      expect(stepResult.result).toBeDefined();
      expect(engine.getResults().length).toBe(1);
    });
    
    it('should reject step when running', async () => {
      await engine.startScenario('flood-critical-001');
      
      const stepResult = await engine.step();
      expect(stepResult.success).toBe(false);
      expect(stepResult.message).toContain('Pause first');
    });
    
    it('should replay scenario', async () => {
      await engine.startScenario('flood-critical-001');
      await new Promise(resolve => setTimeout(resolve, 200));
      engine.stop();
      
      const initialResultsCount = engine.getResults().length;
      expect(initialResultsCount).toBeGreaterThan(0);
      
      const replayResult = await engine.replay();
      expect(replayResult.success).toBe(true);
      expect(engine.getState()).toBe('running');
      
      await new Promise(resolve => setTimeout(resolve, 200));
      engine.stop();
      
      const replayedResultsCount = engine.getResults().length;
      expect(replayedResultsCount).toBeGreaterThan(0);
    });
  });
  
  describe('speed control', () => {
    it('should change speed', () => {
      const result = engine.setSpeed(5.0);
      expect(result.success).toBe(true);
      expect(engine.getStatus().dataSource.speed).toBe(5.0);
    });
    
    it('should reject invalid speed', () => {
      const result = engine.setSpeed(0);
      expect(result.success).toBe(false);
    });
  });
  
  describe('custom simulation', () => {
    it('should run custom events', async () => {
      const customEvents = [
        {
          testCaseId: 'custom-1',
          scenarioType: 'flood' as const,
          scenarioName: 'Custom 1',
          location: { name: 'Test', coordinates: [77, 28] },
          timestamp: '2026-01-01T12:00:00Z',
          severity: 'warning' as const,
        },
        {
          testCaseId: 'custom-2',
          scenarioType: 'flood' as const,
          scenarioName: 'Custom 2',
          location: { name: 'Test', coordinates: [77, 28] },
          timestamp: '2026-01-01T12:05:00Z',
          severity: 'alert' as const,
        },
      ];
      
      const result = await engine.startCustom(customEvents);
      expect(result.success).toBe(true);
      expect(engine.getStatus().dataSource.progress.total).toBe(2);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      engine.stop();
      
      const results = engine.getResults();
      expect(results.length).toBe(2);
    });
  });
  
  describe('event emission', () => {
    it('should emit state_change events', async () => {
      const states: string[] = [];
      engine.on('state_change', (state) => states.push(state));
      
      await engine.startScenario('flood-critical-001');
      engine.pause();
      engine.resume();
      engine.stop();
      
      expect(states).toContain('running');
      expect(states).toContain('paused');
      expect(states).toContain('running'); // after resume
      expect(states).toContain('stopped');
    });
    
    it('should emit event_complete events', async () => {
      const events: any[] = [];
      engine.on('event_complete', (result) => events.push(result));
      
      await engine.startScenario('flood-critical-001');
      await new Promise(resolve => setTimeout(resolve, 300));
      engine.stop();
      
      expect(events.length).toBeGreaterThan(0);
      expect(events[0]).toHaveProperty('testCaseId');
      expect(events[0]).toHaveProperty('validation');
    });
    
    it('should emit scenario_complete event', async () => {
      let suiteResult: any = null;
      engine.on('scenario_complete', (suite) => { suiteResult = suite; });
      
      await engine.startScenario('flood-critical-001');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      expect(suiteResult).toBeDefined();
      expect(suiteResult.summary).toBeDefined();
      expect(suiteResult.summary.total).toBeGreaterThan(0);
    });
  });
  
  describe('results and export', () => {
    it('should collect results', async () => {
      await engine.startScenario('flood-critical-001');
      await new Promise(resolve => setTimeout(resolve, 300));
      engine.stop();
      
      const results = engine.getResults();
      expect(results.length).toBeGreaterThan(0);
      
      for (const result of results) {
        expect(result).toHaveProperty('testCaseId');
        expect(result).toHaveProperty('validation');
        expect(result.validation).toHaveProperty('status');
      }
    });
    
    it('should export JSON', async () => {
      await engine.startScenario('flood-critical-001');
      await new Promise(resolve => setTimeout(resolve, 200));
      engine.stop();
      
      const exportResult = engine.exportResults('json');
      expect(exportResult.success).toBe(true);
      expect(exportResult.data).toBeDefined();
      
      const parsed = JSON.parse(exportResult.data!);
      expect(parsed).toHaveProperty('suiteId');
      expect(parsed).toHaveProperty('results');
    });
    
    it('should export CSV', async () => {
      await engine.startScenario('flood-critical-001');
      await new Promise(resolve => setTimeout(resolve, 200));
      engine.stop();
      
      const exportResult = engine.exportResults('csv');
      expect(exportResult.success).toBe(true);
      expect(exportResult.data).toBeDefined();
      expect(exportResult.data!).toContain('testCaseId');
      expect(exportResult.data!).toContain('status');
    });
    
    it('should clear results', async () => {
      await engine.startScenario('flood-critical-001');
      await new Promise(resolve => setTimeout(resolve, 200));
      engine.stop();
      
      expect(engine.getResults().length).toBeGreaterThan(0);
      
      engine.clearResults();
      expect(engine.getResults().length).toBe(0);
    });
  });
  
  describe('command execution', () => {
    it('should execute commands via executeCommand', async () => {
      const result = await engine.executeCommand('start', { scenarioId: 'flood-critical-001' });
      expect(result.success).toBe(true);
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const pauseResult = await engine.executeCommand('pause');
      expect(pauseResult.success).toBe(true);
      
      const resumeResult = await engine.executeCommand('resume');
      expect(resumeResult.success).toBe(true);
      
      const stopResult = await engine.executeCommand('stop');
      expect(stopResult.success).toBe(true);
    });
    
    it('should reject unknown commands', async () => {
      const result = await engine.executeCommand('unknown_command');
      expect(result.success).toBe(false);
    });
  });
});