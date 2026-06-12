import { comparePassword } from "../auth/password";
import { signToken } from "../auth/jwt";
import * as userRepository from "../repositories/user.repository";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export interface AdminLoginResult {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export async function login(
  email: string,
  password: string
): Promise<AdminLoginResult> {
  const user = await userRepository.findByEmail(email);

  if (!user || user.role !== "admin") {
    throw new AuthError("Invalid credentials");
  }

  const passwordMatches = await comparePassword(password, user.password_hash);
  if (!passwordMatches) {
    throw new AuthError("Invalid credentials");
  }

  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}
