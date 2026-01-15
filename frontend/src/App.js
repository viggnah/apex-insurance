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

// Integration service URL (on port 9090)
const API_URL = "http://localhost:9090";

function App() {
  // Application states: 'dashboard' | 'wizard' | 'processing' | 'success' | 'referred'
  const [appState, setAppState] = useState('dashboard');
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    nationalId: '',
    coverageAmount: ''
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Reset the application
  const resetApp = () => {
    setAppState('dashboard');
    setFormData({ name: '', nationalId: '', coverageAmount: '' });
    setSteps(steps.map(s => ({ ...s, completed: false, active: false })));
    setPolicyData(null);
    setError(null);
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

    // Start step simulation
    const stepsPromise = simulateSteps();

    try {
      // Call the integration service
      const response = await fetch(`${API_URL}/policy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          nationalId: formData.nationalId,
          coverageAmount: parseInt(formData.coverageAmount)
        })
      });

      const data = await response.json();
      
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
      console.error('API Error:', err);
      setError('Failed to connect to the integration service. Please ensure all services are running.');
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
  // RENDER: Wizard State (Form)
  // ============================================
  const renderWizard = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={resetApp}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-gray-800">Life Insurance</h2>
          <div className="w-6" /> {/* Spacer */}
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
          <div className="w-8 h-1 bg-gray-200 rounded"></div>
          <div className="w-3 h-3 rounded-full bg-gray-200"></div>
          <div className="w-8 h-1 bg-gray-200 rounded"></div>
          <div className="w-3 h-3 rounded-full bg-gray-200"></div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            {/* National ID Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                National ID
              </label>
              <input
                type="text"
                name="nationalId"
                value={formData.nationalId}
                onChange={handleInputChange}
                placeholder="1111 (Low Risk) or 2222 (High Risk)"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">Try: 1111 for approval, 2222 for referral</p>
            </div>

            {/* Coverage Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coverage Amount ($)
              </label>
              <input
                type="number"
                name="coverageAmount"
                value={formData.coverageAmount}
                onChange={handleInputChange}
                placeholder="100000"
                required
                min="10000"
                step="10000"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
          >
            Analyze & Issue Policy
          </button>
        </form>
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
  // Main Render
  // ============================================
  return (
    <>
      {appState === 'dashboard' && renderDashboard()}
      {appState === 'wizard' && renderWizard()}
      {appState === 'processing' && renderProcessing()}
      {appState === 'success' && renderSuccess()}
      {appState === 'referred' && renderReferred()}
    </>
  );
}

export default App;
