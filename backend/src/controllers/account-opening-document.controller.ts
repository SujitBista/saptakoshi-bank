import type { Request, Response } from "express";
import {
  AccountOpeningDocumentError,
  DEFAULT_ACCOUNT_OPENING_PAGE,
  DEFAULT_ACCOUNT_OPENING_PAGE_SIZE,
  approveAccountOpeningDocument,
  getAccountOpeningDocumentById,
  getAccountOpeningDocumentFile,
  listAccountOpeningDocuments,
  MAX_ACCOUNT_OPENING_PAGE_SIZE,
  rejectAccountOpeningDocument,
  updateAccountOpeningDocument,
  uploadAccountOpeningDocument,
} from "../services/account-opening-document.service";

function parsePositiveInt(
  value: unknown,
  fallback: number,
  max?: number
): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  if (max !== undefined) {
    return Math.min(parsed, max);
  }

  return parsed;
}

function parseOptionalPositiveInt(value: unknown): number | undefined {
  if (value === undefined || value === "") {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

function handleAccountOpeningDocumentError(
  error: unknown,
  res: Response,
  fallbackMessage: string
): void {
  if (error instanceof AccountOpeningDocumentError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  console.error(fallbackMessage, error);
  res.status(500).json({ error: fallbackMessage });
}

export async function getAccountOpeningDocuments(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const result = await listAccountOpeningDocuments({
      authenticatedUser: req.user,
      search: typeof req.query.search === "string" ? req.query.search : undefined,
      clientCode:
        typeof req.query.client_code === "string" ? req.query.client_code : undefined,
      documentNo:
        typeof req.query.document_no === "string" ? req.query.document_no : undefined,
      branchId: parseOptionalPositiveInt(req.query.branch_id),
      status: typeof req.query.status === "string" ? req.query.status : undefined,
      page: parsePositiveInt(req.query.page, DEFAULT_ACCOUNT_OPENING_PAGE),
      limit: parsePositiveInt(
        req.query.limit,
        DEFAULT_ACCOUNT_OPENING_PAGE_SIZE,
        MAX_ACCOUNT_OPENING_PAGE_SIZE
      ),
    });

    res.json(result);
  } catch (error) {
    handleAccountOpeningDocumentError(
      error,
      res,
      "Unable to load account opening documents"
    );
  }
}

export async function getAccountOpeningDocument(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const documentId = Number(req.params.id);
  if (!Number.isInteger(documentId) || documentId <= 0) {
    res.status(400).json({ error: "Invalid document id" });
    return;
  }

  try {
    const document = await getAccountOpeningDocumentById(req.user, documentId);
    res.json({ document });
  } catch (error) {
    handleAccountOpeningDocumentError(
      error,
      res,
      "Unable to load account opening document"
    );
  }
}

export async function getAccountOpeningDocumentFileHandler(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const documentId = Number(req.params.id);
  if (!Number.isInteger(documentId) || documentId <= 0) {
    res.status(400).json({ error: "Invalid document id" });
    return;
  }

  try {
    const file = await getAccountOpeningDocumentFile(req.user, documentId);
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(file.originalFileName)}"`
    );
    res.sendFile(file.absoluteFilePath);
  } catch (error) {
    handleAccountOpeningDocumentError(
      error,
      res,
      "Unable to download account opening document"
    );
  }
}

export async function putAccountOpeningDocument(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const documentId = Number(req.params.id);
  if (!Number.isInteger(documentId) || documentId <= 0) {
    res.status(400).json({ error: "Invalid document id" });
    return;
  }

  try {
    const document = await updateAccountOpeningDocument({
      authenticatedUser: req.user,
      documentId,
      firstName:
        typeof req.body.first_name === "string" ? req.body.first_name : undefined,
      lastName:
        typeof req.body.last_name === "string" ? req.body.last_name : undefined,
      fatherName:
        typeof req.body.father_name === "string" ? req.body.father_name : undefined,
      citizenNo:
        typeof req.body.citizen_no === "string" ? req.body.citizen_no : undefined,
      mobileNumber:
        typeof req.body.mobile_number === "string"
          ? req.body.mobile_number
          : undefined,
      file: req.file,
    });

    res.json({ document });
  } catch (error) {
    handleAccountOpeningDocumentError(
      error,
      res,
      "Unable to update account opening document"
    );
  }
}

export async function postAccountOpeningDocument(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const document = await uploadAccountOpeningDocument({
      authenticatedUser: req.user,
      branchId: typeof req.body.branch_id === "string" ? req.body.branch_id : undefined,
      clientCode:
        typeof req.body.client_code === "string" ? req.body.client_code : undefined,
      firstName:
        typeof req.body.first_name === "string" ? req.body.first_name : undefined,
      lastName:
        typeof req.body.last_name === "string" ? req.body.last_name : undefined,
      fatherName:
        typeof req.body.father_name === "string" ? req.body.father_name : undefined,
      citizenNo:
        typeof req.body.citizen_no === "string" ? req.body.citizen_no : undefined,
      mobileNumber:
        typeof req.body.mobile_number === "string"
          ? req.body.mobile_number
          : undefined,
      file: req.file,
    });

    res.status(201).json({ document });
  } catch (error) {
    handleAccountOpeningDocumentError(
      error,
      res,
      "Account opening document upload failed"
    );
  }
}

export async function postApproveAccountOpeningDocument(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const documentId = Number(req.params.id);
  if (!Number.isInteger(documentId) || documentId <= 0) {
    res.status(400).json({ error: "Invalid document id" });
    return;
  }

  try {
    const document = await approveAccountOpeningDocument({
      authenticatedUser: req.user,
      documentId,
    });

    res.json({ document });
  } catch (error) {
    handleAccountOpeningDocumentError(
      error,
      res,
      "Unable to approve account opening document"
    );
  }
}

export async function postRejectAccountOpeningDocument(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const documentId = Number(req.params.id);
  if (!Number.isInteger(documentId) || documentId <= 0) {
    res.status(400).json({ error: "Invalid document id" });
    return;
  }

  try {
    const document = await rejectAccountOpeningDocument({
      authenticatedUser: req.user,
      documentId,
      rejectionRemarks:
        typeof req.body.rejection_remarks === "string"
          ? req.body.rejection_remarks
          : undefined,
    });

    res.json({ document });
  } catch (error) {
    handleAccountOpeningDocumentError(
      error,
      res,
      "Unable to reject account opening document"
    );
  }
}
