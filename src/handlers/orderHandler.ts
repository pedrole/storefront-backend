import express, { Request, Response } from 'express';
import { OrderStore } from '../models/order';
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

const orderRoutes = (app: express.Application) => {
  app.get('/orders/current/:user_id', verifyAuthToken, currentOrder);
};

export default orderRoutes;
