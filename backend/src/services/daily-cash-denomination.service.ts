import { USER_ROLES } from "@saptakoshi/shared";
import { query } from "../config/database";
import type { AuthenticatedUser } from "../middleware/auth.middleware";
import * as branchRepository from "../repositories/branch.repository";
import * as userRepository from "../repositories/user.repository";

export class DailyCashDenominationError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "DailyCashDenominationError";
  }
}

interface DailyCashDenominationRow {
  id: number;
  branch_id: number;
  teller_id: number;
  denomination_date: Date;
  thousand_count: number;
  five_hundred_count: number;
  one_hundred_count: number;
  fifty_count: number;
  twenty_count: number;
  ten_count: number;
  five_count: number;
  two_count: number;
  one_count: number;
  coin_10_count: number;
  coin_5_count: number;
  coin_2_count: number;
  coin_1_count: number;
  total_amount: string | number;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface DailyCashDenominationDto {
  id: number;
  branchId: number;
  tellerId: number;
  denominationDate: string;
  thousandCount: number;
  fiveHundredCount: number;
  oneHundredCount: number;
  fiftyCount: number;
  twentyCount: number;
  tenCount: number;
  fiveCount: number;
  twoCount: number;
  oneCount: number;
  coin10Count: number;
  coin5Count: number;
  coin2Count: number;
  coin1Count: number;
  totalAmount: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DailyCashDenominationListItemDto {
  id: number;
  denomination_date: string;
  branch_name: string;
  teller_name: string;
  total_amount: number;
  created_at: string;
}

export interface DailyCashDenominationListResult {
  data: DailyCashDenominationListItemDto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateDailyCashDenominationPayload {
  authenticatedUser: AuthenticatedUser;
  denominationDate?: unknown;
  thousandCount?: unknown;
  fiveHundredCount?: unknown;
  oneHundredCount?: unknown;
  fiftyCount?: unknown;
  twentyCount?: unknown;
  tenCount?: unknown;
  fiveCount?: unknown;
  twoCount?: unknown;
  oneCount?: unknown;
  coin10Count?: unknown;
  coin5Count?: unknown;
  coin2Count?: unknown;
  coin1Count?: unknown;
  notes?: unknown;
  totalAmount?: unknown;
  branchId?: unknown;
  tellerId?: unknown;
  total_amount?: unknown;
  branch_id?: unknown;
  teller_id?: unknown;
}

export interface UpdateDailyCashDenominationPayload
  extends CreateDailyCashDenominationPayload {
  id: number;
}

export const DEFAULT_DAILY_CASH_DENOMINATION_PAGE = 1;
export const DEFAULT_DAILY_CASH_DENOMINATION_PAGE_SIZE = 10;
export const MAX_DAILY_CASH_DENOMINATION_PAGE_SIZE = 100;

const DENOMINATION_VALUES = {
  thousandCount: 1000,
  fiveHundredCount: 500,
  oneHundredCount: 100,
  fiftyCount: 50,
  twentyCount: 20,
  tenCount: 10,
  fiveCount: 5,
  twoCount: 2,
  oneCount: 1,
  coin10Count: 10,
  coin5Count: 5,
  coin2Count: 2,
  coin1Count: 1,
} as const;

type DenominationCountKey = keyof typeof DENOMINATION_VALUES;

interface DailyCashDenominationListRow {
  id: number;
  denomination_date: Date;
  branch_name: string;
  teller_name: string;
  total_amount: string | number;
  created_at: Date;
}

interface NormalizedDailyCashDenominationInput {
  denominationDate: string;
  counts: Record<DenominationCountKey, number>;
  notes: string | null;
  totalAmount: number;
}

function formatDateOnly(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function toDto(row: DailyCashDenominationRow): DailyCashDenominationDto {
  return {
    id: row.id,
    branchId: row.branch_id,
    tellerId: row.teller_id,
    denominationDate: formatDateOnly(row.denomination_date),
    thousandCount: row.thousand_count,
    fiveHundredCount: row.five_hundred_count,
    oneHundredCount: row.one_hundred_count,
    fiftyCount: row.fifty_count,
    twentyCount: row.twenty_count,
    tenCount: row.ten_count,
    fiveCount: row.five_count,
    twoCount: row.two_count,
    oneCount: row.one_count,
    coin10Count: row.coin_10_count,
    coin5Count: row.coin_5_count,
    coin2Count: row.coin_2_count,
    coin1Count: row.coin_1_count,
    totalAmount: Number(row.total_amount),
    notes: row.notes,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function toListItemDto(
  row: DailyCashDenominationListRow
): DailyCashDenominationListItemDto {
  return {
    id: row.id,
    denomination_date: formatDateOnly(row.denomination_date),
    branch_name: row.branch_name,
    teller_name: row.teller_name,
    total_amount: Number(row.total_amount),
    created_at: row.created_at.toISOString(),
  };
}

async function getActiveTeller(
  authenticatedUser: AuthenticatedUser
): Promise<userRepository.UserWithBranchRow> {
  const currentUser = await userRepository.findById(authenticatedUser.id);

  if (!currentUser) {
    throw new DailyCashDenominationError("Unauthorized", 401);
  }

  if (!currentUser.is_active) {
    throw new DailyCashDenominationError("Account is inactive", 403);
  }

  if (currentUser.role !== USER_ROLES.TELLER) {
    throw new DailyCashDenominationError("Only tellers can add denominations", 403);
  }

  if (!currentUser.branch_id) {
    throw new DailyCashDenominationError("Assigned branch is required", 403);
  }

  return currentUser;
}

function parseCount(value: unknown, label: string): number {
  if (value === undefined || value === null || value === "") {
    return 0;
  }

  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value.trim())
        : Number.NaN;

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new DailyCashDenominationError(`${label} must be an integer greater than or equal to 0`);
  }

  return parsed;
}

function parseDenominationDate(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new DailyCashDenominationError("Denomination date is required");
  }

  const normalized = value.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new DailyCashDenominationError("Denomination date must be in YYYY-MM-DD format");
  }

  const parsed = new Date(`${normalized}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== normalized) {
    throw new DailyCashDenominationError("Denomination date is invalid");
  }

  return normalized;
}

function parseNotes(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new DailyCashDenominationError("Notes must be a string");
  }

  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  if (normalized.length > 1000) {
    throw new DailyCashDenominationError("Notes must be 1000 characters or less");
  }

  return normalized;
}

function assertServerOwnedFields(payload: CreateDailyCashDenominationPayload): void {
  if (
    payload.totalAmount !== undefined ||
    payload.total_amount !== undefined ||
    payload.branchId !== undefined ||
    payload.branch_id !== undefined ||
    payload.tellerId !== undefined ||
    payload.teller_id !== undefined
  ) {
    throw new DailyCashDenominationError(
      "branch_id, teller_id, and total_amount are controlled by the server"
    );
  }
}

function calculateTotalAmount(counts: Record<DenominationCountKey, number>): number {
  return Object.entries(DENOMINATION_VALUES).reduce((sum, [key, value]) => {
    return sum + counts[key as DenominationCountKey] * value;
  }, 0);
}

function normalizeDailyCashDenominationInput(
  payload: CreateDailyCashDenominationPayload
): NormalizedDailyCashDenominationInput {
  const denominationDate = parseDenominationDate(payload.denominationDate);
  const counts = {
    thousandCount: parseCount(payload.thousandCount, "1000 count"),
    fiveHundredCount: parseCount(payload.fiveHundredCount, "500 count"),
    oneHundredCount: parseCount(payload.oneHundredCount, "100 count"),
    fiftyCount: parseCount(payload.fiftyCount, "50 count"),
    twentyCount: parseCount(payload.twentyCount, "20 count"),
    tenCount: parseCount(payload.tenCount, "10 count"),
    fiveCount: parseCount(payload.fiveCount, "5 count"),
    twoCount: parseCount(payload.twoCount, "2 count"),
    oneCount: parseCount(payload.oneCount, "1 count"),
    coin10Count: parseCount(payload.coin10Count, "Coin 10 count"),
    coin5Count: parseCount(payload.coin5Count, "Coin 5 count"),
    coin2Count: parseCount(payload.coin2Count, "Coin 2 count"),
    coin1Count: parseCount(payload.coin1Count, "Coin 1 count"),
  };
  const notes = parseNotes(payload.notes);
  const totalAmount = calculateTotalAmount(counts);

  return {
    denominationDate,
    counts,
    notes,
    totalAmount,
  };
}

async function getOwnedDenominationRecord(
  id: number,
  tellerId: number
): Promise<DailyCashDenominationRow> {
  const rows = await query<DailyCashDenominationRow>(
    `SELECT
       id,
       branch_id,
       teller_id,
       denomination_date,
       thousand_count,
       five_hundred_count,
       one_hundred_count,
       fifty_count,
       twenty_count,
       ten_count,
       five_count,
       two_count,
       one_count,
       coin_10_count,
       coin_5_count,
       coin_2_count,
       coin_1_count,
       total_amount,
       notes,
       created_at,
       updated_at
     FROM daily_cash_denominations
     WHERE id = $1 AND teller_id = $2`,
    [id, tellerId]
  );

  const row = rows[0];

  if (!row) {
    throw new DailyCashDenominationError("Denomination record not found", 404);
  }

  return row;
}

export async function createDailyCashDenomination(
  payload: CreateDailyCashDenominationPayload
): Promise<DailyCashDenominationDto> {
  assertServerOwnedFields(payload);

  const currentUser = await getActiveTeller(payload.authenticatedUser);
  const branchId = currentUser.branch_id;

  if (!branchId) {
    throw new DailyCashDenominationError("Assigned branch is required", 403);
  }

  const branch = await branchRepository.findById(branchId);

  if (!branch) {
    throw new DailyCashDenominationError("Branch not found", 404);
  }

  const { denominationDate, counts, notes, totalAmount } =
    normalizeDailyCashDenominationInput(payload);

  const existing = await query<{ id: number }>(
    `SELECT id
     FROM daily_cash_denominations
     WHERE branch_id = $1 AND denomination_date = $2`,
    [branchId, denominationDate]
  );

  if (existing[0]) {
    throw new DailyCashDenominationError(
      "A denomination record already exists for this branch and date",
      409
    );
  }

  try {
    const rows = await query<DailyCashDenominationRow>(
      `INSERT INTO daily_cash_denominations (
         branch_id,
         teller_id,
         denomination_date,
         thousand_count,
         five_hundred_count,
         one_hundred_count,
         fifty_count,
         twenty_count,
         ten_count,
         five_count,
         two_count,
         one_count,
         coin_10_count,
         coin_5_count,
         coin_2_count,
         coin_1_count,
         total_amount,
         notes
       )
       VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9,
         $10, $11, $12, $13, $14, $15, $16, $17, $18
       )
       RETURNING
         id,
         branch_id,
         teller_id,
         denomination_date,
         thousand_count,
         five_hundred_count,
         one_hundred_count,
         fifty_count,
         twenty_count,
         ten_count,
         five_count,
         two_count,
         one_count,
         coin_10_count,
         coin_5_count,
         coin_2_count,
         coin_1_count,
         total_amount,
         notes,
         created_at,
         updated_at`,
      [
        branch.id,
        currentUser.id,
        denominationDate,
        counts.thousandCount,
        counts.fiveHundredCount,
        counts.oneHundredCount,
        counts.fiftyCount,
        counts.twentyCount,
        counts.tenCount,
        counts.fiveCount,
        counts.twoCount,
        counts.oneCount,
        counts.coin10Count,
        counts.coin5Count,
        counts.coin2Count,
        counts.coin1Count,
        totalAmount,
        notes,
      ]
    );

    return toDto(rows[0]);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "23505"
    ) {
      throw new DailyCashDenominationError(
        "A denomination record already exists for this branch and date",
        409
      );
    }

    throw error;
  }
}

export async function listDailyCashDenominations(filters: {
  authenticatedUser: AuthenticatedUser;
  page?: number;
  limit?: number;
}): Promise<DailyCashDenominationListResult> {
  const currentUser = await getActiveTeller(filters.authenticatedUser);
  const page = filters.page ?? DEFAULT_DAILY_CASH_DENOMINATION_PAGE;
  const limit = filters.limit ?? DEFAULT_DAILY_CASH_DENOMINATION_PAGE_SIZE;
  const offset = (page - 1) * limit;

  const [countRows, rows] = await Promise.all([
    query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM daily_cash_denominations d
       WHERE d.teller_id = $1`,
      [currentUser.id]
    ),
    query<DailyCashDenominationListRow>(
      `SELECT
         d.id,
         d.denomination_date,
         b.branch_name,
         u.full_name AS teller_name,
         d.total_amount,
         d.created_at
       FROM daily_cash_denominations d
       INNER JOIN branches b ON b.id = d.branch_id
       INNER JOIN users u ON u.id = d.teller_id
       WHERE d.teller_id = $1
       ORDER BY d.created_at DESC, d.id DESC
       LIMIT $2 OFFSET $3`,
      [currentUser.id, limit, offset]
    ),
  ]);

  const total = Number(countRows[0]?.count ?? 0);

  return {
    data: rows.map(toListItemDto),
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}

