import client from '../database';

export type Order = {
  id?: number;
  user_id: number;
  status: string;
};

export class OrderStore {
  // get current order by user
  async currentOrder(user_id: number): Promise<Order> {
    try {
      const conn = await client.connect();
      const sql = 'SELECT * FROM orders WHERE user_id=($1) AND status=($2)';
      const result = await conn.query(sql, [user_id, 'active']);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not get current order for user ${user_id}. Error: ${err}`);
    }
  }

  async create(o: Order): Promise<Order> {
    try {
      const conn = await client.connect();
      const sql = 'INSERT INTO orders (user_id, status) VALUES($1, $2) RETURNING *';
      const result = await conn.query(sql, [o.user_id, o.status]);
      const order = result.rows[0];
      conn.release();
      return order;
    } catch (err) {
      throw new Error(`Could not add new order. Error: ${err}`);
    }
  }
}
