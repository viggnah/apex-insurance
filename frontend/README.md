# ApexSure Frontend

Modern InsurTech frontend for the ApexSure Insurance demo.

## Features

- **Dashboard** - Welcome screen with policy overview
- **Smart Wizard** - 3-step form for policy application
- **Live Status Stepper** - Shows ESB operations in real-time
- **Success/Referred States** - Visual feedback based on risk assessment

## Tech Stack

- React 18
- Tailwind CSS
- Canvas Confetti (for success animation)

## Quick Start

```bash
npm install
npm start
```

Frontend runs on `http://localhost:3000` (or 3001 if 3000 is busy)

## Test Scenarios

| National ID | Expected Result |
|-------------|-----------------|
| 1111 | Policy Approved (Low Risk) |
| 2222 | Application Referred (High Risk) |
| Other | Random outcome |

## API Integration

The frontend calls the Ballerina integration service at `http://localhost:9090/issue-policy`
