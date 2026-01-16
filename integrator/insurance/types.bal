// Request and response types

type PolicyRequest record {
    string name;
    string nationalId;
    int coverageAmount;
};

type RiskResponse record {
    int score;
    string riskLevel;
};

type PolicyResponse record {
    string policyId;
    string status;
    decimal premium;
};

type ReferralResponse record {
    string status;
    string reason;
};

// SOAP XML types
type SoapPolicy record {
    string Id;
    string Status;
};

type PolicyXml record {
    SoapPolicy Policy;
};

// Claims API types
type ClaimRequest record {
    string policyId;
    string claimantName;
    string vehicleNumber;
    string incidentDate;
    string incidentDescription;
    decimal estimatedDamage;
};

type PolicyValidationResponse record {
    string status;
    string? coverageType?;
};

type RiskAssessmentResponse record {
    string claimReference;
    decimal estimatedPayout;
    string decision;
};

type ClaimSubmissionResponse record {
    string claimReference;
    string decision;
};

type ErrorResponse record {
    string message;
};

// Data Mapping Types - Source Structure
type IncidentDetails record {
    string date;
    string desc;
    decimal estimated_cost;
};

type Vehicle record {
    string make;
    int year;
};

type SourceClaimRequest record {
    string user_id;
    string policy_ref;
    IncidentDetails incident_details;
    Vehicle vehicle;
};

// Data Mapping Types - Target Structure
type TargetRiskAssessmentRequest record {
    string claimantId;
    string policyNumber;
    string incidentDate;
    string damageReport;
    decimal claimAmount;
    string assetDescription;
};
