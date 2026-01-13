import ballerina/http;

// HTTP client for backend services
final http:Client backendClient = check new ("http://localhost:3000");
