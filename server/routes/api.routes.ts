import { Router } from "express";
import { handleAuditManifest, handleChat } from "../controllers/ai.controller";
import { handleExecuteCommand } from "../controllers/command.controller";
import { handleRunStaticScan } from "../controllers/scanner.controller";
import {
  handleGetDecompiledManifest,
  handleDownloadGuideDocx,
  handleDownloadGuideMd,
  handleReadGuide,
} from "../controllers/guide.controller";
import {
  handleCreateTask,
  handleGetAllTasks,
  handleGetTaskStatus,
} from "../controllers/task.controller";
import {
  validate,
  auditManifestSchema,
  chatSchema,
  executeCommandSchema,
  getDecompiledManifestSchema,
} from "../middleware/validation.middleware";

const router = Router();

// 1. Health Check Endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    aiConfigured: !!process.env.GEMINI_API_KEY,
    time: new Date().toISOString(),
  });
});

// 2. AI Manifest Audit Endpoint
router.post("/audit-manifest", validate(auditManifestSchema), handleAuditManifest);

// 3. AI Pentest Assistant Chatbot
router.post("/chat", validate(chatSchema), handleChat);

// 4. Safe Command Execution Endpoint
router.post("/execute-command", validate(executeCommandSchema), handleExecuteCommand);

// 5. Decompiled Manifest Retrieval
router.get("/get-decompiled-manifest", validate(getDecompiledManifestSchema), handleGetDecompiledManifest);

// 5.5. Quick Static Analysis / Static Security Scanner
router.post("/scan", handleRunStaticScan);

// 6. Task Queue Management Endpoints (Phase 4 Integration)
router.post("/tasks", validate(executeCommandSchema), handleCreateTask);
router.get("/tasks", handleGetAllTasks);
router.get("/tasks/:id", handleGetTaskStatus);

// 7. User Guide Document Downloads & Viewing
router.get("/download-guide", handleDownloadGuideDocx);
router.get("/download-guide-md", handleDownloadGuideMd);
router.get("/read-guide", handleReadGuide);

export default router;

