import { beforeEach, describe, expect, it, vi } from "vitest";
import { USER_ROLES } from "@saptakoshi/shared";
import { withTransaction } from "../config/database";
import * as branchRepository from "../repositories/branch.repository";
import * as employeeBranchHistoryRepository from "../repositories/employee-branch-history.repository";
import * as userRepository from "../repositories/user.repository";
import { transferUserBranch } from "./user.service";

vi.mock("../config/database", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../config/database")>();

  return {
    ...actual,
    withTransaction: vi.fn(),
  };
});

vi.mock("../repositories/user.repository");
vi.mock("../repositories/branch.repository");
vi.mock("../repositories/employee-branch-history.repository");

const branchManager: userRepository.UserWithBranchRow = {
  id: 21,
  branch_id: 1,
  full_name: "Shyam",
  username: "shyam",
  email: "shyam@saptakoshi.com",
  password_hash: "secret",
  role: USER_ROLES.CHECKER,
  is_active: true,
  must_reset_password: false,
  created_at: new Date("2026-06-18T00:00:00.000Z"),
  updated_at: new Date("2026-06-18T00:00:00.000Z"),
  branch_code: "BRT001",
  branch_name: "Biratnagar Branch",
};

const employee: userRepository.UserWithBranchRow = {
  ...branchManager,
  id: 7,
  full_name: "Ram Sharma",
  username: "ram",
  email: "ram@saptakoshi.com",
  role: USER_ROLES.MAKER,
};

const adminUser: userRepository.UserWithBranchRow = {
  ...branchManager,
  id: 1,
  full_name: "Admin User",
  username: "admin",
  email: "admin@saptakoshi.com",
  role: USER_ROLES.ADMIN,
  branch_id: null,
  branch_code: null,
  branch_name: null,
};

const newBranch: branchRepository.BranchRow = {
  id: 5,
  branch_code: "BRT005",
  branch_name: "Itahari Branch",
  address: null,
  phone_number: null,
  email: null,
  is_active: true,
  created_at: new Date("2026-06-18T00:00:00.000Z"),
  updated_at: new Date("2026-06-18T00:00:00.000Z"),
};

const transferredBranchManager: userRepository.UserWithBranchRow = {
  ...branchManager,
  branch_id: 5,
  branch_code: "BRT005",
  branch_name: "Itahari Branch",
  updated_at: new Date("2026-06-22T00:00:00.000Z"),
};

describe("transferUserBranch", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(withTransaction).mockImplementation(async (callback) =>
      callback({ query: vi.fn() })
    );
  });

  it("transfers a branch manager and records history", async () => {
    vi.mocked(userRepository.findById)
      .mockResolvedValueOnce(branchManager)
      .mockResolvedValueOnce(transferredBranchManager);
    vi.mocked(branchRepository.findById).mockResolvedValue(newBranch);
    vi.mocked(userRepository.updateBranchId).mockResolvedValue(branchManager.id);
    vi.mocked(employeeBranchHistoryRepository.insert).mockResolvedValue({
      id: 1,
      user_id: branchManager.id,
      old_branch_id: 1,
      new_branch_id: 5,
      transferred_by: 1,
      remarks: "Regional reshuffle",
      transferred_at: new Date("2026-06-22T00:00:00.000Z"),
    });

    const result = await transferUserBranch(
      branchManager.id,
      { branchId: 5, remarks: "Regional reshuffle" },
      1
    );

    expect(userRepository.findById).toHaveBeenNthCalledWith(1, branchManager.id);
    expect(userRepository.findById).toHaveBeenNthCalledWith(
      2,
      branchManager.id,
      expect.any(Object)
    );

    expect(employeeBranchHistoryRepository.insert).toHaveBeenCalledWith(
      {
        userId: branchManager.id,
        oldBranchId: 1,
        newBranchId: 5,
        transferredBy: 1,
        remarks: "Regional reshuffle",
      },
      expect.any(Object)
    );
    expect(userRepository.updateBranchId).toHaveBeenCalledWith(
      branchManager.id,
      5,
      expect.any(Object)
    );
    expect(result.branchId).toBe(5);
    expect(result.branchCode).toBe("BRT005");
    expect(result.role).toBe(USER_ROLES.CHECKER);
    expect(result.email).toBe(branchManager.email);
  });

  it("transfers an employee without changing role or credentials", async () => {
    const transferredEmployee: userRepository.UserWithBranchRow = {
      ...employee,
      branch_id: 5,
      branch_code: "BRT005",
      branch_name: "Itahari Branch",
    };

    vi.mocked(userRepository.findById)
      .mockResolvedValueOnce(employee)
      .mockResolvedValueOnce(transferredEmployee);
    vi.mocked(branchRepository.findById).mockResolvedValue(newBranch);
    vi.mocked(userRepository.updateBranchId).mockResolvedValue(employee.id);
    vi.mocked(employeeBranchHistoryRepository.insert).mockResolvedValue({
      id: 2,
      user_id: employee.id,
      old_branch_id: 1,
      new_branch_id: 5,
      transferred_by: 1,
      remarks: null,
      transferred_at: new Date("2026-06-22T00:00:00.000Z"),
    });

    const result = await transferUserBranch(employee.id, { branchId: 5 }, 1);

    expect(result.role).toBe(USER_ROLES.MAKER);
    expect(result.username).toBe(employee.username);
    expect(result.email).toBe(employee.email);
    expect(result.branchId).toBe(5);
  });

  it("rejects transfer when user is not found", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(null);

    await expect(
      transferUserBranch(999, { branchId: 5 }, 1)
    ).rejects.toEqual(
      expect.objectContaining({
        message: "User not found",
        statusCode: 404,
      })
    );
  });

  it("rejects transfer for admin users", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(adminUser);

    await expect(
      transferUserBranch(adminUser.id, { branchId: 5 }, 1)
    ).rejects.toEqual(
      expect.objectContaining({
        message:
          "Only makers, checkers, and tellers can be transferred between branches",
      })
    );
  });

  it("rejects transfer to a non-existent branch", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(branchManager);
    vi.mocked(branchRepository.findById).mockResolvedValue(null);

    await expect(
      transferUserBranch(branchManager.id, { branchId: 99 }, 1)
    ).rejects.toEqual(
      expect.objectContaining({
        message: "Branch not found",
        statusCode: 404,
      })
    );
  });

  it("rejects transfer when new branch matches current branch", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(branchManager);
    vi.mocked(branchRepository.findById).mockResolvedValue({
      ...newBranch,
      id: 1,
      branch_code: "BRT001",
    });

    await expect(
      transferUserBranch(branchManager.id, { branchId: 1 }, 1)
    ).rejects.toEqual(
      expect.objectContaining({
        message: "New branch must be different from the current branch",
      })
    );
  });

  it("rejects transfer without a valid branch id", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(branchManager);

    await expect(
      transferUserBranch(branchManager.id, {}, 1)
    ).rejects.toEqual(
      expect.objectContaining({
        message: "A valid new branch is required",
      })
    );
  });
});
