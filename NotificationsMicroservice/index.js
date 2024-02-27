const express = require('express');
const { prepareNotificationMessage, getAuthorIdFromNotification } = require('./utils');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const router = express.Router();
const port = 3001;
const kafka = require('kafka-node');


// Kafka configuration
const kafkaClientOptions = { kafkaHost: process.env.KAFKA_BROKERCONNECT || 'localhost:9092' };
const topics = ['commentTopic'];
const kafkaConsumerOptions = { groupId: 'your-group-id', autoCommit: true, autoCommitIntervalMs: 5000 };
const kafkaConsumer = new kafka.ConsumerGroup(kafkaClientOptions, topics, kafkaConsumerOptions);

kafkaConsumer.on('message', (message) => {
  console.log('Received comment:', message.value);
  sendNotification(message.value);
});

kafkaConsumer.on('error', (error) => {
  console.error('Kafka Consumer Error:', error);
});


// Notifications 
let unsentNotifications = [];
async function sendNotification(comment) {
  try {
    console.log('Sending notification:', comment);
    unsentNotifications.push(comment);
  } catch (error) {
    console.error('Error sending notification:', error.message);
  }
}


process.on('SIGINT', () => {
  console.log('Closing Kafka consumer.');
  kafkaConsumer.close(true, () => {
    process.exit();
  });
});



// Routes
/**
 * @swagger
 * /unsent-notifications:
 *   get:
 *     summary: Get unsent notifications for a specific author.
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: query
 *         name: authorId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the author to get unsent notifications.
 *     responses:
 *       200:
 *         description: List of unsent notifications.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: integer
 *                     description: User ID who sent the notification.
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                     description: Timestamp of the notification.
 *                   postId:
 *                     type: integer
 *                     description: ID of the post related to the notification.
 *                   message:
 *                     type: string
 *                     description: Notification message.
 *       400:
 *         description: Bad request - Author ID is required.
 *       500:
 *         description: Internal Server Error.
 */
router.get('/unsent-notifications', async (req, res) => {
  try {
    const { authorId } = req.query;

    if (!authorId) {
      return res.status(400).json({ error: 'Author ID is required in the query parameters.' });
    }

    const filteredNotifications = unsentNotifications.filter((unsentNotifications) => {
      const notificationAuthorId = getAuthorIdFromNotification(unsentNotifications);
      return notificationAuthorId === parseInt(authorId, 10);
    });

    const responseNotifications = filteredNotifications.map((unsentNotifications) => prepareNotificationMessage(unsentNotifications)).filter(Boolean);

    unsentNotifications = unsentNotifications.filter((unsentNotifications) => !filteredNotifications.includes(unsentNotifications));

    res.json(responseNotifications);
  } catch (error) {
    console.error('Error retrieving unsent notifications:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.use('/', router);


//Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Notifications Microservice API',
      version: '1.0.0',
    },
  },
  apis: ['index.js'], 
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.listen(port, () => {
  console.log(`Notification service listening at http://localhost:${port}`);
});
