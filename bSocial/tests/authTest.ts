import nock from "nock";
import axios from 'axios';
import { expect } from "chai";
import 'mocha';
import { startTransaction, rollbackTransaction } from './testHelpers';


describe("Auth Testing", () => {
  beforeEach(async () => {
    await startTransaction();
  });
  afterEach(async () => {
    await rollbackTransaction();
  });
  
  it('should register a new user', async () => {
    const userPayload = {
        "firstName": "Name",
        "lastName": "Surname",
        "username": "username",
        "email": "user@gmail.com",
        "password": "Pa$$w0rd"
    };
    try {
      const res = await axios.post('http://localhost:3000/users/register', userPayload); 

      expect(res.status).to.equal(201);

    } catch (error: any) {
      console.error('Error:', error.message);
      expect.fail(error.message);
    }
  });

  it('should log the user', async () => {
    const userPayload = {
        "username": "user1",
        "password": "Pa$$w0rd"
    };
    try {
      const res = await axios.post('http://localhost:3000/users/login', userPayload); 

      expect(res.status).to.equal(200);
      expect(res.data).to.have.property('token');

    } catch (error: any) {
      console.error('Error:', error.message);
      expect.fail(error.message);
    }
  });

  after(() => {
    nock.cleanAll();
  });
});
