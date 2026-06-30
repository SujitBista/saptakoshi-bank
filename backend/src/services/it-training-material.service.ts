import fs from "node:fs/promises";
import path from "node:path";
import { USER_ROLES } from "@saptakoshi/shared";
import { withTransaction } from "../config/database";
import type { AuthenticatedUser } from "../middleware/auth.middleware";
import * as itTrainingMaterialRepository from "../repositories/it-training-material.repository";
import * as userRepository from "../repositories/user.repository";

const DEFAULT_UPLOAD_DIR = path.join(process.cwd(), "uploads", "it-training-materials");
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/x-pdf",
  "application/octet-stream",
]);

export class ItTrainingMaterialError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "ItTrainingMaterialError";
  }
}

export interface ItTrainingMaterialDto {
  id: number;
  title: string;
  fileName: string;
  fileSize: number;
  uploadedBy: number;
  uploadedByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItTrainingMaterialListResponse {
  data: ItTrainingMaterialDto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListItTrainingMaterialsPayload {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateItTrainingMaterialPayload {
  authenticatedUser: AuthenticatedUser;
  title?: string;
  file?: Express.Multer.File;
}

export interface UpdateItTrainingMaterialPayload {
  authenticatedUser: AuthenticatedUser;
  id: number;
  title?: string;
  file?: Express.Multer.File;
}

export interface ItTrainingMaterialFileResult {
  absoluteFilePath: string;
  mimeType: string;
  fileName: string;
}

export const DEFAULT_IT_TRAINING_MATERIAL_PAGE = 1;
export const DEFAULT_IT_TRAINING_MATERIAL_PAGE_SIZE = 10;
export const MAX_IT_TRAINING_MATERIAL_PAGE_SIZE = 100;

function getUploadDir(): string {
  return path.resolve(
    process.env.IT_TRAINING_UPLOAD_DIR?.trim() || DEFAULT_UPLOAD_DIR
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
      throw new ItTrainingMaterialError(`${fieldLabel} is required`);
    }

    return null;
  }

  if (normalized.length > maxLength) {
    throw new ItTrainingMaterialError(`${fieldLabel} must be ${maxLength} characters or less`);
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

  return sanitized || "it-training-material";
}

function validatePdfFile(file: Express.Multer.File): void {
  const extension = path.extname(file.originalname).toLowerCase();

  if (extension !== ".pdf" || (file.mimetype && !ALLOWED_MIME_TYPES.has(file.mimetype))) {
    throw new ItTrainingMaterialError("Only PDF files are allowed");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new ItTrainingMaterialError("File size must be 2 MB or less");
  }
}

function ensureAllowedFile(file?: Express.Multer.File): Express.Multer.File {
  if (!file) {
    throw new ItTrainingMaterialError("PDF document is required");
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
    throw new ItTrainingMaterialError("Invalid file path");
  }
}

async function getActiveAdminUser(
  authenticatedUser: AuthenticatedUser
): Promise<userRepository.UserWithBranchRow> {
  const currentUser = await userRepository.findById(authenticatedUser.id);

  if (!currentUser) {
    throw new ItTrainingMaterialError("Unauthorized", 401);
  }

  if (!currentUser.is_active) {
    throw new ItTrainingMaterialError("Account is inactive", 403);
  }

  if (currentUser.role !== USER_ROLES.ADMIN) {
    throw new ItTrainingMaterialError("Forbidden", 403);
  }

  return currentUser;
}

function toItTrainingMaterialDto(
  row: itTrainingMaterialRepository.ItTrainingMaterialDetailRow
): ItTrainingMaterialDto {
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

async function getItTrainingMaterialByIdOrThrow(
  id: number
): Promise<itTrainingMaterialRepository.ItTrainingMaterialDetailRow> {
  const material = await itTrainingMaterialRepository.findById(id);

  if (!material) {
    throw new ItTrainingMaterialError("IT training material not found", 404);
  }

  return material;
}

function getAbsoluteFilePath(filePath: string): string {
  const uploadDir = getUploadDir();
  const absoluteFilePath = path.join(uploadDir, filePath);
  ensurePathInsideRoot(uploadDir, absoluteFilePath);
  return absoluteFilePath;
}

export async function listItTrainingMaterials(
  payload: ListItTrainingMaterialsPayload = {}
): Promise<ItTrainingMaterialListResponse> {
  const page = payload.page ?? DEFAULT_IT_TRAINING_MATERIAL_PAGE;
  const limit = Math.min(
    payload.limit ?? DEFAULT_IT_TRAINING_MATERIAL_PAGE_SIZE,
    MAX_IT_TRAINING_MATERIAL_PAGE_SIZE
  );
  const filters = {
    search: payload.search,
  };

  const [total, rows] = await Promise.all([
    itTrainingMaterialRepository.countAll(filters),
    itTrainingMaterialRepository.findAll(filters, { page, limit }),
  ]);

  return {
    data: rows.map(toItTrainingMaterialDto),
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}

export async function getItTrainingMaterialById(id: number): Promise<ItTrainingMaterialDto> {
  const material = await getItTrainingMaterialByIdOrThrow(id);
  return toItTrainingMaterialDto(material);
}

export async function getItTrainingMaterialFile(
  id: number
): Promise<ItTrainingMaterialFileResult> {
  const material = await getItTrainingMaterialByIdOrThrow(id);
  const absoluteFilePath = getAbsoluteFilePath(material.file_path);

  try {
    await fs.access(absoluteFilePath);
  } catch {
    throw new ItTrainingMaterialError("IT training material file not found", 404);
  }

  return {
    absoluteFilePath,
    mimeType: "application/pdf",
    fileName: material.file_name,
  };
}

export async function createItTrainingMaterial(
  payload: CreateItTrainingMaterialPayload
): Promise<ItTrainingMaterialDto> {
  const currentUser = await getActiveAdminUser(payload.authenticatedUser);
  const file = ensureAllowedFile(payload.file);
  const title = sanitizeText(payload.title, "Title", 255, true) as string;

  const uploadDir = getUploadDir();
  const timestamp = Date.now();
  const cleanBaseName = sanitizeFileBaseName(file.originalname);
  const storedFileName = `it-training-material-${timestamp}-${cleanBaseName}.pdf`;
  const relativeFilePath = storedFileName;
  const absoluteFilePath = path.join(uploadDir, storedFileName);

  ensurePathInsideRoot(uploadDir, absoluteFilePath);

  return withTransaction(async (executor) => {
    await fs.mkdir(uploadDir, { recursive: true });

    try {
      await fs.writeFile(absoluteFilePath, file.buffer);

      const createdRow = await itTrainingMaterialRepository.create(
        {
          title,
          fileName: file.originalname,
          filePath: relativeFilePath,
          fileSize: file.size,
          uploadedBy: currentUser.id,
        },
        executor
      );

      const created = await itTrainingMaterialRepository.findById(createdRow.id, executor);

      if (!created) {
        throw new ItTrainingMaterialError("Failed to load created IT training material", 500);
      }

      return toItTrainingMaterialDto(created);
    } catch (error) {
      await fs.unlink(absoluteFilePath).catch(() => undefined);

      const errno = (error as NodeJS.ErrnoException | undefined)?.code;
      if (errno === "EACCES" || errno === "EPERM" || errno === "ENOENT") {
        throw new ItTrainingMaterialError(
          "Unable to store uploaded file. Check server upload directory permissions.",
          500
        );
      }

      throw error;
    }
  });
}

export async function updateItTrainingMaterial(
  payload: UpdateItTrainingMaterialPayload
): Promise<ItTrainingMaterialDto> {
  await getActiveAdminUser(payload.authenticatedUser);
  const existing = await getItTrainingMaterialByIdOrThrow(payload.id);
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
    const storedFileName = `it-training-material-${timestamp}-${cleanBaseName}.pdf`;
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
          throw new ItTrainingMaterialError(
            "Unable to store uploaded file. Check server upload directory permissions.",
            500
          );
        }

        throw error;
      }
    }

    try {
      const updated = await itTrainingMaterialRepository.update(
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
        throw new ItTrainingMaterialError("IT training material not found", 404);
      }

      if (nextAbsoluteFilePath && nextAbsoluteFilePath !== previousAbsoluteFilePath) {
        await fs.unlink(previousAbsoluteFilePath).catch(() => undefined);
      }

      return toItTrainingMaterialDto(updated);
    } catch (error) {
      if (nextAbsoluteFilePath) {
        await fs.unlink(nextAbsoluteFilePath).catch(() => undefined);
      }

      throw error;
    }
  });
}

export async function deleteItTrainingMaterial(
  authenticatedUser: AuthenticatedUser,
  id: number
): Promise<void> {
  await getActiveAdminUser(authenticatedUser);
  const material = await getItTrainingMaterialByIdOrThrow(id);
  const absoluteFilePath = getAbsoluteFilePath(material.file_path);

  await withTransaction(async (executor) => {
    const deleted = await itTrainingMaterialRepository.remove(id, executor);

    if (!deleted) {
      throw new ItTrainingMaterialError("IT training material not found", 404);
    }
  });

  await fs.unlink(absoluteFilePath).catch(() => undefined);
}
