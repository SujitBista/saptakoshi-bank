import type { Request, Response } from "express";
import {
  DEFAULT_PRODUCT_PAPER_PAGE,
  DEFAULT_PRODUCT_PAPER_PAGE_SIZE,
  MAX_PRODUCT_PAPER_PAGE_SIZE,
  ProductPaperError,
  createProductPaper,
  deleteProductPaper,
  getProductPaperById,
  getProductPaperFile,
  listProductPapers,
  updateProductPaper,
} from "../services/product-paper.service";

function parsePositiveInt(
  value: unknown,
  fallback: number,
  max?: number
): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return max === undefined ? parsed : Math.min(parsed, max);
}

function parseId(value: string | string[] | undefined): number | null {
  const normalized = Array.isArray(value) ? value[0] : value;
  const parsed = Number(normalized);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function handleProductPaperError(
  error: unknown,
  res: Response,
  fallbackMessage: string
): void {
  if (error instanceof ProductPaperError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  console.error(fallbackMessage, error);
  res.status(500).json({ error: fallbackMessage });
}

export async function getProductPapers(req: Request, res: Response): Promise<void> {
  try {
    const result = await listProductPapers({
      category: typeof req.query.category === "string" ? req.query.category : undefined,
      search: typeof req.query.search === "string" ? req.query.search : undefined,
      page: parsePositiveInt(req.query.page, DEFAULT_PRODUCT_PAPER_PAGE),
      limit: parsePositiveInt(
        req.query.limit,
        DEFAULT_PRODUCT_PAPER_PAGE_SIZE,
        MAX_PRODUCT_PAPER_PAGE_SIZE
      ),
    });

    res.json(result);
  } catch (error) {
    handleProductPaperError(error, res, "Unable to load product papers");
  }
}

export async function getProductPaper(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id);

  if (!id) {
    res.status(400).json({ error: "Invalid product paper id" });
    return;
  }

  try {
    const productPaper = await getProductPaperById(id);
    res.json({ productPaper });
  } catch (error) {
    handleProductPaperError(error, res, "Unable to load product paper");
  }
}

export async function getProductPaperView(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id);

  if (!id) {
    res.status(400).json({ error: "Invalid product paper id" });
    return;
  }

  try {
    const file = await getProductPaperFile(id);
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "private, no-store, no-cache, must-revalidate");
    res.sendFile(file.absoluteFilePath);
  } catch (error) {
    handleProductPaperError(error, res, "Unable to load product paper PDF");
  }
}

export async function postProductPaper(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const productPaper = await createProductPaper({
      authenticatedUser: req.user,
      category: typeof req.body.category === "string" ? req.body.category : undefined,
      title: typeof req.body.title === "string" ? req.body.title : undefined,
      description:
        typeof req.body.description === "string" ? req.body.description : undefined,
      file: req.file,
    });

    res.status(201).json({ productPaper });
  } catch (error) {
    handleProductPaperError(error, res, "Product paper upload failed");
  }
}

export async function putProductPaper(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid product paper id" });
    return;
  }

  try {
    const productPaper = await updateProductPaper({
      authenticatedUser: req.user,
      id,
      category: typeof req.body.category === "string" ? req.body.category : undefined,
      title: typeof req.body.title === "string" ? req.body.title : undefined,
      description:
        typeof req.body.description === "string" ? req.body.description : undefined,
    });

    res.json({ productPaper });
  } catch (error) {
    handleProductPaperError(error, res, "Unable to update product paper");
  }
}

export async function deleteProductPaperHandler(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid product paper id" });
    return;
  }

  try {
    await deleteProductPaper(req.user, id);
    res.status(204).send();
  } catch (error) {
    handleProductPaperError(error, res, "Unable to delete product paper");
  }
}
