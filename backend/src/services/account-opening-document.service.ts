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
  uploadedBy: number;
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

function toDocumentDto(
  row: accountOpeningDocumentRepository.AccountOpeningDocumentRow
): AccountOpeningDocumentDto {
  return {
    id: row.id,
    branchId: row.branch_id,
    uploadedBy: row.uploaded_by,
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
  const currentUser = await userRepository.findById(payload.authenticatedUser.id);

  if (!currentUser) {
    throw new AccountOpeningDocumentError("Unauthorized", 401);
  }

  if (!currentUser.is_active) {
    throw new AccountOpeningDocumentError("Account is inactive", 403);
  }

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

      return toDocumentDto(row);
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
