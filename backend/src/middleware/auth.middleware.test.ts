import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { USER_ROLES } from "@saptakoshi/shared";
import { signToken } from "../auth/jwt";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware";

function createMockResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  } as unknown as Response;

  vi.mocked(res.status).mockReturnValue(res);
  return res;
}

describe("auth middleware", () => {
  let next: NextFunction;

  beforeEach(() => {
    next = vi.fn();
  });

  it("requireAuth sets req.user from a valid bearer token", () => {
    const token = signToken({
      sub: 7,
      email: "admin@saptakoshi.com",
      role: USER_ROLES.ADMIN,
      branchId: null,
    });

    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as Request;
    const res = createMockResponse();

    requireAuth(req, res, next);

    expect(req.user).toEqual({
      id: 7,
      email: "admin@saptakoshi.com",
      role: USER_ROLES.ADMIN,
      branch_id: null,
    });
    expect(next).toHaveBeenCalled();
  });

  it("requireAuth rejects missing authorization header", () => {
    const req = { headers: {} } as Request;
    const res = createMockResponse();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  it("requireAdmin allows ADMIN users", () => {
    const req = {
      user: {
        id: 1,
        email: "admin@saptakoshi.com",
        role: USER_ROLES.ADMIN,
        branch_id: null,
      },
    } as Request;
    const res = createMockResponse();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("requireAdmin denies MAKER role", () => {
    const req = {
      user: {
        id: 2,
        email: "ram@saptakoshi.com",
        role: USER_ROLES.MAKER,
        branch_id: 1,
      },
    } as Request;
    const res = createMockResponse();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Forbidden" });
    expect(next).not.toHaveBeenCalled();
  });
});
