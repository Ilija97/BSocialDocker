const kafka = require('kafka-node');
const { Client } = require('@elastic/elasticsearch');
const express = require('express');
const bodyParser = require('body-parser');
const { esClient, createIndex } = require('./services/elasticSearchService');

const app = express();
const port = 3002;


// Kafka Consumer setup
const kafkaClientOptions = { kafkaHost: process.env.KAFKA_BROKERCONNECT || 'localhost:9092' };
const topics = ['postTopic', 'commentTopic', 'userRegistrationTopic'];
const kafkaConsumerOptions = { groupId: 'your-group-id', autoCommit: true, autoCommitIntervalMs: 5000 };
const kafkaConsumer = new kafka.ConsumerGroup(kafkaClientOptions, topics, kafkaConsumerOptions);


createIndex('user');
createIndex('post');
createIndex('comment');


// Middleware for parsing JSON
app.use(bodyParser.json());


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
      elasticsearchIndex = 'default_index';
    }

    await esClient.index({
      index: elasticsearchIndex,
      body: parsedMessage,
    });

    console.log(`Message indexed in Elasticsearch (${elasticsearchIndex}):`, parsedMessage);
  } catch (error) {
    console.error('Error processing Kafka message:', error.message);
  }
});

kafkaConsumer.on('error', (error) => {
  console.error('Kafka Consumer Error:', error);
});


process.on('SIGINT', () => {
  console.log('Closing Kafka consumer and Elasticsearch client.');
  kafkaConsumer.close(true, () => {
    esClient.close();
    process.exit();
  });
});


app.listen(port, () => {
  console.log(`Microservice listening on port ${port}`);
});
