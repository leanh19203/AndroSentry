import { Request, Response } from "express";
import { taskQueueService } from "../services/queue.service";

export async function handleCreateTask(req: Request, res: Response): Promise<void> {
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
      error: "Vì lý do bảo mật, tính năng tạo tác vụ và thực thi lệnh bị vô hiệu hóa trên môi trường Cloud/Web công cộng hoặc môi trường mạng từ xa. Hãy tải mã nguồn về và chạy trên Kali Linux của bạn (localhost) để kích hoạt toàn quyền điều khiển thiết bị!",
      isLocal: false,
    });
    return;
  }

  if (!command || typeof command !== "string") {
    res.status(400).json({ error: "Lệnh thực thi không hợp lệ." });
    return;
  }

  try {
    const task = await taskQueueService.submitTask(command);
    res.status(201).json({
      success: true,
      message: "Tác vụ đã được thêm vào hàng đợi thành công.",
      task,
    });
  } catch (error: any) {
    console.error("Lỗi thêm tác vụ vào hàng đợi:", error);
    res.status(500).json({ error: error.message || "Lỗi khi xử lý hàng đợi." });
  }
}

export function handleGetTaskStatus(req: Request, res: Response): void {
  const { id } = req.params;
  const task = taskQueueService.getTask(id);

  if (!task) {
    res.status(404).json({ error: "Không tìm thấy tác vụ." });
    return;
  }

  res.json(task);
}

export function handleGetAllTasks(req: Request, res: Response): void {
  const tasks = taskQueueService.getAllTasks();
  res.json(tasks);
}
