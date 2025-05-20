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
    let conn;
    try {
      conn = await client.connect();
      const sql = "SELECT * FROM orders WHERE user_id=($1) AND status=($2)";
      const result = await conn.query(sql, [user_id, "active"]);
      let order = result.rows[0];
      if (!order) {
        order = await this.create({
          user_id,
          status: "active",
        });
      }

      // Fetch products for the order
      const productsSql =
        "SELECT op.product_id, p.name, p.price, p.image, op.quantity FROM order_products op JOIN products p ON op.product_id = p.id WHERE op.order_id = $1";
      const productsResult = await conn.query(productsSql, [order.id]);

      return {
        ...order,
        products: productsResult.rows,
      };
    } catch (err) {
      throw new Error(
        `Could not get current order for user ${user_id}. Error: ${err}`
      );
    } finally {
      if (conn) conn.release();
    }
  }

  async completeOrder(user_id: number): Promise<Order> {
    const conn = await client.connect();
    try {
      // Begin transaction
      await conn.query("BEGIN");
      // find the current active order for the user
      const sql = "SELECT * FROM orders WHERE user_id=($1) AND status=($2) FOR UPDATE";
      const result = await conn.query(sql, [user_id, "active"]);
      const order = result.rows[0];
      if (!order) {
        throw new Error(`No active order found for user ${user_id}`);
      }
      // Update the order status to 'complete'
      const updateSql =
        "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *";
      const updatedResult = await conn.query(updateSql, ["complete", order.id]);
      const updatedOrder = updatedResult.rows[0];
      // Commit transaction
      await conn.query("COMMIT");
      return updatedOrder;
    } catch (err) {
      // Rollback transaction in case of error
      await conn.query("ROLLBACK");
      throw new Error(
        `Could not complete order for user ${user_id}. Error: ${err}`
      );
    } finally {
      conn.release();
    }
  }

  async updateProductQuantity(
    orderId: number,
    productId: number,
    quantity: number
  ): Promise<OrderProduct | { removed: true }> {
    const conn = await client.connect();
    try {
      // Begin transaction
      await conn.query("BEGIN");
      if (quantity <= 0) {
        // If quantity is 0 or less, delete the product from the order
        await conn.query(
          "DELETE FROM order_products WHERE order_id = $1 AND product_id = $2",
          [orderId, productId]
        );
        await conn.query("COMMIT");
        return { removed: true };
      } else {
        // Update the quantity or insert if it doesn't exist
        const existingProduct = await conn.query(
          "SELECT * FROM order_products WHERE order_id = $1 AND product_id = $2",
          [orderId, productId]
        );
        if (existingProduct.rows.length) {
          await conn.query(
            "UPDATE order_products SET quantity = $1 WHERE order_id = $2 AND product_id = $3",
            [quantity, orderId, productId]
          );
        } else {
          await conn.query(
            "INSERT INTO order_products (order_id, product_id, quantity) VALUES ($1, $2, $3)",
            [orderId, productId, quantity]
          );
        }
      }
      await conn.query("COMMIT");

      return {
        order_id: orderId,
        product_id: productId,
        quantity: quantity,
      };
    } catch (err) {
      // Rollback transaction in case of error
      await conn.query("ROLLBACK");
      throw new Error(
        `Could not update product quantity in order. Error: ${err}`
      );
    } finally {
      conn.release();
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
