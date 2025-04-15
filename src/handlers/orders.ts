import express, { Request, Response } from 'express';
import { Order, OrderStore } from '../models/order';
import verifyAuthToken from '../middleware/auth';

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

const addProductToOrder = async (req: Request, res: Response) => {
  try {
    console.log('user_id', req.user.id);

    const productId = parseInt(req.body.product_id);
    const quantity = parseInt(req.body.quantity);

    const activeOrder : Order = await store.currentOrder(req.user.id);
    if (!activeOrder.id) {
      throw new Error('Active order ID is undefined');
    }
    const addedProduct = await store.addProduct(activeOrder.id, productId, quantity);
    res.json(addedProduct);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }


}

const createOrder = async (req: Request, res: Response) => {
  try {
    const order = {
      user_id: req.body.user_id,
      status: req.body.status
    };
    const newOrder = await store.create(order);
    res.json(newOrder);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

const orderRoutes = (app: express.Application) => {
  app.get('/orders/current/:user_id', verifyAuthToken, currentOrder);
  app.post('/orders', verifyAuthToken, createOrder);
  app.post('/orders/add-product', verifyAuthToken, addProductToOrder);

};

export default orderRoutes;
