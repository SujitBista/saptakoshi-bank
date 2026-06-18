import fs from "node:fs/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { USER_ROLES } from "@saptakoshi/shared";
import { withTransaction } from "../config/database";
import * as accountOpeningDocumentRepository from "../repositories/account-opening-document.repository";
import * as branchRepository from "../repositories/branch.repository";
import * as userRepository from "../repositories/user.repository";
import {
  AccountOpeningDocumentError,
  getAccountOpeningDocumentById,
  listAccountOpeningDocuments,
  updateAccountOpeningDocument,
  uploadAccountOpeningDocument,
} from "../services/account-opening-document.service";

vi.mock("node:fs/promises", () => ({
  default: {
    mkdir: vi.fn(),
    writeFile: vi.fn(),
    unlink: vi.fn(),
    access: vi.fn(),
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

const documentRow: accountOpeningDocumentRepository.AccountOpeningDocumentDetailRow =
  {
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
    branch_code: "BRT001",
    branch_name: "Biratnagar Branch",
    uploaded_by_name: "Ram Sharma",
  };

const authUser = {
  id: 7,
  email: "ram@saptakoshi.com",
  role: USER_ROLES.USER,
  branch_id: 1,
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
    vi.mocked(accountOpeningDocumentRepository.create).mockResolvedValue(documentRow);
    vi.mocked(accountOpeningDocumentRepository.findById).mockResolvedValue(documentRow);

    const result = await uploadAccountOpeningDocument({
      authenticatedUser: authUser,
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
    expect(result.branchCode).toBe("BRT001");
  });

  it("lists documents scoped to the user's branch", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(currentUser);
    vi.mocked(accountOpeningDocumentRepository.countAll).mockResolvedValue(1);
    vi.mocked(accountOpeningDocumentRepository.findAll).mockResolvedValue([
      documentRow,
    ]);

    const result = await listAccountOpeningDocuments({
      authenticatedUser: authUser,
      page: 1,
      limit: 10,
    });

    expect(accountOpeningDocumentRepository.countAll).toHaveBeenCalledWith({
      search: undefined,
      clientCode: undefined,
      documentNo: undefined,
      branchId: 1,
    });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].uploadedByName).toBe("Ram Sharma");
  });

  it("rejects cross-branch document access for branch users", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(currentUser);
    vi.mocked(accountOpeningDocumentRepository.findById).mockResolvedValue({
      ...documentRow,
      branch_id: 99,
    });

    await expect(getAccountOpeningDocumentById(authUser, 11)).rejects.toThrow(
      new AccountOpeningDocumentError("Forbidden", 403)
    );
  });

  it("updates document metadata for branch users", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(currentUser);
    vi.mocked(accountOpeningDocumentRepository.findById)
      .mockResolvedValueOnce(documentRow)
      .mockResolvedValueOnce({
        ...documentRow,
        first_name: "Gita",
      });
    vi.mocked(accountOpeningDocumentRepository.update).mockResolvedValue({
      ...documentRow,
      first_name: "Gita",
    });

    const result = await updateAccountOpeningDocument({
      authenticatedUser: authUser,
      documentId: 11,
      firstName: "Gita",
      lastName: "Sharma",
      fatherName: "Hari Sharma",
      citizenNo: "12345678",
      mobileNumber: "9800000000",
    });

    expect(accountOpeningDocumentRepository.update).toHaveBeenCalled();
    expect(result.firstName).toBe("Gita");
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
