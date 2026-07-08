import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { exec } from "child_process";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Parse JSON request bodies (increased limit for large manifests/code snippets)
app.use(express.json({ limit: "10mb" }));

// Initialize Google GenAI
let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  const currentKey = process.env.GEMINI_API_KEY;
  if (!currentKey) {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI features will be unavailable.");
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: currentKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    aiConfigured: !!process.env.GEMINI_API_KEY,
    time: new Date().toISOString(),
  });
});

// Endpoint: AI Android Manifest Security Audit
app.post("/api/audit-manifest", async (req, res) => {
  const { manifestContent } = req.body;

  if (!manifestContent || typeof manifestContent !== "string") {
    res.status(400).json({ error: "Yêu cầu nội dung tệp AndroidManifest.xml hợp lệ." });
    return;
  }

  const ai = getAiClient();
  if (!ai) {
    res.status(500).json({
      error: "Không thể kết nối với API Gemini. Vui lòng cấu hình API Key trong Settings > Secrets.",
    });
    return;
  }

  try {
    const prompt = `Bạn là một chuyên gia đánh giá bảo mật di động Android hàng đầu (Android Pentester) trên hệ điều hành Kali Linux.
Hãy phân tích tệp AndroidManifest.xml sau đây để phát hiện các lỗ hổng bảo mật, rủi ro cấu hình sai (misconfigurations) theo tiêu chuẩn OWASP Mobile Top 10 và MASVS.

Nội dung tệp AndroidManifest.xml:
\`\`\`xml
${manifestContent}
\`\`\`

Hãy trả về kết quả đánh giá chi tiết bằng tiếng Việt dưới định dạng JSON với cấu trúc sau:
{
  "score": <Điểm bảo mật từ 0 đến 100, ví dụ 65>,
  "summary": "<Tóm tắt ngắn gọn 2-3 câu về tình trạng bảo mật của tệp manifest này>",
  "findings": [
    {
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO",
      "title": "<Tên lỗ hổng/Cấu hình sai ngắn gọn, rõ ràng>",
      "description": "<Mô tả chi tiết lỗ hổng là gì và tại sao nó lại nguy hiểm trong thực tế>",
      "location": "<Tên thuộc tính hoặc thẻ gây ra lỗi, ví dụ: android:debuggable=\"true\" hoặc thẻ <receiver>>",
      "remediation": "<Hướng dẫn lập trình viên sửa lỗi chi tiết, kèm theo đoạn mã XML mẫu an toàn>"
    }
  ]
}

Chú ý: Chỉ trả về JSON thuần túy, không có mã markdown \`\`\`json ở đầu và cuối. Đảm bảo cấu trúc JSON hoàn toàn hợp lệ và có thể parse được.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Lỗi khi gọi API phân tích Manifest:", error);
    res.status(500).json({
      error: "Lỗi trong quá trình phân tích bằng trí tuệ nhân tạo.",
      details: error.message,
    });
  }
});

// Endpoint: AI Pentest Assistant Chatbot
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "Lịch sử trò chuyện (messages) không hợp lệ." });
    return;
  }

  const ai = getAiClient();
  if (!ai) {
    res.status(500).json({
      error: "Không thể kết nối với API Gemini. Vui lòng cấu hình API Key trong Settings > Secrets.",
    });
    return;
  }

  try {
    // Format conversation history for Gemini API
    const systemInstruction = `Bạn là một trợ lý ảo trí tuệ nhân tạo thông minh, một Hacker mũ trắng và chuyên gia Pentester Android chuyên nghiệp hoạt động trên Kali Linux.
Nhiệm vụ của bạn là hỗ trợ người dùng (các nhà nghiên cứu bảo mật, kỹ sư pentest) thực hiện kiểm thử xâm nhập ứng dụng Android một cách an toàn và có đạo đức.

Kiến thức chuyên môn của bạn bao gồm:
1. Sử dụng thành thạo các công cụ trên Kali Linux: adb, apktool, jadx-gui, frida, objection, msfvenom, apksigner, zipalign, drozer, MobSF.
2. Phân tích mã nguồn ngược (Reverse Engineering) các tệp APK thành mã Java/Kotlin, Smali hoặc bytecode để tìm lỗ hổng.
3. Vượt qua các lớp bảo mật như SSL Pinning (Certificate Pinning), Root Detection, Emulator Detection bằng script Frida hoặc vá APK.
4. Phát hiện các lỗ hổng OWASP Mobile Top 10 (lưu trữ không an toàn, mã hóa yếu, rò rỉ dữ liệu qua Logcat, lỗ hổng WebView, v.v.).
5. Đưa ra các giải pháp khắc phục bảo mật (Remediation) chất lượng cao cho nhà phát triển.

Hãy trả lời một cách súc tích, chuyên nghiệp, đi kèm mã lệnh (ADB, bash, script Frida, Java) rõ ràng. Luôn nhắc nhở người dùng sử dụng các kỹ thuật này vì mục đích học tập và kiểm thử hợp pháp.
Trả lời bằng tiếng Việt.`;

    // Construct contents
    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      role: "assistant",
      content: response.text || "Xin lỗi, tôi không thể tạo câu trả lời vào lúc này.",
    });
  } catch (error: any) {
    console.error("Lỗi trò chuyện AI Chat:", error);
    res.status(500).json({
      error: "Không thể thực hiện yêu cầu phân tích trò chuyện.",
      details: error.message,
    });
  }
});

// Endpoint: Safe Live Command Execution (For Local Kali Linux)
app.post("/api/execute-command", (req, res) => {
  const { command } = req.body;

  // Check if request originates from localhost (safety guard for public staging/Cloud Run)
  // ONLY rely on req.ip (peer IP) to prevent Host Header spoofing / Host Header Injection
  const isLocal =
    req.ip === "127.0.0.1" ||
    req.ip === "::1" ||
    req.ip === "::ffff:127.0.0.1";

  // If in production environment and not local, prevent execution
  if (process.env.NODE_ENV === "production" && !isLocal) {
    res.status(403).json({
      error: "Vì lý do bảo mật, tính năng thực thi lệnh trực tiếp bị vô hiệu hóa trên môi trường Cloud/Web công cộng. Hãy tải mã nguồn về và chạy trên Kali Linux của bạn (localhost) để kích hoạt toàn quyền điều khiển thiết bị!",
      isLocal: false,
    });
    return;
  }

  if (!command || typeof command !== "string") {
    res.status(400).json({ error: "Lệnh thực thi không hợp lệ." });
    return;
  }

  const trimmedCmd = command.trim();

  // 1. Strict Redirection, Shell Expansion and Multi-line Block (Security Hardening)
  // Disallow redirection (>, <), backticks (`), command substitution ($(), and multi-line commands (\n, \r)
  if (/[><`]/.test(trimmedCmd) || /\$\(/.test(trimmedCmd) || /[\r\n]/.test(trimmedCmd)) {
    res.status(403).json({
      error: "Từ chối thực thi: Để bảo mật hệ thống, không cho phép sử dụng các toán tử chuyển hướng ('>', '<'), ký tự thực thi phụ ('`', '$(') hoặc các lệnh xuống dòng.",
    });
    return;
  }

  // 2. Allowed pentest tools whitelist
  const allowedTools = [
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

  // 3. Segment Validation: Split by execution delimiters (&&, ||, ;, |)
  // This ensures chained commands or pipeline commands are fully validated.
  const segments = trimmedCmd.split(/&&|\|\||;|\|/);

  for (const segment of segments) {
    const cleanSegment = segment.trim();
    if (!cleanSegment) continue;

    // Get the first word of the segment representing the executable command
    const firstWord = cleanSegment.split(/\s+/)[0];
    const binaryName = path.basename(firstWord).toLowerCase();

    // Check if the binary is allowed
    const isAllowed = allowedTools.some(tool => binaryName === tool || binaryName.startsWith(tool));

    if (!isAllowed) {
      res.status(403).json({
        error: `Từ chối thực thi: Thành phần lệnh '${cleanSegment}' bắt đầu bằng công cụ '${binaryName}' nằm ngoài danh mục công cụ Pentest được phép (adb, apktool, keytool, apksigner, zipalign, frida, jadx, grep).`,
      });
      return;
    }

    // 4. Heavy Blocklist Checks on commands/arguments (Blocking reverse shells, downloaders, destructors)
    const blocklistPattern = /(rm\s+-rf|wget|curl|bash|sh\s+-c|nc\s+|netcat|ncat|python|perl|ruby|gcc|clang|\/etc\/passwd|id\s+|whoami)/i;
    if (cleanSegment.match(blocklistPattern)) {
      res.status(403).json({
        error: "Từ chối thực thi: Phát hiện từ khóa bị cấm hoặc các tham số có nguy cơ khai thác hệ thống tiềm ẩn.",
      });
      return;
    }
  }

  console.log(`[EXECUTE] Running local secure command: ${trimmedCmd}`);

  exec(trimmedCmd, { timeout: 45000 }, (error, stdout, stderr) => {
    res.json({
      stdout: stdout || "",
      stderr: stderr || "",
      code: error ? error.code : 0,
      error: error ? error.message : null,
    });
  });
});

// Endpoint: Download User Guide Document (.docx)
app.get("/api/download-guide", (req, res) => {
  const filePath = path.join(process.cwd(), "Huong_Dan_Su_Dung_Kali_Android_Pentest_GUI.docx");
  if (fs.existsSync(filePath)) {
    res.setHeader("Content-Disposition", "attachment; filename=Huong_Dan_Su_Dung_Kali_Android_Pentest_GUI.docx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: "Tệp hướng dẫn sử dụng không tồn tại. Vui lòng chạy lệnh tạo file trước." });
  }
});

// Endpoint: Download User Guide Document (.md)
app.get("/api/download-guide-md", (req, res) => {
  const filePath = path.join(process.cwd(), "Huong_Dan_Su_Dung_Kali_Android_Pentest_GUI.md");
  if (fs.existsSync(filePath)) {
    res.setHeader("Content-Disposition", "attachment; filename=Huong_Dan_Su_Dung_Kali_Android_Pentest_GUI.md");
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: "Tệp hướng dẫn sử dụng Markdown không tồn tại." });
  }
});

// Endpoint: Read User Guide Document (.md) for web display
app.get("/api/read-guide", (req, res) => {
  const filePath = path.join(process.cwd(), "Huong_Dan_Su_Dung_Kali_Android_Pentest_GUI.md");
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      res.json({ content });
    } catch (err: any) {
      res.status(500).json({ error: "Không thể đọc tệp hướng dẫn sử dụng.", details: err.message });
    }
  } else {
    res.status(404).json({ error: "Tệp hướng dẫn sử dụng Markdown không tồn tại." });
  }
});

// ----------------------------------------------------
// VITE AND STATIC SERVING MIDDLEWARE
// ----------------------------------------------------
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Static files serving production loaded.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Android Pentest Companion] Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
