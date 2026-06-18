import fs from "node:fs/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { USER_ROLES } from "@saptakoshi/shared";
import { withTransaction } from "../config/database";
import * as accountOpeningDocumentRepository from "../repositories/account-opening-document.repository";
import * as branchRepository from "../repositories/branch.repository";
import * as userRepository from "../repositories/user.repository";
import {
  AccountOpeningDocumentError,
  uploadAccountOpeningDocument,
} from "../services/account-opening-document.service";

vi.mock("node:fs/promises", () => ({
  default: {
    mkdir: vi.fn(),
    writeFile: vi.fn(),
    unlink: vi.fn(),
  },
}));

vi.mock("../config/database", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../config/database")>();

  return {
    ...actual,
    withTransaction: vi.fn(),
  };
});

vi.mock("../repositories/user.repository");
vi.mock("../repositories/branch.repository");
vi.mock("../repositories/account-opening-document.repository");

const currentUser: userRepository.UserWithBranchRow = {
  id: 7,
  branch_id: 1,
  full_name: "Ram Sharma",
  username: "ram",
  email: "ram@saptakoshi.com",
  password_hash: "secret",
  role: USER_ROLES.USER,
  is_active: true,
  created_at: new Date("2026-06-18T00:00:00.000Z"),
  updated_at: new Date("2026-06-18T00:00:00.000Z"),
  branch_code: "BRT001",
  branch_name: "Biratnagar Branch",
};

const branch: branchRepository.BranchRow = {
  id: 1,
  branch_code: "BRT001",
  branch_name: "Biratnagar Branch",
  address: null,
  phone_number: null,
  email: null,
  is_active: true,
  created_at: new Date("2026-06-18T00:00:00.000Z"),
  updated_at: new Date("2026-06-18T00:00:00.000Z"),
};

