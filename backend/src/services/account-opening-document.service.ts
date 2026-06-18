import fs from "node:fs/promises";
import path from "node:path";
import { USER_ROLES } from "@saptakoshi/shared";
import { withTransaction } from "../config/database";
import type { AuthenticatedUser } from "../middleware/auth.middleware";
import * as accountOpeningDocumentRepository from "../repositories/account-opening-document.repository";
import * as branchRepository from "../repositories/branch.repository";
import * as userRepository from "../repositories/user.repository";

const ALLOWED_EXTENSIONS = new Set([".pdf"]);
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const DEFAULT_UPLOAD_DIR = path.join(process.cwd(), "uploads");

export class AccountOpeningDocumentError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "AccountOpeningDocumentError";
  }
}

export interface AccountOpeningDocumentDto {
  id: number;
  branchId: number;
  branchCode: string;
  branchName: string;
  uploadedBy: number;
  uploadedByName: string;
  clientCode: string;
  firstName: string;
  lastName: string;
  fatherName: string | null;
  citizenNo: string;
  mobileNumber: string;
  documentNo: string;
  originalFileName: string;
  storedFileName: string;
  relativeFilePath: string;
  mimeType: string | null;
  fileSize: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AccountOpeningDocumentListResponse {
  data: AccountOpeningDocumentDto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const DEFAULT_ACCOUNT_OPENING_PAGE = 1;
export const DEFAULT_ACCOUNT_OPENING_PAGE_SIZE = 10;
export const MAX_ACCOUNT_OPENING_PAGE_SIZE = 100;

export interface UploadAccountOpeningDocumentPayload {
  authenticatedUser: AuthenticatedUser;
  branchId?: string;
  clientCode?: string;
  firstName?: string;
  lastName?: string;
  fatherName?: string;
  citizenNo?: string;
  mobileNumber?: string;
  file?: Express.Multer.File;
}

export interface ListAccountOpeningDocumentsPayload {
  authenticatedUser: AuthenticatedUser;
  search?: string;
  clientCode?: string;
  documentNo?: string;
  branchId?: number;
  page?: number;
  limit?: number;
}

export interface UpdateAccountOpeningDocumentPayload {
  authenticatedUser: AuthenticatedUser;
  documentId: number;
  firstName?: string;
  lastName?: string;
  fatherName?: string;
  citizenNo?: string;
  mobileNumber?: string;
  file?: Express.Multer.File;
}

export interface AccountOpeningDocumentFileResult {
  absoluteFilePath: string;
  originalFileName: string;
  mimeType: string;
}

function getUploadDir(): string {
  return path.resolve(process.env.UPLOAD_DIR?.trim() || DEFAULT_UPLOAD_DIR);
}

function sanitizePathSegment(value: string, fieldLabel: string): string {
  const normalized = value.trim().toUpperCase();

  if (!normalized) {
    throw new AccountOpeningDocumentError(`${fieldLabel} is required`);
  }

  if (normalized.includes("..") || normalized.includes("/") || normalized.includes("\\")) {
    throw new AccountOpeningDocumentError(`Invalid ${fieldLabel.toLowerCase()}`);
  }

  const sanitized = normalized.replace(/[^A-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");

  if (!sanitized) {
    throw new AccountOpeningDocumentError(`Invalid ${fieldLabel.toLowerCase()}`);
  }

  return sanitized;
}

function sanitizeText(
  value: string | undefined,
  fieldLabel: string,
  maxLength: number,
  required: boolean = true
): string | null {
  const normalized = value?.trim() ?? "";

  if (!normalized) {
    if (required) {
      throw new AccountOpeningDocumentError(`${fieldLabel} is required`);
    }

    return null;
  }

  if (normalized.length > maxLength) {
    throw new AccountOpeningDocumentError(
      `${fieldLabel} must be ${maxLength} characters or less`
    );
  }

  return normalized;
}

function sanitizeFileBaseName(originalFileName: string): string {
  const ext = path.extname(originalFileName).toLowerCase();
  const baseName = path.basename(originalFileName, ext).trim();
  const sanitized = baseName
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return sanitized || "document";
}

function ensureAllowedFile(file: Express.Multer.File): string {
  const extension = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new AccountOpeningDocumentError("Only PDF files are allowed");
  }

  const allowedMimeTypes = new Set([
    "application/pdf",
    "application/x-pdf",
    "application/octet-stream",
  ]);

  if (file.mimetype && !allowedMimeTypes.has(file.mimetype)) {
    throw new AccountOpeningDocumentError("Only PDF files are allowed");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new AccountOpeningDocumentError("File size must be 2 MB or less");
  }

  return extension;
}

function ensurePathInsideRoot(rootDir: string, targetPath: string): void {
  const relative = path.relative(rootDir, targetPath);

  if (
    relative.startsWith("..") ||
    path.isAbsolute(relative) ||
    relative.includes(`..${path.sep}`)
  ) {
    throw new AccountOpeningDocumentError("Invalid file path");
  }
}

function getUniqueFieldErrorMessage(
  field: accountOpeningDocumentRepository.AccountOpeningDocumentUniqueField
): string {
  switch (field) {
    case "client_code":
      return "Client code is already in use";
    case "citizen_no":
      return "Citizen No. is already in use";
    case "mobile_number":
      return "Mobile number is already in use";
  }
}

async function assertUniqueDocumentFields(
  values: accountOpeningDocumentRepository.AccountOpeningDocumentUniqueFieldCheck,
  excludeDocumentId?: number,
  executor?: import("../config/database").DbExecutor
): Promise<void> {
  const conflicts = await accountOpeningDocumentRepository.findUniqueFieldConflicts(
    values,
    excludeDocumentId,
    executor
  );

  if (conflicts.length > 0) {
    throw new AccountOpeningDocumentError(
      getUniqueFieldErrorMessage(conflicts[0]),
      409
    );
  }
}

function toDocumentDto(
  row:
    | accountOpeningDocumentRepository.AccountOpeningDocumentRow
    | accountOpeningDocumentRepository.AccountOpeningDocumentDetailRow
): AccountOpeningDocumentDto {
  const detail = row as accountOpeningDocumentRepository.AccountOpeningDocumentDetailRow;

  return {
    id: Number(row.id),
    branchId: row.branch_id,
    branchCode: detail.branch_code ?? "",
    branchName: detail.branch_name ?? "",
    uploadedBy: row.uploaded_by,
    uploadedByName: detail.uploaded_by_name ?? "",
    clientCode: row.client_code,
    firstName: row.first_name,
    lastName: row.last_name,
    fatherName: row.father_name,
    citizenNo: row.citizen_no,
    mobileNumber: row.mobile_number,
    documentNo: row.document_no,
    originalFileName: row.original_file_name,
    storedFileName: row.stored_file_name,
    relativeFilePath: row.relative_file_path,
    mimeType: row.mime_type,
    fileSize:
      row.file_size === null || row.file_size === undefined
        ? null
        : Number(row.file_size),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

async function getActiveUser(
  authenticatedUser: AuthenticatedUser
): Promise<userRepository.UserWithBranchRow> {
  const currentUser = await userRepository.findById(authenticatedUser.id);

  if (!currentUser) {
    throw new AccountOpeningDocumentError("Unauthorized", 401);
  }

  if (!currentUser.is_active) {
    throw new AccountOpeningDocumentError("Account is inactive", 403);
  }

  return currentUser;
}

function resolveListBranchId(
  currentUser: userRepository.UserWithBranchRow,
  branchId?: number
): number | undefined {
  if (currentUser.role === USER_ROLES.USER) {
    if (!currentUser.branch_id) {
      throw new AccountOpeningDocumentError("Assigned branch is required");
    }

    return currentUser.branch_id;
  }

  return branchId;
}

async function getAccessibleDocument(
  currentUser: userRepository.UserWithBranchRow,
  documentId: number
): Promise<accountOpeningDocumentRepository.AccountOpeningDocumentDetailRow> {
  const document = await accountOpeningDocumentRepository.findById(documentId);

  if (!document) {
    throw new AccountOpeningDocumentError("Document not found", 404);
  }

  if (
    currentUser.role === USER_ROLES.USER &&
    document.branch_id !== currentUser.branch_id
  ) {
    throw new AccountOpeningDocumentError("Forbidden", 403);
  }

  return document;
}

function getAbsoluteFilePath(relativeFilePath: string): string {
  const uploadDir = getUploadDir();
  const absoluteFilePath = path.join(uploadDir, relativeFilePath);
  ensurePathInsideRoot(uploadDir, absoluteFilePath);
  return absoluteFilePath;
}

async function resolveBranchForUpload(
  currentUser: userRepository.UserWithBranchRow,
  branchIdValue?: string
): Promise<branchRepository.BranchRow> {
  if (currentUser.role === USER_ROLES.USER) {
    if (!currentUser.branch_id || !currentUser.branch_code) {
      throw new AccountOpeningDocumentError("Assigned branch is required for uploads");
    }

    const branch = await branchRepository.findById(currentUser.branch_id);
    if (!branch) {
      throw new AccountOpeningDocumentError("Branch not found", 404);
    }

    return branch;
  }

  const parsedBranchId = branchIdValue?.trim() ? Number(branchIdValue) : null;
  if (parsedBranchId !== null) {
    if (!Number.isInteger(parsedBranchId) || parsedBranchId <= 0) {
      throw new AccountOpeningDocumentError("Invalid branch id");
    }

    const branch = await branchRepository.findById(parsedBranchId);
    if (!branch) {
      throw new AccountOpeningDocumentError("Branch not found", 404);
    }

    return branch;
  }

  if (!currentUser.branch_id) {
    throw new AccountOpeningDocumentError("Branch is required for admin uploads");
  }

  const branch = await branchRepository.findById(currentUser.branch_id);
  if (!branch) {
    throw new AccountOpeningDocumentError("Branch not found", 404);
  }

  return branch;
}

export async function uploadAccountOpeningDocument(
  payload: UploadAccountOpeningDocumentPayload
): Promise<AccountOpeningDocumentDto> {
  const currentUser = await getActiveUser(payload.authenticatedUser);

  const file = payload.file;
  if (!file) {
    throw new AccountOpeningDocumentError("File is required");
  }

  const branch = await resolveBranchForUpload(currentUser, payload.branchId);
  const branchCode = sanitizePathSegment(branch.branch_code, "Branch code");
  const clientCode = sanitizePathSegment(payload.clientCode ?? "", "Client code");
  const firstName = sanitizeText(payload.firstName, "First name", 100) as string;
  const lastName = sanitizeText(payload.lastName, "Last name", 100) as string;
  const fatherName = sanitizeText(payload.fatherName, "Father name", 100, false);
  const citizenNo = sanitizeText(payload.citizenNo, "Citizen No.", 50) as string;
  const mobileNumber = sanitizeText(
    payload.mobileNumber,
    "Mobile number",
    20
  ) as string;
  const extension = ensureAllowedFile(file);
  const uploadDir = getUploadDir();
  const year = new Date().getFullYear();

  return withTransaction(async (executor) => {
    const nextSequence =
      await accountOpeningDocumentRepository.getNextDocumentSequence(
        branch.id,
        branchCode,
        year,
        executor
      );

    const documentNo = `${branchCode}-${year}-${String(nextSequence).padStart(6, "0")}`;
    const cleanBaseName = sanitizeFileBaseName(file.originalname);
    const storedFileName = `${documentNo}-${cleanBaseName}${extension}`;
    const relativeFilePath = path.posix.join(branchCode, clientCode, storedFileName);
    const absoluteDirectory = path.join(uploadDir, branchCode, clientCode);
    const absoluteFilePath = path.join(absoluteDirectory, storedFileName);

    ensurePathInsideRoot(uploadDir, absoluteDirectory);
    ensurePathInsideRoot(uploadDir, absoluteFilePath);

    await assertUniqueDocumentFields(
      {
        clientCode,
        citizenNo,
        mobileNumber,
      },
      undefined,
      executor
    );

    await fs.mkdir(absoluteDirectory, { recursive: true });

    try {
      await fs.writeFile(absoluteFilePath, file.buffer);

      const row = await accountOpeningDocumentRepository.create(
        {
          branchId: branch.id,
          uploadedBy: currentUser.id,
          clientCode,
          firstName,
          lastName,
          fatherName,
          citizenNo,
          mobileNumber,
          documentNo,
          originalFileName: file.originalname,
          storedFileName,
          relativeFilePath,
          mimeType: file.mimetype || null,
          fileSize: file.size,
        },
        executor
      );

      const created = await accountOpeningDocumentRepository.findById(
        row.id,
        executor
      );
      if (!created) {
        throw new AccountOpeningDocumentError("Failed to load created document", 500);
      }

      return toDocumentDto(created);
    } catch (error) {
      await fs.unlink(absoluteFilePath).catch(() => undefined);

      if (error instanceof AccountOpeningDocumentError) {
        throw error;
      }

      const errno = (error as NodeJS.ErrnoException | undefined)?.code;
      if (errno === "EACCES" || errno === "EPERM" || errno === "ENOENT") {
        throw new AccountOpeningDocumentError(
          "Unable to store uploaded file. Check server upload directory permissions.",
          500
        );
      }

      throw error;
    }
  });
}

export async function listAccountOpeningDocuments(
  payload: ListAccountOpeningDocumentsPayload
): Promise<AccountOpeningDocumentListResponse> {
  const currentUser = await getActiveUser(payload.authenticatedUser);
  const page = payload.page ?? DEFAULT_ACCOUNT_OPENING_PAGE;
  const limit = Math.min(
    payload.limit ?? DEFAULT_ACCOUNT_OPENING_PAGE_SIZE,
    MAX_ACCOUNT_OPENING_PAGE_SIZE
  );
  const branchId = resolveListBranchId(currentUser, payload.branchId);

  const filters = {
    search: payload.search,
    clientCode: payload.clientCode,
    documentNo: payload.documentNo,
    branchId,
  };

  const [total, rows] = await Promise.all([
    accountOpeningDocumentRepository.countAll(filters),
    accountOpeningDocumentRepository.findAll(filters, { page, limit }),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    data: rows.map(toDocumentDto),
    page,
    limit,
    total,
    totalPages,
  };
}

export async function getAccountOpeningDocumentById(
  authenticatedUser: AuthenticatedUser,
  documentId: number
): Promise<AccountOpeningDocumentDto> {
  const currentUser = await getActiveUser(authenticatedUser);
  const document = await getAccessibleDocument(currentUser, documentId);
  return toDocumentDto(document);
}

export async function getAccountOpeningDocumentFile(
  authenticatedUser: AuthenticatedUser,
  documentId: number
): Promise<AccountOpeningDocumentFileResult> {
  const currentUser = await getActiveUser(authenticatedUser);
  const document = await getAccessibleDocument(currentUser, documentId);
  const absoluteFilePath = getAbsoluteFilePath(document.relative_file_path);

  try {
    await fs.access(absoluteFilePath);
  } catch {
    throw new AccountOpeningDocumentError("Document file not found", 404);
  }

  return {
    absoluteFilePath,
    originalFileName: document.original_file_name,
    mimeType: document.mime_type || "application/pdf",
  };
}

export async function updateAccountOpeningDocument(
  payload: UpdateAccountOpeningDocumentPayload
): Promise<AccountOpeningDocumentDto> {
  const currentUser = await getActiveUser(payload.authenticatedUser);
  const document = await getAccessibleDocument(currentUser, payload.documentId);

  const firstName = sanitizeText(payload.firstName, "First name", 100) as string;
  const lastName = sanitizeText(payload.lastName, "Last name", 100) as string;
  const fatherName = sanitizeText(payload.fatherName, "Father name", 100, false);
  const citizenNo = sanitizeText(payload.citizenNo, "Citizen No.", 50) as string;
  const mobileNumber = sanitizeText(
    payload.mobileNumber,
    "Mobile number",
    20
  ) as string;

  let fileUpdate:
    | {
        originalFileName: string;
        mimeType: string | null;
        fileSize: number;
      }
    | undefined;

  if (payload.file) {
    ensureAllowedFile(payload.file);
    const absoluteFilePath = getAbsoluteFilePath(document.relative_file_path);

    try {
      await fs.writeFile(absoluteFilePath, payload.file.buffer);
    } catch (error) {
      const errno = (error as NodeJS.ErrnoException | undefined)?.code;
      if (errno === "EACCES" || errno === "EPERM" || errno === "ENOENT") {
        throw new AccountOpeningDocumentError(
          "Unable to store uploaded file. Check server upload directory permissions.",
          500
        );
      }

      throw error;
    }

    fileUpdate = {
      originalFileName: payload.file.originalname,
      mimeType: payload.file.mimetype || null,
      fileSize: payload.file.size,
    };
  }

  await assertUniqueDocumentFields(
    {
      citizenNo,
      mobileNumber,
    },
    payload.documentId
  );

  const updated = await accountOpeningDocumentRepository.update(
    payload.documentId,
    {
      firstName,
      lastName,
      fatherName,
      citizenNo,
      mobileNumber,
      originalFileName: fileUpdate?.originalFileName,
      mimeType: fileUpdate?.mimeType,
      fileSize: fileUpdate?.fileSize,
    }
  );

  if (!updated) {
    throw new AccountOpeningDocumentError("Document not found", 404);
  }

  return toDocumentDto(updated);
}
