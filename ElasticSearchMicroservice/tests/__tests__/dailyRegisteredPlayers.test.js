const axios = require('axios');
const fs = require('fs');
const { addUsersToIndex, clearIndex } = require('../testHelpers');

const elasticsearchHost = process.env.ELASTICSEARCH_HOST || 'http://localhost:9200';
const elasticsearchIndex = "user-test";
const elasticsearchQuery = JSON.parse(fs.readFileSync('./queries/daily_registered_players.json', 'utf-8'));


test('Elasticsearch query returns expected results', async () => {
    try {
        await clearIndex(elasticsearchHost, elasticsearchIndex)

        const randomUserCounts = Array.from({ length: 10 }, () => Math.floor(Math.random() * 30) + 1);
        await addUsersToIndex(elasticsearchIndex, randomUserCounts);

      const response = await axios.post(`${elasticsearchHost}/${elasticsearchIndex}/_search`, elasticsearchQuery);
  
      expect(response.status).toBe(200);

      const responseData = response.data;
      
      expect(responseData).toHaveProperty('aggregations.daily_registered_players.buckets');
      
      const buckets = responseData.aggregations.daily_registered_players.buckets;
      
      for (let i = 0; i < buckets.length; i++) {
        randomUserCounts.sort((a, b) => b - a); // order from the biggest count
        expect(buckets[i].doc_count).toBe(randomUserCounts[i], `Unexpected doc_count for date ${buckets[i].key_as_string}. Received: ${buckets[i].doc_count}`);
      }
    } catch (error) {
      throw error;
    }
  }); 