import client from "../database";
import express, { Request, Response } from "express";
import { User, UserStore } from "../models/user";
import jwt from "jsonwebtoken";
import verifyAuthToken from "../middleware/auth";

const store = new UserStore();

const createUser = async (req: Request, res: Response) => {
  try {
    const user: User = {
      first_name: req.body.firstname,
      last_name: req.body.lastname,
      email: req.body.email,
      password: req.body.password,
    };

    const newUser = await store.create(user);
    const token = jwt.sign(
      { user: newUser },
      process.env.TOKEN_SECRET as string
    );
    res.json({ id: newUser.id, token });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

// login
const login = async (req: Request, res: Response) => {
  try {
    const {email, password} = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const loggedInUser = await store.authenticate(
      email,
      password
    );
    if (!loggedInUser) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign(
      { user: loggedInUser },
      process.env.TOKEN_SECRET as string
    );
    res.json({ id: loggedInUser.id, token });
  } catch (err) {
    console.error("Error in login:", (err as Error).message);
    res
      .status(400)
      .json({ error: "An error occurred. Please try again later." });
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
  app.get("/users", verifyAuthToken, index);
  app.post("/users", createUser);
  app.get("/users/:id", verifyAuthToken, show);
  app.post("/users/login", login);
};

export default userRoutes;
