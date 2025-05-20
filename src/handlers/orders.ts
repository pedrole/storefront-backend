import express, { Request, Response } from "express";
import { Order, OrderStore } from "../models/order";
import verifyAuthToken from "../middleware/auth";

const store = new OrderStore();

const currentOrder = async (req: Request, res: Response) => {
  try {
    const user_id = parseInt(req.params.user_id);
    const order = await store.currentOrder(user_id);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

const completeCurrentOrder = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user?.id) throw new Error("User not authenticated");
    const order = await store.completeOrder(user.id);
    if (!order.id) {
      throw new Error("Order ID is undefined");
    }
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

const addProductToOrder = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.body.product_id);
    const quantity = parseInt(req.body.quantity);
    if (isNaN(quantity) || !isFinite(quantity)) {
      throw new Error("Invalid quantity: must be a valid number");
    }
    if (isNaN(productId)) {
      throw new Error("Invalid product ID: must be a valid number");
    }
    const user = req.user;

    if (user.id === undefined) {
      throw new Error("User ID is undefined");
    }
    const activeOrder: Order = await store.currentOrder(user.id);
    if (!activeOrder.id) {
      throw new Error("Active order ID is undefined");
    }
    const addedProduct = await store.addProduct(
      activeOrder.id,
      productId,
      quantity
    );
    res.json(addedProduct);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

const updateProductQuantity = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.body.product_id);
    const quantity = parseInt(req.body.quantity);
    if (isNaN(quantity) || !isFinite(quantity)) {
      throw new Error("Invalid quantity: must be a valid number");
    }
    if (isNaN(productId)) {
      throw new Error("Invalid product ID: must be a valid number");
    }
    const user = req.user;
    if (!user?.id) throw new Error("User not authenticated");
    const activeOrder: Order = await store.currentOrder(user.id);
    if (!activeOrder.id) throw new Error("No Active Order found");
    const updatedProduct = await store.updateProductQuantity(
      activeOrder.id,
      productId,
      quantity
    );
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

const createOrder = async (req: Request, res: Response) => {
  try {
    const order = {
      user_id: req.body.user_id,
      status: req.body.status,
    };
    const newOrder = await store.create(order);
    res.json(newOrder);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

const orderRoutes = (app: express.Application) => {
  app.get("/orders/current/:user_id", verifyAuthToken, currentOrder);
  app.post("/orders", verifyAuthToken, createOrder);
  app.post("/orders/add-product", verifyAuthToken, addProductToOrder);
  app.put("/orders/update-product", verifyAuthToken, updateProductQuantity);
  app.patch(
    "/orders/complete-current-order",
    verifyAuthToken,
    completeCurrentOrder
  );
};

export default orderRoutes;
