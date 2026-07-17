import { Request, Response } from "express";
import { auditManifest, chatAssistant, generateFridaScript } from "../services/ai.service";

export async function handleAuditManifest(req: Request, res: Response): Promise<void> {
  const { manifestContent, language = "vi" } = req.body;

  if (!manifestContent || typeof manifestContent !== "string") {
    res.status(400).json({ error: "Yêu cầu nội dung tệp AndroidManifest.xml hợp lệ." });
    return;
  }

  try {
    const auditResult = await auditManifest(manifestContent, language);
    res.json(auditResult);
  } catch (error: any) {
    console.error("Lỗi trong Controller phân tích Manifest:", error);
    res.status(500).json({
      error: error.message || "Lỗi trong quá trình phân tích bằng trí tuệ nhân tạo.",
    });
  }
}

export async function handleChat(req: Request, res: Response): Promise<void> {
  const { messages, language = "vi" } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "Lịch sử trò chuyện (messages) không hợp lệ." });
    return;
  }

  try {
    const aiResponse = await chatAssistant(messages, language);
    res.json({
      role: "assistant",
      content: aiResponse,
    });
  } catch (error: any) {
    console.error("Lỗi trong Controller AI Chat:", error);
    res.status(500).json({
      error: error.message || "Không thể thực hiện yêu cầu phân tích trò chuyện.",
    });
  }
}

export async function handleGenerateFridaScript(req: Request, res: Response): Promise<void> {
  const { prompt, language = "vi" } = req.body;

  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({ error: "Yêu cầu chuỗi prompt mô tả kịch bản Frida hợp lệ." });
    return;
  }

  try {
    const result = await generateFridaScript(prompt, language);
    res.json(result);
  } catch (error: any) {
    console.error("Lỗi trong Controller tạo mã Frida:", error);
    res.status(500).json({
      error: error.message || "Không thể tạo mã Frida bằng AI vào lúc này.",
    });
  }
}

