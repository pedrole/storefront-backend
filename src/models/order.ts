import { Connection } from "pg";
import client from "../database";

export type Order = {
  id?: number;
  user_id: number;
  status: string;
};

export type OrderProduct = {
  order_id: number;
  product_id: number;
  quantity: number;
};

export class OrderStore {
  // get current order by user
  async currentOrder(user_id: number): Promise<Order> {
    try {
      const conn = await client.connect();
      const sql = "SELECT * FROM orders WHERE user_id=($1) AND status=($2)";
      const result = await conn.query(sql, [user_id, "active"]);
      conn.release();
      let order = result.rows[0];
      if( !order ) {
        order =  await this.create({
          user_id,
          status: "active",
        });

      }
      return order;
    } catch (err) {
      throw new Error(
        `Could not get current order for user ${user_id}. Error: ${err}`
      );
    }
  }

  // Add product to order
  async addProduct(
    orderId: number,
    productId: number,
    quantity: number
  ): Promise<OrderProduct> {
    // Check if product already in the order
    const conn = await client.connect();
    try {
      const exists = await conn.query(
        "SELECT * FROM order_products WHERE order_id = $1 AND product_id = $2",
        [orderId, productId]
      );

      if (exists.rows.length) {
        await conn.query(
          "UPDATE order_products SET quantity = quantity + $1 WHERE order_id = $2 AND product_id = $3",
          [quantity, orderId, productId]
        );
      } else {
        await conn.query(
          "INSERT INTO order_products (order_id, product_id, quantity) VALUES ($1, $2, $3)",
          [orderId, productId, quantity]
        );
      }
    } finally {
      conn.release();
    }

    return {
      order_id: orderId,
      product_id: productId,
      quantity,
    };
  }

  async create(o: Order): Promise<Order> {
    try {
      const conn = await client.connect();
      const sql =
        "INSERT INTO orders (user_id, status) VALUES($1, $2) RETURNING *";
      const result = await conn.query(sql, [o.user_id, o.status]);
      const order = result.rows[0];
      conn.release();
      return order;
    } catch (err) {
      throw new Error(`Could not add new order. Error: ${err}`);
    }
  }
}
