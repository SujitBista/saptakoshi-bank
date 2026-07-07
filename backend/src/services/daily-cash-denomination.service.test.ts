import { beforeEach, describe, expect, it, vi } from "vitest";
import { USER_ROLES } from "@saptakoshi/shared";
import { query } from "../config/database";
import * as branchRepository from "../repositories/branch.repository";
import * as userRepository from "../repositories/user.repository";
import {
  createDailyCashDenomination,
  deleteDailyCashDenomination,
  DailyCashDenominationError,
  getDailyCashDenominationById,
  listDailyCashDenominations,
  updateDailyCashDenomination,
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

describe("listDailyCashDenominations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userRepository.findById).mockResolvedValue(tellerUser);
  });

  it("lists only the authenticated teller's records with pagination", async () => {
    vi.mocked(query)
      .mockResolvedValueOnce([{ count: "2" }])
      .mockResolvedValueOnce([
        {
          id: 15,
          denomination_date: new Date("2026-07-08T00:00:00.000Z"),
          branch_name: "Dharan Branch",
          teller_name: "Sita Teller",
          total_amount: "15000",
          created_at: new Date("2026-07-08T09:30:00.000Z"),
        },
        {
          id: 14,
          denomination_date: new Date("2026-07-07T00:00:00.000Z"),
          branch_name: "Dharan Branch",
          teller_name: "Sita Teller",
          total_amount: "12000",
          created_at: new Date("2026-07-07T09:30:00.000Z"),
        },
      ]);

    const result = await listDailyCashDenominations({
      authenticatedUser: {
        id: 9,
        email: tellerUser.email,
        role: USER_ROLES.TELLER,
        branch_id: 3,
      },
      page: 1,
      limit: 10,
    });

    expect(query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("COUNT(*)::text AS count"),
      [9]
    );
    expect(query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("WHERE d.teller_id = $1"),
      [9, 10, 0]
    );
    expect(result).toEqual({
      data: [
        {
          id: 15,
          denomination_date: "2026-07-08",
          branch_name: "Dharan Branch",
          teller_name: "Sita Teller",
          total_amount: 15000,
          created_at: "2026-07-08T09:30:00.000Z",
        },
        {
          id: 14,
          denomination_date: "2026-07-07",
          branch_name: "Dharan Branch",
          teller_name: "Sita Teller",
          total_amount: 12000,
          created_at: "2026-07-07T09:30:00.000Z",
        },
      ],
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
    });
  });

  it("rejects makers from listing denomination records", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue({
      ...tellerUser,
      role: USER_ROLES.MAKER,
    });

    await expect(
      listDailyCashDenominations({
        authenticatedUser: {
          id: 9,
          email: tellerUser.email,
          role: USER_ROLES.MAKER,
          branch_id: 3,
        },
      })
    ).rejects.toEqual(
      expect.objectContaining({
        message: "Only tellers can add denominations",
        statusCode: 403,
      })
    );
  });
});

describe("getDailyCashDenominationById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userRepository.findById).mockResolvedValue(tellerUser);
  });

  it("returns the teller's own denomination record", async () => {
    vi.mocked(query).mockResolvedValueOnce([
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
        updated_at: new Date("2026-07-07T10:30:00.000Z"),
      },
    ]);

    const result = await getDailyCashDenominationById({
      authenticatedUser: {
        id: 9,
        email: tellerUser.email,
        role: USER_ROLES.TELLER,
        branch_id: 3,
      },
      id: 11,
    });

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("WHERE id = $1 AND teller_id = $2"),
      [11, 9]
    );
    expect(result.id).toBe(11);
    expect(result.totalAmount).toBe(2970);
    expect(result.notes).toBe("Counter verified");
  });
});

