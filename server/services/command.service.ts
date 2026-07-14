import { spawn } from "child_process";
import path from "path";

export interface CommandExecutionResult {
  stdout: string;
  stderr: string;
  code: number;
  error: string | null;
}

export const ALLOWED_TOOLS = [
  "adb",
  "apktool",
  "apksigner",
  "keytool",
  "zipalign",
  "frida",
  "frida-ps",
  "jadx",
  "jadx-gui",
  "echo",
  "ls",
  "grep"
];

// Helper to validate that a file path or directory is safe (no directory traversal, no root access, strictly within workspace)
function isSafePath(p: string): boolean {
  if (!p) return true;

  // Prevent directory traversal attempts
  if (p.includes("..")) {
    return false;
  }

  // Device-specific paths (ADB context) are allowed but sanitized
  if (p.startsWith("/sdcard") || p.startsWith("/data/data/")) {
    return /^[a-zA-Z0-9_\-\.\/:\s]+$/.test(p);
  }

  // Local absolute paths must be strictly within the workspace process.cwd()
  if (p.startsWith("/")) {
    try {
      const resolved = path.resolve(p);
      const cwd = process.cwd();
      if (!resolved.startsWith(cwd)) {
        return false;
      }
    } catch (e) {
      return false;
    }
  }

  // Only allow typical safe path characters. Explicitly remove '*' to block glob/wildcard exploits.
  return /^[a-zA-Z0-9_\-\.\/:\s]+$/.test(p);
}

// Helper to validate package names (e.g. com.example.app)
function isSafePackageName(pkg: string): boolean {
  return /^[a-zA-Z0-9_\.]+$/.test(pkg);
}

