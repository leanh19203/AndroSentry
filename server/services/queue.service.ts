import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { parseCommandString, ALLOWED_TOOLS, ARGUMENT_VALIDATORS } from "./command.service";

export interface Task {
  id: string;
  command: string;
  originalCommand: string;
  status: "pending" | "running" | "completed" | "failed";
  stdout: string;
  stderr: string;
  code: number | null;
  error: string | null;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  workspaceDir: string;
}

class TaskQueueService {
  private tasks: Map<string, Task> = new Map();
  private queue: string[] = [];
  private activeCount = 0;
  private maxConcurrency = 2; // Allow up to 2 heavy tasks concurrently
  private workspaceRoot = path.join(process.cwd(), "workspaces");

  constructor() {
    // Ensure workspace root directory exists
    if (!fs.existsSync(this.workspaceRoot)) {
      fs.mkdirSync(this.workspaceRoot, { recursive: true });
    }
    
    // Start periodic cleanup of workspaces older than 24 hours
    setInterval(() => this.cleanupOldWorkspaces(), 30 * 60 * 1000);
  }

  /**
   * Submits a command to the queue, applying Workspace Isolation.
   */
  public async submitTask(originalCommand: string): Promise<Task> {
    const id = uuidv4();
    const workspaceDir = path.join(this.workspaceRoot, `task-${id}`);
    
    // 1. Create isolated workspace directory
    fs.mkdirSync(workspaceDir, { recursive: true });

    // 2. Prepare workspace: Copy any .apk files from current working directory to workspace
    // so that local APKs are accessible inside the isolated workspace CWD
    try {
      const files = fs.readdirSync(process.cwd());
      for (const file of files) {
        if (file.toLowerCase().endsWith(".apk")) {
          const srcPath = path.join(process.cwd(), file);
          const destPath = path.join(workspaceDir, file);
          fs.copyFileSync(srcPath, destPath);
          console.log(`[WORKSPACE PREP] Copied APK: ${file} to isolated workspace task-${id}`);
        }
      }
    } catch (err) {
      console.error("[WORKSPACE PREP ERROR] Failed to copy base APK files:", err);
    }

    // 3. Create the Task object
    const task: Task = {
      id,
      command: originalCommand,
      originalCommand,
      status: "pending",
      stdout: "",
      stderr: "",
      code: null,
      error: null,
      createdAt: new Date(),
      workspaceDir,
    };

    this.tasks.set(id, task);
    this.queue.push(id);
    
    // Trigger queue processing asynchronously
    this.processQueue();

    return task;
  }

