import multer from "multer";
import path from "node:path";
import type { NextFunction, Request, Response } from "express";

const FILE_SIZE_LIMIT_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["application/pdf", "application/x-pdf", "application/octet-stream"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: FILE_SIZE_LIMIT_BYTES,
  },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (extension !== ".pdf" || !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      callback(new Error("Only PDF files are allowed"));
      return;
    }

    callback(null, true);
  },
});

export function handleItTrainingMaterialUpload(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  upload.single("document")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({ error: "File size must be 2 MB or less" });
      return;
    }

    res.status(400).json({
      error: error instanceof Error ? error.message : "Invalid upload request",
    });
  });
}
