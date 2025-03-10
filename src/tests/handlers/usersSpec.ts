import supertest from 'supertest';
import app from '../../server';
import client from '../../database';
import jwt from 'jsonwebtoken';

const request = supertest(app);
let token: string;
let userId: number;

describe('Users Handler', () => {
  beforeAll(async () => {
    const conn = await client.connect();
    await conn.query("DELETE FROM users");
    conn.release();

    const response = await request.post('/users').send({
      firstname: 'John',
      lastname: 'Doe',
      password: 'password123'
    });
    token = response.body.token;
    userId = response.body.id;
  });

  it('should create a new user', async () => {
    const response = await request.post('/users').send({
      firstname: 'Jane',
      lastname: 'Doe',
      password: 'password123'
    });
    expect(response.status).toBe(200);
    const decoded = jwt.verify(response.body.token, process.env.TOKEN_SECRET as string);
    expect((decoded as any).user.first_name).toBe('Jane');
  });

  it('should return a list of users', async () => {
    const response = await request.get('/users').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should return the correct user', async () => {
    const response = await request.get(`/users/${userId}`).set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.first_name).toBe('John');
  });
});
