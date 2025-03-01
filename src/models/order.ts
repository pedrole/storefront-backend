import client from '../database';

export type Order = {
  id: number;
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
}
