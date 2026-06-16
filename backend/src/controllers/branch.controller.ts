import type { Request, Response } from "express";
import {
  BranchError,
  createBranch,
  getBranchById,
  listBranches,
  updateBranch,
  updateBranchStatus,
} from "../services/branch.service";

function handleBranchError(error: unknown, res: Response): void {
  if (error instanceof BranchError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  res.status(500).json({ error: "Branch operation failed" });
}

export async function getBranches(req: Request, res: Response): Promise<void> {
  try {
    const branchCode =
      typeof req.query.branchCode === "string" ? req.query.branchCode : undefined;
    const branchName =
      typeof req.query.branchName === "string" ? req.query.branchName : undefined;

    const branches = await listBranches({ branchCode, branchName });
    res.json({ branches });
  } catch (error) {
    handleBranchError(error, res);
  }
}

export async function getBranch(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid branch id" });
    return;
  }

  try {
    const branch = await getBranchById(id);
    res.json({ branch });
  } catch (error) {
    handleBranchError(error, res);
  }
}

export async function postBranch(req: Request, res: Response): Promise<void> {
  try {
    const branch = await createBranch(req.body);
    res.status(201).json({ branch });
  } catch (error) {
    handleBranchError(error, res);
  }
}

export async function putBranch(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid branch id" });
    return;
  }

  try {
    const branch = await updateBranch(id, req.body);
    res.json({ branch });
  } catch (error) {
    handleBranchError(error, res);
  }
}

export async function patchBranchStatus(
  req: Request,
  res: Response
): Promise<void> {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid branch id" });
    return;
  }

  const { isActive } = req.body as { isActive?: boolean };

  if (typeof isActive !== "boolean") {
    res.status(400).json({ error: "isActive must be a boolean" });
    return;
  }

  try {
    const branch = await updateBranchStatus(id, isActive);
    res.json({ branch });
  } catch (error) {
    handleBranchError(error, res);
  }
}
