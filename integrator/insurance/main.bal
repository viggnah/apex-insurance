import ballerina/http;
import ballerina/io;
import ballerina/data.xmldata;

// HTTP listener on port 9090
listener http:Listener httpListener = check new (9090);

@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["*", "Content-Type", "Authorization"],
        maxAge: 3600
    }
}
service / on httpListener {

    resource function post policy(@http:Payload PolicyRequest request) returns PolicyResponse|ReferralResponse|error {

        // Step 1: Log the request
        io:println(string `Received Request for ${request.name}`);
        
        // Step 2: Risk Check - Call the risk endpoint
        string riskPath = string `/risk/${request.nationalId}`;
        RiskResponse riskResponse = check backendClient->get(riskPath);
        
        // Step 3: Branching based on risk score
        if riskResponse.score > 700 {
            // High score - proceed with SOAP call
            
            // Transform JSON to XML for SOAP request
            decimal calculatedPremium = <decimal>request.coverageAmount * 0.0025;
            string soapRequestXml = string `&lt;PolicyRequest&gt;&lt;Name&gt;${request.name}&lt;/Name&gt;&lt;NationalId&gt;${request.nationalId}&lt;/NationalId&gt;&lt;Premium&gt;${calculatedPremium}&lt;/Premium&gt;&lt;/PolicyRequest&gt;`;
            
            // Call SOAP Mock
            http:Response soapResponse = check backendClient->post("/soap/policy", soapRequestXml, headers = {
                "Content-Type": "text/xml"
            });
            
            // Get XML response
            xml soapResponseXml = check soapResponse.getXmlPayload();
            
            // Transform XML response to JSON
            PolicyXml policyXml = check xmldata:parseAsType(soapResponseXml);
            
            // Step 4: Return policy response
            decimal calculatedPremiumForResponse = <decimal>request.coverageAmount * 0.0025;
            PolicyResponse policyResponse = {
                policyId: policyXml.Policy.Id,
                status: policyXml.Policy.Status,
                premium: calculatedPremiumForResponse
            };
            
            return policyResponse;
            
        } else {
            // Low score - return referral
            ReferralResponse referralResponse = {
                status: "Referred",
                reason: "High Risk"
            };
            
            return referralResponse;
        }

        // PolicyResponse policyResponse = {
        //         policyId: "1111",
        //         status: "Active",
        //         premium: 1200.50d
        //     };
            
        // return policyResponse;
    }
}

