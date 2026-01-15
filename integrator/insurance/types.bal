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