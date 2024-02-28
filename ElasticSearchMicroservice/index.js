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
const elasticsearchHost = process.env.ELASTICSEARCH_HOST || 'http://localhost:9200';
const username = process.env.ELASTICSEARCH_USERNAME || 'ilija';
const password = process.env.ELASTICSEARCH_PASSWORD || 'ilijaG';
const esClient = new Client({ node: elasticsearchHost, auth: { username: username, password: password } });

const indexExists = async (indexName) => {
  try {
    return await esClient.indices.exists({ index: indexName });
  } catch (error) {
    console.error('Error checking if index exists:', error);
    throw error; 
  }
};

const createIndex = async (indexName) => {
  const indexAlreadyExists = await indexExists(indexName);

  if (!indexAlreadyExists) {
    try {
      await esClient.indices.create({ index: indexName });
      console.log(`Index "${indexName}" created`);
    } catch (error) {
      console.error(`Error creating index "${indexName}":`, error);
      throw error; // You might want to handle this error appropriately
    }
  } else {
    console.log(`Index "${indexName}" already exists.`);
  }
};

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
