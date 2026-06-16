import type { BranchRow } from "../repositories/branch.repository";
import * as branchRepository from "../repositories/branch.repository";

export class BranchError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "BranchError";
  }
}

export interface BranchDto {
  id: number;
  branchCode: string;
  branchName: string;
  address: string | null;
  phoneNumber: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBranchPayload {
  branchCode?: string;
  branchName?: string;
  address?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  isActive?: boolean;
}

export interface UpdateBranchPayload {
  branchCode?: string;
  branchName?: string;
  address?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  isActive?: boolean;
}

function toBranchDto(row: BranchRow): BranchDto {
  return {
    id: row.id,
    branchCode: row.branch_code,
    branchName: row.branch_name,
    address: row.address,
    phoneNumber: row.phone_number,
    email: row.email,
    isActive: row.is_active,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function normalizeBranchCode(branchCode: string): string {
  return branchCode.trim().toUpperCase();
}

function validateBranchPayload(payload: {
  branchCode?: string;
  branchName?: string;
}): { branchCode: string; branchName: string } {
  const branchCode = payload.branchCode?.trim();
  const branchName = payload.branchName?.trim();

  if (!branchCode) {
    throw new BranchError("Branch code is required");
  }

  if (!branchName) {
    throw new BranchError("Branch name is required");
  }

  return {
    branchCode: normalizeBranchCode(branchCode),
    branchName,
  };
}

async function ensureUniqueBranchCode(
  branchCode: string,
  excludeId?: number
): Promise<void> {
  const existing = await branchRepository.findByBranchCode(branchCode, excludeId);

  if (existing) {
    throw new BranchError("Branch code must be unique", 409);
  }
}

export async function listBranches(filters: {
  branchCode?: string;
  branchName?: string;
}): Promise<BranchDto[]> {
  const rows = await branchRepository.findAll(filters);
  return rows.map(toBranchDto);
}

export async function getBranchById(id: number): Promise<BranchDto> {
  const row = await branchRepository.findById(id);

  if (!row) {
    throw new BranchError("Branch not found", 404);
  }

  return toBranchDto(row);
}

export async function createBranch(
  payload: CreateBranchPayload
): Promise<BranchDto> {
  const { branchCode, branchName } = validateBranchPayload(payload);
  await ensureUniqueBranchCode(branchCode);

  const row = await branchRepository.create({
    branchCode,
    branchName,
    address: payload.address?.trim() || null,
    phoneNumber: payload.phoneNumber?.trim() || null,
    email: payload.email?.trim() || null,
    isActive: payload.isActive ?? true,
  });

  return toBranchDto(row);
}

export async function updateBranch(
  id: number,
  payload: UpdateBranchPayload
): Promise<BranchDto> {
  const existing = await branchRepository.findById(id);

  if (!existing) {
    throw new BranchError("Branch not found", 404);
  }

  const { branchCode, branchName } = validateBranchPayload(payload);
  await ensureUniqueBranchCode(branchCode, id);

  const row = await branchRepository.update(id, {
    branchCode,
    branchName,
    address: payload.address?.trim() || null,
    phoneNumber: payload.phoneNumber?.trim() || null,
    email: payload.email?.trim() || null,
    isActive: payload.isActive ?? existing.is_active,
  });

  if (!row) {
    throw new BranchError("Branch not found", 404);
  }

  return toBranchDto(row);
}

export async function updateBranchStatus(
  id: number,
  isActive: boolean
): Promise<BranchDto> {
  const row = await branchRepository.updateStatus(id, isActive);

  if (!row) {
    throw new BranchError("Branch not found", 404);
  }

  return toBranchDto(row);
}
