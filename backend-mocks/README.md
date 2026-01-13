# ApexSure Backend Mocks

Mock backend services simulating legacy insurance systems.

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/risk/:id` | GET | Risk Assessment Service |
| `/soap/policy` | POST | Legacy Policy Core (XML) |
| `/health` | GET | Health Check |

## Test Data

| National ID | Risk Score | Risk Level |
|-------------|------------|------------|
| 1111 | 850 | Low |
| 2222 | 500 | High |
| Other | Random (500-900) | Varies |

## Quick Start

```bash
npm install
npm start
```

Server runs on `http://localhost:3000`
