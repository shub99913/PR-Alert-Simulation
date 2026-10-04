/**
 * =============================================================================
 * PRODUCTION/SIMULATION SEPARATION UTILITIES
 * =============================================================================
 * Provides strong separation between simulation and production environments.
 * =============================================================================
 */

import { SIMULATION_MODE, SIMULATION_LABEL } from './schemas';
import { createEngineLogger } from '@pr-alert/core';

const logger = createEngineLogger('simulation:separation');

/**
 * Assert that we're in simulation mode
 * Throws if called in production mode
 */
export function assertSimulationMode(context?: string): void {
  if (!SIMULATION_MODE) {
    const message = [
      SIMULATION_LABEL,
      'Operation only allowed in simulation mode.',
      context ? `Context: ${context}` : '',
    ].filter(Boolean).join('\n');
    
    logger.error({ context }, 'Simulation mode assertion failed');
    throw new Error(message);
  }
}

/**
 * Assert that we're NOT in simulation mode
 * Throws if called in simulation mode
 */
export function assertProductionMode(context?: string): void {
  if (SIMULATION_MODE) {
    const message = [
      'Operation not allowed in simulation mode.',
      'Set SIMULATION_MODE=false or NODE_ENV=production to enable.',
      context ? `Context: ${context}` : '',
    ].filter(Boolean).join('\n');
    
    logger.error({ context }, 'Production mode assertion failed');
    throw new Error(message);
  }
}

/**
 * Get current environment info
 */
export function getEnvironmentInfo(): {
  mode: 'simulation' | 'production';
  label: string;
  nodeEnv: string;
  simulationMode: boolean;
} {
  return {
    mode: SIMULATION_MODE ? 'simulation' : 'production',
    label: SIMULATION_MODE ? SIMULATION_LABEL : 'PRODUCTION MODE',
    nodeEnv: process.env.NODE_ENV || 'development',
    simulationMode: SIMULATION_MODE,
  };
}

/**
 * Decorator to restrict method to simulation mode only
 */
export function SimulationOnly(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    assertSimulationMode(`${target.constructor.name}.${propertyKey}`);
    return originalMethod.apply(this, args);
  };
  
  return descriptor;
}

/**
 * Decorator to restrict method to production mode only
 */
export function ProductionOnly(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    assertProductionMode(`${target.constructor.name}.${propertyKey}`);
    return originalMethod.apply(this, args);
  };
  
  return descriptor;
}

/**
 * Safe data wrapper that tags data with environment info
 */
export interface EnvironmentTaggedData<T> {
  data: T;
  environment: 'simulation' | 'production';
  timestamp: string;
  source: string;
}

export function tagData<T>(data: T, source: string): EnvironmentTaggedData<T> {
  return {
    data,
    environment: SIMULATION_MODE ? 'simulation' : 'production',
    timestamp: new Date().toISOString(),
    source,
  };
}

export function assertDataEnvironment<T>(
  tagged: EnvironmentTaggedData<T>, 
  expectedEnvironment: 'simulation' | 'production'
): T {
  if (tagged.environment !== expectedEnvironment) {
    throw new Error(
      `Data environment mismatch: expected ${expectedEnvironment}, got ${tagged.environment}. ` +
      `Source: ${tagged.source}, Timestamp: ${tagged.timestamp}`
    );
  }
  return tagged.data;
}

/**
 * Test database configuration
 * Uses separate database/namespace for simulation
 */
export function getSimulationDatabaseConfig(): {
  uri: string;
  database: string;
  collectionPrefix: string;
} {
  const baseUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pr-alert';
  const url = new URL(baseUri);
  
  return {
    uri: baseUri,
    database: SIMULATION_MODE ? 'pr-alert-simulation' : url.pathname.slice(1) || 'pr-alert',
    collectionPrefix: SIMULATION_MODE ? 'sim_' : '',
  };
}

/**
 * Test notification adapter that logs instead of sending
 */
export interface TestNotificationAdapter {
  send(notification: any): Promise<{ success: boolean; messageId: string; simulated: true }>;
  getSentNotifications(): any[];
  clear(): void;
}

