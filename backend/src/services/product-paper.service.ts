import fs from "node:fs/promises";
import path from "node:path";
import { PRODUCT_PAPER_CATEGORIES, USER_ROLES } from "@saptakoshi/shared";
import { withTransaction } from "../config/database";
import type { AuthenticatedUser } from "../middleware/auth.middleware";
import * as productPaperRepository from "../repositories/product-paper.repository";
import * as userRepository from "../repositories/user.repository";

const DEFAULT_UPLOAD_DIR = path.join(process.cwd(), "uploads", "product-papers");
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/x-pdf",
  "application/octet-stream",
]);

export class ProductPaperError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "ProductPaperError";
  }
}

export interface ProductPaperDto {
  id: number;
  category: productPaperRepository.ProductPaperRow["category"];
  title: string;
  description: string | null;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: number;
  uploadedByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPaperListResponse {
  data: ProductPaperDto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListProductPapersPayload {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateProductPaperPayload {
  authenticatedUser: AuthenticatedUser;
  category?: string;
  title?: string;
  description?: string;
  file?: Express.Multer.File;
}

export interface UpdateProductPaperPayload {
  authenticatedUser: AuthenticatedUser;
  id: number;
  category?: string;
  title?: string;
  description?: string;
}

export interface ProductPaperFileResult {
  absoluteFilePath: string;
  mimeType: string;
  originalFileName: string;
}

export const DEFAULT_PRODUCT_PAPER_PAGE = 1;
export const DEFAULT_PRODUCT_PAPER_PAGE_SIZE = 10;
export const MAX_PRODUCT_PAPER_PAGE_SIZE = 100;

function getUploadDir(): string {
  return path.resolve(process.env.PRODUCT_PAPER_UPLOAD_DIR?.trim() || DEFAULT_UPLOAD_DIR);
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
      throw new ProductPaperError(`${fieldLabel} is required`);
    }

    return null;
  }

  if (normalized.length > maxLength) {
    throw new ProductPaperError(`${fieldLabel} must be ${maxLength} characters or less`);
  }

  return normalized;
}

function normalizeCategory(value?: string): productPaperRepository.ProductPaperRow["category"] | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const normalized = value.trim().toUpperCase();
  const allowed = new Set(Object.values(PRODUCT_PAPER_CATEGORIES));

  if (!allowed.has(normalized as (typeof PRODUCT_PAPER_CATEGORIES)[keyof typeof PRODUCT_PAPER_CATEGORIES])) {
    throw new ProductPaperError("Invalid category");
  }

  return normalized as productPaperRepository.ProductPaperRow["category"];
}

function sanitizeFileBaseName(originalFileName: string): string {
  const ext = path.extname(originalFileName).toLowerCase();
  const baseName = path.basename(originalFileName, ext).trim();
  const sanitized = baseName
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return sanitized || "product-paper";
}

function ensureAllowedFile(file?: Express.Multer.File): Express.Multer.File {
  if (!file) {
    throw new ProductPaperError("PDF document is required");
  }

  const extension = path.extname(file.originalname).toLowerCase();

  if (extension !== ".pdf" || (file.mimetype && !ALLOWED_MIME_TYPES.has(file.mimetype))) {
    throw new ProductPaperError("Only PDF files are allowed");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new ProductPaperError("File size must be 2 MB or less");
  }

  return file;
}

function ensurePathInsideRoot(rootDir: string, targetPath: string): void {
  const relative = path.relative(rootDir, targetPath);

  if (
    relative.startsWith("..") ||
    path.isAbsolute(relative) ||
    relative.includes(`..${path.sep}`)
  ) {
    throw new ProductPaperError("Invalid file path");
  }
}

async function getActiveAdminUser(
  authenticatedUser: AuthenticatedUser
): Promise<userRepository.UserWithBranchRow> {
  const currentUser = await userRepository.findById(authenticatedUser.id);

  if (!currentUser) {
    throw new ProductPaperError("Unauthorized", 401);
  }

  if (!currentUser.is_active) {
    throw new ProductPaperError("Account is inactive", 403);
  }

  if (currentUser.role !== USER_ROLES.ADMIN) {
    throw new ProductPaperError("Forbidden", 403);
  }

  return currentUser;
}

