import type { Request, Response } from "express";
import {
  AccountOpeningDocumentError,
  uploadAccountOpeningDocument,
} from "../services/account-opening-document.service";

function handleAccountOpeningDocumentError(
  error: unknown,
  res: Response
): void {
  if (error instanceof AccountOpeningDocumentError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  console.error("Account opening document upload failed:", error);
  res.status(500).json({ error: "Account opening document upload failed" });
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
    handleAccountOpeningDocumentError(error, res);
  }
}
