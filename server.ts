import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Parse JSON request bodies (increased limit for large manifests/code snippets)
app.use(express.json({ limit: "10mb" }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI features will be unavailable.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
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
    aiConfigured: !!apiKey,
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
      model: "gemini-3.5-flash",
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
      model: "gemini-3.5-flash",
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
