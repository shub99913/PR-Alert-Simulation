import React, { useState } from 'react';
import { useSimulation } from '../hooks/useSimulation';
import { Scenario, TestResult, SimulationState } from '../types/simulation';
import './SimulationDashboard.css';

export const SimulationDashboard: React.FC = () => {
  const {
    scenarios,
    state,
    results,
    suiteResult,
    selectedScenario,
    loading,
    error,
    speed,
    startScenario,
    executeCommand,
    fetchSuiteResult,
    setSelectedScenario,
    setError,
  } = useSimulation();
  
  const [activeTab, setActiveTab] = useState<'scenarios' | 'results' | 'details'>('scenarios');
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter scenarios by category
  const filteredScenarios = scenarios.filter(s => 
    filterCategory === 'all' || s.category === filterCategory
  ).filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.disasterType.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get unique categories
  const categories = ['all', ...new Set(scenarios.map(s => s.category))];
  
  // Format duration
  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };
  
  // Format timestamp
  const formatTime = (isoString?: string) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleTimeString();
  };
  
  // Get status badge color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'PASS': return 'status-pass';
      case 'FAIL': return 'status-fail';
      case 'BLOCKED': return 'status-blocked';
      case 'SKIPPED': return 'status-skipped';
      default: return 'status-unknown';
    }
  };
  
  // Get state badge color
  const getStateColor = (simState: SimulationState['state']) => {
    switch (simState) {
      case 'running': return 'state-running';
      case 'paused': return 'state-paused';
      case 'completed': return 'state-completed';
      case 'stopped': return 'state-stopped';
      case 'error': return 'state-error';
      default: return 'state-idle';
    }
  };
  
  // Handle scenario selection
  const handleScenarioClick = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setActiveTab('scenarios');
  };
  
  // Handle start simulation
  const handleStart = async (scenarioId: string) => {
    try {
      await startScenario(scenarioId, speed);
      setActiveTab('results');
    } catch (err) {
      console.error('Failed to start simulation:', err);
    }
  };
  
  // Handle result click
  const handleResultClick = (result: TestResult) => {
    setSelectedResult(result);
    setActiveTab('details');
  };
  
  // Handle control buttons
  const handlePause = () => executeCommand({ command: 'pause' });
  const handleResume = () => executeCommand({ command: 'resume' });
  const handleStop = async () => {
    await executeCommand({ command: 'stop' });
    setTimeout(fetchSuiteResult, 500);
  };
  const handleReset = () => executeCommand({ command: 'reset' });
  const handleStep = () => executeCommand({ command: 'step' });
  const handleReplay = () => executeCommand({ command: 'replay' });
  const handleSpeedChange = (newSpeed: number) => executeCommand({ command: 'set_speed', params: { speed: newSpeed } });
  const handleClear = () => executeCommand({ command: 'clear_results' });
  const handleExport = (format: 'json' | 'csv') => executeCommand({ command: 'export_results', params: { format } });
  
  return (
    <div className="simulation-dashboard">
      {/* Header */}
      <header className="sim-header">
        <div className="sim-header-left">
          <h1>🧪 PR-Alert Simulation Dashboard</h1>
          <span className={`sim-mode-badge ${getStateColor(state.state)}`}>
            {state.state.toUpperCase()}
          </span>
          {SIMULATION_LABEL && (
            <span className="simulation-label">{SIMULATION_LABEL}</span>
          )}
        </div>
        <div className="sim-header-right">
          <div className="speed-control">
            <label>Speed: </label>
            <input
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              value={speed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
            />
            <span>{speed.toFixed(1)}x</span>
          </div>
        </div>
      </header>
      
      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}
      
      {/* Loading Indicator */}
      {loading && <div className="loading-overlay">Processing...</div>}
      
      {/* Main Content */}
      <div className="sim-main">
        {/* Left Panel - Scenarios & Controls */}
        <aside className="sim-sidebar">
          {/* Control Buttons */}
          <div className="control-panel">
            <h3>Simulation Controls</h3>
            <div className="control-buttons">
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => handleStart(selectedScenario!.id)}
                disabled={!selectedScenario || state.state === 'running' || loading}
              >
                ▶ Start
              </button>
              <button 
                className="btn btn-secondary"
                onClick={handlePause}
                disabled={state.state !== 'running' || loading}
              >
                ⏸ Pause
              </button>
              <button 
                className="btn btn-secondary"
                onClick={handleResume}
                disabled={state.state !== 'paused' || loading}
              >
                ▶ Resume
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleStop}
                disabled={state.state === 'idle' || state.state === 'stopped' || loading}
              >
                ■ Stop
              </button>
              <button 
                className="btn btn-warning"
                onClick={handleReset}
                disabled={state.state === 'idle' || loading}
              >
                ⟲ Reset
              </button>
            </div>
            <div className="control-buttons">
              <button 
                className="btn btn-outline"
                onClick={handleStep}
                disabled={state.state !== 'paused' || loading}
              >
                ⏭ Step
              </button>
              <button 
                className="btn btn-outline"
                onClick={handleReplay}
                disabled={!selectedScenario || loading}
              >
                ↻ Replay
              </button>
            </div>
          </div>
          
          {/* Progress */}
          {state.state !== 'idle' && (
            <div className="progress-panel">
              <h3>Progress</h3>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${state.progress.percentage}%` }}
                ></div>
              </div>
              <div className="progress-info">
                <span>{state.progress.current} / {state.progress.total}</span>
                <span>{state.progress.percentage}%</span>
              </div>
              <div className="progress-info">
                <span>Results: {state.resultsCount}</span>
                <span>Speed: {speed.toFixed(1)}x</span>
              </div>
            </div>
          )}
          
          {/* Scenario List */}
          <div className="scenario-panel">
            <div className="panel-header">
              <h3>Test Scenarios ({filteredScenarios.length}/{scenarios.length})</h3>
              <div className="panel-filters">
                <select 
                  value={filterCategory} 
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="filter-select"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
            
            <div className="scenario-list">
              {filteredScenarios.map(scenario => (
                <div
                  key={scenario.id}
                  className={`scenario-item ${selectedScenario?.id === scenario.id ? 'selected' : ''}`}
                  onClick={() => handleScenarioClick(scenario)}
                >
                  <div className="scenario-info">
                    <div className="scenario-name-row">
                      <span className="scenario-name">{scenario.name}</span>
                      <span className={`severity-badge severity-${scenario.severity}`}>
                        {scenario.severity}
                      </span>
                    </div>
                    <div className="scenario-meta">
                      <span className="disaster-type">{scenario.disasterType}</span>
                      <span className="category-tag">{scenario.category}</span>
                    </div>
                    <p className="scenario-description">{scenario.description}</p>
                  </div>
                </div>
              ))}
              
              {filteredScenarios.length === 0 && (
                <div className="no-results">No scenarios match your filters</div>
              )}
            </div>
          </div>
        </aside>
        
        {/* Right Panel - Results or Details */}
        <main className="sim-content">
          <div className="content-tabs">
            <button 
              className={`tab ${activeTab === 'scenarios' ? 'active' : ''}`}
              onClick={() => setActiveTab('scenarios')}
            >
              📋 Scenarios
            </button>
            <button 
              className={`tab ${activeTab === 'results' ? 'active' : ''}`}
              onClick={() => setActiveTab('results')}
            >
              📊 Results ({results.length})
            </button>
            <button 
              className={`tab ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
              disabled={!selectedResult}
            >
              🔍 Details
            </button>
          </div>
          
          {activeTab === 'scenarios' && selectedScenario && (
            <ScenarioDetailPanel scenario={selectedScenario} onStart={handleStart} />
          )}
          
          {activeTab === 'results' && (
            <ResultsPanel 
              results={results}
              suiteResult={suiteResult}
              onResultClick={handleResultClick}
              onClear={handleClear}
              onExport={handleExport}
            />
          )}
          
          {activeTab === 'details' && selectedResult && (
            <ResultDetailPanel result={selectedResult} onClose={() => setSelectedResult(null)} />
          )}
          
          {activeTab === 'results' && results.length === 0 && state.state === 'idle' && (
            <div className="empty-state">
              <p>Select a scenario and click Start to run a simulation</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// ==================== Sub Components ====================

const ScenarioDetailPanel: React.FC<{ scenario: Scenario; onStart: (id: string) => void }> = ({ 
  scenario, 
  onStart 
}) => (
  <div className="detail-panel">
    <h3>{scenario.name}</h3>
    <p className="description">{scenario.description}</p>
    
    <div className="detail-grid">
      <div className="detail-item">
        <label>ID</label>
        <span>{scenario.id}</span>
      </div>
      <div className="detail-item">
        <label>Category</label>
        <span className="category-tag">{scenario.category}</span>
      </div>
      <div className="detail-item">
        <label>Disaster Type</label>
        <span className="disaster-type">{scenario.disasterType}</span>
      </div>
      <div className="detail-item">
        <label>Severity</label>
        <span className={`severity-badge severity-${scenario.severity}`}>{scenario.severity}</span>
      </div>
      <div className="detail-item">
        <label>Location</label>
        <span>{scenario.baseEvent?.location?.name || 'N/A'}</span>
      </div>
      <div className="detail-item">
        <label>Coordinates</label>
        <span>
          {scenario.baseEvent?.location?.coordinates 
            ? `${scenario.baseEvent.location.coordinates[1].toFixed(4)}°N, ${scenario.baseEvent.location.coordinates[0].toFixed(4)}°E`
            : 'N/A'}
        </span>
      </div>
    </div>
    
    {scenario.baseEvent?.sensorData && Object.keys(scenario.baseEvent.sensorData).length > 0 && (
      <div className="detail-section">
        <h4>Sensor Data</h4>
        <pre className="json-preview">
          {JSON.stringify(scenario.baseEvent.sensorData, null, 2)}
        </pre>
      </div>
    )}
    
    {scenario.baseEvent?.expectedOutcome && (
      <div className="detail-section">
        <h4>Expected Outcome</h4>
        <pre className="json-preview">
          {JSON.stringify(scenario.baseEvent.expectedOutcome, null, 2)}
        </pre>
      </div>
    )}
    
    <button className="btn btn-primary btn-block" onClick={() => onStart(scenario.id)}>
      Run This Scenario
    </button>
  </div>
);

const ResultsPanel: React.FC<{ 
  results: TestResult[];
  suiteResult: any;
  onResultClick: (result: TestResult) => void;
  onClear: () => void;
  onExport: (format: 'json' | 'csv') => void;
}> = ({ results, suiteResult, onResultClick, onClear, onExport }) => {
  if (results.length === 0) {
    return <div className="empty-state">No results yet. Run a simulation to see results.</div>;
  }
  
  return (
    <div className="results-panel">
      {/* Suite Summary */}
      {suiteResult && (
        <div className="suite-summary">
          <h3>Test Suite Summary</h3>
          <div className="summary-stats">
            <div className="stat pass">
              <span className="stat-value">{suiteResult.summary.passed}</span>
              <span className="stat-label">Passed</span>
            </div>
            <div className="stat fail">
              <span className="stat-value">{suiteResult.summary.failed}</span>
              <span className="stat-label">Failed</span>
            </div>
            <div className="stat blocked">
              <span className="stat-value">{suiteResult.summary.blocked}</span>
              <span className="stat-label">Blocked</span>
            </div>
            <div className="stat total">
              <span className="stat-value">{suiteResult.summary.passPercentage}%</span>
              <span className="stat-label">Pass Rate</span>
            </div>
            <div className="stat">
              <span className="stat-value">{suiteResult.summary.totalAlertsGenerated}</span>
              <span className="stat-label">Alerts</span>
            </div>
            <div className="stat">
              <span className="stat-value">{suiteResult.summary.totalNotificationsSent}</span>
              <span className="stat-label">Notifications</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Results Table */}
      <div className="results-table-container">
        <table className="results-table">
          <thead>
            <tr>
              <th>Test Case</th>
              <th>Scenario</th>
              <th>Status</th>
              <th>Duration</th>
              <th>Alert</th>
              <th>Notifications</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={result.testCaseId} onClick={() => onResultClick(result)}>
                <td className="test-case-id">{result.testCaseId}</td>
                <td>{result.scenarioName || result.scenarioId || 'N/A'}</td>
                <td>
                  <span className={`status-badge ${getStatusColor(result.validation?.status)}`}>
                    {result.validation?.status || 'PENDING'}
                  </span>
                </td>
                <td>{formatDuration(result.durationMs)}</td>
                <td>
                  {result.alertGenerated ? (
                    <span className={`severity-badge severity-${result.alertGenerated.severity?.toLowerCase()}`}>
                      {result.alertGenerated.severity}
                    </span>
                  ) : (
                    <span className="no-alert">—</span>
                  )}
                </td>
                <td>{result.notificationsSent.length}</td>
                <td>
                  <button className="btn-icon" onClick={(e) => { e.stopPropagation(); onResultClick(result); }} title="View Details">
                    👁
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Export Buttons */}
      <div className="export-actions">
        <button className="btn btn-outline" onClick={() => onExport('json')}>
          📥 Export JSON
        </button>
        <button className="btn btn-outline" onClick={() => onExport('csv')}>
          📥 Export CSV
        </button>
        <button className="btn btn-danger" onClick={onClear}>
          🗑 Clear Results
        </button>
      </div>
    </div>
  );
};

const ResultDetailPanel: React.FC<{ result: TestResult; onClose: () => void }> = ({ result, onClose }) => (
  <div className="detail-panel">
    <div className="detail-header">
      <h3>Test Result Details</h3>
      <button className="btn-icon" onClick={onClose}>✕</button>
    </div>
    
    <div className="detail-grid">
      <div className="detail-item full-width">
        <label>Test Case ID</label>
        <span className="monospace">{result.testCaseId}</span>
      </div>
      <div className="detail-item">
        <label>Scenario</label>
        <span>{result.scenarioName || result.scenarioId}</span>
      </div>
      <div className="detail-item">
        <label>Status</label>
        <span className={`status-badge ${getStatusColor(result.validation?.status)}`}>
          {result.validation?.status || 'UNKNOWN'}
        </span>
      </div>
      <div className="detail-item">
        <label>Score</label>
        <span>{result.validation?.score || 'N/A'}/100</span>
      </div>
      <div className="detail-item">
        <label>Duration</label>
        <span>{formatDuration(result.durationMs)}</span>
      </div>
      <div className="detail-item">
        <label>Started</label>
        <span>{formatTime(result.startedAt)}</span>
      </div>
      <div className="detail-item">
        <label>Completed</label>
        <span>{formatTime(result.completedAt)}</span>
      </div>
    </div>
    
    {/* Validation Details */}
    {result.validation && (
      <div className="detail-section">
        <h4>Validation Checks</h4>
        <div className="validation-checks">
          {result.validation.passedChecks.map(check => (
            <div key={check} className="check-item pass">
              <span className="check-icon">✓</span>
              <span>{check}</span>
            </div>
          ))}
          {result.validation.failedChecks.map((check, i) => (
            <div key={i} className="check-item fail">
              <span className="check-icon">✗</span>
              <span>{check.check}: {check.message}</span>
              <details>
                <summary>Expected vs Actual</summary>
                <pre>Expected: {JSON.stringify(check.expected, null, 2)}</pre>
                <pre>Actual: {JSON.stringify(check.actual, null, 2)}</pre>
              </details>
            </div>
          ))}
        </div>
      </div>
    )}
    
    {/* Detection Result */}
    {result.detectionResult && (
      <div className="detail-section">
        <h4>Detection Result</h4>
        <div className="detail-grid">
          <div className="detail-item">
            <label>Triggered</label>
            <span>{result.detectionResult.triggered ? 'Yes' : 'No'}</span>
          </div>
          <div className="detail-item">
            <label>Max Severity</label>
            <span className={`severity-badge severity-${result.detectionResult.maxSeverity}`}>
              {result.detectionResult.maxSeverity}
            </span>
          </div>
          <div className="detail-item">
            <label>Max Confidence</label>
            <span>{(result.detectionResult.maxConfidence * 100).toFixed(1)}%</span>
          </div>
          <div className="detail-item">
            <label>Recommended Action</label>
            <span>{result.detectionResult.recommendedAction}</span>
          </div>
        </div>
        {result.detectionResult.matches.length > 0 && (
          <div className="matches-list">
            <h5>Rule Matches</h5>
            {result.detectionResult.matches.map((match, i) => (
              <div key={i} className={`match-item ${match.matched ? 'matched' : 'unmatched'}`}>
                <span className="match-name">{match.ruleName}</span>
                <span className={`match-status ${match.matched ? 'pass' : 'fail'}`}>
                  {match.matched ? '✓ MATCHED' : '✗ NOT MATCHED'}
                </span>
                <span className="match-severity severity-{match.severity}">{match.severity}</span>
                <span className="match-confidence">{(match.confidence * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )}
    
    {/* Fusion Result */}
    {result.fusionResult && (
      <div className="detail-section">
        <h4>Fusion Result</h4>
        <div className="detail-grid">
          <div className="detail-item">
            <label>Fused Severity</label>
            <span className={`severity-badge severity-${result.fusionResult.fusedSeverity}`}>
              {result.fusionResult.fusedSeverity}
            </span>
          </div>
          <div className="detail-item">
            <label>Fused Confidence</label>
            <span>{(result.fusionResult.fusedConfidence * 100).toFixed(1)}%</span>
          </div>
          <div className="detail-item">
            <label>Sources</label>
            <span>{result.fusionResult.contributingSources.join(', ')}</span>
          </div>
        </div>
        {result.fusionResult.conflicts.length > 0 && (
          <div className="conflicts-list">
            <h5>Conflicts</h5>
            {result.fusionResult.conflicts.map((c, i) => (
              <div key={i} className="conflict-item">
                <span className="conflict-type">{c.type}</span>
                <span className="conflict-resolution">{c.resolution}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )}
    
    {/* Alert Generated */}
    {result.alertGenerated && (
      <div className="detail-section">
        <h4>Alert Generated</h4>
        <div className="detail-grid">
          <div className="detail-item">
            <label>Alert ID</label>
            <span className="monospace">{result.alertGenerated.alertId}</span>
          </div>
          <div className="detail-item">
            <label>Severity</label>
            <span className={`severity-badge severity-${result.alertGenerated.severity?.toLowerCase()}`}>
              {result.alertGenerated.severity}
            </span>
          </div>
          <div className="detail-item">
            <label>Confidence</label>
            <span>{(result.alertGenerated.confidence || 0 * 100).toFixed(1)}%</span>
          </div>
          <div className="detail-item">
            <label>Disaster Type</label>
            <span>{result.alertGenerated.disasterType}</span>
          </div>
          <div className="detail-item">
            <label>CAP XML</label>
            <span>{result.alertGenerated.capXmlGenerated ? '✓ Generated' : '✗ Not Generated'}</span>
          </div>
        </div>
        {result.alertGenerated.messages.length > 0 && (
          <div className="messages-list">
            <h5>Messages</h5>
            {result.alertGenerated.messages.map((msg, i) => (
              <div key={i} className="message-item">
                <span className="message-lang">{msg.lang}</span>
                <span className="message-channel">{msg.channel}</span>
                <span className="message-content">{msg.content.substring(0, 100)}...</span>
                {msg.truncated && <span className="truncated-badge">Truncated</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    )}
    
    {/* Notifications */}
    {result.notificationsSent.length > 0 && (
      <div className="detail-section">
        <h4>Notifications Sent ({result.notificationsSent.length})</h4>
        <div className="notifications-table">
          {result.notificationsSent.map((notif, i) => (
            <div key={i} className={`notification-row ${notif.success ? 'success' : 'failed'}`}>
              <span className="notif-channel">{notif.channel}</span>
              <span className="notif-recipient">{notif.recipient}</span>
              <span className={`notif-status ${notif.success ? 'success' : 'fail'}`}>
                {notif.success ? '✓ Sent' : '✗ Failed'}
              </span>
              {notif.error && <span className="notif-error" title={notif.error}>Error</span>}
            </div>
          ))}
        </div>
      </div>
    )}
    
    {/* Dashboard State */}
    {result.dashboardState && (
      <div className="detail-section">
        <h4>Dashboard State</h4>
        <div className="detail-grid">
          <div className="detail-item"><label>Events Displayed</label><span>{result.dashboardState.eventsDisplayed}</span></div>
          <div className="detail-item"><label>Alerts Displayed</label><span>{result.dashboardState.alertsDisplayed}</span></div>
          <div className="detail-item"><label>Map Markers</label><span>{result.dashboardState.mapMarkers}</span></div>
          <div className="detail-item"><label>Active Alerts</label><span>{result.dashboardState.activeAlerts}</span></div>
        </div>
      </div>
    )}
    
    {/* Database Records */}
    {result.databaseRecords && (
      <div className="detail-section">
        <h4>Database Records</h4>
        <div className="detail-grid">
          <div className="detail-item"><label>Events Inserted</label><span>{result.databaseRecords.eventsInserted}</span></div>
          <div className="detail-item"><label>Alerts Inserted</label><span>{result.databaseRecords.alertsInserted}</span></div>
          <div className="detail-item"><label>Crowd Reports</label><span>{result.databaseRecords.crowdReportsInserted}</span></div>
          <div className="detail-item"><label>Dispatches Recorded</label><span>{result.databaseRecords.dispatchesRecorded}</span></div>
        </div>
      </div>
    )}
    
    {/* Errors */}
    {result.errors.length > 0 && (
      <div className="detail-section">
        <h4>Errors ({result.errors.length})</h4>
        {result.errors.map((err, i) => (
          <div key={i} className="error-item">
            <div className="error-header">
              <span className="error-stage">[{err.stage}]</span>
              <span className="error-time">{formatTime(err.timestamp)}</span>
            </div>
            <div className="error-message">{err.message}</div>
            {err.stack && (
              <details>
                <summary>Stack Trace</summary>
                <pre>{err.stack}</pre>
              </details>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

// Helper functions (defined outside component)
const formatDuration = (ms?: number) => {
  if (!ms) return 'N/A';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

const formatTime = (isoString?: string) => {
  if (!isoString) return 'N/A';
  return new Date(isoString).toLocaleTimeString();
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'PASS': return 'status-pass';
    case 'FAIL': return 'status-fail';
    case 'BLOCKED': return 'status-blocked';
    case 'SKIPPED': return 'status-skipped';
    default: return 'status-unknown';
  }
};

// Need SIMULATION_LABEL
const SIMULATION_LABEL = 'SIMULATION / TEST MODE — NOT REAL-WORLD DATA';

export default SimulationDashboard;