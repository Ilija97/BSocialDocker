const axios = require('axios');
const { esClient, createIndex } = require('../services/elasticSearchService');


/**
 * Adds users to an Elasticsearch index with specified user counts and timestamps. userCounts[i] users is registered 
 * on date (currentDate-i*day)
 *
 * @param {string} elasticsearchIndex - The name of the Elasticsearch index.
 * @param {number[]} userCounts - An array containing the number of users to add for each iteration.
 */
async function addUsersToIndex(elasticsearchIndex, userCounts) {
    try {
        createIndex(elasticsearchIndex);
        for (let i = 0; i < userCounts.length; i++) {
            const currentDate = new Date();
            const date = currentDate.setDate(currentDate.getDate() - i);
          const usersToAdd = Array.from({ length: userCounts[i] }, (_, index) => ({
            firstName: `name_${index}`,
            lastName: `surname_${index}`,
            username: `user_${index}`,
            email: `user_${index}@gmail.com`,
            timestamp: new Date(date).toISOString(),
          }));
    
          const bulkBody = usersToAdd.flatMap(user => [
            { index: { _index: elasticsearchIndex } },
            user,
          ]);
    
          await esClient.bulk({ body: bulkBody, refresh: true });
        }
    
        console.log(`Users added to index "${elasticsearchIndex}"`);
      } catch (error) {
        console.error(`Error adding users to index "${elasticsearchIndex}":`, error);
        throw error;
      }
  }

  
  async function clearIndex(elasticsearchEndpoint, elasticsearchIndex) {
    try {
        const response = await axios.post(`${elasticsearchEndpoint}/${elasticsearchIndex}/_delete_by_query`, {
          query: {
            match_all: {} // Delete all documents in the index
          }
        });
    
        if (response.status === 200) {
          console.log(`Content of index "${elasticsearchIndex}" cleared`);
        } else {
          console.error('Error clearing index content. Unexpected response:', response.data);
        }
      } catch (error) {
        console.error('Error clearing index content:', error.message);
      }
  }

module.exports = { addUsersToIndex, clearIndex }