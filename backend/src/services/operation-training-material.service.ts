import fs from "node:fs/promises";
import path from "node:path";
import { USER_ROLES } from "@saptakoshi/shared";
import { withTransaction } from "../config/database";
import type { AuthenticatedUser } from "../middleware/auth.middleware";
import * as operationTrainingMaterialRepository from "../repositories/operation-training-material.repository";
import * as userRepository from "../repositories/user.repository";

const DEFAULT_UPLOAD_DIR = path.join(process.cwd(), "uploads", "operation-training-materials");
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/x-pdf",
  "application/octet-stream",
]);

export class OperationTrainingMaterialError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "OperationTrainingMaterialError";
  }
}

export interface OperationTrainingMaterialDto {
  id: number;
  title: string;
  fileName: string;
  fileSize: number;
  uploadedBy: number;
  uploadedByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface OperationTrainingMaterialListResponse {
  data: OperationTrainingMaterialDto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListOperationTrainingMaterialsPayload {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateOperationTrainingMaterialPayload {
  authenticatedUser: AuthenticatedUser;
  title?: string;
  file?: Express.Multer.File;
}

export interface UpdateOperationTrainingMaterialPayload {
  authenticatedUser: AuthenticatedUser;
  id: number;
  title?: string;
  file?: Express.Multer.File;
}

export interface OperationTrainingMaterialFileResult {
  absoluteFilePath: string;
  mimeType: string;
  fileName: string;
}

export const DEFAULT_OPERATION_TRAINING_MATERIAL_PAGE = 1;
export const DEFAULT_OPERATION_TRAINING_MATERIAL_PAGE_SIZE = 10;
export const MAX_OPERATION_TRAINING_MATERIAL_PAGE_SIZE = 100;

function getUploadDir(): string {
  return path.resolve(
    process.env.OPERATION_TRAINING_UPLOAD_DIR?.trim() || DEFAULT_UPLOAD_DIR
  );
}

function sanitizeText(
  value: string | undefined,
  fieldLabel: string,
  maxLength: number,
  required: boolean = false
): string | null {
  const normalized = value?.trim() ?? "";

  if (!normalized) {
    if (required) {
      throw new OperationTrainingMaterialError(`${fieldLabel} is required`);
    }

    return null;
  }

  if (normalized.length > maxLength) {
    throw new OperationTrainingMaterialError(`${fieldLabel} must be ${maxLength} characters or less`);
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

  return sanitized || "operation-training-material";
}

function validatePdfFile(file: Express.Multer.File): void {
  const extension = path.extname(file.originalname).toLowerCase();

  if (extension !== ".pdf" || (file.mimetype && !ALLOWED_MIME_TYPES.has(file.mimetype))) {
    throw new OperationTrainingMaterialError("Only PDF files are allowed");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new OperationTrainingMaterialError("File size must be 2 MB or less");
  }
}

function ensureAllowedFile(file?: Express.Multer.File): Express.Multer.File {
  if (!file) {
    throw new OperationTrainingMaterialError("PDF document is required");
  }

  validatePdfFile(file);
  return file;
}

function ensureOptionalAllowedFile(file?: Express.Multer.File): Express.Multer.File | undefined {
  if (!file) {
    return undefined;
  }

  validatePdfFile(file);
  return file;
}

function ensurePathInsideRoot(rootDir: string, targetPath: string): void {
  const relative = path.relative(rootDir, targetPath);

  if (
    relative.startsWith("..") ||
    path.isAbsolute(relative) ||
    relative.includes(`..${path.sep}`)
  ) {
    throw new OperationTrainingMaterialError("Invalid file path");
  }
}

async function getActiveAdminUser(
  authenticatedUser: AuthenticatedUser
): Promise<userRepository.UserWithBranchRow> {
  const currentUser = await userRepository.findById(authenticatedUser.id);

  if (!currentUser) {
    throw new OperationTrainingMaterialError("Unauthorized", 401);
  }

  if (!currentUser.is_active) {
    throw new OperationTrainingMaterialError("Account is inactive", 403);
  }

  if (currentUser.role !== USER_ROLES.ADMIN) {
    throw new OperationTrainingMaterialError("Forbidden", 403);
  }

  return currentUser;
}

function toOperationTrainingMaterialDto(
  row: operationTrainingMaterialRepository.OperationTrainingMaterialDetailRow
): OperationTrainingMaterialDto {
  return {
    id: Number(row.id),
    title: row.title,
    fileName: row.file_name,
    fileSize: Number(row.file_size),
    uploadedBy: row.uploaded_by,
    uploadedByName: row.uploaded_by_name,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

async function getOperationTrainingMaterialByIdOrThrow(
  id: number
): Promise<operationTrainingMaterialRepository.OperationTrainingMaterialDetailRow> {
  const material = await operationTrainingMaterialRepository.findById(id);

  if (!material) {
    throw new OperationTrainingMaterialError("Operation training material not found", 404);
  }

  return material;
}

function getAbsoluteFilePath(filePath: string): string {
  const uploadDir = getUploadDir();
  const absoluteFilePath = path.join(uploadDir, filePath);
  ensurePathInsideRoot(uploadDir, absoluteFilePath);
  return absoluteFilePath;
}

export async function listOperationTrainingMaterials(
  payload: ListOperationTrainingMaterialsPayload = {}
): Promise<OperationTrainingMaterialListResponse> {
  const page = payload.page ?? DEFAULT_OPERATION_TRAINING_MATERIAL_PAGE;
  const limit = Math.min(
    payload.limit ?? DEFAULT_OPERATION_TRAINING_MATERIAL_PAGE_SIZE,
    MAX_OPERATION_TRAINING_MATERIAL_PAGE_SIZE
  );
  const filters = {
    search: payload.search,
  };

  const [total, rows] = await Promise.all([
    operationTrainingMaterialRepository.countAll(filters),
    operationTrainingMaterialRepository.findAll(filters, { page, limit }),
  ]);

  return {
    data: rows.map(toOperationTrainingMaterialDto),
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}

export async function getOperationTrainingMaterialById(id: number): Promise<OperationTrainingMaterialDto> {
  const material = await getOperationTrainingMaterialByIdOrThrow(id);
  return toOperationTrainingMaterialDto(material);
}

export async function getOperationTrainingMaterialFile(
  id: number
): Promise<OperationTrainingMaterialFileResult> {
  const material = await getOperationTrainingMaterialByIdOrThrow(id);
  const absoluteFilePath = getAbsoluteFilePath(material.file_path);

  try {
    await fs.access(absoluteFilePath);
  } catch {
    throw new OperationTrainingMaterialError("Operation training material file not found", 404);
  }

  return {
    absoluteFilePath,
    mimeType: "application/pdf",
    fileName: material.file_name,
  };
}

export async function createOperationTrainingMaterial(
  payload: CreateOperationTrainingMaterialPayload
): Promise<OperationTrainingMaterialDto> {
  const currentUser = await getActiveAdminUser(payload.authenticatedUser);
  const file = ensureAllowedFile(payload.file);
  const title = sanitizeText(payload.title, "Title", 255, true) as string;

  const uploadDir = getUploadDir();
  const timestamp = Date.now();
  const cleanBaseName = sanitizeFileBaseName(file.originalname);
  const storedFileName = `operation-training-material-${timestamp}-${cleanBaseName}.pdf`;
  const relativeFilePath = storedFileName;
  const absoluteFilePath = path.join(uploadDir, storedFileName);

  ensurePathInsideRoot(uploadDir, absoluteFilePath);

  return withTransaction(async (executor) => {
    await fs.mkdir(uploadDir, { recursive: true });

    try {
      await fs.writeFile(absoluteFilePath, file.buffer);

      const createdRow = await operationTrainingMaterialRepository.create(
        {
          title,
          fileName: file.originalname,
          filePath: relativeFilePath,
          fileSize: file.size,
          uploadedBy: currentUser.id,
        },
        executor
      );

      const created = await operationTrainingMaterialRepository.findById(createdRow.id, executor);

      if (!created) {
        throw new OperationTrainingMaterialError("Failed to load created Operation training material", 500);
      }

      return toOperationTrainingMaterialDto(created);
    } catch (error) {
      await fs.unlink(absoluteFilePath).catch(() => undefined);

      const errno = (error as NodeJS.ErrnoException | undefined)?.code;
      if (errno === "EACCES" || errno === "EPERM" || errno === "ENOENT") {
        throw new OperationTrainingMaterialError(
          "Unable to store uploaded file. Check server upload directory permissions.",
          500
        );
      }

      throw error;
    }
  });
}

export async function updateOperationTrainingMaterial(
  payload: UpdateOperationTrainingMaterialPayload
): Promise<OperationTrainingMaterialDto> {
  await getActiveAdminUser(payload.authenticatedUser);
  const existing = await getOperationTrainingMaterialByIdOrThrow(payload.id);
  const title = sanitizeText(payload.title, "Title", 255, true) as string;
  const file = ensureOptionalAllowedFile(payload.file);
  const uploadDir = getUploadDir();
  const previousAbsoluteFilePath = getAbsoluteFilePath(existing.file_path);

  let nextAbsoluteFilePath: string | null = null;
  let nextRelativeFilePath: string | undefined;
  let nextFileName: string | undefined;
  let nextFileSize: number | undefined;

  if (file) {
    const timestamp = Date.now();
    const cleanBaseName = sanitizeFileBaseName(file.originalname);
    const storedFileName = `operation-training-material-${timestamp}-${cleanBaseName}.pdf`;
    nextRelativeFilePath = storedFileName;
    nextAbsoluteFilePath = path.join(uploadDir, storedFileName);
    nextFileName = file.originalname;
    nextFileSize = file.size;

    ensurePathInsideRoot(uploadDir, nextAbsoluteFilePath);
  }

  return withTransaction(async (executor) => {
    if (file && nextAbsoluteFilePath) {
      await fs.mkdir(uploadDir, { recursive: true });

      try {
        await fs.writeFile(nextAbsoluteFilePath, file.buffer);
      } catch (error) {
        const errno = (error as NodeJS.ErrnoException | undefined)?.code;
        if (errno === "EACCES" || errno === "EPERM" || errno === "ENOENT") {
          throw new OperationTrainingMaterialError(
            "Unable to store uploaded file. Check server upload directory permissions.",
            500
          );
        }

        throw error;
      }
    }

    try {
      const updated = await operationTrainingMaterialRepository.update(
        payload.id,
        {
          title,
          fileName: nextFileName,
          filePath: nextRelativeFilePath,
          fileSize: nextFileSize,
        },
        executor
      );

      if (!updated) {
        throw new OperationTrainingMaterialError("Operation training material not found", 404);
      }

      if (nextAbsoluteFilePath && nextAbsoluteFilePath !== previousAbsoluteFilePath) {
        await fs.unlink(previousAbsoluteFilePath).catch(() => undefined);
      }

      return toOperationTrainingMaterialDto(updated);
    } catch (error) {
      if (nextAbsoluteFilePath) {
        await fs.unlink(nextAbsoluteFilePath).catch(() => undefined);
      }

      throw error;
    }
  });
}

export async function deleteOperationTrainingMaterial(
  authenticatedUser: AuthenticatedUser,
  id: number
): Promise<void> {
  await getActiveAdminUser(authenticatedUser);
  const material = await getOperationTrainingMaterialByIdOrThrow(id);
  const absoluteFilePath = getAbsoluteFilePath(material.file_path);

  await withTransaction(async (executor) => {
    const deleted = await operationTrainingMaterialRepository.remove(id, executor);

    if (!deleted) {
      throw new OperationTrainingMaterialError("Operation training material not found", 404);
    }
  });

  await fs.unlink(absoluteFilePath).catch(() => undefined);
}
