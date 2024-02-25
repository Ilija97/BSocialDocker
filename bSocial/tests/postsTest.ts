// import { expect } from "chai";
import nock from "nock";
import axios from 'axios';
import { expect } from "chai";
import 'mocha';
import { startTransaction, rollbackTransaction, cleanupDatabase } from './test-helpers';


let authToken: string;

describe("API Testing", () => {

  beforeEach(async () => {
    await startTransaction();

    // Log in the user and obtain the token
    const loginPayload = {
      "username": "username",
      "password": "Passw0rd"
    };

    try {
      const loginResponse = await axios.post('http://192.168.99.100:3000/users/login', loginPayload);
      expect(loginResponse.status).to.equal(200);
      expect(loginResponse.data).to.have.property('token');

      authToken = loginResponse.data.token;
    } catch (error: any) {
      console.error('Error during login:', error.message);
      expect.fail(error.message);
    }
  });

  afterEach(async () => {
    await rollbackTransaction();
    await cleanupDatabase();
  });

  it('should post a new post', async () => {
    const userPayload = {
      "message": "post content"
    };
    const headers = {
      Authorization: `Bearer ${authToken}` // Include the JWT token
    }
    try {
      const res = await axios.post('http://192.168.99.100:3000/posts', userPayload, {headers}); 

      expect(res.status).to.equal(201);

    } catch (error: any) {
      console.error('Error:', error.message);
      expect.fail(error.message);
    }
  });

  after(() => {
    nock.cleanAll();
  });
});
