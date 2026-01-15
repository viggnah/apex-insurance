# 🚀 ApexSure Insurance - Run Guide

## Prerequisites

- **Node.js** (v16 or higher)
- **Ballerina** (Swan Lake or higher)
- **npm** or **yarn**

## Architecture Overview

```
┌──────────────────┐     ┌────────────────────┐     ┌──────────────────┐
│   React Frontend │────▶│ Ballerina Service  │────▶│  Backend Mocks   │
│   (Port 3001)    │     │   (Port 9090)      │     │   (Port 3000)    │
└──────────────────┘     └────────────────────┘     └──────────────────┘
                              │                           │
                              │  1. Risk Check (REST)     │
                              │─────────────────────────▶│
                              │                           │
                              │  2. Policy Issue (SOAP)   │
                              │─────────────────────────▶│
```

## Quick Start (3 Terminals)

### Terminal 1: Start Backend Mocks

```bash
cd backend-mocks
npm install
npm start
```

✅ Server running on http://localhost:3000

### Terminal 2: Start Ballerina Integration Service

```bash
cd integrator/insurance
bal run
```

✅ Service running on http://localhost:9090

### Terminal 3: Start React Frontend

```bash
cd frontend
npm install
npm start
```

✅ App running on http://localhost:3001 (opens automatically)

---

## 🧪 Test Scenarios

| National ID | Risk Score | Expected Result |
|-------------|------------|-----------------|
| `1111` | 850 (Low) | ✅ Policy Approved |
| `2222` | 500 (High) | ⚠️ Application Referred |
| Other | Random | Varies |

---

## 📁 Project Structure

```
JInsurance/
├── backend-mocks/          # Node.js mock services
│   ├── server.js           # Express server with SOAP & REST mocks
│   └── package.json
│
├── integrator/insurance/   # Ballerina integration service
│   ├── main.bal           # HTTP listener & /policy endpoint
│   └── ...
│
├── frontend/              # React + Tailwind CSS app
│   ├── src/App.js         # Main application with all states
│   └── ...
│
├── api-spec/
│   └── apex-api.yaml      # OpenAPI 3.0 specification
│
└── RUN_GUIDE.md           # This file
```

---

## 🎯 Demo Flow

1. **Open the Frontend** at http://localhost:3001
2. **Click "Get New Coverage"** to start the wizard
3. **Fill in the form:**
   - Name: Any name
   - National ID: `1111` (for success) or `2222` (for referral)
   - Coverage Amount: Any amount (e.g., 100000)
4. **Click "Analyze & Issue Policy"**
5. **Watch the Live Status Stepper** showing ESB operations
6. **See the Result:**
   - `1111` → Policy Certificate with confetti 🎉
   - `2222` → Referral notice ⚠️

---

## 🔧 Troubleshooting

### "Failed to connect to integration service"
- Ensure Ballerina service is running on port 9090
- Check that backend mocks are running on port 3000

### Port conflicts
- Backend mocks: Change `PORT` in `backend-mocks/server.js`
- React: Automatically uses next available port (3001, 3002, etc.)
- Ballerina: Change listener port in `main.bal`

### CORS issues
- Backend mocks include CORS middleware
- Ballerina service should also allow CORS from localhost:3001

---

## 📚 API Testing

You can test the Ballerina integration directly:

```bash
# Test with low-risk ID (should succeed)
curl -X POST http://localhost:9090/policy \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","nationalId":"1111","coverageAmount":100000}'

# Test with high-risk ID (should be referred)
curl -X POST http://localhost:9090/policy \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Smith","nationalId":"2222","coverageAmount":50000}'
```

---

Happy Demo! 🎉
