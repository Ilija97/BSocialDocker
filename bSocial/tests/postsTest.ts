import nock from "nock";
import axios from 'axios';
import { expect } from "chai";
import 'mocha';
import { startTransaction, rollbackTransaction } from './testHelpers';


let authToken: string;

describe("Post Testing", () => {

  beforeEach(async () => {
    await startTransaction();

    // Log in the user and obtain the token
    const loginPayload = {
      "username": "user1",
      "password": "Pa$$w0rd"
    };

    try {
      const loginResponse = await axios.post('http://localhost:3000/users/login', loginPayload);
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
  });

  it('should create a posts', async () => {
    const userPayload = {
      "message": "post content"
    };
    const headers = {
      Authorization: `Bearer ${authToken}` 
    }
    try {
      const res = await axios.post('http://localhost:3000/posts', userPayload, {headers}); 

      expect(res.status).to.equal(201);

    } catch (error: any) {
      console.error('Error:', error.message);
      expect.fail(error.message);
    }
  });

  it('should get posts', async () => {
    const headers = {
      Authorization: `Bearer ${authToken}` 
    }
    try {
      const res = await axios.get('http://localhost:3000/posts', {headers}); 

      expect(res.status).to.equal(200);
      expect(res.data).to.be.an('array');

    } catch (error: any) {
      console.error('Error:', error.message);
      expect.fail(error.message);
    }
  });

  after(() => {
    nock.cleanAll();
  });
});