export function createTestNotificationAdapter(): TestNotificationAdapter {
  const sent: any[] = [];
  
  return {
    async send(notification: any) {
      const record = {
        ...notification,
        messageId: `sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        sentAt: new Date().toISOString(),
        simulated: true,
      };
      sent.push(record);
      
      logger.info({ 
        channel: notification.channel, 
        recipient: notification.recipient,
        messageId: record.messageId 
      }, 'TEST NOTIFICATION SENT (simulated)');
      
      return { success: true, messageId: record.messageId, simulated: true };
    },
    
    getSentNotifications() {
      return [...sent];
    },
    
    clear() {
      sent.length = 0;
    },
  };
}

/**
 * Production notification adapter factory
 * Returns real adapters in production, test adapters in simulation
 */
export function createNotificationAdapter(channel: string): any {
  if (SIMULATION_MODE) {
    // Return a test adapter that logs
    const testAdapter = createTestNotificationAdapter();
    return {
      async send(params: any) {
        return testAdapter.send({ channel, ...params });
      },
    };
  }
  
  // In production, return real adapters (would be implemented with actual providers)
  logger.warn({ channel }, 'Production notification adapter requested');
  return {
    async send(params: any) {
      throw new Error(`Production adapter for ${channel} not implemented`);
    },
  };
}

/**
 * Safe execution wrapper that prevents simulation data from reaching production
 */
export async function safeExecute<T>(
  operation: () => Promise<T>,
  options: {
    allowInSimulation?: boolean;
    allowInProduction?: boolean;
    context?: string;
  } = {}
): Promise<T> {
  const { allowInSimulation = true, allowInProduction = true, context } = options;
  
  if (SIMULATION_MODE && !allowInSimulation) {
    throw new Error(`Operation not allowed in simulation mode: ${context || 'unknown'}`);
  }
  
  if (!SIMULATION_MODE && !allowInProduction) {
    throw new Error(`Operation not allowed in production mode: ${context || 'unknown'}`);
  }
  
  return operation();
}

/**
 * Configuration guard for simulation-only features
 */
export const simulationConfig = {
  // Feature flags
  enableRealDispatch: false,
  enableRealAlerts: false,
  enableRealNotifications: false,
  enableRealDatabaseWrites: false,
  
  // Test isolation
  useTestDatabase: true,
  useTestNotificationAdapters: true,
  isolateTestData: true,
  
  // Safety
  requireExplicitConfirmation: true,
  logAllOperations: true,
  preventProductionLeakage: true,
};

/**
 * Validate simulation configuration
 */
export function validateSimulationConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!SIMULATION_MODE) {
    errors.push('SIMULATION_MODE is not enabled');
  }
  
  if (process.env.ENABLE_REAL_DISPATCH === 'true') {
    errors.push('ENABLE_REAL_DISPATCH should be false in simulation mode');
  }
  
  if (process.env.NODE_ENV === 'production') {
    errors.push('NODE_ENV should not be production in simulation mode');
  }
  
  // Check for production credentials
  const productionKeys = [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'SENDGRID_API_KEY',
    'FCM_SERVER_KEY',
    'WHATSAPP_ACCESS_TOKEN',
  ];
  
  for (const key of productionKeys) {
    if (process.env[key] && process.env[key] !== '[REDACTED]') {
      errors.push(`Production credential ${key} is set - should be [REDACTED] in simulation`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Middleware to enforce simulation mode for API routes
 */
export function simulationModeMiddleware(
  req: any, 
  res: any, 
  next: any
): void {
  if (!SIMULATION_MODE) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Simulation endpoints only available in simulation mode',
      label: SIMULATION_LABEL,
    });
  }
  
  // Add simulation headers
  res.setHeader('X-Simulation-Mode', 'true');
  res.setHeader('X-Simulation-Label', SIMULATION_LABEL);
  
  next();
}

/**
 * Middleware to enforce production mode for API routes
 */
export function productionModeMiddleware(
  req: any, 
  res: any, 
  next: any
): void {
  if (SIMULATION_MODE) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Production endpoints not available in simulation mode',
    });
  }
  
  next();
}

export { 
  assertSimulationMode, 
  assertProductionMode, 
  getEnvironmentInfo,
  SimulationOnly,
  ProductionOnly,
  tagData,
  assertDataEnvironment,
  getSimulationDatabaseConfig,
  createTestNotificationAdapter,
  createNotificationAdapter,
  safeExecute,
  simulationConfig,
  validateSimulationConfig,
  simulationModeMiddleware,
  productionModeMiddleware,
};