function toProductPaperDto(
  row: productPaperRepository.ProductPaperDetailRow
): ProductPaperDto {
  return {
    id: Number(row.id),
    category: row.category,
    title: row.title,
    description: row.description,
    originalFileName: row.original_file_name,
    mimeType: row.mime_type,
    fileSize: Number(row.file_size),
    uploadedBy: row.uploaded_by,
    uploadedByName: row.uploaded_by_name,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

async function getProductPaperByIdOrThrow(
  id: number
): Promise<productPaperRepository.ProductPaperDetailRow> {
  const productPaper = await productPaperRepository.findById(id);

  if (!productPaper) {
    throw new ProductPaperError("Product paper not found", 404);
  }

  return productPaper;
}

function getAbsoluteFilePath(filePath: string): string {
  const uploadDir = getUploadDir();
  const absoluteFilePath = path.join(uploadDir, filePath);
  ensurePathInsideRoot(uploadDir, absoluteFilePath);
  return absoluteFilePath;
}

export async function listProductPapers(
  payload: ListProductPapersPayload = {}
): Promise<ProductPaperListResponse> {
  const page = payload.page ?? DEFAULT_PRODUCT_PAPER_PAGE;
  const limit = Math.min(
    payload.limit ?? DEFAULT_PRODUCT_PAPER_PAGE_SIZE,
    MAX_PRODUCT_PAPER_PAGE_SIZE
  );
  const filters = {
    category: normalizeCategory(payload.category),
    search: payload.search,
  };

  const [total, rows] = await Promise.all([
    productPaperRepository.countAll(filters),
    productPaperRepository.findAll(filters, { page, limit }),
  ]);

  return {
    data: rows.map(toProductPaperDto),
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}

export async function getProductPaperById(id: number): Promise<ProductPaperDto> {
  const productPaper = await getProductPaperByIdOrThrow(id);
  return toProductPaperDto(productPaper);
}

export async function getProductPaperFile(
  id: number
): Promise<ProductPaperFileResult> {
  const productPaper = await getProductPaperByIdOrThrow(id);
  const absoluteFilePath = getAbsoluteFilePath(productPaper.file_path);

  try {
    await fs.access(absoluteFilePath);
  } catch {
    throw new ProductPaperError("Product paper file not found", 404);
  }

  return {
    absoluteFilePath,
    mimeType: productPaper.mime_type || "application/pdf",
    originalFileName: productPaper.original_file_name,
  };
}

export async function createProductPaper(
  payload: CreateProductPaperPayload
): Promise<ProductPaperDto> {
  const currentUser = await getActiveAdminUser(payload.authenticatedUser);
  const file = ensureAllowedFile(payload.file);
  const category = normalizeCategory(payload.category);
  const title = sanitizeText(payload.title, "Title", 255, true) as string;
  const description = sanitizeText(payload.description, "Description", 2000);

  if (!category) {
    throw new ProductPaperError("Category is required");
  }

  const uploadDir = getUploadDir();
  const timestamp = Date.now();
  const cleanBaseName = sanitizeFileBaseName(file.originalname);
  const storedFileName = `${category.toLowerCase()}-${timestamp}-${cleanBaseName}.pdf`;
  const relativeFilePath = path.posix.join(category.toLowerCase(), storedFileName);
  const absoluteDirectory = path.join(uploadDir, category.toLowerCase());
  const absoluteFilePath = path.join(absoluteDirectory, storedFileName);

  ensurePathInsideRoot(uploadDir, absoluteDirectory);
  ensurePathInsideRoot(uploadDir, absoluteFilePath);

  return withTransaction(async (executor) => {
    await fs.mkdir(absoluteDirectory, { recursive: true });

    try {
      await fs.writeFile(absoluteFilePath, file.buffer);

      const createdRow = await productPaperRepository.create(
        {
          category,
          title,
          description,
          originalFileName: file.originalname,
          storedFileName,
          filePath: relativeFilePath,
          mimeType: "application/pdf",
          fileSize: file.size,
          uploadedBy: currentUser.id,
        },
        executor
      );

      const created = await productPaperRepository.findById(createdRow.id, executor);

      if (!created) {
        throw new ProductPaperError("Failed to load created product paper", 500);
      }

      return toProductPaperDto(created);
    } catch (error) {
      await fs.unlink(absoluteFilePath).catch(() => undefined);

      const errno = (error as NodeJS.ErrnoException | undefined)?.code;
      if (errno === "EACCES" || errno === "EPERM" || errno === "ENOENT") {
        throw new ProductPaperError(
          "Unable to store uploaded file. Check server upload directory permissions.",
          500
        );
      }

      throw error;
    }
  });
}

export async function updateProductPaper(
  payload: UpdateProductPaperPayload
): Promise<ProductPaperDto> {
  await getActiveAdminUser(payload.authenticatedUser);
  await getProductPaperByIdOrThrow(payload.id);

  const category = normalizeCategory(payload.category);
  const title = sanitizeText(payload.title, "Title", 255, true) as string;
  const description = sanitizeText(payload.description, "Description", 2000);

  if (!category) {
    throw new ProductPaperError("Category is required");
  }

  const updated = await productPaperRepository.update(payload.id, {
    category,
    title,
    description,
  });

  if (!updated) {
    throw new ProductPaperError("Product paper not found", 404);
  }

  return toProductPaperDto(updated);
}

export async function deleteProductPaper(
  authenticatedUser: AuthenticatedUser,
  id: number
): Promise<void> {
  await getActiveAdminUser(authenticatedUser);
  const productPaper = await getProductPaperByIdOrThrow(id);
  const absoluteFilePath = getAbsoluteFilePath(productPaper.file_path);

  await withTransaction(async (executor) => {
    await executor.query("DELETE FROM product_papers WHERE id = $1", [id]);
  });

  await fs.unlink(absoluteFilePath).catch(() => undefined);
}
