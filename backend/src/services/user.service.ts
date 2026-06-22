import { USER_ROLES } from "@saptakoshi/shared";
import { hashPassword } from "../auth/password";
import { withTransaction } from "../config/database";
import * as branchRepository from "../repositories/branch.repository";
import * as employeeBranchHistoryRepository from "../repositories/employee-branch-history.repository";
import type { UserWithBranchRow } from "../repositories/user.repository";
import * as userRepository from "../repositories/user.repository";

export class UserError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "UserError";
  }
}

export interface UserDto {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: string;
  branchId: number | null;
  branchCode: string | null;
  branchName: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  fullName?: string;
  username?: string;
  email?: string;
  password?: string;
  branchId?: number | null;
  role?: string;
  isActive?: boolean;
}

export interface UpdateUserPayload {
  fullName?: string;
  username?: string;
  email?: string;
  branchId?: number | null;
  role?: string;
  isActive?: boolean;
}

export interface ResetPasswordPayload {
  password?: string;
}

export interface TransferUserBranchPayload {
  branchId?: number;
  remarks?: string;
}

export const DEFAULT_USER_PAGE = 1;
export const DEFAULT_USER_PAGE_SIZE = 10;
export const MAX_USER_PAGE_SIZE = 100;

export interface UserListResult {
  data: UserDto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toUserDto(row: UserWithBranchRow): UserDto {
  return {
    id: row.id,
    fullName: row.full_name,
    username: row.username,
    email: row.email,
    role: row.role,
    branchId: row.branch_id,
    branchCode: row.branch_code,
    branchName: row.branch_name,
    isActive: row.is_active,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function normalizeRole(role: string): string {
  return role.trim().toUpperCase();
}

function validateRole(role: string): string {
  const normalized = normalizeRole(role);
  const allowedRoles = new Set<string>(Object.values(USER_ROLES));

  if (!allowedRoles.has(normalized)) {
    throw new UserError("Role must be ADMIN, EMPLOYEE, or BRANCH_MANAGER");
  }

  return normalized;
}

function validateEmail(email: string): string {
  const normalized = email.trim().toLowerCase();

  if (!normalized) {
    throw new UserError("Email is required");
  }

  if (!EMAIL_PATTERN.test(normalized)) {
    throw new UserError("Enter a valid email address");
  }

  return normalized;
}

async function ensureUniqueEmail(
  email: string,
  excludeId?: number
): Promise<void> {
  const existing = await userRepository.findByEmail(email, excludeId);

  if (existing) {
    throw new UserError("Email must be unique", 409);
  }
}

async function validateBranchForRole(
  role: string,
  branchId: number | null | undefined
): Promise<number | null> {
  if (role === USER_ROLES.EMPLOYEE || role === USER_ROLES.BRANCH_MANAGER) {
    if (branchId === undefined || branchId === null) {
      throw new UserError(`Branch is required for ${role} role`);
    }

    const branch = await branchRepository.findById(branchId);
    if (!branch) {
      throw new UserError("Branch not found", 404);
    }

    return branchId;
  }

  if (branchId === undefined || branchId === null) {
    return null;
  }

  const branch = await branchRepository.findById(branchId);
  if (!branch) {
    throw new UserError("Branch not found", 404);
  }

  return branchId;
}

function validatePassword(password: string | undefined, fieldLabel: string): string {
  const value = password?.trim();

  if (!value) {
    throw new UserError(`${fieldLabel} is required`);
  }

  return value;
}

function parseStatusFilter(status?: string): boolean | undefined {
  if (!status?.trim()) {
    return undefined;
  }

  const normalized = status.trim().toLowerCase();

  if (normalized === "active") {
    return true;
  }

  if (normalized === "inactive") {
    return false;
  }

  throw new UserError("Status must be active or inactive");
}

export async function listUsers(filters: {
  search?: string;
  branchId?: number;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<UserListResult> {
  const page = filters.page ?? DEFAULT_USER_PAGE;
  const limit = filters.limit ?? DEFAULT_USER_PAGE_SIZE;
  const isActive = parseStatusFilter(filters.status);
  const role = filters.role?.trim()
    ? validateRole(filters.role)
    : undefined;

  const repositoryFilters = {
    search: filters.search,
    branchId: filters.branchId,
    role,
    isActive,
  };

  const [total, rows] = await Promise.all([
    userRepository.countAll(repositoryFilters),
    userRepository.findAll(repositoryFilters, { page, limit }),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    data: rows.map(toUserDto),
    page,
    limit,
    total,
    totalPages,
  };
}

export async function getUserById(id: number): Promise<UserDto> {
  const row = await userRepository.findById(id);

  if (!row) {
    throw new UserError("User not found", 404);
  }

  return toUserDto(row);
}

export async function createUser(payload: CreateUserPayload): Promise<UserDto> {
  const fullName = payload.fullName?.trim();
  const username = payload.username?.trim();

  if (!fullName) {
    throw new UserError("Full name is required");
  }

  if (!username) {
    throw new UserError("Username is required");
  }

  const email = validateEmail(payload.email ?? "");
  await ensureUniqueEmail(email);

  const role = validateRole(payload.role ?? USER_ROLES.EMPLOYEE);
  const branchId = await validateBranchForRole(role, payload.branchId ?? null);
  const password = validatePassword(payload.password, "Temporary password");
  const passwordHash = await hashPassword(password);

  const row = await userRepository.create({
    branchId,
    fullName,
    username,
    email,
    passwordHash,
    role,
    isActive: payload.isActive ?? true,
  });

  return toUserDto(row);
}

export async function updateUser(
  id: number,
  payload: UpdateUserPayload
): Promise<UserDto> {
  const existing = await userRepository.findById(id);

  if (!existing) {
    throw new UserError("User not found", 404);
  }

  const fullName = payload.fullName?.trim();
  const username = payload.username?.trim();

  if (!fullName) {
    throw new UserError("Full name is required");
  }

  if (!username) {
    throw new UserError("Username is required");
  }

  const email = validateEmail(payload.email ?? "");
  await ensureUniqueEmail(email, id);

  const role = validateRole(payload.role ?? existing.role);
  const branchId = await validateBranchForRole(
    role,
    payload.branchId !== undefined ? payload.branchId : existing.branch_id
  );

  const row = await userRepository.update(id, {
    branchId,
    fullName,
    username,
    email,
    role,
    isActive: payload.isActive ?? existing.is_active,
  });

  if (!row) {
    throw new UserError("User not found", 404);
  }

  return toUserDto(row);
}

export async function updateUserStatus(
  id: number,
  isActive: boolean
): Promise<UserDto> {
  const row = await userRepository.updateStatus(id, isActive);

  if (!row) {
    throw new UserError("User not found", 404);
  }

  return toUserDto(row);
}

export async function transferUserBranch(
  id: number,
  payload: TransferUserBranchPayload,
  transferredBy: number
): Promise<UserDto> {
  const existing = await userRepository.findById(id);

  if (!existing) {
    throw new UserError("User not found", 404);
  }

  if (
    existing.role !== USER_ROLES.EMPLOYEE &&
    existing.role !== USER_ROLES.BRANCH_MANAGER
  ) {
    throw new UserError(
      "Only employees and branch managers can be transferred between branches"
    );
  }

  const newBranchId = payload.branchId;

  if (newBranchId === undefined || !Number.isInteger(newBranchId) || newBranchId <= 0) {
    throw new UserError("A valid new branch is required");
  }

  const branch = await branchRepository.findById(newBranchId);
  if (!branch) {
    throw new UserError("Branch not found", 404);
  }

  if (existing.branch_id === newBranchId) {
    throw new UserError("New branch must be different from the current branch");
  }

  const row = await withTransaction(async (executor) => {
    await employeeBranchHistoryRepository.insert(
      {
        userId: id,
        oldBranchId: existing.branch_id,
        newBranchId,
        transferredBy,
        remarks: payload.remarks,
      },
      executor
    );

    const updatedId = await userRepository.updateBranchId(
      id,
      newBranchId,
      executor
    );

    if (!updatedId) {
      throw new UserError("User not found", 404);
    }

    const updatedUser = await userRepository.findById(updatedId, executor);

    if (!updatedUser) {
      throw new UserError("User not found", 404);
    }

    return updatedUser;
  });

  return toUserDto(row);
}

export async function resetUserPassword(
  id: number,
  payload: ResetPasswordPayload
): Promise<UserDto> {
  const existing = await userRepository.findById(id);

  if (!existing) {
    throw new UserError("User not found", 404);
  }

  const password = validatePassword(payload.password, "Password");
  const passwordHash = await hashPassword(password);

  const row = await userRepository.updatePassword(id, passwordHash);

  if (!row) {
    throw new UserError("User not found", 404);
  }

  return toUserDto(row);
}
