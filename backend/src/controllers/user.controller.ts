import type { Request, Response } from "express";
import {
  createUser,
  DEFAULT_USER_PAGE,
  DEFAULT_USER_PAGE_SIZE,
  getUserById,
  listUsers,
  MAX_USER_PAGE_SIZE,
  resetUserPassword,
  transferUserBranch,
  updateUser,
  updateUserStatus,
  UserError,
} from "../services/user.service";

function parsePositiveInt(
  value: unknown,
  fallback: number,
  max?: number
): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  if (max !== undefined) {
    return Math.min(parsed, max);
  }

  return parsed;
}

function parseOptionalPositiveInt(value: unknown): number | undefined {
  if (value === undefined || value === "") {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

function parseTransferBranchId(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

function handleUserError(error: unknown, res: Response): void {
  if (error instanceof UserError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "42P01"
  ) {
    res.status(500).json({
      error:
        "Branch transfer history table is missing. Run database migrations and try again.",
    });
    return;
  }

  console.error("User operation failed:", error);
  res.status(500).json({ error: "User operation failed" });
}

export async function getUsers(req: Request, res: Response): Promise<void> {
  try {
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;
    const branchId = parseOptionalPositiveInt(req.query.branch_id);
    const role = typeof req.query.role === "string" ? req.query.role : undefined;
    const status =
      typeof req.query.status === "string" ? req.query.status : undefined;
    const page = parsePositiveInt(req.query.page, DEFAULT_USER_PAGE);
    const limit = parsePositiveInt(
      req.query.limit,
      DEFAULT_USER_PAGE_SIZE,
      MAX_USER_PAGE_SIZE
    );

    const result = await listUsers({
      search,
      branchId,
      role,
      status,
      page,
      limit,
    });

    res.json(result);
  } catch (error) {
    handleUserError(error, res);
  }
}

export async function getUser(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid user id" });
    return;
  }

  try {
    const user = await getUserById(id);
    res.json({ user });
  } catch (error) {
    handleUserError(error, res);
  }
}

export async function postUser(req: Request, res: Response): Promise<void> {
  try {
    const user = await createUser(req.body);
    res.status(201).json({ user });
  } catch (error) {
    handleUserError(error, res);
  }
}

export async function putUser(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid user id" });
    return;
  }

  try {
    const user = await updateUser(id, req.body);
    res.json({ user });
  } catch (error) {
    handleUserError(error, res);
  }
}

export async function patchUserStatus(
  req: Request,
  res: Response
): Promise<void> {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid user id" });
    return;
  }

  const { isActive } = req.body as { isActive?: boolean };

  if (typeof isActive !== "boolean") {
    res.status(400).json({ error: "isActive must be a boolean" });
    return;
  }

  try {
    const user = await updateUserStatus(id, isActive);
    res.json({ user });
  } catch (error) {
    handleUserError(error, res);
  }
}

export async function patchUserTransfer(
  req: Request,
  res: Response
): Promise<void> {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid user id" });
    return;
  }

  const transferredBy = req.user?.id;

  if (!transferredBy) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const branchId = parseTransferBranchId(req.body?.branchId);
  const remarks =
    typeof req.body?.remarks === "string" ? req.body.remarks : undefined;

  try {
    const user = await transferUserBranch(
      id,
      { branchId, remarks },
      transferredBy
    );
    res.json({ user });
  } catch (error) {
    handleUserError(error, res);
  }
}

export async function patchUserResetPassword(
  req: Request,
  res: Response
): Promise<void> {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid user id" });
    return;
  }

  try {
    const user = await resetUserPassword(id, req.body);
    res.json({ user });
  } catch (error) {
    handleUserError(error, res);
  }
}
