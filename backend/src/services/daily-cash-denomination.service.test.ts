import { beforeEach, describe, expect, it, vi } from "vitest";
import { USER_ROLES } from "@saptakoshi/shared";
import { query } from "../config/database";
import * as branchRepository from "../repositories/branch.repository";
import * as userRepository from "../repositories/user.repository";
import {
  createDailyCashDenomination,
  DailyCashDenominationError,
} from "./daily-cash-denomination.service";

vi.mock("../config/database", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../config/database")>();

  return {
    ...actual,
    query: vi.fn(),
  };
});

vi.mock("../repositories/branch.repository");
vi.mock("../repositories/user.repository");

const tellerUser: userRepository.UserWithBranchRow = {
  id: 9,
  branch_id: 3,
  full_name: "Sita Teller",
  username: "sita",
  email: "sita@saptakoshi.com",
  password_hash: "secret",
  role: USER_ROLES.TELLER,
  is_active: true,
  created_at: new Date("2026-07-01T00:00:00.000Z"),
  updated_at: new Date("2026-07-01T00:00:00.000Z"),
  branch_code: "BRT003",
  branch_name: "Dharan Branch",
};

const branch: branchRepository.BranchRow = {
  id: 3,
  branch_code: "BRT003",
  branch_name: "Dharan Branch",
  address: null,
  phone_number: null,
  email: null,
  is_active: true,
  created_at: new Date("2026-07-01T00:00:00.000Z"),
  updated_at: new Date("2026-07-01T00:00:00.000Z"),
};

describe("createDailyCashDenomination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userRepository.findById).mockResolvedValue(tellerUser);
    vi.mocked(branchRepository.findById).mockResolvedValue(branch);
  });

  it("creates a teller denomination record with server-calculated total", async () => {
    vi.mocked(query)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 11,
          branch_id: 3,
          teller_id: 9,
          denomination_date: new Date("2026-07-07T00:00:00.000Z"),
          thousand_count: 2,
          five_hundred_count: 1,
          one_hundred_count: 3,
          fifty_count: 0,
          twenty_count: 4,
          ten_count: 0,
          five_count: 0,
          two_count: 5,
          one_count: 6,
          coin_10_count: 7,
          coin_5_count: 0,
          coin_2_count: 1,
          coin_1_count: 2,
          total_amount: 2970,
          notes: "Counter verified",
          created_at: new Date("2026-07-07T10:00:00.000Z"),
          updated_at: new Date("2026-07-07T10:00:00.000Z"),
        },
      ]);

    const result = await createDailyCashDenomination({
      authenticatedUser: {
        id: 9,
        email: tellerUser.email,
        role: USER_ROLES.TELLER,
        branch_id: 3,
      },
      denominationDate: "2026-07-07",
      thousandCount: 2,
      fiveHundredCount: 1,
      oneHundredCount: 3,
      fiftyCount: "",
      twentyCount: 4,
      tenCount: "",
      fiveCount: "",
      twoCount: 5,
      oneCount: 6,
      coin10Count: 7,
      coin5Count: "",
      coin2Count: 1,
      coin1Count: 2,
      notes: "Counter verified",
    });

    expect(result.totalAmount).toBe(2970);
    expect(result.branchId).toBe(3);
    expect(result.tellerId).toBe(9);
    expect(query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("FROM daily_cash_denominations"),
      [3, "2026-07-07"]
    );
    expect(query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("INSERT INTO daily_cash_denominations"),
      [3, 9, "2026-07-07", 2, 1, 3, 0, 4, 0, 0, 5, 6, 7, 0, 1, 2, 2970, "Counter verified"]
    );
  });

  it("rejects non-teller users", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue({
      ...tellerUser,
      role: USER_ROLES.MAKER,
    });

    await expect(
      createDailyCashDenomination({
        authenticatedUser: {
          id: 9,
          email: tellerUser.email,
          role: USER_ROLES.MAKER,
          branch_id: 3,
        },
        denominationDate: "2026-07-07",
      })
    ).rejects.toEqual(
      expect.objectContaining({
        message: "Only tellers can add denominations",
        statusCode: 403,
      })
    );
  });

  it("rejects duplicate branch submissions for the same date", async () => {
    vi.mocked(query).mockResolvedValueOnce([{ id: 11 }]);

    await expect(
      createDailyCashDenomination({
        authenticatedUser: {
          id: 9,
          email: tellerUser.email,
          role: USER_ROLES.TELLER,
          branch_id: 3,
        },
        denominationDate: "2026-07-07",
      })
    ).rejects.toEqual(
      expect.objectContaining({
        message: "A denomination record already exists for this branch and date",
        statusCode: 409,
      })
    );
  });

  it("rejects client-supplied total, branch, or teller fields", async () => {
    await expect(
      createDailyCashDenomination({
        authenticatedUser: {
          id: 9,
          email: tellerUser.email,
          role: USER_ROLES.TELLER,
          branch_id: 3,
        },
        denominationDate: "2026-07-07",
        totalAmount: 1,
      })
    ).rejects.toEqual(
      expect.objectContaining<Partial<DailyCashDenominationError>>({
        message: "branch_id, teller_id, and total_amount are controlled by the server",
      })
    );
  });
});
