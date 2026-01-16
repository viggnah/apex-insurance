import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

/**
 * ApexSure Insurance - Digital Insurance Portal
 * 
 * A modern InsurTech frontend demonstrating WSO2 integration capabilities.
 * 
 * States:
 * 1. Dashboard - Welcome screen with "Get New Coverage" button
 * 2. Wizard - Form to collect user information
 * 3. Processing - Live status stepper showing ESB operations
 * 4. Success - Policy certificate with confetti
 */

// API Configuration from environment
const ENV_API_CONFIG = {
  API_MANAGER: {
    url: process.env.REACT_APP_API_MANAGER_URL || 'https://localhost:8300/policy/1.0.0/policy',
    token: process.env.REACT_APP_API_MANAGER_TOKEN || ''
  },
  INTEGRATOR: {
    url: process.env.REACT_APP_INTEGRATOR_URL || 'http://localhost:9090/policy',
    token: null // No token needed for direct integrator
  }
};

function App() {
  // Application states: 'dashboard' | 'wizard' | 'processing' | 'success' | 'referred'
  const [appState, setAppState] = useState('dashboard');
  
  // API Mode toggle - can be switched in UI
  const [apiMode, setApiMode] = useState(process.env.REACT_APP_API_MODE || 'INTEGRATOR');
  
  // Under the Hood panel state
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [requestLog, setRequestLog] = useState(null);
  const [responseLog, setResponseLog] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: 'John Doe',
    nationalId: '1111',
    coverageAmount: '100000'
  });
  
  // Processing steps status
  const [steps, setSteps] = useState([
    { id: 1, text: 'Verifying Identity...', completed: false, active: false },
    { id: 2, text: 'Assessing Risk Score...', completed: false, active: false },
    { id: 3, text: 'Connecting to Legacy Core...', completed: false, active: false },
    { id: 4, text: 'Generating Policy...', completed: false, active: false }
  ]);
  
  // Response data
  const [policyData, setPolicyData] = useState(null);
  const [error, setError] = useState(null);
  
  // Wizard step (1: Personal Info, 2: Coverage Selection, 3: Review)
  const [wizardStep, setWizardStep] = useState(1);

  // Coverage presets
  const coveragePresets = [
    { value: 50000, label: '$50K', description: 'Basic Protection' },
    { value: 100000, label: '$100K', description: 'Standard Coverage' },
    { value: 250000, label: '$250K', description: 'Premium Plan' },
    { value: 500000, label: '$500K', description: 'Elite Coverage' },
  ];

  // Get current API config based on selected mode
  const getCurrentAPI = () => ENV_API_CONFIG[apiMode];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Reset the application
  const resetApp = () => {
    setAppState('dashboard');
    setFormData({ name: 'John Doe', nationalId: '1111', coverageAmount: '100000' });
    setSteps(steps.map(s => ({ ...s, completed: false, active: false })));
    setPolicyData(null);
    setError(null);
    setRequestLog(null);
    setResponseLog(null);
    setWizardStep(1);
  };

  // Simulate step progression during API call
  const simulateSteps = async () => {
    const delays = [500, 1000, 1500, 2000];
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, delays[i]));
      setSteps(prev => prev.map((step, idx) => ({
        ...step,
        active: idx === i,
        completed: idx < i
      })));
    }
  };

  // Submit the policy request
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAppState('processing');
    setError(null);
    setResponseLog(null);

    const currentAPI = getCurrentAPI();

    // Start step simulation
    const stepsPromise = simulateSteps();

    try {
      // Prepare headers based on API mode
      const headers = {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      };
      
      // Add Authorization header for API Manager
      if (apiMode === 'API_MANAGER' && currentAPI.token) {
        headers['Authorization'] = `Bearer ${currentAPI.token}`;
      }

      const requestBody = {
        name: formData.name,
        nationalId: formData.nationalId,
        coverageAmount: parseInt(formData.coverageAmount)
      };

      // Log request for "Under the Hood" panel
      setRequestLog({
        timestamp: new Date().toISOString(),
        method: 'POST',
        url: currentAPI.url,
        headers: {
          ...headers,
          // Mask the token for display
          ...(headers['Authorization'] ? { 'Authorization': `Bearer ${currentAPI.token.substring(0, 20)}...` } : {})
        },
        body: requestBody
      });

      console.log(`🚀 Calling ${apiMode}:`, currentAPI.url);

      // Call the API (either API Manager or Direct Integrator)
      const response = await fetch(currentAPI.url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });

      console.log(`📊 Response Status: ${response.status} ${response.statusText}`);

      // Check for HTTP errors
      if (!response.ok) {
        let errorMessage = '';
        let errorDetails = '';
        let errorData = null;

        // Try to get error details from response body
        try {
          errorData = await response.json();
          errorDetails = errorData.message || errorData.error || errorData.description || JSON.stringify(errorData);
        } catch {
          errorDetails = response.statusText;
        }

        // Log error response
        setResponseLog({
          timestamp: new Date().toISOString(),
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorData,
          error: true
        });

        // Create user-friendly error messages based on status code
        switch (response.status) {
          case 401:
            errorMessage = 'Authentication Failed (401)';
            errorDetails = 'Your access token is invalid or expired. Please update the token in .env.local';
            break;
          case 403:
            errorMessage = 'Access Forbidden (403)';
            errorDetails = errorDetails || 'You do not have permission to access this API';
            break;
          case 404:
            errorMessage = 'API Not Found (404)';
            errorDetails = `The endpoint ${currentAPI.url} was not found. Check your configuration.`;
            break;
          case 429:
            errorMessage = 'Rate Limit Exceeded (429)';
            errorDetails = errorDetails || 'Too many requests. Please wait a moment and try again.';
            break;
          case 500:
            errorMessage = 'Server Error (500)';
            errorDetails = errorDetails || 'The server encountered an internal error. Check backend logs.';
            break;
          case 502:
          case 503:
          case 504:
            errorMessage = `Service Unavailable (${response.status})`;
            errorDetails = errorDetails || 'The backend service is temporarily unavailable. Please try again later.';
            break;
          default:
            errorMessage = `Request Failed (${response.status})`;
            errorDetails = errorDetails || response.statusText;
        }

        console.error('❌ API Error:', errorMessage, errorDetails);
        
        // Stop step animation and show error
        setSteps(prev => prev.map(s => ({ ...s, completed: false, active: false })));
        setError(`${errorMessage}: ${errorDetails}`);
        setAppState('wizard');
        return;
      }

      // Parse successful response
      const data = await response.json();
      console.log('✅ Response Data:', data);

      // Log success response
      setResponseLog({
        timestamp: new Date().toISOString(),
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: data,
        error: false
      });
      
      // Wait for step animation to complete
      await stepsPromise;
      
      // Mark all steps as completed
      setSteps(prev => prev.map(s => ({ ...s, completed: true, active: false })));
      
      // Short delay before showing result
      await new Promise(resolve => setTimeout(resolve, 500));

      if (data.status === 'Referred') {
        setAppState('referred');
        setPolicyData(data);
      } else {
        setPolicyData(data);
        setAppState('success');
        // Trigger confetti!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('❌ Network/Parse Error:', err);
      
      const currentAPI = getCurrentAPI();
      
      // Log network error
      setResponseLog({
        timestamp: new Date().toISOString(),
        status: 0,
        statusText: 'Network Error',
        body: { error: err.message },
        error: true
      });
      
      // Stop step animation
      setSteps(prev => prev.map(s => ({ ...s, completed: false, active: false })));
      
      // Provide detailed error message
      let errorMessage = 'Connection Failed: ';
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        errorMessage += 'Unable to reach the API. Please ensure the service is running';
        if (apiMode === 'API_MANAGER') {
          errorMessage += ' and that HTTPS certificate is trusted.';
        } else {
          errorMessage += ` on ${currentAPI.url}`;
        }
      } else if (err instanceof SyntaxError) {
        errorMessage += 'Invalid response format from server. Expected JSON.';
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
      setAppState('wizard');
    }
  };

  // ============================================
  // RENDER: Dashboard State
  // ============================================
  const renderDashboard = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">ApexSure Insurance</h1>
          <p className="text-gray-500 mt-1">Digital Insurance Portal</p>
        </div>

        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white mb-6">
          <h2 className="text-xl font-semibold mb-2">Welcome, User! 👋</h2>
          <p className="text-blue-100 text-sm">Protect your future with our comprehensive insurance solutions.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">0</p>
            <p className="text-xs text-gray-500">Active Policies</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">$0</p>
            <p className="text-xs text-gray-500">Total Coverage</p>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => setAppState('wizard')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Get New Coverage
        </button>
      </div>
    </div>
  );

  // ============================================
  // RENDER: Wizard State (Form) - Multi-Step
  // ============================================
  const renderWizard = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full animate-fade-in">
        
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative flex items-center justify-between">
            <button
              onClick={resetApp}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center">
              <h2 className="text-xl font-bold">Life Insurance Application</h2>
              <p className="text-blue-100 text-sm">Step {wizardStep} of 3</p>
            </div>
            <div className="w-9"></div>
          </div>
          
          {/* Progress Steps */}
          <div className="relative mt-6 flex items-center justify-between">
            {[
              { num: 1, label: 'Personal' },
              { num: 2, label: 'Coverage' },
              { num: 3, label: 'Review' }
            ].map((step, idx) => (
              <div key={step.num} className="flex flex-col items-center relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  wizardStep > step.num 
                    ? 'bg-green-400 text-white' 
                    : wizardStep === step.num 
                      ? 'bg-white text-blue-600' 
                      : 'bg-white/30 text-white/70'
                }`}>
                  {wizardStep > step.num ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : step.num}
                </div>
                <span className={`text-xs mt-2 ${wizardStep >= step.num ? 'text-white' : 'text-white/50'}`}>
                  {step.label}
                </span>
              </div>
            ))}
            {/* Progress line */}
            <div className="absolute top-5 left-[15%] right-[15%] h-0.5 bg-white/30">
              <div 
                className="h-full bg-green-400 transition-all duration-500"
                style={{ width: `${(wizardStep - 1) * 50}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg mb-6 flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Information */}
            {wizardStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-3">
                    <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
                  <p className="text-sm text-gray-500">Let's start with your basic details</p>
                </div>

                {/* Name Input with Icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Legal Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>
                </div>

                {/* National ID Input with Icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">National ID Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="nationalId"
                      value={formData.nationalId}
                      onChange={handleInputChange}
                      placeholder="Enter your national ID"
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Demo: Use 1111 for approval, 2222 for referral
                  </p>
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  disabled={!formData.name || !formData.nationalId}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Continue to Coverage
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            )}

            {/* Step 2: Coverage Selection */}
            {wizardStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-3">
                    <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Select Your Coverage</h3>
                  <p className="text-sm text-gray-500">Choose the protection level that's right for you</p>
                </div>

                {/* Coverage Preset Cards */}
                <div className="grid grid-cols-2 gap-3">
                  {coveragePresets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, coverageAmount: preset.value.toString() }))}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        parseInt(formData.coverageAmount) === preset.value
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-xl font-bold text-gray-800">{preset.label}</div>
                      <div className="text-xs text-gray-500">{preset.description}</div>
                      {parseInt(formData.coverageAmount) === preset.value && (
                        <div className="mt-2 flex items-center gap-1 text-blue-600 text-xs font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Selected
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Or enter custom amount</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-medium">$</span>
                    </div>
                    <input
                      type="number"
                      name="coverageAmount"
                      value={formData.coverageAmount}
                      onChange={handleInputChange}
                      placeholder="Enter amount"
                      required
                      min="1000"
                      step="1000"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Estimated Premium Display */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Estimated Monthly Premium</div>
                    <div className="text-2xl font-bold text-gray-800">
                      ${((parseInt(formData.coverageAmount) || 0) * 0.0025).toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Coverage</div>
                    <div className="text-lg font-semibold text-blue-600">
                      ${(parseInt(formData.coverageAmount) || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                    </svg>
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardStep(3)}
                    disabled={!formData.coverageAmount || parseInt(formData.coverageAmount) < 1000}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    Review
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review & Submit */}
            {wizardStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-100 rounded-full mb-3">
                    <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Review Your Application</h3>
                  <p className="text-sm text-gray-500">Please confirm your details before submitting</p>
                </div>

                {/* Summary Card */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                  
                  <div className="relative">
                    <div className="text-blue-200 text-xs uppercase tracking-wider mb-4">Application Summary</div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-blue-200 text-xs">Applicant</div>
                          <div className="font-semibold">{formData.name}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-blue-200 text-xs">National ID</div>
                          <div className="font-semibold">{formData.nationalId}</div>
                        </div>
                      </div>
                      
                      <div className="h-px bg-white/20 my-2"></div>
                      
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-blue-200 text-xs">Coverage Amount</div>
                          <div className="text-3xl font-bold">${parseInt(formData.coverageAmount).toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-blue-200 text-xs">Est. Monthly</div>
                          <div className="text-xl font-semibold">${(parseInt(formData.coverageAmount) * 0.0025).toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms Notice */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-gray-500">
                    By submitting this application, you confirm that the information provided is accurate. 
                    Your application will be processed through our automated risk assessment system.
                  </p>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                    </svg>
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Submit Application
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );

  // ============================================
  // RENDER: Processing State
  // ============================================
  const renderProcessing = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 relative">
            <div className="absolute inset-0 bg-blue-400 rounded-full animate-pulse-ring opacity-50"></div>
            <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Processing Your Request</h2>
          <p className="text-gray-500 text-sm mt-1">This shows what the ESB is doing behind the scenes</p>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                step.completed
                  ? 'bg-green-50 border border-green-200'
                  : step.active
                  ? 'bg-blue-50 border border-blue-200'
                  : 'bg-gray-50 border border-gray-100'
              }`}
            >
              {/* Status Icon */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                step.completed
                  ? 'bg-green-500'
                  : step.active
                  ? 'bg-blue-500'
                  : 'bg-gray-300'
              }`}>
                {step.completed ? (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : step.active ? (
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                ) : (
                  <span className="text-white text-sm font-medium">{index + 1}</span>
                )}
              </div>

              {/* Step Text */}
              <div className="flex-1">
                <p className={`font-medium ${
                  step.completed
                    ? 'text-green-700'
                    : step.active
                    ? 'text-blue-700'
                    : 'text-gray-400'
                }`}>
                  {step.text}
                </p>
                {step.active && (
                  <p className="text-xs text-blue-500 mt-1">In progress...</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ============================================
  // RENDER: Success State
  // ============================================
  const renderSuccess = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-fade-in">
        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Policy Issued! 🎉</h2>
          <p className="text-gray-500 text-sm mt-1">Your coverage is now active</p>
        </div>

        {/* Policy Certificate Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white mb-6 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-8 -top-8 w-32 h-32 border-4 border-white rounded-full"></div>
            <div className="absolute -left-4 -bottom-4 w-24 h-24 border-4 border-white rounded-full"></div>
          </div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-blue-200 text-xs uppercase tracking-wider">Policy Certificate</span>
              <span className="bg-green-400 text-green-900 text-xs font-bold px-2 py-1 rounded">
                {policyData?.status || 'ACTIVE'}
              </span>
            </div>
            
            <p className="text-2xl font-bold mb-4">{policyData?.policyId || 'POL-XXXXXX'}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-200">Policyholder</p>
                <p className="font-semibold">{formData.name}</p>
              </div>
              <div>
                <p className="text-blue-200">Coverage</p>
                <p className="font-semibold">${parseInt(formData.coverageAmount).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-blue-200">Premium</p>
                <p className="font-semibold">${policyData?.premium || 'N/A'}/month</p>
              </div>
              <div>
                <p className="text-blue-200">Issue Date</p>
                <p className="font-semibold">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF Certificate
          </button>
          
          <button
            onClick={resetApp}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  // ============================================
  // RENDER: Referred State (High Risk)
  // ============================================
  const renderReferred = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
            <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Application Referred</h2>
          <p className="text-gray-500 text-sm mt-1">Additional review required</p>
        </div>

        {/* Info Card */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">What does this mean?</h3>
          <p className="text-yellow-700 text-sm mb-4">
            {policyData?.reason || 'Your application requires manual review by our underwriting team.'}
          </p>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Status</span>
              <span className="font-semibold text-yellow-600">{policyData?.status}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600">Reason</span>
              <span className="font-semibold text-gray-800">{policyData?.reason}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={resetApp}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  // ============================================
  // RENDER: Under the Hood Panel (Dev Tools)
  // ============================================
  const renderDevPanel = () => (
    <div className={`fixed top-0 right-0 h-full bg-gray-900 text-gray-100 transition-all duration-300 z-50 overflow-hidden ${showDevPanel ? 'w-96' : 'w-0'}`}>
      <div className="w-96 h-full flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span className="font-semibold">Under the Hood</span>
          </div>
          <button 
            onClick={() => setShowDevPanel(false)}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* API Mode Toggle */}
        <div className="p-4 bg-gray-800 border-b border-gray-700">
          <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">API Mode</label>
          <div className="flex gap-2">
            <button
              onClick={() => setApiMode('INTEGRATOR')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                apiMode === 'INTEGRATOR' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Integrator
            </button>
            <button
              onClick={() => setApiMode('API_MANAGER')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                apiMode === 'API_MANAGER' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              API Manager
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {apiMode === 'INTEGRATOR' ? '→ Direct to Integrator (9090)' : '→ Via API Manager (8300)'}
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Current Endpoint */}
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Endpoint</label>
            <code className="block bg-gray-800 rounded p-2 text-xs text-green-400 break-all">
              {getCurrentAPI().url}
            </code>
          </div>

          {/* Request Section */}
          {requestLog && (
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">
                📤 Request
                <span className="text-gray-500 ml-2 normal-case">
                  {new Date(requestLog.timestamp).toLocaleTimeString()}
                </span>
              </label>
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="bg-blue-600 px-3 py-1 text-xs font-mono">
                  {requestLog.method} {requestLog.url.split('/').slice(-2).join('/')}
                </div>
                <div className="p-3 space-y-2">
                  <div>
                    <span className="text-xs text-gray-500">Headers:</span>
                    <pre className="text-xs text-yellow-300 mt-1 overflow-x-auto">
{JSON.stringify(requestLog.headers, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Body:</span>
                    <pre className="text-xs text-cyan-300 mt-1">
{JSON.stringify(requestLog.body, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Response Section */}
          {responseLog && (
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">
                📥 Response
                <span className="text-gray-500 ml-2 normal-case">
                  {new Date(responseLog.timestamp).toLocaleTimeString()}
                </span>
              </label>
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <div className={`px-3 py-1 text-xs font-mono ${
                  responseLog.error ? 'bg-red-600' : 'bg-green-600'
                }`}>
                  {responseLog.status} {responseLog.statusText}
                </div>
                <div className="p-3 space-y-2">
                  {responseLog.headers && Object.keys(responseLog.headers).length > 0 && (
                    <div>
                      <span className="text-xs text-gray-500">Headers:</span>
                      <pre className="text-xs text-yellow-300 mt-1 overflow-x-auto max-h-24">
{JSON.stringify(responseLog.headers, null, 2)}
                      </pre>
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-gray-500">Body:</span>
                    <pre className={`text-xs mt-1 ${responseLog.error ? 'text-red-300' : 'text-green-300'}`}>
{JSON.stringify(responseLog.body, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!requestLog && !responseLog && (
            <div className="text-center text-gray-500 py-8">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Submit a request to see the API traffic</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-800 border-t border-gray-700 text-center">
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${
            apiMode === 'INTEGRATOR' ? 'bg-blue-900 text-blue-300' : 'bg-purple-900 text-purple-300'
          }`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
            {apiMode === 'INTEGRATOR' ? 'Direct Integrator Mode' : 'API Manager Mode'}
          </span>
        </div>
      </div>
    </div>
  );

  // ============================================
  // RENDER: Toggle Button (floating)
  // ============================================
  const renderDevToggle = () => (
    <button
      onClick={() => setShowDevPanel(!showDevPanel)}
      className={`fixed top-4 right-4 z-40 p-3 rounded-xl shadow-lg transition-all duration-200 ${
        showDevPanel 
          ? 'bg-gray-700 text-white translate-x-[-400px]' 
          : 'bg-gray-800 text-white hover:bg-gray-700'
      }`}
      title="Toggle Developer Panel"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    </button>
  );

  // ============================================
  // Main Render
  // ============================================
  return (
    <>
      {/* Main App Content */}
      {appState === 'dashboard' && renderDashboard()}
      {appState === 'wizard' && renderWizard()}
      {appState === 'processing' && renderProcessing()}
      {appState === 'success' && renderSuccess()}
      {appState === 'referred' && renderReferred()}
      
      {/* Developer Tools */}
      {renderDevToggle()}
      {renderDevPanel()}
    </>
  );
}

export default App;
