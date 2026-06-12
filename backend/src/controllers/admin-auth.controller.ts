import type { Request, Response } from "express";
import {
  AuthError,
  login as adminLogin,
} from "../services/admin-auth.service";

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  try {
    const result = await adminLogin(email, password);
    res.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(401).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: "Login failed" });
  }
}