describe("updateDailyCashDenomination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userRepository.findById).mockResolvedValue(tellerUser);
  });

  it("updates the teller's own denomination record with recalculated total", async () => {
    vi.mocked(query)
      .mockResolvedValueOnce([
        {
          id: 11,
          branch_id: 3,
          teller_id: 9,
          denomination_date: new Date("2026-07-07T00:00:00.000Z"),
          thousand_count: 2,
          five_hundred_count: 0,
          one_hundred_count: 0,
          fifty_count: 0,
          twenty_count: 0,
          ten_count: 0,
          five_count: 0,
          two_count: 0,
          one_count: 0,
          coin_10_count: 0,
          coin_5_count: 0,
          coin_2_count: 0,
          coin_1_count: 0,
          total_amount: 2000,
          notes: null,
          created_at: new Date("2026-07-07T10:00:00.000Z"),
          updated_at: new Date("2026-07-07T10:00:00.000Z"),
        },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 11,
          branch_id: 3,
          teller_id: 9,
          denomination_date: new Date("2026-07-08T00:00:00.000Z"),
          thousand_count: 1,
          five_hundred_count: 2,
          one_hundred_count: 0,
          fifty_count: 1,
          twenty_count: 0,
          ten_count: 0,
          five_count: 0,
          two_count: 0,
          one_count: 0,
          coin_10_count: 0,
          coin_5_count: 0,
          coin_2_count: 0,
          coin_1_count: 0,
          total_amount: 2050,
          notes: "Updated",
          created_at: new Date("2026-07-07T10:00:00.000Z"),
          updated_at: new Date("2026-07-08T08:00:00.000Z"),
        },
      ]);

    const result = await updateDailyCashDenomination({
      authenticatedUser: {
        id: 9,
        email: tellerUser.email,
        role: USER_ROLES.TELLER,
        branch_id: 3,
      },
      id: 11,
      denominationDate: "2026-07-08",
      thousandCount: 1,
      fiveHundredCount: 2,
      fiftyCount: 1,
      notes: "Updated",
    });

    expect(query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("AND id <> $3"),
      [3, "2026-07-08", 11]
    );
    expect(query).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("UPDATE daily_cash_denominations"),
      [11, "2026-07-08", 1, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2050, "Updated", 9]
    );
    expect(result.totalAmount).toBe(2050);
    expect(result.denominationDate).toBe("2026-07-08");
  });

  it("rejects updates when another record already exists for the branch and date", async () => {
    vi.mocked(query)
      .mockResolvedValueOnce([
        {
          id: 11,
          branch_id: 3,
          teller_id: 9,
          denomination_date: new Date("2026-07-07T00:00:00.000Z"),
          thousand_count: 2,
          five_hundred_count: 0,
          one_hundred_count: 0,
          fifty_count: 0,
          twenty_count: 0,
          ten_count: 0,
          five_count: 0,
          two_count: 0,
          one_count: 0,
          coin_10_count: 0,
          coin_5_count: 0,
          coin_2_count: 0,
          coin_1_count: 0,
          total_amount: 2000,
          notes: null,
          created_at: new Date("2026-07-07T10:00:00.000Z"),
          updated_at: new Date("2026-07-07T10:00:00.000Z"),
        },
      ])
      .mockResolvedValueOnce([{ id: 12 }]);

    await expect(
      updateDailyCashDenomination({
        authenticatedUser: {
          id: 9,
          email: tellerUser.email,
          role: USER_ROLES.TELLER,
          branch_id: 3,
        },
        id: 11,
        denominationDate: "2026-07-08",
      })
    ).rejects.toEqual(
      expect.objectContaining({
        message: "A denomination record already exists for this branch and date",
        statusCode: 409,
      })
    );
  });
});

describe("deleteDailyCashDenomination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userRepository.findById).mockResolvedValue(tellerUser);
  });

  it("deletes the teller's own denomination record", async () => {
    vi.mocked(query)
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
          updated_at: new Date("2026-07-07T10:30:00.000Z"),
        },
      ])
      .mockResolvedValueOnce([]);

    await deleteDailyCashDenomination({
      authenticatedUser: {
        id: 9,
        email: tellerUser.email,
        role: USER_ROLES.TELLER,
        branch_id: 3,
      },
      id: 11,
    });

    expect(query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("DELETE FROM daily_cash_denominations"),
      [11, 9]
    );
  });
});
