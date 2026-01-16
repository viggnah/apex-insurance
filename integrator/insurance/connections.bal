import ballerina/http;
import ballerinax/redis;

// HTTP client for backend services
final http:Client backendClient = check new ("http://localhost:3000");

// Redis client for caching
final redis:Client redisClient = check new (connection = {
    host: redisHost,
    port: redisPort,
    password: redisPassword.length() > 0 ? redisPassword : ()
});
