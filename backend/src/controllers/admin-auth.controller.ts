import type { Request, Response } from "express";
import {
  changeOwnPassword,
  UserError,
} from "../services/user.service";
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

export async function resetOwnPassword(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const user = await changeOwnPassword(req.user, req.body);
    res.json({ user });
  } catch (error) {
    if (error instanceof UserError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: "Password reset failed" });
  }
}
