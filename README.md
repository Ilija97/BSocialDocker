# BSocial

## Overview

BSocial is a microservices-based project that provides social networking functionalities through a set of independent microservices.

### Microservices

1. **Notification Microservice**: Handles user notifications and related functionalities.
2. **Elasticsearch Microservice**: Indexes data from other microservices into Elasticsearch for efficient search.

## Prerequisites

- Node.js
- Docker
- Docker Compose

## Getting Started
Database is prepopulated with 5 users each of them having 5 posts. Usernames are "user1", "user2", "user3", "user4" and "user5". Password for all of them is "Pa$$w0rd".
To run the script use
```bash
npm run populate-db

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Ilija97/BSocialDocker.git
   cd BSocial
2. **Start the microservices using Docker Compose**
    ```bash
    docker-compose build
    docker-compose up

## API Documentation
API documentation for each microservice is available in swagger docs.

## Testing
Unit and integration tests are available in the tests directory for each microservice.
```bash
npm test
