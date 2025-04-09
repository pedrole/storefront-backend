import { ProductStore } from "../../models/product";
import client from "../../database";

const store = new ProductStore();
let productId: number;

describe("Product Model", () => {
  beforeAll(async () => {
    const conn = await client.connect();
    await conn.query("DELETE FROM products");
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

  it("create method should add a product", async () => {
    const result = await store.create({
      name: "Test Product",
      price: 100,
      image: "test_image.jpg",
    });
    productId = result.id as number;


    expect(result).toEqual({
      id: productId,
      name: "Test Product",
      price: parseFloat(100 as unknown as string),
      image: "test_image.jpg",
      created_at: result.created_at, //
    });
  });

  it("index method should return a list of products", async () => {
    const result = await store.index();
    expect(result.length).toBeGreaterThan(0);
  });

  it("show method should return the correct product", async () => {
    const result = await store.show(productId.toString());
    expect(result).toEqual(
      jasmine.objectContaining({
        id: productId,
        name: "Test Product",
        price: 100,
      })
    );
  });

  it("delete method should remove the product", async () => {
    await store.delete(productId.toString());
    const result = await store.index();

    expect(result).toEqual([]);
  });
});
