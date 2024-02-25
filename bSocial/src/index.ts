import 'reflect-metadata';
import { createConnection } from 'typeorm';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import CommentRoutes from './routes/CommentRoutes';
import PostRoutes from './routes/PostRoutes';

dotenv.config();

const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0', // Specification (optional, defaults to swagger: '2.0')
    info: {
      title: 'Your API', // Title (required)
      version: '1.0.0', // Version (required)
    },
    security: [{ JWT: [] }],
    components: {
      securitySchemes: {
        JWT: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'JWT Authorization header using the Bearer scheme',
        },
      },
    },
  },
  // Paths to files containing OpenAPI definitions
  apis: ['./dist/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

const app = express();

app.use(cors());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const port = process.env.PORT || 3000;

// Create the database connection
createConnection().then(async connection => {
  console.log('Connected to the database');

  app.use(bodyParser.json());

  // Routes
  app.use('/users', userRoutes);
  app.use('/posts', PostRoutes);
  app.use('/comments', CommentRoutes);

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch(error => console.log('TypeORM connection error: ', error));

export default app;

