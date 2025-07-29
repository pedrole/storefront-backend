import { User, UserStore } from "../../models/user";
import client from "../../database";

const store = new UserStore();

describe("User Model", () => {
  let userId: number;
  beforeAll(async () => {
    const conn = await client.connect();
    await conn.query("DELETE FROM users");
    conn.release();
  });

  it("should have an index method", () => {
    expect(store.index).toBeDefined();
  });

  it("should have a show method", () => {
    expect(store.show).toBeDefined();
  });

  it("should have a create method", () => {
    expect(store.create).toBeDefined();
  });

  it("should have a delete method", () => {
    expect(store.delete).toBeDefined();
  });

  it("should have an authenticate method", () => {
    expect(store.authenticate).toBeDefined();
  });

  it("create method should add a user", async () => {
    const result = await store.create({
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      password: "password123",
    });
    userId = result.id as number;

    expect(result.first_name).toEqual("John");
    expect(result.last_name).toEqual("Doe");
    expect(result.email).toEqual("john.doe@example.com");
  });

  it("index method should return a list of users", async () => {
    const result = await store.index();
    expect(result.length).toBeGreaterThan(0);
  });

  it("show method should return the correct user", async () => {
    const result = await store.show(userId.toString());
    expect(result.first_name).toEqual("John");
    expect(result.last_name).toEqual("Doe");
    expect(result.email).toEqual("john.doe@example.com");
  });

  it("delete method should remove the user", async () => {
    await store.delete(userId.toString());
    const result = await store.index();
    expect(result.length).toEqual(0);
  });

  it("authenticate method should return the authenticated user", async () => {
    await store.create({
      first_name: "Jane",
      last_name: "Doe",
      email: "jane.doe@example.com",
      password: "password123",
    });
    const result = await store.authenticate("jane.doe@example.com", "password123");
    expect(result).not.toBeNull();
    expect(result?.email).toBe("jane.doe@example.com");
  });
});
