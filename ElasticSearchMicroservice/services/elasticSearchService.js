const { Client } = require('@elastic/elasticsearch');

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

module.exports = { esClient, createIndex };