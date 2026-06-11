import cors from "cors";
import express from "express";
import type { HealthResponse } from "@saptakoshi/shared";
import { APP_NAME } from "@saptakoshi/shared";

const app = express();
const port = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  const response: HealthResponse = {
    status: "ok",
    service: "backend",
    timestamp: new Date().toISOString(),
  };

  res.json(response);
});

app.get("/", (_req, res) => {
  res.json({ message: `${APP_NAME} API` });
});

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
