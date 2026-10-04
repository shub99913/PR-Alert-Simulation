import { 
  assertSimulationMode,
  assertProductionMode,
  getEnvironmentInfo,
  tagData,
  assertDataEnvironment,
  getSimulationDatabaseConfig,
  createTestNotificationAdapter,
  safeExecute,
  validateSimulationConfig,
  simulationModeMiddleware,
  productionModeMiddleware,
} from '../src/separation';

describe('Environment Separation', () => {
  describe('assertSimulationMode', () => {
    it('should not throw when SIMULATION_MODE is true', () => {
      // In test environment, SIMULATION_MODE should be true
      expect(() => assertSimulationMode('test')).not.toThrow();
    });
  });
  
  describe('assertProductionMode', () => {
    it('should throw when SIMULATION_MODE is true', () => {
      expect(() => assertProductionMode('test')).toThrow('Operation not allowed in simulation mode');
    });
  });
  
  describe('getEnvironmentInfo', () => {
    it('should return correct environment info', () => {
      const info = getEnvironmentInfo();
      
      expect(info).toHaveProperty('mode');
      expect(info).toHaveProperty('label');
      expect(info).toHaveProperty('nodeEnv');
      expect(info).toHaveProperty('simulationMode');
      expect(typeof info.simulationMode).toBe('boolean');
    });
  });
  
  describe('tagData', () => {
    it('should tag data with environment info', () => {
      const data = { test: 'value' };
      const tagged = tagData(data, 'test-source');
      
      expect(tagged.data).toEqual(data);
      expect(tagged.environment).toBe('simulation'); // In test mode
      expect(tagged.source).toBe('test-source');
      expect(tagged.timestamp).toBeDefined();
    });
  });
  
  describe('assertDataEnvironment', () => {
    it('should return data when environment matches', () => {
      const tagged = { data: { test: 'value' }, environment: 'simulation' as const, timestamp: '', source: 'test' };
      const result = assertDataEnvironment(tagged, 'simulation');
      expect(result).toEqual({ test: 'value' });
    });
    
    it('should throw when environment mismatches', () => {
      const tagged = { data: { test: 'value' }, environment: 'production' as const, timestamp: '', source: 'test' };
      expect(() => assertDataEnvironment(tagged, 'simulation')).toThrow('Data environment mismatch');
    });
  });
  
  describe('getSimulationDatabaseConfig', () => {
    it('should return simulation database config', () => {
      const config = getSimulationDatabaseConfig();
      
      expect(config).toHaveProperty('uri');
      expect(config).toHaveProperty('database');
      expect(config).toHaveProperty('collectionPrefix');
      expect(config.database).toBe('pr-alert-simulation');
      expect(config.collectionPrefix).toBe('sim_');
    });
  });
  
  describe('createTestNotificationAdapter', () => {
    it('should create adapter that logs notifications', async () => {
      const adapter = createTestNotificationAdapter();
      
      const result = await adapter.send({
        channel: 'sms',
        recipient: '+91xxx',
        content: 'Test message',
      });
      
      expect(result.success).toBe(true);
      expect(result.simulated).toBe(true);
      expect(result.messageId).toBeDefined();
      
      const sent = adapter.getSentNotifications();
      expect(sent.length).toBe(1);
      expect(sent[0].channel).toBe('sms');
      expect(sent[0].simulated).toBe(true);
    });
    
    it('should clear notifications', async () => {
      const adapter = createTestNotificationAdapter();
      
      await adapter.send({ channel: 'sms', recipient: '+91xxx' });
      expect(adapter.getSentNotifications().length).toBe(1);
      
      adapter.clear();
      expect(adapter.getSentNotifications().length).toBe(0);
    });
  });
  
  describe('safeExecute', () => {
    it('should execute operation in simulation mode', async () => {
      const result = await safeExecute(
        async () => 'success',
        { allowInSimulation: true, context: 'test' }
      );
      expect(result).toBe('success');
    });
    
    it('should reject when not allowed in simulation', async () => {
      await expect(
        safeExecute(
          async () => 'success',
          { allowInSimulation: false, context: 'test' }
        )
      ).rejects.toThrow('Operation not allowed in simulation mode');
    });
  });
  
  describe('validateSimulationConfig', () => {
    it('should validate config in simulation mode', () => {
      const result = validateSimulationConfig();
      
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });
  
  describe('simulationModeMiddleware', () => {
    it('should call next in simulation mode', () => {
      const req = {};
      const res = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();
      
      simulationModeMiddleware(req, res, next);
      
      expect(res.setHeader).toHaveBeenCalledWith('X-Simulation-Mode', 'true');
      expect(next).toHaveBeenCalled();
    });
  });
  
  describe('productionModeMiddleware', () => {
    it('should reject in simulation mode', () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();
      
      productionModeMiddleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });
});