import { beforeEach, describe, expect, it, vi } from "vitest";
import { USER_ROLES } from "@saptakoshi/shared";
import * as password from "../auth/password";
import * as jwt from "../auth/jwt";
import * as userRepository from "../repositories/user.repository";
import { AuthError, login } from "../services/admin-auth.service";

vi.mock("../repositories/user.repository");
vi.mock("../auth/password");
vi.mock("../auth/jwt");

const mockUser: userRepository.UserWithBranchRow = {
  id: 1,
  branch_id: 1,
  full_name: "Ram Sharma",
  username: "ram",
  email: "ram@saptakoshi.com",
  password_hash: "hashed-password",
  role: USER_ROLES.MAKER,
  is_active: true,
  created_at: new Date(),
  updated_at: new Date(),
  branch_code: "BRT001",
  branch_name: "Biratnagar Main Branch",
};

describe("admin-auth.service login", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(jwt.signToken).mockReturnValue("test-token");
  });

  it("returns token and user with branch info for valid credentials", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);
    vi.mocked(password.comparePassword).mockResolvedValue(true);

    const result = await login("ram@saptakoshi.com", "password123");

    expect(result).toEqual({
      token: "test-token",
      user: {
        id: 1,
        fullName: "Ram Sharma",
        username: "ram",
        email: "ram@saptakoshi.com",
        role: USER_ROLES.MAKER,
        branchId: 1,
        branchCode: "BRT001",
        branchName: "Biratnagar Main Branch",
      },
    });
    expect(jwt.signToken).toHaveBeenCalledWith({
      sub: 1,
      email: "ram@saptakoshi.com",
      role: USER_ROLES.MAKER,
      branchId: 1,
    });
  });

  it("rejects unknown email", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

    await expect(login("missing@saptakoshi.com", "password123")).rejects.toThrow(
      new AuthError("Invalid credentials")
    );
  });

  it("rejects inactive users", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue({
      ...mockUser,
      is_active: false,
    });

    await expect(login("inactive@saptakoshi.com", "password123")).rejects.toThrow(
      new AuthError("Account is inactive")
    );
  });

  it("rejects wrong password", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);
    vi.mocked(password.comparePassword).mockResolvedValue(false);

    await expect(login("ram@saptakoshi.com", "wrong-password")).rejects.toThrow(
      new AuthError("Invalid credentials")
    );
  });
});