  /**
   * Retrieves a task by its ID.
   */
  public getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  /**
   * Retrieves all tasks.
   */
  public getAllTasks(): Task[] {
    return Array.from(this.tasks.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * Wait for a task to reach a terminal state (completed or failed).
   * Useful for handling sync requests via async queue.
   */
  public waitForTask(id: string, timeoutMs: number = 40000): Promise<Task> {
    return new Promise((resolve, reject) => {
      const task = this.getTask(id);
      if (!task) {
        reject(new Error("Task not found"));
        return;
      }

      if (task.status === "completed" || task.status === "failed") {
        resolve(task);
        return;
      }

      const start = Date.now();
      const interval = setInterval(() => {
        const currentTask = this.getTask(id);
        if (!currentTask) {
          clearInterval(interval);
          reject(new Error("Task disappeared during execution"));
          return;
        }

        if (currentTask.status === "completed" || currentTask.status === "failed") {
          clearInterval(interval);
          resolve(currentTask);
          return;
        }

        if (Date.now() - start > timeoutMs) {
          clearInterval(interval);
          // Don't kill it, just resolve with current state (or let the caller handle timeout)
          resolve(currentTask);
        }
      }, 200);
    });
  }

  /**
   * Worker loop to process tasks in the queue.
   */
  private async processQueue() {
    if (this.activeCount >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    const taskId = this.queue.shift();
    if (!taskId) return;

    const task = this.tasks.get(taskId);
    if (!task) {
      this.processQueue();
      return;
    }

    this.activeCount++;
    task.status = "running";
    task.startedAt = new Date();
    console.log(`[TASK QUEUE] Starting Task ${task.id}: ${task.command}`);

    try {
      await this.runTaskInWorkspace(task);
    } catch (err: any) {
      task.status = "failed";
      task.error = err.message || "Lỗi không xác định khi thực thi trong hàng đợi.";
      task.completedAt = new Date();
    } finally {
      this.activeCount--;
      // Process next task
      this.processQueue();
    }
  }

  /**
   * Executes the task inside its isolated workspace directory.
   */
  private runTaskInWorkspace(task: Task): Promise<void> {
    return new Promise((resolve) => {
      const steps = task.command.split("&&");
      let currentStepIndex = 0;

      const runNextStep = async () => {
        if (currentStepIndex >= steps.length) {
          task.status = "completed";
          task.completedAt = new Date();
          console.log(`[TASK QUEUE SUCCESS] Task ${task.id} completed successfully.`);
          
          // Copy back any generated artifacts (like recompiled apks) from workspace to main process dir
          // so that general adb/apksigner tools can access them as expected by the user.
          this.syncArtifactsBack(task.workspaceDir);
          
          resolve();
          return;
        }

        const step = steps[currentStepIndex].trim();
        if (!step) {
          currentStepIndex++;
          runNextStep();
          return;
        }

        console.log(`[TASK STEP] Running step: ${step} inside CWD: ${task.workspaceDir}`);

        // Parse command
        const words = parseCommandString(step);
        if (words.length === 0) {
          currentStepIndex++;
          runNextStep();
          return;
        }

        const executable = words[0];
        const args = words.slice(1);
        const binName = path.basename(executable).toLowerCase();

        // Security Validation
        if (!ALLOWED_TOOLS.includes(binName)) {
          task.status = "failed";
          task.error = `Từ chối thực thi: Lệnh '${binName}' không được phép.`;
          task.stderr += `\n[Error: Lệnh '${binName}' không nằm trong whitelist cho phép]`;
          task.code = -1;
          task.completedAt = new Date();
          resolve();
          return;
        }

        const validator = ARGUMENT_VALIDATORS[binName];
        if (validator) {
          const valRes = validator(args);
          if (!valRes.isValid) {
            task.status = "failed";
            task.error = `Tham số không hợp lệ: ${valRes.error}`;
            task.stderr += `\n[Error: ${valRes.error}]`;
            task.code = -1;
            task.completedAt = new Date();
            resolve();
            return;
          }
        }

        // Spawn child process with isolated workspace as the CWD!
        const child = spawn(executable, args, {
          cwd: task.workspaceDir,
          timeout: 45000,
        });

        child.stdout.on("data", (data) => {
          task.stdout += data.toString();
        });

        child.stderr.on("data", (data) => {
          task.stderr += data.toString();
        });

        child.on("error", (err: any) => {
          task.status = "failed";
          task.error = err.message;
          task.stderr += `\n[Error spawning process: ${err.message}]`;
          task.code = -1;
          task.completedAt = new Date();
          resolve();
        });

        child.on("close", (code) => {
          task.code = code ?? 0;
          if (code !== 0) {
            task.status = "failed";
            task.error = `Lệnh thất bại ở bước ${currentStepIndex + 1} với mã lỗi ${code}.`;
            task.completedAt = new Date();
            resolve();
          } else {
            currentStepIndex++;
            runNextStep();
          }
        });
      };

      runNextStep();
    });
  }

  /**
   * Syncs generated APK files from isolated workspace back to main directory.
   */
  private syncArtifactsBack(workspaceDir: string) {
    try {
      const files = fs.readdirSync(workspaceDir);
      for (const file of files) {
        // Sync any newly generated or modified APK files
        if (file.toLowerCase().endsWith(".apk")) {
          const srcPath = path.join(workspaceDir, file);
          const destPath = path.join(process.cwd(), file);
          
          // Only copy if it's a new file or has been updated
          let shouldCopy = true;
          if (fs.existsSync(destPath)) {
            const srcStat = fs.statSync(srcPath);
            const destStat = fs.statSync(destPath);
            if (srcStat.mtime.getTime() <= destStat.mtime.getTime()) {
              shouldCopy = false;
            }
          }

          if (shouldCopy) {
            fs.copyFileSync(srcPath, destPath);
            console.log(`[WORKSPACE SYNC] Synced generated APK '${file}' back to main root directory.`);
          }
        }
      }
    } catch (err) {
      console.error("[WORKSPACE SYNC ERROR] Failed to sync artifacts back:", err);
    }
  }

  /**
   * Periodic cleanup of workspaces older than 24 hours to prevent disk space leaks.
   */
  private cleanupOldWorkspaces() {
    console.log("[WORKSPACE CLEANUP] Running periodic cleanup...");
    try {
      if (!fs.existsSync(this.workspaceRoot)) return;
      const dirs = fs.readdirSync(this.workspaceRoot);
      const now = Date.now();
      const maxAgeMs = 24 * 60 * 60 * 1000; // 24 hours (1 day)

      for (const dir of dirs) {
        const dirPath = path.join(this.workspaceRoot, dir);
        const stat = fs.statSync(dirPath);

        if (stat.isDirectory() && now - stat.mtime.getTime() > maxAgeMs) {
          fs.rmSync(dirPath, { recursive: true, force: true });
          console.log(`[WORKSPACE CLEANUP] Removed expired workspace directory: ${dir}`);
        }
      }
    } catch (err) {
      console.error("[WORKSPACE CLEANUP ERROR] Failed to clean old workspaces:", err);
    }
  }
}

export const taskQueueService = new TaskQueueService();
