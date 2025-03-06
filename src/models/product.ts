import client from '../database';

export type Product = {
  id?: number;
  name: string;
  price: number;
  created_at?: Date;

};


export class ProductStore {
  async index(): Promise<Product[]> {
    try {
      const conn = await client.connect();
      const sql = 'SELECT * FROM products';

      const result = await conn.query(sql);

      conn.release();

      return result.rows;
    } catch (err) {
      throw new Error(`Could not get products. Error: ${err}`);
    }
  }

  async show(id: string): Promise<Product> {
    try {
      const conn = await client.connect();
      const sql = 'SELECT * FROM products WHERE id=($1)';

      const result = await conn.query(sql, [id]);

      conn.release();

      return {
        ...result.rows[0],
        price: Number(result.rows[0].price) // Convert price to number
      };
    } catch (err) {
      throw new Error(`Could not find product ${id}. Error: ${err}`);
    }
  }

  async create(p: Product): Promise<Product> {
    try {
      const conn = await client.connect();
      const sql = 'INSERT INTO products (name, price) VALUES($1, $2) RETURNING *';

      const result = await conn.query(sql, [p.name, p.price]);

      conn.release();

      return {
        ...result.rows[0],
        price: Number(result.rows[0].price) // Convert price to number
      };
    } catch (err) {
      throw new Error(`Could not add new product. Error: ${err}`);
    }
  }

  async delete(id: string): Promise<Product> {
    try {
      const conn = await client.connect();
      const sql = 'DELETE FROM products WHERE id=($1) RETURNING *';

      const result = await conn.query(sql, [id]);

      conn.release();

      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not delete product ${id}. Error: ${err}`);
    }
  }
}
