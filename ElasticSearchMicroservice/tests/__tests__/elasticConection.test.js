const { esClient } = require("../../services/elasticSearchService.js");

describe('Elasticsearch Connection Test', () => {

  afterAll(async () => {
    await esClient.close();
  });

  it('should connect to Elasticsearch', async () => {
    try {
      // Check the cluster health to ensure the connection is successful
      const health = await esClient.cluster.health();
      expect(['green', 'yellow']).toContain(health.status);
    } catch (error) {
      throw error;
    }
  });
});