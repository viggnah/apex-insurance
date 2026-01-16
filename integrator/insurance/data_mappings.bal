// Data Mapping Functions

function transform(SourceClaimRequest request) returns TargetRiskAssessmentRequest => {
    policyNumber: request.policy_ref,
    claimAmount: request.incident_details.estimated_cost,
    incidentDate: request.incident_details.date,
    damageReport: request.incident_details.desc
,
    assetDescription: request.vehicle.make + " " + request.vehicle.year.toString()
,
    claimantId: request.user_id
};
