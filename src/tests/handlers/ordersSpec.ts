import supertest from 'supertest';
import app from '../../server';
import client from '../../database';

const request = supertest(app);
let token: string;
let userId: number;

describe('Orders Handler', () => {
  beforeAll(async () => {
    const conn = await client.connect();
    await conn.query("DELETE FROM orders");
    await conn.query("DELETE FROM users");
    conn.release();

    const userResponse = await request.post('/users').send({
      firstname: 'John',
      lastname: 'Doe',
      password: 'password123'
    });
    token = userResponse.body.token;
    userId = userResponse.body.id;

    await request.post('/orders').set('Authorization', `Bearer ${token}`).send({
      user_id: userId,
      status: 'active'
    });
  });

  it('should return the current order for a user', async () => {
    const response = await request.get(`/orders/current/${userId}`).set('Authorization', `Bearer ${token}`);
    console.log(`result: ${response.body}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('active');
  });

  // clean up
  afterAll(async () => {
    const conn = await client.connect();
    await conn.query('DELETE FROM orders');
    await conn.query('DELETE FROM users');
    conn.release();
  });
});
