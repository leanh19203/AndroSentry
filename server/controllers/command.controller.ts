import { Request, Response } from "express";
import { validateCommand, executeLocalCommand } from "../services/command.service";
import { taskQueueService } from "../services/queue.service";

export async function handleExecuteCommand(req: Request, res: Response): Promise<void> {
  const { command } = req.body;

  // Check if request originates from localhost (safety guard for public staging/Cloud Run)
  // ONLY rely on req.ip (peer IP) to prevent Host Header spoofing / Host Header Injection
  const isLocal =
    req.ip === "127.0.0.1" ||
    req.ip === "::1" ||
    req.ip === "::ffff:127.0.0.1";

  // Block execution if request is not originating from localhost
  if (!isLocal) {
    res.status(403).json({
      error: "Vì lý do bảo mật, tính năng thực thi lệnh trực tiếp bị vô hiệu hóa trên môi trường Cloud/Web công cộng hoặc môi trường mạng từ xa. Hãy tải mã nguồn về và chạy trên Kali Linux của bạn (localhost) để kích hoạt toàn quyền điều khiển thiết bị!",
      isLocal: false,
    });
    return;
  }

  if (!command || typeof command !== "string") {
    res.status(400).json({ error: "Lệnh thực thi không hợp lệ." });
    return;
  }

  // Delegate safety and whitelist validation to service
  const validationResult = validateCommand(command);
  if (!validationResult.isValid) {
    res.status(403).json({ error: validationResult.error });
    return;
  }

  try {
    const isHeavyCommand = command.includes("apktool") || command.includes("jadx");

    if (isHeavyCommand) {
      console.log(`[COMMAND ROUTE] Heavy command detected, routing to Task Queue with Workspace Isolation: ${command}`);
      const task = await taskQueueService.submitTask(command);
      
      // Wait for task completion to return synchronous result for seamless frontend compatibility
      const completedTask = await taskQueueService.waitForTask(task.id);
      
      res.json({
        stdout: completedTask.stdout,
        stderr: completedTask.stderr,
        code: completedTask.code ?? 0,
        error: completedTask.error,
        taskId: completedTask.id, // Include taskId for advanced UI features
      });
    } else {
      const executionResult = await executeLocalCommand(command);
      res.json(executionResult);
    }
  } catch (error: any) {
    console.error("Lỗi thực thi lệnh trong Controller:", error);
    res.status(500).json({
      error: error.message || "Lỗi nghiêm trọng khi thực thi lệnh hệ thống.",
    });
  }
}

