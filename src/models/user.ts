
import client from "../database";
import bcrypt from "bcrypt";

export type User = {
  id?: number;
  first_name: string;
  last_name: string;
  password: string;
};

const pepper = process.env.BCRYPT_PEPPER || "";

const hashPassword = async (password: string) => {
  const saltRounds = parseInt(process.env.SALT_ROUNDS as string) || 10;
  return bcrypt.hash(password + pepper, saltRounds);
};

export class UserStore {
  async index(): Promise<User[]> {
    try {
      const conn = await client.connect();
      const sql = "SELECT * FROM users";

      const result = await conn.query(sql);

      conn.release();

      return result.rows;
    } catch (err) {
      throw new Error(`Could not get users. Error: ${err}`);
    }
  }

  async show(id: string): Promise<User> {
    try {
      const conn = await client.connect();
      const sql = "SELECT * FROM users WHERE id=($1)";

      const result = await conn.query(sql, [id]);

      conn.release();

      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not find user ${id}. Error: ${err}`);
    }
  }

  async create(u: User): Promise<User> {
    try {
      const conn = await client.connect();

      const sql =
        "INSERT INTO users (first_name, last_name, password) VALUES($1, $2, $3) RETURNING *";

      const hash = await hashPassword(u.password);

      const result = await conn.query(sql, [
        u.first_name,
        u.last_name,
        hash,
      ]);

      conn.release();

      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not add new user. Error: ${err}`);
    }
  }

  async delete(id: string): Promise<User> {
    try {
      const conn = await client.connect();
      const sql = "DELETE FROM users WHERE id=($1) RETURNING *";

      const result = await conn.query(sql, [id]);

      conn.release();

      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not delete user ${id}. Error: ${err}`);
    }
  }

  async authenticate(
    first_name: string,
    last_name: string,
    password: string
  ): Promise<User | null> {
    try {
      const conn = await client.connect();
      const sql =
        "SELECT * FROM users WHERE first_name=($1) AND last_name=($2)";

      const result = await conn.query(sql, [first_name, last_name]);

      conn.release();

      if (result.rows.length) {
        const user = result.rows[0];


        if (bcrypt.compareSync(password + pepper, user.password)) {
          return user;
        }
      }
      return null;
    } catch (err) {
      throw new Error(
        `Could not authenticate user ${first_name}. Error: ${err}`
      );
    }
  }
}
