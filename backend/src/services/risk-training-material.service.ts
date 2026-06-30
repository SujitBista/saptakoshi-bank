import fs from "node:fs/promises";
import path from "node:path";
import { USER_ROLES } from "@saptakoshi/shared";
import { withTransaction } from "../config/database";
import type { AuthenticatedUser } from "../middleware/auth.middleware";
import * as riskTrainingMaterialRepository from "../repositories/risk-training-material.repository";
import * as userRepository from "../repositories/user.repository";

const DEFAULT_UPLOAD_DIR = path.join(process.cwd(), "uploads", "risk-training-materials");
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/x-pdf",
  "application/octet-stream",
]);

export class RiskTrainingMaterialError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "RiskTrainingMaterialError";
  }
}

export interface RiskTrainingMaterialDto {
  id: number;
  title: string;
  fileName: string;
  fileSize: number;
  uploadedBy: number;
  uploadedByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface RiskTrainingMaterialListResponse {
  data: RiskTrainingMaterialDto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListRiskTrainingMaterialsPayload {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateRiskTrainingMaterialPayload {
  authenticatedUser: AuthenticatedUser;
  title?: string;
  file?: Express.Multer.File;
}

export interface UpdateRiskTrainingMaterialPayload {
  authenticatedUser: AuthenticatedUser;
  id: number;
  title?: string;
  file?: Express.Multer.File;
}

export interface RiskTrainingMaterialFileResult {
  absoluteFilePath: string;
  mimeType: string;
  fileName: string;
}

export const DEFAULT_RISK_TRAINING_MATERIAL_PAGE = 1;
export const DEFAULT_RISK_TRAINING_MATERIAL_PAGE_SIZE = 10;
export const MAX_RISK_TRAINING_MATERIAL_PAGE_SIZE = 100;

function getUploadDir(): string {
  return path.resolve(
    process.env.RISK_TRAINING_UPLOAD_DIR?.trim() || DEFAULT_UPLOAD_DIR
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
      throw new RiskTrainingMaterialError(`${fieldLabel} is required`);
    }

    return null;
  }

  if (normalized.length > maxLength) {
    throw new RiskTrainingMaterialError(`${fieldLabel} must be ${maxLength} characters or less`);
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

  return sanitized || "risk-training-material";
}

function validatePdfFile(file: Express.Multer.File): void {
  const extension = path.extname(file.originalname).toLowerCase();

  if (extension !== ".pdf" || (file.mimetype && !ALLOWED_MIME_TYPES.has(file.mimetype))) {
    throw new RiskTrainingMaterialError("Only PDF files are allowed");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new RiskTrainingMaterialError("File size must be 2 MB or less");
  }
}

function ensureAllowedFile(file?: Express.Multer.File): Express.Multer.File {
  if (!file) {
    throw new RiskTrainingMaterialError("PDF document is required");
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
    throw new RiskTrainingMaterialError("Invalid file path");
  }
}

async function getActiveAdminUser(
  authenticatedUser: AuthenticatedUser
): Promise<userRepository.UserWithBranchRow> {
  const currentUser = await userRepository.findById(authenticatedUser.id);

  if (!currentUser) {
    throw new RiskTrainingMaterialError("Unauthorized", 401);
  }

  if (!currentUser.is_active) {
    throw new RiskTrainingMaterialError("Account is inactive", 403);
  }

  if (currentUser.role !== USER_ROLES.ADMIN) {
    throw new RiskTrainingMaterialError("Forbidden", 403);
  }

  return currentUser;
}

function toRiskTrainingMaterialDto(
  row: riskTrainingMaterialRepository.RiskTrainingMaterialDetailRow
): RiskTrainingMaterialDto {
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

async function getRiskTrainingMaterialByIdOrThrow(
  id: number
): Promise<riskTrainingMaterialRepository.RiskTrainingMaterialDetailRow> {
  const material = await riskTrainingMaterialRepository.findById(id);

  if (!material) {
    throw new RiskTrainingMaterialError("Risk training material not found", 404);
  }

  return material;
}

function getAbsoluteFilePath(filePath: string): string {
  const uploadDir = getUploadDir();
  const absoluteFilePath = path.join(uploadDir, filePath);
  ensurePathInsideRoot(uploadDir, absoluteFilePath);
  return absoluteFilePath;
}

export async function listRiskTrainingMaterials(
  payload: ListRiskTrainingMaterialsPayload = {}
): Promise<RiskTrainingMaterialListResponse> {
  const page = payload.page ?? DEFAULT_RISK_TRAINING_MATERIAL_PAGE;
  const limit = Math.min(
    payload.limit ?? DEFAULT_RISK_TRAINING_MATERIAL_PAGE_SIZE,
    MAX_RISK_TRAINING_MATERIAL_PAGE_SIZE
  );
  const filters = {
    search: payload.search,
  };

  const [total, rows] = await Promise.all([
    riskTrainingMaterialRepository.countAll(filters),
    riskTrainingMaterialRepository.findAll(filters, { page, limit }),
  ]);

  return {
    data: rows.map(toRiskTrainingMaterialDto),
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}

export async function getRiskTrainingMaterialById(id: number): Promise<RiskTrainingMaterialDto> {
  const material = await getRiskTrainingMaterialByIdOrThrow(id);
  return toRiskTrainingMaterialDto(material);
}

export async function getRiskTrainingMaterialFile(
  id: number
): Promise<RiskTrainingMaterialFileResult> {
  const material = await getRiskTrainingMaterialByIdOrThrow(id);
  const absoluteFilePath = getAbsoluteFilePath(material.file_path);

  try {
    await fs.access(absoluteFilePath);
  } catch {
    throw new RiskTrainingMaterialError("Risk training material file not found", 404);
  }

  return {
    absoluteFilePath,
    mimeType: "application/pdf",
    fileName: material.file_name,
  };
}

export async function createRiskTrainingMaterial(
  payload: CreateRiskTrainingMaterialPayload
): Promise<RiskTrainingMaterialDto> {
  const currentUser = await getActiveAdminUser(payload.authenticatedUser);
  const file = ensureAllowedFile(payload.file);
  const title = sanitizeText(payload.title, "Title", 255, true) as string;

  const uploadDir = getUploadDir();
  const timestamp = Date.now();
  const cleanBaseName = sanitizeFileBaseName(file.originalname);
  const storedFileName = `risk-training-material-${timestamp}-${cleanBaseName}.pdf`;
  const relativeFilePath = storedFileName;
  const absoluteFilePath = path.join(uploadDir, storedFileName);

  ensurePathInsideRoot(uploadDir, absoluteFilePath);

  return withTransaction(async (executor) => {
    await fs.mkdir(uploadDir, { recursive: true });

    try {
      await fs.writeFile(absoluteFilePath, file.buffer);

      const createdRow = await riskTrainingMaterialRepository.create(
        {
          title,
          fileName: file.originalname,
          filePath: relativeFilePath,
          fileSize: file.size,
          uploadedBy: currentUser.id,
        },
        executor
      );

      const created = await riskTrainingMaterialRepository.findById(createdRow.id, executor);

      if (!created) {
        throw new RiskTrainingMaterialError("Failed to load created Risk training material", 500);
      }

      return toRiskTrainingMaterialDto(created);
    } catch (error) {
      await fs.unlink(absoluteFilePath).catch(() => undefined);

      const errno = (error as NodeJS.ErrnoException | undefined)?.code;
      if (errno === "EACCES" || errno === "EPERM" || errno === "ENOENT") {
        throw new RiskTrainingMaterialError(
          "Unable to store uploaded file. Check server upload directory permissions.",
          500
        );
      }

      throw error;
    }
  });
}

export async function updateRiskTrainingMaterial(
  payload: UpdateRiskTrainingMaterialPayload
): Promise<RiskTrainingMaterialDto> {
  await getActiveAdminUser(payload.authenticatedUser);
  const existing = await getRiskTrainingMaterialByIdOrThrow(payload.id);
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
    const storedFileName = `risk-training-material-${timestamp}-${cleanBaseName}.pdf`;
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
          throw new RiskTrainingMaterialError(
            "Unable to store uploaded file. Check server upload directory permissions.",
            500
          );
        }

        throw error;
      }
    }

    try {
      const updated = await riskTrainingMaterialRepository.update(
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
        throw new RiskTrainingMaterialError("Risk training material not found", 404);
      }

      if (nextAbsoluteFilePath && nextAbsoluteFilePath !== previousAbsoluteFilePath) {
        await fs.unlink(previousAbsoluteFilePath).catch(() => undefined);
      }

      return toRiskTrainingMaterialDto(updated);
    } catch (error) {
      if (nextAbsoluteFilePath) {
        await fs.unlink(nextAbsoluteFilePath).catch(() => undefined);
      }

      throw error;
    }
  });
}

export async function deleteRiskTrainingMaterial(
  authenticatedUser: AuthenticatedUser,
  id: number
): Promise<void> {
  await getActiveAdminUser(authenticatedUser);
  const material = await getRiskTrainingMaterialByIdOrThrow(id);
  const absoluteFilePath = getAbsoluteFilePath(material.file_path);

  await withTransaction(async (executor) => {
    const deleted = await riskTrainingMaterialRepository.remove(id, executor);

    if (!deleted) {
      throw new RiskTrainingMaterialError("Risk training material not found", 404);
    }
  });

  await fs.unlink(absoluteFilePath).catch(() => undefined);
}
