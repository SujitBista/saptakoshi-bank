import fs from "node:fs/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DOCUMENT_STATUSES, USER_ROLES } from "@saptakoshi/shared";
import { withTransaction } from "../config/database";
import * as accountOpeningDocumentRepository from "../repositories/account-opening-document.repository";
import * as branchRepository from "../repositories/branch.repository";
import * as documentReviewHistoryRepository from "../repositories/document-review-history.repository";
import * as userRepository from "../repositories/user.repository";
import {
  AccountOpeningDocumentError,
  approveAccountOpeningDocument,
  getAccountOpeningDocumentById,
  listAccountOpeningDocuments,
  rejectAccountOpeningDocument,
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
vi.mock("../repositories/document-review-history.repository");

const currentEmployee: userRepository.UserWithBranchRow = {
  id: 7,
  branch_id: 1,
  full_name: "Ram Sharma",
  username: "ram",
  email: "ram@saptakoshi.com",
  password_hash: "secret",
  role: USER_ROLES.MAKER,
  is_active: true,
  must_reset_password: false,
  created_at: new Date("2026-06-18T00:00:00.000Z"),
  updated_at: new Date("2026-06-18T00:00:00.000Z"),
  branch_code: "BRT001",
  branch_name: "Biratnagar Branch",
};

const branchManagerOne: userRepository.UserWithBranchRow = {
  id: 21,
  branch_id: 1,
  full_name: "Branch Manager One",
  username: "manager1",
  email: "manager1@saptakoshi.com",
  password_hash: "secret",
  role: USER_ROLES.CHECKER,
  is_active: true,
  must_reset_password: false,
  created_at: new Date("2026-06-18T00:00:00.000Z"),
  updated_at: new Date("2026-06-18T00:00:00.000Z"),
  branch_code: "BRT001",
  branch_name: "Biratnagar Branch",
};

const branchManagerTwo: userRepository.UserWithBranchRow = {
  ...branchManagerOne,
  id: 22,
  full_name: "Branch Manager Two",
  username: "manager2",
  email: "manager2@saptakoshi.com",
};

const adminUser: userRepository.UserWithBranchRow = {
  id: 1,
  branch_id: null,
  full_name: "Admin User",
  username: "admin",
  email: "admin@saptakoshi.com",
  password_hash: "secret",
  role: USER_ROLES.ADMIN,
  is_active: true,
  must_reset_password: false,
  created_at: new Date("2026-06-18T00:00:00.000Z"),
  updated_at: new Date("2026-06-18T00:00:00.000Z"),
  branch_code: null,
  branch_name: null,
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
    status: DOCUMENT_STATUSES.PENDING,
    reviewed_by: null,
    reviewed_at: null,
    rejection_remarks: null,
    created_at: new Date("2026-06-18T01:00:00.000Z"),
    updated_at: new Date("2026-06-18T01:00:00.000Z"),
    branch_code: "BRT001",
    branch_name: "Biratnagar Branch",
    uploaded_by_name: "Ram Sharma",
    reviewed_by_name: null,
  };

const employeeAuthUser = {
  id: 7,
  email: "ram@saptakoshi.com",
  role: USER_ROLES.MAKER,
  branch_id: 1,
};

const branchManagerAuthUser = {
  id: 21,
  email: "manager1@saptakoshi.com",
  role: USER_ROLES.CHECKER,
  branch_id: 1,
};

const branchManagerTwoAuthUser = {
  id: 22,
  email: "manager2@saptakoshi.com",
  role: USER_ROLES.CHECKER,
  branch_id: 1,
};

const adminAuthUser = {
  id: 1,
  email: "admin@saptakoshi.com",
  role: USER_ROLES.ADMIN,
  branch_id: null,
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
    vi.mocked(
      accountOpeningDocumentRepository.findUniqueFieldConflicts
    ).mockResolvedValue([]);
  });

  it("uploads a document using the logged-in employee branch", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(currentEmployee);
    vi.mocked(branchRepository.findById).mockResolvedValue(branch);
    vi.mocked(
      accountOpeningDocumentRepository.getNextDocumentSequence
    ).mockResolvedValue(1);
    vi.mocked(accountOpeningDocumentRepository.create).mockResolvedValue(documentRow);
    vi.mocked(accountOpeningDocumentRepository.findById).mockResolvedValue(documentRow);

    const result = await uploadAccountOpeningDocument({
      authenticatedUser: employeeAuthUser,
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
    expect(result.documentNo).toBe("BRT001-2026-000001");
    expect(result.status).toBe(DOCUMENT_STATUSES.PENDING);
  });

  it("lists documents scoped to the employee own uploads", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(currentEmployee);
    vi.mocked(accountOpeningDocumentRepository.countAll).mockResolvedValue(1);
    vi.mocked(accountOpeningDocumentRepository.findAll).mockResolvedValue([
      documentRow,
    ]);

    const result = await listAccountOpeningDocuments({
      authenticatedUser: employeeAuthUser,
      page: 1,
      limit: 10,
    });

    expect(accountOpeningDocumentRepository.countAll).toHaveBeenCalledWith({
      search: undefined,
      clientCode: undefined,
      documentNo: undefined,
      branchId: 1,
      uploadedBy: 7,
      status: undefined,
    });
    expect(result.data).toHaveLength(1);
  });

  it("allows two branch managers in the same branch to list pending documents", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(branchManagerOne);
    vi.mocked(accountOpeningDocumentRepository.countAll).mockResolvedValue(1);
    vi.mocked(accountOpeningDocumentRepository.findAll).mockResolvedValue([
      documentRow,
    ]);

    const managerOneResult = await listAccountOpeningDocuments({
      authenticatedUser: branchManagerAuthUser,
      status: DOCUMENT_STATUSES.PENDING,
      page: 1,
      limit: 10,
    });

    vi.mocked(userRepository.findById).mockResolvedValue(branchManagerTwo);

    const managerTwoResult = await listAccountOpeningDocuments({
      authenticatedUser: branchManagerTwoAuthUser,
      status: DOCUMENT_STATUSES.PENDING,
      page: 1,
      limit: 10,
    });

    expect(managerOneResult.data).toHaveLength(1);
    expect(managerTwoResult.data).toHaveLength(1);
    expect(accountOpeningDocumentRepository.countAll).toHaveBeenCalledWith({
      search: undefined,
      clientCode: undefined,
      documentNo: undefined,
      branchId: 1,
      uploadedBy: undefined,
      status: DOCUMENT_STATUSES.PENDING,
    });
  });

  it("lists all document statuses for branch managers when no status filter is provided", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(branchManagerOne);
    vi.mocked(accountOpeningDocumentRepository.countAll).mockResolvedValue(3);
    vi.mocked(accountOpeningDocumentRepository.findAll).mockResolvedValue([
      documentRow,
      { ...documentRow, id: 12, status: DOCUMENT_STATUSES.APPROVED },
      { ...documentRow, id: 13, status: DOCUMENT_STATUSES.REJECTED },
    ]);

    const result = await listAccountOpeningDocuments({
      authenticatedUser: branchManagerAuthUser,
      page: 1,
      limit: 10,
    });

    expect(accountOpeningDocumentRepository.countAll).toHaveBeenCalledWith({
      search: undefined,
      clientCode: undefined,
      documentNo: undefined,
      branchId: 1,
      uploadedBy: undefined,
      status: undefined,
    });
    expect(result.data).toHaveLength(3);
  });

  it("rejects cross-branch document access for employees", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue({
      ...currentEmployee,
      id: 99,
    });
    vi.mocked(accountOpeningDocumentRepository.findById).mockResolvedValue(
      documentRow
    );

    await expect(
      getAccountOpeningDocumentById(
        { id: 99, email: "other@saptakoshi.com", role: USER_ROLES.MAKER, branch_id: 1 },
        11
      )
    ).rejects.toThrow(new AccountOpeningDocumentError("Forbidden", 403));
  });

  it("rejects branch manager approval for another branch document", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(branchManagerOne);
    vi.mocked(accountOpeningDocumentRepository.findById).mockResolvedValue({
      ...documentRow,
      branch_id: 99,
    });

    await expect(
      approveAccountOpeningDocument({
        authenticatedUser: branchManagerAuthUser,
        documentId: 11,
      })
    ).rejects.toThrow(
      new AccountOpeningDocumentError("Document is not in your assigned branch", 403)
    );
  });

  it("denies transferred branch manager access to old branch documents", async () => {
    const transferredManager = {
      ...branchManagerOne,
      branch_id: 5,
      branch_code: "BRT005",
      branch_name: "Itahari Branch",
    };

    vi.mocked(userRepository.findById).mockResolvedValue(transferredManager);
    vi.mocked(accountOpeningDocumentRepository.findById).mockResolvedValue(
      documentRow
    );

    await expect(
      getAccountOpeningDocumentById(
        {
          id: transferredManager.id,
          email: transferredManager.email,
          role: USER_ROLES.CHECKER,
          branch_id: 5,
        },
        11
      )
    ).rejects.toThrow(
      new AccountOpeningDocumentError(
        "Document is not in your assigned branch",
        403
      )
    );
  });

  it("allows transferred branch manager access to new branch documents", async () => {
    const transferredManager = {
      ...branchManagerOne,
      branch_id: 5,
      branch_code: "BRT005",
      branch_name: "Itahari Branch",
    };
    const newBranchDocument = {
      ...documentRow,
      branch_id: 5,
      branch_code: "BRT005",
      branch_name: "Itahari Branch",
    };

    vi.mocked(userRepository.findById).mockResolvedValue(transferredManager);
    vi.mocked(accountOpeningDocumentRepository.findById).mockResolvedValue(
      newBranchDocument
    );

    const result = await getAccountOpeningDocumentById(
      {
        id: transferredManager.id,
        email: transferredManager.email,
        role: USER_ROLES.CHECKER,
        branch_id: 5,
      },
      11
    );

    expect(result.branchId).toBe(5);
    expect(result.branchCode).toBe("BRT005");
  });

  it("keeps historical document approvals unchanged after branch transfer", async () => {
    const approvedDocument = {
      ...documentRow,
      status: DOCUMENT_STATUSES.APPROVED,
      reviewed_by: branchManagerOne.id,
      reviewed_at: new Date("2026-06-20T00:00:00.000Z"),
      reviewed_by_name: branchManagerOne.full_name,
    };
    const transferredManager = {
      ...branchManagerOne,
      branch_id: 5,
      branch_code: "BRT005",
      branch_name: "Itahari Branch",
    };

    vi.mocked(userRepository.findById).mockResolvedValue(transferredManager);
    vi.mocked(accountOpeningDocumentRepository.findById).mockResolvedValue(
      approvedDocument
    );

    await expect(
      getAccountOpeningDocumentById(
        {
          id: transferredManager.id,
          email: transferredManager.email,
          role: USER_ROLES.CHECKER,
          branch_id: 5,
        },
        11
      )
    ).rejects.toThrow(
      new AccountOpeningDocumentError(
        "Document is not in your assigned branch",
        403
      )
    );

    expect(approvedDocument.branch_id).toBe(1);
    expect(approvedDocument.reviewed_by).toBe(branchManagerOne.id);
    expect(approvedDocument.reviewed_at).toEqual(
      new Date("2026-06-20T00:00:00.000Z")
    );
  });

  it("rejects employee approve/reject attempts", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(currentEmployee);
    vi.mocked(accountOpeningDocumentRepository.findById).mockResolvedValue(
      documentRow
    );

    await expect(
      approveAccountOpeningDocument({
        authenticatedUser: employeeAuthUser,
        documentId: 11,
      })
    ).rejects.toThrow(new AccountOpeningDocumentError("Forbidden", 403));

    await expect(
      rejectAccountOpeningDocument({
        authenticatedUser: employeeAuthUser,
        documentId: 11,
        rejectionRemarks: "Incomplete",
      })
    ).rejects.toThrow(new AccountOpeningDocumentError("Forbidden", 403));
  });

  it("allows admin to approve any pending document", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(adminUser);
    vi.mocked(accountOpeningDocumentRepository.findById)
      .mockResolvedValueOnce(documentRow)
      .mockResolvedValueOnce({
        ...documentRow,
        status: DOCUMENT_STATUSES.APPROVED,
        reviewed_by: 1,
        reviewed_at: new Date("2026-06-19T00:00:00.000Z"),
        reviewed_by_name: "Admin User",
      });
    vi.mocked(accountOpeningDocumentRepository.updateReviewStatus).mockResolvedValue({
      ...documentRow,
      status: DOCUMENT_STATUSES.APPROVED,
      reviewed_by: 1,
      reviewed_at: new Date("2026-06-19T00:00:00.000Z"),
      reviewed_by_name: "Admin User",
    });

    const result = await approveAccountOpeningDocument({
      authenticatedUser: adminAuthUser,
      documentId: 11,
    });

    expect(result.status).toBe(DOCUMENT_STATUSES.APPROVED);
    expect(result.reviewedBy).toBe(1);
    expect(documentReviewHistoryRepository.insert).toHaveBeenCalledWith(
      {
        documentId: 11,
        action: DOCUMENT_STATUSES.APPROVED,
        performedBy: 1,
        remarks: null,
      },
      expect.anything()
    );
  });

  it("rejects approving an already reviewed document", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(branchManagerOne);
    vi.mocked(accountOpeningDocumentRepository.findById).mockResolvedValue({
      ...documentRow,
      status: DOCUMENT_STATUSES.APPROVED,
      reviewed_by: 21,
      reviewed_at: new Date("2026-06-19T00:00:00.000Z"),
    });

    await expect(
      approveAccountOpeningDocument({
        authenticatedUser: branchManagerAuthUser,
        documentId: 11,
      })
    ).rejects.toThrow(
      new AccountOpeningDocumentError("Document has already been reviewed", 409)
    );
  });

  it("allows branch manager to reject pending document with remarks", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(branchManagerOne);
    vi.mocked(accountOpeningDocumentRepository.findById)
      .mockResolvedValueOnce(documentRow)
      .mockResolvedValueOnce({
        ...documentRow,
        status: DOCUMENT_STATUSES.REJECTED,
        reviewed_by: 21,
        reviewed_at: new Date("2026-06-19T00:00:00.000Z"),
        rejection_remarks: "Missing signature",
        reviewed_by_name: "Branch Manager One",
      });
    vi.mocked(accountOpeningDocumentRepository.updateReviewStatus).mockResolvedValue({
      ...documentRow,
      status: DOCUMENT_STATUSES.REJECTED,
      reviewed_by: 21,
      reviewed_at: new Date("2026-06-19T00:00:00.000Z"),
      rejection_remarks: "Missing signature",
      reviewed_by_name: "Branch Manager One",
    });

    const result = await rejectAccountOpeningDocument({
      authenticatedUser: branchManagerAuthUser,
      documentId: 11,
      rejectionRemarks: "Missing signature",
    });

    expect(result.status).toBe(DOCUMENT_STATUSES.REJECTED);
    expect(result.rejectionRemarks).toBe("Missing signature");
    expect(documentReviewHistoryRepository.insert).toHaveBeenCalledWith(
      {
        documentId: 11,
        action: DOCUMENT_STATUSES.REJECTED,
        performedBy: 21,
        remarks: "Missing signature",
      },
      expect.anything()
    );
  });

  it("updates document metadata for employees on their own documents", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(currentEmployee);
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
      authenticatedUser: employeeAuthUser,
      documentId: 11,
      firstName: "Gita",
      lastName: "Sharma",
      fatherName: "Hari Sharma",
      citizenNo: "12345678",
      mobileNumber: "9800000000",
    });

    expect(accountOpeningDocumentRepository.update).toHaveBeenCalledWith(
      11,
      expect.objectContaining({
        firstName: "Gita",
      }),
      { resubmit: false },
      expect.anything()
    );
    expect(result.firstName).toBe("Gita");
  });

  it("resubmits rejected documents and records review history", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(currentEmployee);
    vi.mocked(accountOpeningDocumentRepository.findById)
      .mockResolvedValueOnce({
        ...documentRow,
        status: DOCUMENT_STATUSES.REJECTED,
        reviewed_by: 21,
        reviewed_at: new Date("2026-06-19T00:00:00.000Z"),
        rejection_remarks: "Missing signature",
      })
      .mockResolvedValueOnce({
        ...documentRow,
        status: DOCUMENT_STATUSES.PENDING,
        reviewed_by: null,
        reviewed_at: null,
        rejection_remarks: null,
        first_name: "Gita",
      });
    vi.mocked(accountOpeningDocumentRepository.update).mockResolvedValue({
      ...documentRow,
      status: DOCUMENT_STATUSES.PENDING,
      reviewed_by: null,
      reviewed_at: null,
      rejection_remarks: null,
      first_name: "Gita",
    });

    const result = await updateAccountOpeningDocument({
      authenticatedUser: employeeAuthUser,
      documentId: 11,
      firstName: "Gita",
      lastName: "Sharma",
      fatherName: "Hari Sharma",
      citizenNo: "12345678",
      mobileNumber: "9800000000",
    });

    expect(accountOpeningDocumentRepository.update).toHaveBeenCalledWith(
      11,
      expect.objectContaining({
        firstName: "Gita",
      }),
      { resubmit: true },
      expect.anything()
    );
    expect(documentReviewHistoryRepository.insert).toHaveBeenCalledWith(
      {
        documentId: 11,
        action: "RESUBMITTED",
        performedBy: 7,
      },
      expect.anything()
    );
    expect(result.status).toBe(DOCUMENT_STATUSES.PENDING);
    expect(result.firstName).toBe("Gita");
  });

  it("rejects editing approved documents for employees", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(currentEmployee);
    vi.mocked(accountOpeningDocumentRepository.findById).mockResolvedValue({
      ...documentRow,
      status: DOCUMENT_STATUSES.APPROVED,
      reviewed_by: 21,
      reviewed_at: new Date("2026-06-19T00:00:00.000Z"),
    });

    await expect(
      updateAccountOpeningDocument({
        authenticatedUser: employeeAuthUser,
        documentId: 11,
        firstName: "Gita",
        lastName: "Sharma",
        fatherName: "Hari Sharma",
        citizenNo: "12345678",
        mobileNumber: "9800000000",
      })
    ).rejects.toThrow(
      new AccountOpeningDocumentError("Approved documents cannot be edited", 409)
    );
  });

  it("rejects inactive users", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue({
      ...currentEmployee,
      is_active: false,
    });

    await expect(
      uploadAccountOpeningDocument({
        authenticatedUser: employeeAuthUser,
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

  it("rejects branch manager uploads", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(branchManagerOne);

    await expect(
      uploadAccountOpeningDocument({
        authenticatedUser: branchManagerAuthUser,
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
    ).rejects.toThrow(new AccountOpeningDocumentError("Forbidden", 403));
  });

  it("rejects path traversal in client code", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(currentEmployee);
    vi.mocked(branchRepository.findById).mockResolvedValue(branch);

    await expect(
      uploadAccountOpeningDocument({
        authenticatedUser: employeeAuthUser,
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
    vi.mocked(userRepository.findById).mockResolvedValue(currentEmployee);
    vi.mocked(branchRepository.findById).mockResolvedValue(branch);

    await expect(
      uploadAccountOpeningDocument({
        authenticatedUser: employeeAuthUser,
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
    vi.mocked(userRepository.findById).mockResolvedValue(currentEmployee);
    vi.mocked(branchRepository.findById).mockResolvedValue(branch);

    await expect(
      uploadAccountOpeningDocument({
        authenticatedUser: employeeAuthUser,
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

  it("rejects duplicate client code on upload", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(currentEmployee);
    vi.mocked(branchRepository.findById).mockResolvedValue(branch);
    vi.mocked(
      accountOpeningDocumentRepository.findUniqueFieldConflicts
    ).mockResolvedValue(["client_code"]);

    await expect(
      uploadAccountOpeningDocument({
        authenticatedUser: employeeAuthUser,
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
    ).rejects.toThrow(
      new AccountOpeningDocumentError("Client code is already in use", 409)
    );
  });

  it("rejects duplicate citizen number on update", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(currentEmployee);
    vi.mocked(accountOpeningDocumentRepository.findById).mockResolvedValue(
      documentRow
    );
    vi.mocked(
      accountOpeningDocumentRepository.findUniqueFieldConflicts
    ).mockResolvedValue(["citizen_no"]);

    await expect(
      updateAccountOpeningDocument({
        authenticatedUser: employeeAuthUser,
        documentId: 11,
        firstName: "Sita",
        lastName: "Sharma",
        fatherName: "Hari Sharma",
        citizenNo: "99999999",
        mobileNumber: "9800000000",
      })
    ).rejects.toThrow(
      new AccountOpeningDocumentError("Citizen No. is already in use", 409)
    );
  });
});
