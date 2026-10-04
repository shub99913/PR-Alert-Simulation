/**
 * =============================================================================
 * PR-ALERT SIMULATION PACKAGE
 * =============================================================================
 * 
 * Complete simulation and testing system for PR-Alert disaster pre-alert platform.
 * 
 * CRITICAL SAFETY: This package MUST only be used when SIMULATION_MODE=true
 * or NODE_ENV=test. It will throw errors if instantiated in production mode.
 * 
 * Provides:
 * - Synthetic data generation for all disaster types
 * - Test scenario library with 27+ predefined scenarios
 * - Full pipeline simulation: Event → Detection → Fusion → Alert → Dispatch
 * - Expected-results validation with PASS/FAIL/BLOCKED verdicts
 * - Simulation controls: play, pause, resume, stop, reset, step, replay, speed
 * - Failure injection: network, API, notification failures, duplicates, delays
 * - Comprehensive reporting and export (JSON/CSV)
 * - Production/simulation separation with explicit flag
 * =============================================================================
 */

// Schemas and Types
export * from './schemas';

// Data Source (implements BaseAdapter interface)
export * from './datasource';

// Validation Engine
export * from './validator';

// Main Simulation Engine
export * from './engine';

// Environment Separation
export * from './separation';

// Re-export key types for convenience
export {
  SIMULATION_MODE,
  SIMULATION_LABEL,
  PREDEFINED_SCENARIOS,
  SimulationSchemas,
} from './schemas';

export {
  SimulationDataSource,
  FailureInjector,
  createSimulationDataSource,
  createSimulationAdapterRegistry,
} from './datasource';

export {
  SimulationValidator,
  createValidator,
  ValidationCheck,
  ValidationContext,
} from './validator';

export {
  SimulationEngine,
  PipelineComponents,
} from './engine';

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
} from './separation';

// Version
export const VERSION = '0.1.0';
export const SIMULATION_PACKAGE_NAME = '@pr-alert/simulation';

/**
 * Quick start function for common use cases
 */
export async function runQuickTest(scenarioId: string, options?: {
  speed?: number;
  onProgress?: (result: any) => void;
  onComplete?: (suite: any) => void;
}): Promise<any> {
  const { SimulationEngine } = await import('./engine');
  
  const engine = SimulationEngine.create();
  
  if (options?.speed) {
    engine.setSpeed(options.speed);
  }
  
  if (options?.onProgress) {
    engine.on('event_complete', options.onProgress);
  }
  
  if (options?.onComplete) {
    engine.on('scenario_complete', options.onComplete);
  }
  
  const result = await engine.startScenario(scenarioId);
  
  if (!result.success) {
    throw new Error(result.message);
  }
  
  // Wait for completion
  return new Promise((resolve) => {
    engine.once('scenario_complete', (suite) => {
      resolve(suite);
    });
  });
}

/**
 * Run all predefined scenarios
 */
export async function runAllScenarios(options?: {
  speed?: number;
  onScenarioComplete?: (scenarioId: string, suite: any) => void;
}): Promise<any[]> {
  const { SimulationEngine, PREDEFINED_SCENARIOS } = await import('./engine');
  const { PREDEFINED_SCENARIOS: scenarios } = await import('./schemas');
  
  const engine = SimulationEngine.create();
  
  if (options?.speed) {
    engine.setSpeed(options.speed);
  }
  
  const results = [];
  
  for (const scenario of scenarios) {
    engine.reset();
    await engine.startScenario(scenario.id);
    
    // Wait for completion
    await new Promise<void>((resolve) => {
      engine.once('scenario_complete', (suite) => {
        results.push({ scenarioId: scenario.id, suite });
        if (options?.onScenarioComplete) {
          options.onScenarioComplete(scenario.id, suite);
        }
        resolve();
      });
    });
  }
  
  return results;
}

/**
 * Create simulation engine with custom components (for testing)
 */
export function createTestEngine(components?: any) {
  const { SimulationEngine } = require('./engine');
  return SimulationEngine.create({ components });
}

export default {
  VERSION,
  SIMULATION_PACKAGE_NAME,
  runQuickTest,
  runAllScenarios,
  createTestEngine,
};