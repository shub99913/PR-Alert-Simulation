import React, { useState, useEffect, useCallback } from 'react';
import { 
  Scenario, 
  SimulationState, 
  TestResult, 
  TestSuiteResult,
  SimulationCommand,
  APIResponse 
} from '../types/simulation';

const API_BASE = '/api/simulation';

export function useSimulation() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [state, setState] = useState<SimulationState>({
    state: 'idle',
    progress: { current: 0, total: 0, percentage: 0 },
    speed: 1.0,
    resultsCount: 0,
  });
  const [results, setResults] = useState<TestResult[]>([]);
  const [suiteResult, setSuiteResult] = useState<TestSuiteResult | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speed, setSpeed] = useState(1.0);
  
  // Fetch scenarios on mount
  useEffect(() => {
    fetchScenarios();
  }, []);
  
  // Poll for state updates when running
  useEffect(() => {
    if (state.state === 'running') {
      const interval = setInterval(() => {
        fetchStatus();
        fetchResults();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [state.state]);
  
  const fetchScenarios = async () => {
    try {
      const response = await fetch(`${API_BASE}/scenarios`);
      const data = await response.json();
      if (data.scenarios) {
        setScenarios(data.scenarios);
      }
    } catch (err) {
      console.error('Failed to fetch scenarios:', err);
    }
  };
  
  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/status`);
      const data = await response.json();
      if (data.status) {
        setState(data.status);
      }
    } catch (err) {
      console.error('Failed to fetch status:', err);
    }
  };
  
  const fetchResults = async () => {
    try {
      const response = await fetch(`${API_BASE}/results`);
      const data = await response.json();
      if (data.results) {
        setResults(data.results);
      }
    } catch (err) {
      console.error('Failed to fetch results:', err);
    }
  };
  
  const fetchSuiteResult = async () => {
    try {
      const response = await fetch(`${API_BASE}/summary`);
      const data = await response.json();
      if (data.suite) {
        setSuiteResult(data.suite);
      }
    } catch (err) {
      console.error('Failed to fetch suite result:', err);
    }
  };
  
  const executeCommand = async (command: SimulationCommand) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command),
      });
      
      const data: APIResponse<any> = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || data.error || 'Command failed');
      }
      
      // Update local state based on command
      switch (command.command) {
        case 'start':
        case 'load_scenario':
          if (command.params?.scenarioId) {
            const scenario = scenarios.find(s => s.id === command.params.scenarioId);
            if (scenario) setSelectedScenario(scenario);
          }
          setState(prev => ({ ...prev, state: 'running' }));
          break;
        case 'pause':
          setState(prev => ({ ...prev, state: 'paused' }));
          break;
        case 'resume':
          setState(prev => ({ ...prev, state: 'running' }));
          break;
        case 'stop':
          setState(prev => ({ ...prev, state: 'stopped' }));
          await fetchSuiteResult();
          break;
        case 'reset':
          setState({ state: 'idle', progress: { current: 0, total: 0, percentage: 0 }, speed: 1.0, resultsCount: 0 });
          setResults([]);
          setSuiteResult(null);
          setSelectedScenario(null);
          break;
        case 'step':
          if (data.data?.result) {
            setResults(prev => [...prev, data.data.result]);
          }
          break;
        case 'replay':
          setResults([]);
          setSuiteResult(null);
          setState(prev => ({ ...prev, state: 'running' }));
          break;
        case 'set_speed':
          if (command.params?.speed) {
            setSpeed(command.params.speed);
            setState(prev => ({ ...prev, speed: command.params.speed }));
          }
          break;
        case 'clear_results':
          setResults([]);
          setSuiteResult(null);
          break;
        case 'export_results':
          // Handle download
          if (data.data) {
            const blob = new Blob([data.data], { type: command.params?.format === 'csv' ? 'text/csv' : 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `simulation-results.${command.params?.format || 'json'}`;
            a.click();
            URL.revokeObjectURL(url);
          }
          break;
      }
      
      // Refresh status and results
      await fetchStatus();
      await fetchResults();
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const startScenario = useCallback(async (scenarioId: string, simSpeed?: number) => {
    if (simSpeed) {
      await executeCommand({ command: 'set_speed', params: { speed: simSpeed } });
    }
    return executeCommand({ command: 'start', params: { scenarioId } });
  }, []);
  
  const startCustom = useCallback(async (events: any[], simSpeed?: number) => {
    if (simSpeed) {
      await executeCommand({ command: 'set_speed', params: { speed: simSpeed } });
    }
    return executeCommand({ command: 'load_custom', params: { events } });
  }, []);
  
  const loadFromFile = useCallback(async (filePath: string) => {
    return executeCommand({ command: 'load_scenario', params: { filePath } });
  }, []);
  
  return {
    // State
    scenarios,
    state,
    results,
    suiteResult,
    selectedScenario,
    loading,
    error,
    speed,
    
    // Actions
    executeCommand,
    startScenario,
    startCustom,
    loadFromFile,
    fetchStatus,
    fetchResults,
    fetchSuiteResult,
    setSelectedScenario,
    setError,
  };
}