// Map of strict whitelisting validators for each tool's arguments
export const ARGUMENT_VALIDATORS: Record<string, (args: string[]) => { isValid: boolean; error?: string }> = {
  ls: (args) => {
    // Only allow safe options or relative directories
    for (const arg of args) {
      if (arg.startsWith("-")) {
        if (!/^\-[laR]+$/.test(arg)) {
          return { isValid: false, error: "Tùy chọn ls không được phép." };
        }
      } else {
        if (!isSafePath(arg)) {
          return { isValid: false, error: "Đường dẫn ls không hợp lệ hoặc chứa ký tự nguy hiểm." };
        }
      }
    }
    return { isValid: true };
  },

  grep: (args) => {
    // Only allow safe options, search strings, and relative file targets
    for (const arg of args) {
      if (arg.startsWith("-")) {
        if (!/^\-[iRrnEwoO]+$/.test(arg)) {
          return { isValid: false, error: "Tùy chọn grep không được phép." };
        }
      } else {
        if (!isSafePath(arg)) {
          return { isValid: false, error: "Đường dẫn/Từ khóa tìm kiếm grep không hợp lệ." };
        }
      }
    }
    return { isValid: true };
  },

  adb: (args) => {
    if (args.length === 0) return { isValid: true };
    const subCommand = args[0];

    if (subCommand === "devices") {
      const allowed = args.slice(1).every(arg => arg === "-l");
      if (!allowed) return { isValid: false, error: "Tham số adb devices không hợp lệ." };
      return { isValid: true };
    }

    if (subCommand === "forward") {
      const allowed = args.slice(1).every(arg => /^tcp:\d+$/.test(arg));
      if (!allowed || args.length < 3) return { isValid: false, error: "Tham số adb forward không hợp lệ. Chỉ chấp nhận định dạng tcp:port." };
      return { isValid: true };
    }

    if (subCommand === "pull") {
      // Must have source and optional target
      if (args.length < 2) return { isValid: false, error: "Thiếu tham số cho lệnh adb pull." };
      const src = args[1];
      const dest = args[2] || "";
      if (!isSafePath(src) || !isSafePath(dest)) {
        return { isValid: false, error: "Đường dẫn adb pull chứa ký tự hoặc thư mục không được phép." };
      }
      return { isValid: true };
    }

    if (subCommand === "logcat") {
      const allowed = args.slice(1).every(arg => arg === "-d");
      if (!allowed) return { isValid: false, error: "Tham số adb logcat không hợp lệ. Chỉ hỗ trợ '-d' để trích xuất log tĩnh." };
      return { isValid: true };
    }

    if (subCommand === "shell") {
      if (args.length < 2) return { isValid: true };
      
      // Handle quoted shell commands like "su -c 'whoami'"
      let shellArgs = args.slice(1);
      if (shellArgs.length === 1 && (shellArgs[0].includes(" ") || shellArgs[0].includes("'") || shellArgs[0].includes("\""))) {
        // Strip outermost quotes and parse
        let innerCmd = shellArgs[0].replace(/^['"]|['"]$/g, "");
        shellArgs = parseCommandString(innerCmd);
      }

      const shellBin = shellArgs[0];
      if (!shellBin) return { isValid: true };

      const allowedShellBins = ["getprop", "pm", "screencap", "am", "su", "netstat", "whoami"];
      if (!allowedShellBins.includes(shellBin)) {
        return { isValid: false, error: `Lệnh shell '${shellBin}' không nằm trong whitelist cho phép.` };
      }

      if (shellBin === "getprop") {
        const prop = shellArgs[1];
        if (prop && !/^[a-zA-Z0-9_\-\.]+$/.test(prop)) {
          return { isValid: false, error: "Thuộc tính getprop không hợp lệ." };
        }
      } else if (shellBin === "pm") {
        const pmSub = shellArgs[1];
        if (pmSub === "list") {
          if (shellArgs[2] !== "packages") {
            return { isValid: false, error: "Chỉ cho phép lệnh 'pm list packages'." };
          }
        } else if (pmSub === "path") {
          const pkg = shellArgs[2];
          if (!pkg || !isSafePackageName(pkg)) {
            return { isValid: false, error: "Tên package cho lệnh pm path không hợp lệ." };
          }
        } else {
          return { isValid: false, error: "Lệnh pm không được hỗ trợ." };
        }
      } else if (shellBin === "screencap") {
        const opt = shellArgs[1];
        const target = shellArgs[2];
        if (opt !== "-p" || target !== "/sdcard/screen.png") {
          return { isValid: false, error: "Chỉ cho phép lệnh chụp màn hình mặc định." };
        }
      } else if (shellBin === "am") {
        const amSub = shellArgs[1];
        if (!["start", "broadcast", "startservice"].includes(amSub)) {
          return { isValid: false, error: "Lệnh am không được hỗ trợ." };
        }
        if (amSub === "start" || amSub === "startservice") {
          if (shellArgs[2] !== "-n") return { isValid: false, error: "Thiếu tùy chọn '-n' cho lệnh am." };
          const component = shellArgs[3];
          if (!component || !/^[a-zA-Z0-9_\-\.\/]+$/.test(component)) {
            return { isValid: false, error: "Component chỉ định cho lệnh am không hợp lệ." };
          }
        } else if (amSub === "broadcast") {
          if (shellArgs[2] !== "-a") return { isValid: false, error: "Thiếu tùy chọn '-a' cho lệnh am broadcast." };
          const action = shellArgs[3];
          if (!action || !/^[a-zA-Z0-9_\-\.]+$/.test(action)) {
            return { isValid: false, error: "Action phát broadcast không hợp lệ." };
          }
          // Optional extras should be safe too
          const extra = shellArgs.slice(4).join(" ");
          if (extra && !/^[a-zA-Z0-9_\-\.\s:\-\\\/\'"]*$/.test(extra)) {
            return { isValid: false, error: "Tham số extras chứa ký tự không an toàn." };
          }
        }
      } else if (shellBin === "su") {
        const opt = shellArgs[1];
        const cmd = shellArgs[2];
        if (opt !== "-c" || (cmd !== "whoami" && cmd !== "'whoami'" && cmd !== '"whoami"')) {
          return { isValid: false, error: "Lệnh su chỉ hỗ trợ kiểm tra quyền 'su -c whoami'." };
        }
      } else if (shellBin === "netstat") {
        const opt = shellArgs[1];
        if (opt && opt !== "-tuln") {
          return { isValid: false, error: "Tùy chọn netstat không được phép." };
        }
      }

      return { isValid: true };
    }

    return { isValid: true };
  },

  apktool: (args) => {
    if (args.length === 0) return { isValid: true };
    const action = args[0];
    if (action !== "d" && action !== "b") {
      return { isValid: false, error: "Chỉ hỗ trợ thao tác decompile (d) hoặc build (b) bằng apktool." };
    }

    for (const arg of args.slice(1)) {
      if (arg !== "-o" && !isSafePath(arg)) {
        return { isValid: false, error: "Đường dẫn tham số cho apktool không hợp lệ." };
      }
    }
    return { isValid: true };
  },

  keytool: (args) => {
    // Only allow options that are safe for creating a test keystore
    const allowedOptions = ["-genkey", "-v", "-keystore", "-keyalg", "-keysize", "-validity", "-alias", "RSA", "2048", "10000"];
    for (const arg of args) {
      if (arg.startsWith("-")) {
        if (!allowedOptions.includes(arg)) {
          return { isValid: false, error: `Tùy chọn keytool '${arg}' không được phép.` };
        }
      } else {
        if (!/^[a-zA-Z0-9_\-\.]+$/.test(arg)) {
          return { isValid: false, error: `Giá trị tham số keytool '${arg}' không hợp lệ.` };
        }
      }
    }
    return { isValid: true };
  },

  apksigner: (args) => {
    if (args.length === 0) return { isValid: true };
    if (args[0] !== "sign") {
      return { isValid: false, error: "Chỉ cho phép lệnh 'apksigner sign'." };
    }

    for (const arg of args.slice(1)) {
      if (arg !== "--keystore" && arg !== "--ks-key-alias" && !isSafePath(arg)) {
        return { isValid: false, error: "Tham số cho apksigner không hợp lệ." };
      }
    }
    return { isValid: true };
  },

  zipalign: (args) => {
    for (const arg of args) {
      if (arg !== "-v" && arg !== "-f" && arg !== "4" && !isSafePath(arg)) {
        return { isValid: false, error: "Tham số zipalign không hợp lệ." };
      }
    }
    return { isValid: true };
  },

  frida: (args) => {
    for (const arg of args) {
      if (arg.startsWith("-")) {
        if (arg !== "-U" && arg !== "-f" && arg !== "-l") {
          return { isValid: false, error: `Tùy chọn frida '${arg}' không được hỗ trợ.` };
        }
      } else {
        if (!isSafePackageName(arg) && !isSafePath(arg)) {
          return { isValid: false, error: `Tham số frida '${arg}' không an toàn.` };
        }
      }
    }
    return { isValid: true };
  },

  "frida-ps": (args) => {
    const allowed = args.every(arg => arg === "-U");
    if (!allowed) return { isValid: false, error: "frida-ps chỉ hỗ trợ tùy chọn -U." };
    return { isValid: true };
  },

  jadx: (args) => {
    for (const arg of args) {
      if (arg !== "-d" && !isSafePath(arg)) {
        return { isValid: false, error: "Tham số jadx không hợp lệ." };
      }
    }
    return { isValid: true };
  },

  "jadx-gui": (args) => {
    const allowed = args.every(arg => isSafePath(arg));
    if (!allowed) return { isValid: false, error: "Tham số jadx-gui chứa đường dẫn không an toàn." };
    return { isValid: true };
  },

  echo: (args) => {
    const allowed = args.every(arg => /^[a-zA-Z0-9_\-\.\s!@#\$%\^&\*\(\)\+=\{\}\[\]\\|:;\"\'<>,?\/]*$/.test(arg));
    if (!allowed) return { isValid: false, error: "Nội dung echo chứa ký tự không hợp lệ." };
    return { isValid: true };
  }
};

export function validateCommand(command: string): { isValid: boolean; error?: string } {
  const trimmedCmd = command.trim();

  // 1. Strict Redirection, Shell Expansion and Multi-line Block (Security Hardening)
  if (/[><`]/.test(trimmedCmd) || /\$\(/.test(trimmedCmd) || /[\r\n]/.test(trimmedCmd)) {
    return {
      isValid: false,
      error: "Từ chối thực thi: Để bảo mật hệ thống, không cho phép sử dụng các toán tử chuyển hướng ('>', '<'), ký tự thực thi phụ ('`', '$(') hoặc các lệnh xuống dòng."
    };
  }

  // 2. Segment Validation: Split by execution delimiters (&&, ||, ;, |)
  const segments = trimmedCmd.split(/&&|\|\||;|\|/);

  for (const segment of segments) {
    const cleanSegment = segment.trim();
    if (!cleanSegment) continue;

    // Get the first word of the segment representing the executable command
    const parsedSegmentWords = parseCommandString(cleanSegment);
    if (parsedSegmentWords.length === 0) continue;

    const firstWord = parsedSegmentWords[0];
    const binaryName = path.basename(firstWord).toLowerCase();

    // Check if the binary is allowed using strict exact matching
    const isAllowed = ALLOWED_TOOLS.includes(binaryName);

    if (!isAllowed) {
      return {
        isValid: false,
        error: `Từ chối thực thi: Thành phần lệnh '${cleanSegment}' bắt đầu bằng công cụ '${binaryName}' nằm ngoài danh mục công cụ Pentest được phép (adb, apktool, keytool, apksigner, zipalign, frida, jadx, grep, ls, echo).`
      };
    }

    // 3. Heavy Blocklist Checks on commands/arguments (Blocking reverse shells, downloaders, destructors)
    const blocklistPattern = /(rm\s+-rf|wget|curl|bash|sh\s+-c|nc\s+|netcat|ncat|python|perl|ruby|gcc|clang|\/etc\/passwd|id\s+|whoami)/i;
    if (cleanSegment.match(blocklistPattern)) {
      return {
        isValid: false,
        error: "Từ chối thực thi: Phát hiện từ khóa bị cấm hoặc các tham số có nguy cơ khai thác hệ thống tiềm ẩn."
      };
    }

    // 4. Argument Whitelisting (Phase 3 Integration)
    const validator = ARGUMENT_VALIDATORS[binaryName];
    if (validator) {
      const args = parsedSegmentWords.slice(1);
      const validation = validator(args);
      if (!validation.isValid) {
        return {
          isValid: false,
          error: `Từ chối thực thi: Tham số của công cụ '${binaryName}' không hợp lệ hoặc bị chặn. Chi tiết: ${validation.error || "Không nằm trong whitelist cho phép."}`
        };
      }
    }
  }

  return { isValid: true };
}

/**
 * Parses a shell-like command string into an array of arguments, handling quotes properly.
 */
export function parseCommandString(cmdStr: string): string[] {
  const args: string[] = [];
  let current = "";
  let inDoubleQuotes = false;
  let inSingleQuotes = false;

  for (let i = 0; i < cmdStr.length; i++) {
    const char = cmdStr[i];

    if (char === '"' && !inSingleQuotes) {
      inDoubleQuotes = !inDoubleQuotes;
    } else if (char === "'" && !inDoubleQuotes) {
      inSingleQuotes = !inSingleQuotes;
    } else if (char === " " && !inDoubleQuotes && !inSingleQuotes) {
      if (current) {
        args.push(current);
        current = "";
      }
    } else {
      current += char;
    }
  }
  if (current) {
    args.push(current);
  }
  return args;
}

/**
 * Spawns a single command without shell, returning stdout, stderr, code, and error.
 */
export function spawnSingleCommand(executable: string, args: string[]): Promise<CommandExecutionResult> {
  return new Promise((resolve) => {
    console.log(`[SPAWN SERVICE] Running: ${executable} ${args.join(" ")}`);
    const child = spawn(executable, args, { timeout: 45000 });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (err: any) => {
      resolve({
        stdout,
        stderr: stderr + `\n[Error spawning process: ${err.message}]`,
        code: -1,
        error: err.message
      });
    });

    child.on("close", (code) => {
      resolve({
        stdout,
        stderr,
        code: code ?? 0,
        error: code !== 0 ? `Process exited with code ${code}` : null
      });
    });
  });
}

/**
 * Spawns a pipeline of commands (cmd1 | cmd2 | ...), linking stdout to stdin.
 */
export function spawnPipeline(commands: Array<{ executable: string; args: string[] }>): Promise<CommandExecutionResult> {
  return new Promise((resolve) => {
    if (commands.length === 0) {
      resolve({ stdout: "", stderr: "", code: 0, error: null });
      return;
    }

    console.log(`[SPAWN PIPELINE] Running pipe chain: ${commands.map(c => `${c.executable} ${c.args.join(" ")}`).join(" | ")}`);

    const children = commands.map((cmd) => {
      return spawn(cmd.executable, cmd.args, { timeout: 45000 });
    });

    let lastStdout = "";
    let aggregatedStderr = "";

    // Pipe outputs from each child to the next
    for (let i = 0; i < children.length - 1; i++) {
      const current = children[i];
      const next = children[i + 1];
      current.stdout.pipe(next.stdin);
      
      current.stderr.on("data", (data) => {
        aggregatedStderr += `[${path.basename(commands[i].executable)} stderr]: ${data.toString()}`;
      });

      current.on("error", (err) => {
        aggregatedStderr += `\n[Error spawning ${commands[i].executable}: ${err.message}]\n`;
      });
    }

    // Capture the stdout and stderr of the last command
    const lastChild = children[children.length - 1];
    lastChild.stdout.on("data", (data) => {
      lastStdout += data.toString();
    });

    lastChild.stderr.on("data", (data) => {
      aggregatedStderr += data.toString();
    });

    lastChild.on("error", (err) => {
      aggregatedStderr += `\n[Error spawning ${commands[commands.length - 1].executable}: ${err.message}]\n`;
    });

    // Handle process completion
    let completedCount = 0;
    let lastCode = 0;

    children.forEach((child, index) => {
      child.on("close", (code) => {
        completedCount++;
        if (index === children.length - 1) {
          lastCode = code ?? 0;
        }
        if (completedCount === children.length) {
          resolve({
            stdout: lastStdout,
            stderr: aggregatedStderr,
            code: lastCode,
            error: lastCode !== 0 ? `Pipeline failed at last command with code ${lastCode}` : null
          });
        }
      });
    });
  });
}

/**
 * Parses and executes a chained/piped shell-like string purely using spawn and pipelines.
 */
export async function executeLocalCommand(command: string): Promise<CommandExecutionResult> {
  const trimmedCmd = command.trim();
  const steps = trimmedCmd.split("&&");
  let finalStdout = "";
  let finalStderr = "";
  let lastCode = 0;
  let lastError: string | null = null;

  for (const step of steps) {
    const cleanStep = step.trim();
    if (!cleanStep) continue;

    let res: CommandExecutionResult;

    if (cleanStep.includes("|")) {
      const pipeParts = cleanStep.split("|");
      const pipeCommands = pipeParts.map((part) => {
        const words = parseCommandString(part.trim());
        const executable = words[0];
        const args = words.slice(1);
        return { executable, args };
      });

      // Double-check validation for pipeline parts
      for (const cmd of pipeCommands) {
        const binName = path.basename(cmd.executable).toLowerCase();
        if (!ALLOWED_TOOLS.includes(binName)) {
          return {
            stdout: finalStdout,
            stderr: finalStderr + `\n[Error: Lệnh '${binName}' không được phép thực thi]`,
            code: -1,
            error: `Từ chối thực thi lệnh: ${binName}`
          };
        }
      }

      res = await spawnPipeline(pipeCommands);
    } else {
      const words = parseCommandString(cleanStep);
      const executable = words[0];
      const args = words.slice(1);

      const binName = path.basename(executable).toLowerCase();
      if (!ALLOWED_TOOLS.includes(binName)) {
        return {
          stdout: finalStdout,
          stderr: finalStderr + `\n[Error: Lệnh '${binName}' không được phép thực thi]`,
          code: -1,
          error: `Từ chối thực thi lệnh: ${binName}`
        };
      }

      res = await spawnSingleCommand(executable, args);
    }

    finalStdout += res.stdout;
    if (res.stderr) {
      finalStderr += (finalStderr ? "\n" : "") + res.stderr;
    }
    lastCode = res.code;
    lastError = res.error;

    if (lastCode !== 0) {
      break; // Stop execution on failure
    }
  }

  return {
    stdout: finalStdout,
    stderr: finalStderr,
    code: lastCode,
    error: lastError
  };
}
