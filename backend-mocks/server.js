/**
 * ApexSure Insurance - Backend Mock Services
 * 
 * This server simulates legacy backend systems:
 * 1. Risk Assessment Service (REST)
 * 2. Policy Core System (SOAP-like XML)
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.text({ type: 'application/xml' }));
app.use(bodyParser.text({ type: 'text/xml' }));

// ============================================
// MOCK 1: Risk Assessment Service (REST)
// ============================================
app.get('/risk/:id', (req, res) => {
    const { id } = req.params;
    console.log(`[RISK SERVICE] Checking risk for ID: ${id}`);

    // Simulated delay to make demo more realistic
    setTimeout(() => {
        let response;

        switch (id) {
            case '1111':
                response = { score: 850, riskLevel: 'Low' };
                break;
            case '2222':
                response = { score: 500, riskLevel: 'High' };
                break;
            default:
                // Random score for other IDs (for demo flexibility)
                const score = Math.floor(Math.random() * 400) + 500; // 500-900
                response = {
                    score: score,
                    riskLevel: score > 700 ? 'Low' : score > 550 ? 'Medium' : 'High'
                };
        }

        console.log(`[RISK SERVICE] Response:`, response);
        res.json(response);
    }, 300); // 300ms delay
});

// ============================================
// MOCK 2: Legacy Policy Core System (SOAP-like)
// ============================================
app.post('/soap/policy', (req, res) => {
    console.log(`[SOAP SERVICE] Received policy request`);
    console.log(`[SOAP SERVICE] Body:`, req.body);

    // Generate a random policy ID
    const policyId = `POL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Simulated delay for legacy system
    setTimeout(() => {
        const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<PolicyResponse>
    <Policy>
        <Id>${policyId}</Id>
        <Status>Active</Status>
        <CreatedAt>${new Date().toISOString()}</CreatedAt>
    </Policy>
</PolicyResponse>`;

        console.log(`[SOAP SERVICE] Returning policy ID: ${policyId}`);
        res.set('Content-Type', 'application/xml');
        res.send(xmlResponse);
    }, 500); // 500ms delay
});

// ============================================
// Health Check Endpoint
// ============================================
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'ApexSure Backend Mocks' });
});

// ============================================
// Start Server
// ============================================
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🏦 ApexSure Backend Mock Services');
    console.log('='.repeat(50));
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('');
    console.log('Available Endpoints:');
    console.log(`  GET  /risk/:id      - Risk Assessment Service`);
    console.log(`  POST /soap/policy   - Legacy Policy Core (XML)`);
    console.log(`  GET  /health        - Health Check`);
    console.log('');
    console.log('Test IDs:');
    console.log('  1111 -> Low Risk (Score: 850)');
    console.log('  2222 -> High Risk (Score: 500)');
    console.log('='.repeat(50));
});
