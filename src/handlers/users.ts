import client from '../database';
import express, { Request, Response } from "express";
import { User, UserStore } from '../models/user';
import jwt from 'jsonwebtoken';
import verifyAuthToken from '../middleware/auth';

const store = new UserStore();


const createUser = async (req: Request, res: Response) => {
  try {
    const user: User = {
      first_name: req.body.firstname,
      last_name: req.body.lastname,
      password: req.body.password
    };

    const newUser = await store.create(user);
    const token = jwt.sign({ user: newUser }, process.env.TOKEN_SECRET as string);
    res.json(token);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};


const index = async (_req: Request, res: Response) => {
  try {
    const users = await store.index();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

const show = async (req: Request, res: Response) => {
  try {
    const user = await store.show(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

const userRoutes = (app: express.Application) => {
  app.get('/users', verifyAuthToken, index);
  app.post('/users', createUser);
  app.get('/users/:id', verifyAuthToken, show);
};

export default userRoutes;
