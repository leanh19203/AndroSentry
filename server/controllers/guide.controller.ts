import { Request, Response } from "express";
import {
  getDecompiledManifest,
  getGuideMdPath,
  readGuideMdContent,
  generateAndGetGuideDocxPath
} from "../services/guide.service";

export function handleGetDecompiledManifest(req: Request, res: Response): void {
  const outputDir = (req.query.outputDir as string) || "decompiled_src";
  const result = getDecompiledManifest(outputDir);

  if (result.success) {
    res.json({ success: true, content: result.content });
  } else {
    const statusCode = result.error?.includes("Không tìm thấy") ? 404 : 500;
    res.status(statusCode).json({ error: result.error });
  }
}

export async function handleDownloadGuideDocx(req: Request, res: Response): Promise<void> {
  try {
    const docxPath = await generateAndGetGuideDocxPath();
    res.setHeader("Content-Disposition", "attachment; filename=Huong_Dan_Su_Dung_AndroSentry.docx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.sendFile(docxPath);
  } catch (error: any) {
    console.error("Lỗi tải/tạo báo cáo docx:", error);
    res.status(500).json({
      error: error.message || "Không thể tải/tạo báo cáo docx lúc này."
    });
  }
}

export function handleDownloadGuideMd(req: Request, res: Response): void {
  const mdPath = getGuideMdPath();
  if (mdPath) {
    res.setHeader("Content-Disposition", "attachment; filename=Huong_Dan_Su_Dung_AndroSentry.md");
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.sendFile(mdPath);
  } else {
    res.status(404).json({ error: "Tệp hướng dẫn sử dụng Markdown không tồn tại." });
  }
}

export function handleReadGuide(req: Request, res: Response): void {
  try {
    const content = readGuideMdContent();
    res.json({ content });
  } catch (error: any) {
    console.error("Lỗi đọc tệp hướng dẫn sử dụng:", error);
    res.status(404).json({ error: error.message });
  }
}
