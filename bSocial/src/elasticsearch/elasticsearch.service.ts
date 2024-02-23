// import { Injectable } from '@nestjs/common';
// import { Client } from '@elastic/elasticsearch';

// @Injectable()
// export class ElasticsearchService {
//   private readonly client: Client;

//   constructor() {
//     this.client = new Client({ node: 'http://localhost:9200' });
//   }

//   async indexDocument(index: string, body: any): Promise<any> {
//     return await this.client.index({
//       index,
//       body,
//     });
//   }
// }
