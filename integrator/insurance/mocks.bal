import ballerina/log;

// Mock Policy Administration Service with Redis caching
// Returns ACTIVE if policyId starts with "ACT", otherwise EXPIRED
function mockPolicyValidation(string policyId) returns PolicyValidationResponse|error {
    
    // Step 1: Check Redis cache first
    string cacheKey = string `policy:validation:${policyId}`;
    
    string|error? cachedValue = check redisClient->get(key = cacheKey);
    
    if cachedValue is string {
        // Cache hit - deserialize and return
        log:printInfo(string `Cache HIT for policy: ${policyId}`);
        json cachedJson = check cachedValue.fromJsonString();
        PolicyValidationResponse cachedResponse = check cachedJson.cloneWithType();
        return cachedResponse;
    }
    
    // Cache miss - call validation service
    log:printInfo(string `Cache MISS for policy: ${policyId}`);
    
    PolicyValidationResponse validationResponse;
    if policyId.startsWith("ACT") {
        validationResponse = {
            status: "ACTIVE",
            coverageType: "COMPREHENSIVE"
        };
    } else {
        validationResponse = {
            status: "EXPIRED"
        };
    }
    
    // Store in Redis cache with TTL
    string responseJson = validationResponse.toJsonString();
    string|error setResult = check redisClient->setEx(key = cacheKey, value = responseJson, expirationTime = cacheTtl);
    
    if setResult is error {
        log:printError(string `Failed to cache policy validation: ${setResult.message()}`);
    } else {
        log:printInfo(string `Cached policy validation for: ${policyId}`);
    }
    
    return validationResponse;
}

// Mock Risk Assessment System
// Accepts the target format and returns a fixed claim reference and approval decision
function mockRiskAssessment(TargetRiskAssessmentRequest riskRequest) returns RiskAssessmentResponse {
    return {
        claimReference: "CLM-9999",
        estimatedPayout: 5000.0,
        decision: "APPROVED"
    };
}
