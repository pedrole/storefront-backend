import supertest from 'supertest';
import app from '../../server';
import client from '../../database';
import jwt from 'jsonwebtoken';

const request = supertest(app);
let token: string;

describe('Products Handler', () => {
  beforeAll(async () => {
    const conn = await client.connect();
    await conn.query("DELETE FROM products");
    await conn.query("DELETE FROM users");
    conn.release();

    const userResponse = await request.post('/users').send({
      firstname: 'John',
      lastname: 'Doe',
      email: 'john@example.com',
      password: 'password123'
    });
    token = userResponse.body.token;

    await request.post('/products').set('Authorization', `Bearer ${token}`).send({
      name: 'Product1',
      price: 100,
      category: 'Category1'
    });
  });

  it('should create a new product', async () => {
    const response = await request.post('/products').set('Authorization', `Bearer ${token}`).send({
      name: 'Product2',
      price: 200,
      category: 'Category2'
    });
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Product2');
  });

  it('should return a list of products', async () => {
    const response = await request.get('/products');
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should return the correct product', async () => {
    const response = await request.get('/products/1');
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Product1');
  });
});
