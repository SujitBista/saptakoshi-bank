import fs from "node:fs/promises";
import path from "node:path";
import { USER_ROLES } from "@saptakoshi/shared";
import { withTransaction } from "../config/database";
import type { AuthenticatedUser } from "../middleware/auth.middleware";
import * as amlTrainingMaterialRepository from "../repositories/aml-training-material.repository";
import * as userRepository from "../repositories/user.repository";

const DEFAULT_UPLOAD_DIR = path.join(process.cwd(), "uploads", "aml-training-materials");
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/x-pdf",
  "application/octet-stream",
]);

export class AmlTrainingMaterialError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "AmlTrainingMaterialError";
  }
}

export interface AmlTrainingMaterialDto {
  id: number;
  title: string;
  fileName: string;
  fileSize: number;
  uploadedBy: number;
  uploadedByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AmlTrainingMaterialListResponse {
  data: AmlTrainingMaterialDto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListAmlTrainingMaterialsPayload {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateAmlTrainingMaterialPayload {
  authenticatedUser: AuthenticatedUser;
  title?: string;
  file?: Express.Multer.File;
}

export interface UpdateAmlTrainingMaterialPayload {
  authenticatedUser: AuthenticatedUser;
  id: number;
  title?: string;
  file?: Express.Multer.File;
}

export interface AmlTrainingMaterialFileResult {
  absoluteFilePath: string;
  mimeType: string;
  fileName: string;
}

export const DEFAULT_AML_TRAINING_MATERIAL_PAGE = 1;
export const DEFAULT_AML_TRAINING_MATERIAL_PAGE_SIZE = 10;
export const MAX_AML_TRAINING_MATERIAL_PAGE_SIZE = 100;

function getUploadDir(): string {
  return path.resolve(
    process.env.AML_TRAINING_UPLOAD_DIR?.trim() || DEFAULT_UPLOAD_DIR
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
      throw new AmlTrainingMaterialError(`${fieldLabel} is required`);
    }

    return null;
  }

  if (normalized.length > maxLength) {
    throw new AmlTrainingMaterialError(`${fieldLabel} must be ${maxLength} characters or less`);
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

  return sanitized || "aml-training-material";
}

function validatePdfFile(file: Express.Multer.File): void {
  const extension = path.extname(file.originalname).toLowerCase();

  if (extension !== ".pdf" || (file.mimetype && !ALLOWED_MIME_TYPES.has(file.mimetype))) {
    throw new AmlTrainingMaterialError("Only PDF files are allowed");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new AmlTrainingMaterialError("File size must be 2 MB or less");
  }
}

function ensureAllowedFile(file?: Express.Multer.File): Express.Multer.File {
  if (!file) {
    throw new AmlTrainingMaterialError("PDF document is required");
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
    throw new AmlTrainingMaterialError("Invalid file path");
  }
}

async function getActiveAdminUser(
  authenticatedUser: AuthenticatedUser
): Promise<userRepository.UserWithBranchRow> {
  const currentUser = await userRepository.findById(authenticatedUser.id);

  if (!currentUser) {
    throw new AmlTrainingMaterialError("Unauthorized", 401);
  }

  if (!currentUser.is_active) {
    throw new AmlTrainingMaterialError("Account is inactive", 403);
  }

  if (currentUser.role !== USER_ROLES.ADMIN) {
    throw new AmlTrainingMaterialError("Forbidden", 403);
  }

  return currentUser;
}

function toAmlTrainingMaterialDto(
  row: amlTrainingMaterialRepository.AmlTrainingMaterialDetailRow
): AmlTrainingMaterialDto {
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

async function getAmlTrainingMaterialByIdOrThrow(
  id: number
): Promise<amlTrainingMaterialRepository.AmlTrainingMaterialDetailRow> {
  const material = await amlTrainingMaterialRepository.findById(id);

  if (!material) {
    throw new AmlTrainingMaterialError("AML training material not found", 404);
  }

  return material;
}

function getAbsoluteFilePath(filePath: string): string {
  const uploadDir = getUploadDir();
  const absoluteFilePath = path.join(uploadDir, filePath);
  ensurePathInsideRoot(uploadDir, absoluteFilePath);
  return absoluteFilePath;
}

export async function listAmlTrainingMaterials(
  payload: ListAmlTrainingMaterialsPayload = {}
): Promise<AmlTrainingMaterialListResponse> {
  const page = payload.page ?? DEFAULT_AML_TRAINING_MATERIAL_PAGE;
  const limit = Math.min(
    payload.limit ?? DEFAULT_AML_TRAINING_MATERIAL_PAGE_SIZE,
    MAX_AML_TRAINING_MATERIAL_PAGE_SIZE
  );
  const filters = {
    search: payload.search,
  };

  const [total, rows] = await Promise.all([
    amlTrainingMaterialRepository.countAll(filters),
    amlTrainingMaterialRepository.findAll(filters, { page, limit }),
  ]);

  return {
    data: rows.map(toAmlTrainingMaterialDto),
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}

export async function getAmlTrainingMaterialById(id: number): Promise<AmlTrainingMaterialDto> {
  const material = await getAmlTrainingMaterialByIdOrThrow(id);
  return toAmlTrainingMaterialDto(material);
}

export async function getAmlTrainingMaterialFile(
  id: number
): Promise<AmlTrainingMaterialFileResult> {
  const material = await getAmlTrainingMaterialByIdOrThrow(id);
  const absoluteFilePath = getAbsoluteFilePath(material.file_path);

  try {
    await fs.access(absoluteFilePath);
  } catch {
    throw new AmlTrainingMaterialError("AML training material file not found", 404);
  }

  return {
    absoluteFilePath,
    mimeType: "application/pdf",
    fileName: material.file_name,
  };
}

export async function createAmlTrainingMaterial(
  payload: CreateAmlTrainingMaterialPayload
): Promise<AmlTrainingMaterialDto> {
  const currentUser = await getActiveAdminUser(payload.authenticatedUser);
  const file = ensureAllowedFile(payload.file);
  const title = sanitizeText(payload.title, "Title", 255, true) as string;

  const uploadDir = getUploadDir();
  const timestamp = Date.now();
  const cleanBaseName = sanitizeFileBaseName(file.originalname);
  const storedFileName = `aml-training-material-${timestamp}-${cleanBaseName}.pdf`;
  const relativeFilePath = storedFileName;
  const absoluteFilePath = path.join(uploadDir, storedFileName);

  ensurePathInsideRoot(uploadDir, absoluteFilePath);

  return withTransaction(async (executor) => {
    await fs.mkdir(uploadDir, { recursive: true });

    try {
      await fs.writeFile(absoluteFilePath, file.buffer);

      const createdRow = await amlTrainingMaterialRepository.create(
        {
          title,
          fileName: file.originalname,
          filePath: relativeFilePath,
          fileSize: file.size,
          uploadedBy: currentUser.id,
        },
        executor
      );

      const created = await amlTrainingMaterialRepository.findById(createdRow.id, executor);

      if (!created) {
        throw new AmlTrainingMaterialError("Failed to load created AML training material", 500);
      }

      return toAmlTrainingMaterialDto(created);
    } catch (error) {
      await fs.unlink(absoluteFilePath).catch(() => undefined);

      const errno = (error as NodeJS.ErrnoException | undefined)?.code;
      if (errno === "EACCES" || errno === "EPERM" || errno === "ENOENT") {
        throw new AmlTrainingMaterialError(
          "Unable to store uploaded file. Check server upload directory permissions.",
          500
        );
      }

      throw error;
    }
  });
}

export async function updateAmlTrainingMaterial(
  payload: UpdateAmlTrainingMaterialPayload
): Promise<AmlTrainingMaterialDto> {
  await getActiveAdminUser(payload.authenticatedUser);
  const existing = await getAmlTrainingMaterialByIdOrThrow(payload.id);
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
    const storedFileName = `aml-training-material-${timestamp}-${cleanBaseName}.pdf`;
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
          throw new AmlTrainingMaterialError(
            "Unable to store uploaded file. Check server upload directory permissions.",
            500
          );
        }

        throw error;
      }
    }

    try {
      const updated = await amlTrainingMaterialRepository.update(
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
        throw new AmlTrainingMaterialError("AML training material not found", 404);
      }

      if (nextAbsoluteFilePath && nextAbsoluteFilePath !== previousAbsoluteFilePath) {
        await fs.unlink(previousAbsoluteFilePath).catch(() => undefined);
      }

      return toAmlTrainingMaterialDto(updated);
    } catch (error) {
      if (nextAbsoluteFilePath) {
        await fs.unlink(nextAbsoluteFilePath).catch(() => undefined);
      }

      throw error;
    }
  });
}

export async function deleteAmlTrainingMaterial(
  authenticatedUser: AuthenticatedUser,
  id: number
): Promise<void> {
  await getActiveAdminUser(authenticatedUser);
  const material = await getAmlTrainingMaterialByIdOrThrow(id);
  const absoluteFilePath = getAbsoluteFilePath(material.file_path);

  await withTransaction(async (executor) => {
    const deleted = await amlTrainingMaterialRepository.remove(id, executor);

    if (!deleted) {
      throw new AmlTrainingMaterialError("AML training material not found", 404);
    }
  });

  await fs.unlink(absoluteFilePath).catch(() => undefined);
}
