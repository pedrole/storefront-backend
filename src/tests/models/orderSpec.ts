import { OrderStore } from '../../models/order';
import client from '../../database';

const store = new OrderStore();

describe('Order Model', () => {
  let userId: number;
  beforeAll(async () => {
    const conn = await client.connect();
    await conn.query('DELETE FROM orders');
    await conn.query('DELETE FROM users');
    const userResult = await conn.query(
      'INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3,$4) RETURNING id',
      ['John', 'Doe', 'john@mail.com','password123']
    );
    userId = userResult.rows[0].id;
    await conn.query('INSERT INTO orders (user_id, status) VALUES ($1, $2)', [userId, 'active']);
    conn.release();
  });

  it('should have a currentOrder method', () => {
    expect(store.currentOrder).toBeDefined();
  });

  it('currentOrder method should return the current order for a user', async () => {
    const result = await store.currentOrder(userId);
    expect(result).toEqual(jasmine.objectContaining({
      id: result.id,
      user_id: userId,
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