describe("account-opening-document.service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.UPLOAD_DIR = "/tmp/bank-documents";

    vi.mocked(withTransaction).mockImplementation(async (callback) =>
      callback({
        query: vi.fn(),
      })
    );
  });

  it("uploads a document using the logged-in user's branch", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(currentUser);
    vi.mocked(branchRepository.findById).mockResolvedValue(branch);
    vi.mocked(
      accountOpeningDocumentRepository.getNextDocumentSequence
    ).mockResolvedValue(1);
    vi.mocked(accountOpeningDocumentRepository.create).mockResolvedValue({
      id: 11,
      branch_id: 1,
      uploaded_by: 7,
      client_code: "CL000123",
      first_name: "Sita",
      last_name: "Sharma",
      father_name: "Hari Sharma",
      citizen_no: "12345678",
      mobile_number: "9800000000",
      document_no: "BRT001-2026-000001",
      original_file_name: "citizenship copy.pdf",
      stored_file_name: "BRT001-2026-000001-citizenship-copy.pdf",
      relative_file_path:
        "BRT001/CL000123/BRT001-2026-000001-citizenship-copy.pdf",
      mime_type: "application/pdf",
      file_size: 2048,
      created_at: new Date("2026-06-18T01:00:00.000Z"),
      updated_at: new Date("2026-06-18T01:00:00.000Z"),
    });

    const result = await uploadAccountOpeningDocument({
      authenticatedUser: {
        id: 7,
        email: "ram@saptakoshi.com",
        role: USER_ROLES.USER,
        branch_id: 1,
      },
      clientCode: "cl000123",
      firstName: "Sita",
      lastName: "Sharma",
      fatherName: "Hari Sharma",
      citizenNo: "12345678",
      mobileNumber: "9800000000",
      file: {
        originalname: "citizenship copy.pdf",
        mimetype: "application/pdf",
        size: 2048,
        buffer: Buffer.from("pdf"),
      } as Express.Multer.File,
    });

    expect(accountOpeningDocumentRepository.getNextDocumentSequence).toHaveBeenCalled();
    expect(fs.mkdir).toHaveBeenCalledWith("/tmp/bank-documents/BRT001/CL000123", {
      recursive: true,
    });
    expect(fs.writeFile).toHaveBeenCalledWith(
      "/tmp/bank-documents/BRT001/CL000123/BRT001-2026-000001-citizenship-copy.pdf",
      expect.any(Buffer)
    );
    expect(accountOpeningDocumentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        branchId: 1,
        uploadedBy: 7,
        clientCode: "CL000123",
        documentNo: "BRT001-2026-000001",
        storedFileName: "BRT001-2026-000001-citizenship-copy.pdf",
        relativeFilePath:
          "BRT001/CL000123/BRT001-2026-000001-citizenship-copy.pdf",
      }),
      expect.any(Object)
    );
    expect(result.documentNo).toBe("BRT001-2026-000001");
  });

  it("rejects inactive users", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue({
      ...currentUser,
      is_active: false,
    });

    await expect(
      uploadAccountOpeningDocument({
        authenticatedUser: {
          id: 7,
          email: "ram@saptakoshi.com",
          role: USER_ROLES.USER,
          branch_id: 1,
        },
        clientCode: "CL000123",
        firstName: "Sita",
        lastName: "Sharma",
        citizenNo: "12345678",
        mobileNumber: "9800000000",
        file: {
          originalname: "citizenship.pdf",
          mimetype: "application/pdf",
          size: 2048,
          buffer: Buffer.from("pdf"),
        } as Express.Multer.File,
      })
    ).rejects.toThrow(new AccountOpeningDocumentError("Account is inactive", 403));
  });

  it("rejects path traversal in client code", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(currentUser);
    vi.mocked(branchRepository.findById).mockResolvedValue(branch);

    await expect(
      uploadAccountOpeningDocument({
        authenticatedUser: {
          id: 7,
          email: "ram@saptakoshi.com",
          role: USER_ROLES.USER,
          branch_id: 1,
        },
        clientCode: "../secret",
        firstName: "Sita",
        lastName: "Sharma",
        citizenNo: "12345678",
        mobileNumber: "9800000000",
        file: {
          originalname: "citizenship.pdf",
          mimetype: "application/pdf",
          size: 2048,
          buffer: Buffer.from("pdf"),
        } as Express.Multer.File,
      })
    ).rejects.toThrow(new AccountOpeningDocumentError("Invalid client code"));
  });

  it("rejects non-PDF files", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(currentUser);
    vi.mocked(branchRepository.findById).mockResolvedValue(branch);

    await expect(
      uploadAccountOpeningDocument({
        authenticatedUser: {
          id: 7,
          email: "ram@saptakoshi.com",
          role: USER_ROLES.USER,
          branch_id: 1,
        },
        clientCode: "CL000123",
        firstName: "Sita",
        lastName: "Sharma",
        citizenNo: "12345678",
        mobileNumber: "9800000000",
        file: {
          originalname: "photo.jpg",
          mimetype: "image/jpeg",
          size: 2048,
          buffer: Buffer.from("jpg"),
        } as Express.Multer.File,
      })
    ).rejects.toThrow(new AccountOpeningDocumentError("Only PDF files are allowed"));
  });

  it("rejects files larger than 2 MB", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(currentUser);
    vi.mocked(branchRepository.findById).mockResolvedValue(branch);

    await expect(
      uploadAccountOpeningDocument({
        authenticatedUser: {
          id: 7,
          email: "ram@saptakoshi.com",
          role: USER_ROLES.USER,
          branch_id: 1,
        },
        clientCode: "CL000123",
        firstName: "Sita",
        lastName: "Sharma",
        citizenNo: "12345678",
        mobileNumber: "9800000000",
        file: {
          originalname: "citizenship.pdf",
          mimetype: "application/pdf",
          size: 2 * 1024 * 1024 + 1,
          buffer: Buffer.from("pdf"),
        } as Express.Multer.File,
      })
    ).rejects.toThrow(
      new AccountOpeningDocumentError("File size must be 2 MB or less")
    );
  });
});