export async function getDailyCashDenominationById(filters: {
  authenticatedUser: AuthenticatedUser;
  id: number;
}): Promise<DailyCashDenominationDto> {
  const currentUser = await getActiveTeller(filters.authenticatedUser);
  const row = await getOwnedDenominationRecord(filters.id, currentUser.id);
  return toDto(row);
}

export async function updateDailyCashDenomination(
  payload: UpdateDailyCashDenominationPayload
): Promise<DailyCashDenominationDto> {
  assertServerOwnedFields(payload);

  const currentUser = await getActiveTeller(payload.authenticatedUser);
  const existingRecord = await getOwnedDenominationRecord(payload.id, currentUser.id);
  const { denominationDate, counts, notes, totalAmount } =
    normalizeDailyCashDenominationInput(payload);

  const duplicateRows = await query<{ id: number }>(
    `SELECT id
     FROM daily_cash_denominations
     WHERE branch_id = $1
       AND denomination_date = $2
       AND id <> $3`,
    [existingRecord.branch_id, denominationDate, payload.id]
  );

  if (duplicateRows[0]) {
    throw new DailyCashDenominationError(
      "A denomination record already exists for this branch and date",
      409
    );
  }

  try {
    const rows = await query<DailyCashDenominationRow>(
      `UPDATE daily_cash_denominations
       SET denomination_date = $2,
           thousand_count = $3,
           five_hundred_count = $4,
           one_hundred_count = $5,
           fifty_count = $6,
           twenty_count = $7,
           ten_count = $8,
           five_count = $9,
           two_count = $10,
           one_count = $11,
           coin_10_count = $12,
           coin_5_count = $13,
           coin_2_count = $14,
           coin_1_count = $15,
           total_amount = $16,
           notes = $17,
           updated_at = NOW()
       WHERE id = $1 AND teller_id = $18
       RETURNING
         id,
         branch_id,
         teller_id,
         denomination_date,
         thousand_count,
         five_hundred_count,
         one_hundred_count,
         fifty_count,
         twenty_count,
         ten_count,
         five_count,
         two_count,
         one_count,
         coin_10_count,
         coin_5_count,
         coin_2_count,
         coin_1_count,
         total_amount,
         notes,
         created_at,
         updated_at`,
      [
        payload.id,
        denominationDate,
        counts.thousandCount,
        counts.fiveHundredCount,
        counts.oneHundredCount,
        counts.fiftyCount,
        counts.twentyCount,
        counts.tenCount,
        counts.fiveCount,
        counts.twoCount,
        counts.oneCount,
        counts.coin10Count,
        counts.coin5Count,
        counts.coin2Count,
        counts.coin1Count,
        totalAmount,
        notes,
        currentUser.id,
      ]
    );

    if (!rows[0]) {
      throw new DailyCashDenominationError("Denomination record not found", 404);
    }

    return toDto(rows[0]);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "23505"
    ) {
      throw new DailyCashDenominationError(
        "A denomination record already exists for this branch and date",
        409
      );
    }

    throw error;
  }
}

export async function deleteDailyCashDenomination(filters: {
  authenticatedUser: AuthenticatedUser;
  id: number;
}): Promise<void> {
  const currentUser = await getActiveTeller(filters.authenticatedUser);
  await getOwnedDenominationRecord(filters.id, currentUser.id);

  await query(
    `DELETE FROM daily_cash_denominations
     WHERE id = $1 AND teller_id = $2`,
    [filters.id, currentUser.id]
  );
}
