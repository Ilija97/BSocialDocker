const kafka = require('kafka-node');
const { Client } = require('@elastic/elasticsearch');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3002;

// Kafka Consumer setup
const kafkaClientOptions = { kafkaHost: process.env.KAFKA_BROKERCONNECT || 'localhost:9092' };
const topics = ['postTopic', 'commentTopic', 'userRegistrationTopic'];
const kafkaConsumerOptions = { groupId: 'your-group-id', autoCommit: true, autoCommitIntervalMs: 5000 };

const kafkaConsumer = new kafka.ConsumerGroup(kafkaClientOptions, topics, kafkaConsumerOptions);

// Elasticsearch Client setup
const esClient = new Client({ node: process.env.ELASTICSEARCH_HOST || 'http://localhost:9200', 
                              auth: { username: process.env.ELASTICSEARCH_USERNAME || 'ilija', password: process.env.ELASTICSEARCH_PASSWORD ||'ilijaG' } });

// Middleware for parsing JSON
app.use(bodyParser.json());

// Listen for incoming messages from Kafka
kafkaConsumer.on('message', async (message) => {
  try {
    const parsedMessage = JSON.parse(JSON.parse(message.value));
    const topic = message.topic;

    // Choose Elasticsearch index based on Kafka topic
    let elasticsearchIndex;
    if (topic === 'postTopic') {
      elasticsearchIndex = 'post';
    } else if (topic === 'commentTopic') {
      elasticsearchIndex = 'comment';
    } else if (topic === 'userRegistrationTopic') {
      elasticsearchIndex = 'user';
    } else {
      // Handle other topics if needed
      elasticsearchIndex = 'default_index';
    }

    // Index the message in the dynamically determined Elasticsearch index
    await esClient.index({
      index: elasticsearchIndex,
      body: parsedMessage,
    });

    console.log(`Message indexed in Elasticsearch (${elasticsearchIndex}):`, parsedMessage);
  } catch (error) {
    console.error('Error processing Kafka message:', error.message);
  }
});

// Handle errors
kafkaConsumer.on('error', (error) => {
  console.error('Kafka Consumer Error:', error);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Closing Kafka consumer and Elasticsearch client.');
  kafkaConsumer.close(true, () => {
    esClient.close();
    process.exit();
  });
});

// Start the Express server
app.listen(port, () => {
  console.log(`Microservice listening on port ${port}`);
});
