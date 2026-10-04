# PR-Alert Simulation & Testing System

> **A complete synthetic-data simulation framework for testing the PR-Alert Universal Multi-Disaster Pre-Alert Platform**

[![Simulation Mode](https://img.shields.io/badge/Mode-SIMULATION%20ONLY-red)](https://github.com/shub99913/PR-Alert-Simulation)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-Jest-green)](https://jestjs.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 🎯 What is This?

This system lets you **test the entire PR-Alert disaster alert pipeline** using **fake/synthetic disaster data** instead of real-world events. You can simulate floods, earthquakes, cyclones, wildfires, and more—then watch exactly how the system detects, classifies, alerts, and dispatches notifications.

**Think of it as a "flight simulator" for disaster alert systems.**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SIMULATION MODE ENABLED                               │
│              SIMULATION / TEST MODE — NOT REAL-WORLD DATA                   │
└─────────────────────────────────────────────────────────────────────────────┘

Synthetic Event → Normalization → Detection → Fusion → Alert → Dispatch
     │               │             │          │       │        │
     ▼               ▼             ▼          ▼       ▼        ▼
  Fake Data      Real Code     Real Code  Real Code Real Code Real Code
  (JSON/CSV)     (TypeScript)  (JSONLogic) (TS)     (Handlebars) (Simulated)
```

---

## ✨ Key Features

### 🧪 **27+ Predefined Test Scenarios**
| Category | Examples |
|----------|----------|
| **Flood** | Critical flash flood, moderate riverine, boundary threshold tests |
| **Earthquake** | M7.5 Himalayan, M5.5 peninsula, M8.0 undersea with tsunami |
| **Landslide** | Catastrophic hill station |
| **Cyclone** | Category 4 east coast landfall |
| **Wildfire** | Large forest fire |
| **Heatwave** | 48°C extreme North India |
| **Drought** | Severe meteorological |
| **Tsunami** | Indian Ocean warning |
| **Multi-Hazard** | Rainfall→landslide, earthquake→tsunami cascading |
| **Boundary** | Values exactly at/just above/just below thresholds |
| **Negative** | Missing fields, invalid coords, negative values, future timestamps |
| **Reliability** | Network failure, offline mode, API timeout |
| **Recovery** | Flood receding, cyclone dissipated, alert cancellation |
| **Escalation** | Rapid warning→alert→emergency in minutes |

### 🎮 **Full Simulation Controls**
| Control | Description |
|---------|-------------|
| **Play** | Start a scenario or custom event stream |
| **Pause** | Freeze execution mid-scenario |
| **Resume** | Continue from pause point |
| **Step** | Execute single event (when paused) |
| **Replay** | Re-run last scenario |
| **Speed** | 0.1x to 10x real-time |
| **Reset** | Clear all state and results |
| **Load File** | Import scenarios from JSON |

### ✅ **Validation Framework**
Every test produces a **PASS / FAIL / BLOCKED** verdict with detailed checks:

| Check | Purpose |
|-------|---------|
| Alert Triggered | Did alert fire when expected? |
| Alert Severity | Matches/exceeds expected level? |
| Risk Category | Correct classification? |
| Notifications Sent | Were notifications dispatched? |
| Channels Used | SMS, Push, Email, WhatsApp, Cell Broadcast, Siren, Radio, TV? |
| Message Content | Contains required keywords? |
| Actions Taken | issue_alert, dispatch_notifications, activate_sirens, etc. |
| Dashboard State | Events, alerts, map markers correct? |
| Database Records | Events/alerts inserted? |
| Escalation | Proper severity escalation? |
| Recovery | Downgrade/cancellation behavior? |
| Map Markers | Correct geographic markers? |

### 🛡️ **Production Safety (Non-Negotiable)**
- **Never mixes synthetic with production data**
- **SIMULATION_MODE flag** required (throws if missing)
- **Test database** (`pr-alert-simulation` with `sim_` prefix)
- **Test notification adapters** (log only, never send)
- **Explicit mode checks** in every simulation class
- **Visible labels** everywhere: "SIMULATION / TEST MODE — NOT REAL-WORLD DATA"

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         PR-ALERT SIMULATION SYSTEM                          │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────────┐    ┌────────────────────────┐   │
│  │   SCENARIOS  │───▶│ SimulationEngine │───▶│   PIPELINE (REAL)      │   │
│  │  (27+ built) │    │  (Controls)      │    │                        │   │
│  └──────────────┘    └──────────────────┘    │  ┌──────────────────┐  │   │
│         ▲                    │               │  │ Normalization    │  │   │
│         │                    ▼               │  │ @pr-alert/       │  │   │
│  ┌──────────────┐    ┌──────────────────┐    │  │ normalization  │  │   │
│  │  API / UI    │◀───│  Event Bus       │    │  └────────┬─────────┘  │   │
│  │  (REST+React)│    │  (Emitter)       │    │           ▼            │   │
│  └──────────────┘    └──────────────────┘    │  ┌──────────────────┐  │   │
│                                               │  │ Detection        │  │   │
│  ┌──────────────┐                             │  │ @pr-alert/       │  │   │
│  │  Validator   │◀────────────────────────────│  │ detection      │  │   │
│  │ (PASS/FAIL)  │    Expected vs Actual       │  │ (RuleEngine)   │  │   │
│  └──────────────┘                             │  └────────┬─────────┘  │   │
│                                                │           ▼            │   │
│                                               │  ┌──────────────────┐  │   │
│                                               │  │ Fusion           │  │   │
│                                               │  │ @pr-alert/       │  │   │
│                                               │  │ fusion           │  │   │
│                                               │  └────────┬─────────┘  │   │
│                                                │           ▼            │   │
│                                               │  ┌──────────────────┐  │   │
│                                               │  │ Alert Generation │  │   │
│                                               │  │ @pr-alert/       │  │   │
│                                               │  │ messaging        │  │   │
│                                               │  └────────┬─────────┘  │   │
│                                                │           ▼            │   │
│                                               │  ┌──────────────────┐  │   │
│                                               │  │ Dispatch         │  │   │
│                                               │  │ @pr-alert/       │  │   │
│                                               │  │ dispatch         │  │   │
│                                               │  │ (SIMULATED)      │  │   │
│                                               │  └──────────────────┘  │   │
│                                               └────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB (for test DB)
- Redis (optional, for dispatch queue)

### Installation

```bash
# Clone
git clone https://github.com/shub99913/PR-Alert-Simulation.git
cd PR-Alert-Simulation

# Install dependencies
npm install

# Build all packages
npm run build
```

### Run API Server (Simulation Mode)

```bash
# Required: Enable simulation mode
export SIMULATION_MODE=true
export NODE_ENV=test
export ENABLE_REAL_DISPATCH=false

# Optional: Test database
export MONGODB_URI=mongodb://localhost:27017/pr-alert-simulation

# Start server
cd apps/api
npm run dev
```

Server runs at `http://localhost:3001`

### Run Dashboard (Optional)

```bash
cd apps/dashboard
npm run dev
```

Dashboard at `http://localhost:5173` — add `<SimulationDashboard />` to your routes.

---

## 📚 Usage Guide

### 1. List Available Scenarios

```bash
curl http://localhost:3001/api/simulation/scenarios
```

Response:
```json
{
  "scenarios": [
    {
      "id": "flood-critical-001",
      "name": "Critical Flash Flood - Urban Area",
      "description": "Rapidly rising flood waters in urban area with extreme rainfall",
      "category": "positive",
      "disasterType": "flood",
      "severity": "emergency"
    },
    ...
  ],
  "count": 27
}
```

### 2. Run a Scenario

```bash
curl -X POST http://localhost:3001/api/simulation/start \
  -H "Content-Type: application/json" \
  -d '{"scenarioId": "flood-critical-001", "speed": 10}'
```

### 3. Monitor Real-Time Results

```bash
# Poll for results
curl http://localhost:3001/api/simulation/results

# Or get summary
curl http://localhost:3001/api/simulation/summary
```

### 4. Control Simulation

```bash
# Pause
curl -X POST http://localhost:3001/api/simulation/pause

# Resume
curl -X POST http://localhost:3001/api/simulation/resume

# Single step (when paused)
curl -X POST http://localhost:3001/api/simulation/step

# Change speed
curl -X POST http://localhost:3001/api/simulation/speed \
  -H "Content-Type: application/json" \
  -d '{"speed": 5}'

# Stop
curl -X POST http://localhost:3001/api/simulation/stop
```

### 5. Export Results

```bash
# JSON
curl http://localhost:3001/api/simulation/export?format=json > results.json

# CSV
curl http://localhost:3001/api/simulation/export?format=csv > results.csv
```

### 6. Programmatic Usage

```typescript
import { 
  SimulationEngine, 
  runQuickTest, 
  runAllScenarios,
  PREDEFINED_SCENARIOS 
} from '@pr-alert/simulation';

// Quick single test
const suite = await runQuickTest('flood-critical-001', { 
  speed: 10,
  onProgress: (result) => console.log(`${result.testCaseId}: ${result.validation?.status}`),
  onComplete: (suite) => console.log(`Pass rate: ${suite.summary.passPercentage}%`)
});

// Run all scenarios
const allResults = await runAllScenarios({ 
  speed: 5,
  onScenarioComplete: (id, suite) => console.log(`${id}: ${suite.summary.passed}/${suite.summary.total}`)
});

// Full engine control
const engine = new SimulationEngine({ 
  simulationConfig: { speed: 5, eventIntervalMs: 100 }
});

engine.on('event_complete', (result) => {
  console.log(`${result.testCaseId}: ${result.validation?.status}`);
});

engine.on('scenario_complete', (suite) => {
  console.log(`Complete: ${suite.summary.passed}/${suite.summary.total} passed`);
});

await engine.startScenario('earthquake-major-004');
```

### 7. Custom Scenarios from File

```json
// my-scenario.json
{
  "events": [
    {
      "testCaseId": "custom-flood-001",
      "scenarioType": "flood",
      "scenarioName": "My Custom Flood",
      "location": { 
        "name": "My City", 
        "coordinates": [77.5, 28.5], 
        "district": "Test", 
        "state": "Delhi", 
        "country": "India" 
      },
      "timestamp": "2026-07-15T10:00:00Z",
      "severity": "emergency",
      "sensorData": { "rainfallMmPerHour": 180, "riverLevelMeters": 9.5 },
      "expectedOutcome": { "shouldTriggerAlert": true, "expectedAlertLevel": "emergency" }
    }
  ]
}
```

```bash
curl -X POST http://localhost:3001/api/simulation/load-file \
  -H "Content-Type: application/json" \
  -d '{"filePath": "/tmp/my-scenario.json"}'
```

---

## 🧪 Test Scenarios Reference

### Positive Tests (Should Trigger Alerts)
| ID | Name | Type | Severity | Key Features |
|----|------|------|----------|--------------|
| `flood-critical-001` | Critical Flash Flood | Flood | Emergency | 150mm/hr rain, 8.5m river |
| `flood-moderate-002` | Moderate Riverine Flood | Flood | Warning | 45mm/hr rain, 5.2m river |
| `earthquake-major-004` | Major M7.5 Himalayan | Earthquake | Emergency | Shallow 15km, aftershock risk |
| `earthquake-moderate-005` | Moderate M5.5 Peninsula | Earthquake | Alert | 10km depth |
| `earthquake-tsunami-006` | Undersea M8.0 + Tsunami | Earthquake | Emergency | Tsunami risk |
| `landslide-critical-007` | Catastrophic Hill Station | Landslide | Emergency | 500mm ground movement |
| `cyclone-severe-008` | Category 4 East Coast | Cyclone | Emergency | 210 km/h winds, 4m surge |
| `wildfire-large-009` | Large Forest Fire | Wildfire | Alert | 500 ha, 2 km/h spread |
| `heatwave-extreme-010` | Extreme 48°C North India | Heatwave | Emergency | 5 consecutive days |
| `drought-severe-011` | Severe Meteorological | Drought | Alert | 85% drought index |
| `tsunami-warning-012` | Indian Ocean Tsunami | Tsunami | Emergency | 3m wave, 45min ETA |

### Boundary Tests (Threshold Edge Cases)
| ID | Name | Description |
|----|------|-------------|
| `flood-boundary-003` | Flood Threshold | 50mm/hr exactly at warning threshold |
| `variation: Just Below` | 49mm/hr | Should NOT trigger |
| `variation: Just Above` | 51mm/hr | Should trigger |

### Negative Tests (Should NOT Trigger / Should Handle Gracefully)
| ID | Name | Issue Tested |
|----|------|--------------|
| `negative-missing-fields-015` | Missing Required Fields | Validation rejection |
| `negative-invalid-coords-016` | Invalid Coordinates | lat>90, lon>180 |
| `negative-negative-values-017` | Negative Sensor Values | -50mm rain |
| `negative-future-timestamp-018` | Future Timestamp | Year 2099 |
| `negative-unknown-type-019` | Unknown Disaster Type | Schema validation |
| `negative-duplicate-event-020` | Duplicate Event ID | Deduplication |

### Reliability Tests (Failure Injection)
| ID | Name | Failure Simulated |
|----|------|-------------------|
| `reliability-network-failure-021` | Network Failure | Connection drops |
| `reliability-offline-mode-022` | Offline Mode | Local processing only |

### Recovery Tests
| ID | Name | Behavior |
|----|------|----------|
| `recovery-flood-receding-025` | Flood Receding | Alert downgrade emergency→warning |
| `recovery-alert-cancelled-026` | Cyclone Dissipated | Alert cancellation notice |

### Escalation Tests
| ID | Name | Behavior |
|----|------|----------|
| `escalation-rapid-027` | Rapid Escalation | Warning→Alert→Emergency in 60 min |

---

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SIMULATION_MODE` | **YES** | `false` | Must be `true` or `NODE_ENV=test` |
| `NODE_ENV` | **YES** | `development` | `test` enables simulation |
| `ENABLE_REAL_DISPATCH` | **YES** | `false` | Must be `false` in simulation |
| `MONGODB_URI` | No | `mongodb://localhost:27017/pr-alert` | Test DB: `pr-alert-simulation` |
| `REDIS_URL` | No | `redis://localhost:6379` | Dispatch queue |

### Simulation Config (Programmatic)

```typescript
const engine = new SimulationEngine({
  simulationConfig: {
    speed: 5.0,              // 5x real-time
    autoAdvance: true,       // Auto-process timeline
    eventIntervalMs: 100,    // ms between events at 1x
    maxEvents: 0,            // 0 = unlimited
    injectFailures: false,   // Enable failure injection
    failureConfig: {
      networkFailureRate: 0.1,
      apiFailureRate: 0.05,
      notificationFailureRate: 0.05,
      duplicateRate: 0.02,
      delayRate: 0.05,
      missingFieldRate: 0.03,
      invalidValueRate: 0.02,
      offlineMode: false
    },
    validationConfig: {
      strictMode: false,     // true = exact match required
      partialMatch: true,    // Allow partial object matching
      ignoreTimestamps: true,
      ignoreIds: true
    }
  }
});
```

---

## 📊 Output & Reports

### Test Result (Per Event)
```json
{
  "testCaseId": "flood-critical-001",
  "validation": {
    "status": "PASS",
    "passedChecks": ["alert_triggered", "alert_severity", "notifications_sent", ...],
    "failedChecks": [],
    "score": 100
  },
  "detectionResult": {
    "triggered": true,
    "maxSeverity": "emergency",
    "maxConfidence": 0.95,
    "triggeredRules": ["flood-severe"],
    "recommendedAction": "immediate_alert"
  },
  "alertGenerated": {
    "alertId": "alert_123",
    "severity": "emergency",
    "messages": [{ "lang": "en", "channel": "sms", "content": "EMERGENCY: Flood..." }]
  },
  "notificationsSent": [
    { "channel": "sms", "success": true, "simulated": true },
    { "channel": "push", "success": true, "simulated": true }
  ]
}
```

### Suite Summary
```json
{
  "suiteId": "suite_123",
  "summary": {
    "total": 5,
    "passed": 4,
    "failed": 1,
    "blocked": 0,
    "passPercentage": 80,
    "totalAlertsGenerated": 4,
    "totalNotificationsSent": 12,
    "totalErrors": 0
  }
}
```

---

## 🧰 Development

### Run Tests

```bash
cd packages/simulation
npm test
```

### Add New Scenario

1. Add to `PREDEFINED_SCENARIOS` in `packages/simulation/src/schemas.ts`
2. Follow existing schema structure
3. Run tests: `npm test`

### Extend Validation

Add new checks in `SimulationValidator.validate()`:

```typescript
if (expected.myNewCheck) {
  this.checkMyNewCheck(context, expected);
}
```

---

## 🔒 Safety Checklist

Before running ANY simulation:

- [ ] `SIMULATION_MODE=true` set
- [ ] `NODE_ENV=test` set
- [ ] `ENABLE_REAL_DISPATCH=false` confirmed
- [ ] No production API keys in env (Twilio, SendGrid, FCM, WhatsApp)
- [ ] MongoDB points to `pr-alert-simulation` database
- [ ] Dashboard shows "SIMULATION MODE" badge

---

## 📖 Related Documentation

- [PR-Alert Architecture](ARCHITECTURE.md)
- [API Reference](docs/api.md) *(to be created)*
- [Dashboard Components](apps/dashboard/src/components/simulation/)
- [Simulation Package](packages/simulation/)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-scenario`
3. Add scenario + tests
4. Run `npm test` and `npm run build`
5. Submit PR

---

## ⚠️ Disclaimer

> **This is a TESTING TOOL ONLY.**
> 
> - Outputs are **not scientifically accurate predictions**
> - Uses **rule-based logic**, not ML models (unless E08 enabled)
> - **Never use for real emergency decisions**
> - All alerts/notifications are **simulated**
> - Data is **synthetic**, not historical

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

Built for the **PR-Alert Universal Multi-Disaster Pre-Alert Platform** — a modular, engine-based disaster intelligence system for India.

**19 Engines** | **Open Data Sources** | **Multi-Language** | **CAP v1.2 Compliant**