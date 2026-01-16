# API Configuration Guide

## Quick Switch Between API Manager and Integrator

Edit [.env.local](frontend/.env.local) to switch modes:

### Option 1: Use API Manager (WSO2 APIM)
```env
REACT_APP_API_MODE=API_MANAGER
REACT_APP_API_MANAGER_URL=https://localhost:8300/policy/1.0.0/policy
REACT_APP_API_MANAGER_TOKEN=<paste_your_token_here>
```

### Option 2: Use Direct Integrator (Ballerina)
```env
REACT_APP_API_MODE=INTEGRATOR
REACT_APP_INTEGRATOR_URL=http://localhost:9090/policy
```

## Updating the Bearer Token

1. Get a new token from API Manager
2. Open [frontend/.env.local](frontend/.env.local)
3. Replace the value of `REACT_APP_API_MANAGER_TOKEN`
4. Restart the React app (`npm start`)

## Security Note

- `.env.local` is in `.gitignore` - your tokens won't be committed
- Use `.env.local.template` as a reference for the structure
- Never commit actual tokens to version control

## Testing

After changing the mode, the console will show:
```
🔗 API Mode: API_MANAGER (or INTEGRATOR)
📍 Endpoint: <the URL being used>
```

When you submit a policy request, you'll see:
```
🚀 Calling API_MANAGER: https://localhost:8300/policy/1.0.0/policy
```
