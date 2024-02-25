BSocial - Microservices Project
Overview
BSocial is a microservices-based project that aims to provide social networking functionalities through a set of independent microservices.

Microservices
User Service: Manages user registration, authentication, and profile information.
Post Service: Handles the creation and management of user posts.
Comment Service: Allows users to comment on posts.
Elasticsearch Microservice: Indexes data from other microservices into Elasticsearch for efficient search.
Prerequisites
Node.js (version X.X.X)
Docker
Docker Compose
Getting Started
Clone the repository:

bash
Copy code
git clone https://github.com/your-username/BSocial.git
cd BSocial
Install dependencies:

bash
Copy code
npm install
Start the microservices using Docker Compose:

bash
Copy code
docker-compose up
This will launch all the microservices, databases, and dependencies.

Access the services:

User Service: http://localhost:3001
Post Service: http://localhost:3002
Comment Service: http://localhost:3003
Elasticsearch Microservice: http://localhost:9200
Configuration
Each microservice may have its own configuration file (e.g., .env) for environment-specific settings.
API Documentation
Detailed API documentation for each microservice is available in their respective codebases.
Testing
Unit and integration tests are available in the tests directory for each microservice.
