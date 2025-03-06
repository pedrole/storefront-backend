import { OrderStore } from '../../models/order';
import client from '../../database';

const store = new OrderStore();

describe('Order Model', () => {
  beforeAll(async () => {
    const conn = await client.connect();
    await conn.query('DELETE FROM orders');
    await conn.query('DELETE FROM users');
    await conn.query('INSERT INTO users (first_name, last_name, password) VALUES ($1, $2, $3)', ['John', 'Doe', 'password123']);
    await conn.query('INSERT INTO orders (user_id, status) VALUES ($1, $2)', [1, 'active']);
    conn.release();
  });

  it('should have a currentOrder method', () => {
    expect(store.currentOrder).toBeDefined();
  });

  it('currentOrder method should return the current order for a user', async () => {
    const result = await store.currentOrder(1);
    expect(result).toEqual(jasmine.objectContaining({
      id: result.id,
      user_id: 1,
      status: 'active'
    }));
  });

  // clean up
  afterAll(async () => {
    const conn = await client.connect();
    await conn.query('DELETE FROM orders');
    await conn.query('DELETE FROM users');
    conn.release();
  } );



});
