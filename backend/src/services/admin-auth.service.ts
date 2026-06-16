import { comparePassword } from "../auth/password";
import { signToken } from "../auth/jwt";
import * as userRepository from "../repositories/user.repository";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export interface LoginResult {
  token: string;
  user: {
    id: number;
    fullName: string;
    username: string;
    email: string;
    role: string;
    branchId: number | null;
    branchCode: string | null;
    branchName: string | null;
  };
}

export async function login(
  email: string,
  password: string
): Promise<LoginResult> {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw new AuthError("Invalid credentials");
  }

  if (!user.is_active) {
    throw new AuthError("Account is inactive");
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
      fullName: user.full_name,
      username: user.username,
      email: user.email,
      role: user.role,
      branchId: user.branch_id,
      branchCode: user.branch_code,
      branchName: user.branch_name,
    },
  };
}
