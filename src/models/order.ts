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
      if (!order) {
        order = await this.create({
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
    const conn = await client.connect();
    try {
      // Begin transaction
      await conn.query("BEGIN");

      // Check if product already in the order
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

      // Retrieve the updated cumulative quantity
      const result = await conn.query(
        "SELECT quantity FROM order_products WHERE order_id = $1 AND product_id = $2",
        [orderId, productId]
      );

      // Commit transaction
      await conn.query("COMMIT");

      const cumulativeQuantity = result.rows[0].quantity;
      return {
        order_id: orderId,
        product_id: productId,
        quantity: cumulativeQuantity,
      };
    } catch (err) {
      // Rollback transaction in case of error
      await conn.query("ROLLBACK");
      throw new Error(`Could not add product to order. Error: ${err}`);
    } finally {
      conn.release();
    }
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
