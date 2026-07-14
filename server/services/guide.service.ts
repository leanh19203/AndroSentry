import fs from "fs";
import path from "path";
import { execFile } from "child_process";

export function getDecompiledManifest(outputDir: string): { success: boolean; content?: string; error?: string } {
  const safeDir = path.basename(outputDir);
  let filePath = path.join(process.cwd(), safeDir, "AndroidManifest.xml");

  // 1. Check in root CWD first for compatibility
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      return { success: true, content };
    } catch (err: any) {
      return { success: false, error: "Không thể đọc tệp AndroidManifest.xml.", ...err };
    }
  }

  // 2. Scan workspaces directory for the most recent decompiled AndroidManifest.xml
  const workspacesRoot = path.join(process.cwd(), "workspaces");
  if (fs.existsSync(workspacesRoot)) {
    try {
      const tasks = fs.readdirSync(workspacesRoot);
      // Sort tasks by modification time descending (most recent first)
      const sortedTasks = tasks
        .map((taskDir) => {
          const taskPath = path.join(workspacesRoot, taskDir);
          const stat = fs.statSync(taskPath);
          return { name: taskDir, path: taskPath, mtime: stat.mtime.getTime() };
        })
        .sort((a, b) => b.mtime - a.mtime);

      for (const task of sortedTasks) {
        // Try to look inside workspaces/task-id/outputDir/AndroidManifest.xml
        const workspaceManifestPath = path.join(task.path, safeDir, "AndroidManifest.xml");
        if (fs.existsSync(workspaceManifestPath)) {
          console.log(`[MANIFEST RETRIEVAL] Found AndroidManifest.xml in isolated workspace: ${workspaceManifestPath}`);
          const content = fs.readFileSync(workspaceManifestPath, "utf-8");
          return { success: true, content };
        }
        
        // Direct search workspaces/task-id/AndroidManifest.xml as fallback
        const fallbackPath = path.join(task.path, "AndroidManifest.xml");
        if (fs.existsSync(fallbackPath)) {
          console.log(`[MANIFEST RETRIEVAL] Found AndroidManifest.xml at task root fallback: ${fallbackPath}`);
          const content = fs.readFileSync(fallbackPath, "utf-8");
          return { success: true, content };
        }
      }
    } catch (err) {
      console.error("[MANIFEST RETRIEVAL ERROR] Failed scanning workspaces:", err);
    }
  }

  return {
    success: false,
    error: `Không tìm thấy tệp AndroidManifest.xml tại thư mục '${safeDir}'. Vui lòng đảm bảo bạn đã chạy lệnh Decompile thành công trong tab Quy trình Apktool.`
  };
}

export function getGuideMdPath(): string | null {
  const filePath = path.join(process.cwd(), "Huong_Dan_Su_Dung_AndroSentry.md");
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  return null;
}

export function readGuideMdContent(): string {
  const filePath = path.join(process.cwd(), "Huong_Dan_Su_Dung_AndroSentry.md");
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, "utf-8");
  }
  throw new Error("Tệp hướng dẫn sử dụng Markdown không tồn tại.");
}

export function generateAndGetGuideDocxPath(): Promise<string> {
  const filePath = path.join(process.cwd(), "Huong_Dan_Su_Dung_AndroSentry.docx");

  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      resolve(filePath);
      return;
    }

    console.log("[DOCX SERVICE] File not found. Triggering dynamic generation via generate-docx.js...");
    execFile("node", ["generate-docx.js"], (error) => {
      if (error) {
        console.error("[DOCX SERVICE ERROR] Failed to generate DOCX dynamically:", error);
        reject(new Error("Không thể tự động tạo tệp tin báo cáo. Vui lòng liên hệ quản trị viên."));
      } else {
        console.log("[DOCX SERVICE SUCCESS] Dynamically generated docx successfully.");
        if (fs.existsSync(filePath)) {
          resolve(filePath);
        } else {
          reject(new Error("Không tìm thấy tệp sau khi biên dịch động."));
        }
      }
    });
  });
}
