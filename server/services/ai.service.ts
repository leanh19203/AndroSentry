import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

export function getAiClient(): GoogleGenAI | null {
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

export interface ManifestAuditResult {
  score: number;
  summary: string;
  findings: Array<{
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
    title: string;
    description: string;
    location: string;
    remediation: string;
  }>;
}

export async function auditManifest(manifestContent: string, language: string = "vi"): Promise<ManifestAuditResult> {
  const ai = getAiClient();
  if (!ai) {
    throw new Error("Không thể kết nối với API Gemini. Vui lòng cấu hình API Key trong Settings > Secrets.");
  }

  let languagePrompt = "Hãy trả về kết quả đánh giá chi tiết bằng tiếng Việt dưới định dạng JSON với cấu trúc sau:";
  if (language === "en") {
    languagePrompt = "Please return the detailed audit results in English under the following JSON structure:";
  } else if (language === "ja") {
    languagePrompt = "監査結果の詳細を、以下のJSON構造に従って日本語で返してください。";
  }

  const prompt = `Bạn là một chuyên gia đánh giá bảo mật di động Android hàng đầu (Android Pentester) trên hệ điều hành Kali Linux.
Hãy phân tích tệp AndroidManifest.xml sau đây để phát hiện các lỗ hổng bảo mật, rủi ro cấu hình sai (misconfigurations) theo tiêu chuẩn OWASP Mobile Top 10 và MASVS.

Nội dung tệp AndroidManifest.xml:
\`\`\`xml
${manifestContent}
\`\`\`

${languagePrompt}
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
  return JSON.parse(resultText);
}

export interface ChatMessage {
  role: "user" | "assistant" | "model";
  content: string;
}

export async function chatAssistant(messages: ChatMessage[], language: string = "vi"): Promise<string> {
  const ai = getAiClient();
  if (!ai) {
    throw new Error("Không thể kết nối với API Gemini. Vui lòng cấu hình API Key trong Settings > Secrets.");
  }

  let systemInstruction = `Bạn là một trợ lý ảo trí tuệ nhân tạo thông minh, một Hacker mũ trắng và chuyên gia Pentester Android chuyên nghiệp hoạt động trên Kali Linux.
Nhiệm vụ của bạn là hỗ trợ người dùng (các nhà nghiên cứu bảo mật, kỹ sư pentest) thực hiện kiểm thử xâm nhập ứng dụng Android một cách an sau và có đạo đức.

Kiến thức chuyên môn của bạn bao gồm:
1. Sử dụng thành thạo các công cụ trên Kali Linux: adb, apktool, jadx-gui, frida, objection, msfvenom, apksigner, zipalign, drozer, MobSF.
2. Phân tích mã nguồn ngược (Reverse Engineering) các tệp APK thành mã Java/Kotlin, Smali hoặc bytecode để tìm lỗ hổng.
3. Vượt qua các lớp bảo mật như SSL Pinning (Certificate Pinning), Root Detection, Emulator Detection bằng script Frida hoặc vá APK.
4. Phát hiện các lỗ hổng OWASP Mobile Top 10 (lưu trữ không an toàn, mã hóa yếu, rò rỉ dữ liệu qua Logcat, lỗ hổng WebView, v.v.).
5. Đưa ra các giải pháp khắc phục bảo mật (Remediation) chất lượng cao cho nhà phát triển.

Hãy trả lời một cách súc tích, chuyên nghiệp, đi kèm mã lệnh (ADB, bash, script Frida, Java) rõ ràng. Luôn nhắc nhở người dùng sử dụng các kỹ thuật này vì mục đích học tập và kiểm thử hợp pháp.
Trả lời bằng tiếng Việt.`;

  if (language === "en") {
    systemInstruction = `You are an intelligent AI virtual assistant, an ethical White Hat Hacker, and a professional Android Pentesting expert operating on Linux.
Your mission is to help users (security researchers, pentest engineers) perform Android application penetration testing safely and ethically.

Your expertise includes:
1. Proficient use of tools on Linux: adb, apktool, jadx-gui, frida, objection, msfvenom, apksigner, zipalign, drozer, MobSF.
2. Reverse Engineering APK files back into Java/Kotlin, Smali, or bytecode to find vulnerabilities.
3. Bypassing security mechanisms like SSL Pinning (Certificate Pinning), Root Detection, and Emulator Detection using Frida scripts or patched APKs.
4. Identifying OWASP Mobile Top 10 vulnerabilities (insecure storage, weak cryptography, logcat data leaks, WebView vulnerabilities, etc.).
5. Providing high-quality security remediation guidelines for developers.

Please respond concisely and professionally, with clear instructions and code snippets (ADB, bash, Frida scripts, Java). Always remind users to use these techniques strictly for legal, educational, and authorized testing purposes.
Please reply in English.`;
  } else if (language === "ja") {
    systemInstruction = `あなたは優秀なAI仮想アシスタントであり、ホワイトハットハッカー、そしてKali Linux上で活動するプロフェッショナルなAndroid脆弱性診断・ペンテストの専門家です。
あなたの役割は、ユーザー（セキュリティ研究者やペンテストエンジニア）が安全かつ倫理的にAndroidアプリのペネトレーションテストを実行できるよう支援することです。

専門知識には以下が含まれます：
1. Kali Linuxツールの習熟：adb、apktool、jadx-gui、frida、objection、msfvenom、apksigner、zipalign、drozer、MobSF。
2. APKファイルをJava/Kotlin、Smali、またはバイトコードにリバースエンジニアリング（逆コンパイル）し、脆弱性を発見すること。
3. FridaスクリプトやAPK修正（パッチ）による、SSLピンニング（SSL Pinning）、ルート検知（Root Detection）、エミュレータ検知（Emulator Detection）などのセキュリティ機構 của バイパス。
4. OWASP Mobile Top 10の脆弱性の特定（安全でないストレージ、脆弱な暗号化、Logcat経由のデータ漏洩、WebViewの脆弱性など）。
5. 開発者向けの高品質なセキュリティ対策（修正・緩和策）の提示。

簡潔かつ専門的に回答し、明確なコード（ADB、bash、Fridaスクリプト、Java）を提供してください。法的および認可されたテストの範囲内でのみ使用するよう、常にユーザーに喚起してください。
日本語で回答してください。`;
  }

  // Format conversation history for Gemini API
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? ("model" as const) : ("user" as const),
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

  return response.text || "Xin lỗi, tôi không thể tạo câu trả lời vào lúc này.";
}

export interface FridaGenerationResult {
  script: string;
  explanation: string;
}

export async function generateFridaScript(prompt: string, language: string = "vi"): Promise<FridaGenerationResult> {
  const ai = getAiClient();
  if (!ai) {
    throw new Error("Không thể kết nối với API Gemini. Vui lòng cấu hình API Key trong Settings > Secrets.");
  }

  let languagePrompt = "Hãy trả về kết quả bằng tiếng Việt dưới định dạng JSON với cấu trúc sau:";
  if (language === "en") {
    languagePrompt = "Please return the results in English under the following JSON structure:";
  } else if (language === "ja") {
    languagePrompt = "結果を以下のJSON構造に従って日本語で返してください。";
  }

  const systemInstruction = `Bạn là một chuyên gia Pentester Android hàng đầu và là bậc thầy về viết Frida scripts (Frida API, Javascript).
Nhiệm vụ của bạn là nhận yêu cầu từ người dùng và sinh một đoạn mã script Frida Javascript chất lượng cao, chạy ổn định, không bị crash ứng dụng, hỗ trợ đầy đủ overload trong Java.use khi cần, có xử lý ngoại lệ và hiển thị thông tin log rõ ràng bằng console.log.

${languagePrompt}
{
  "script": "<Toàn bộ đoạn mã Javascript của Frida script, ví dụ: Java.perform(function() { ... })>",
  "explanation": "<Giải thích từng bước súc tích về cách hoạt động của script này và cách chạy nó bằng lệnh Frida cơ bản>"
}

Chú ý quan trọng: Chỉ trả về chuỗi JSON thuần túy, không bao bọc bằng ký tự markdown như \`\`\`json ở đầu và cuối.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
    },
  });

  const resultText = response.text || "{}";
  try {
    return JSON.parse(resultText);
  } catch (err) {
    return {
      script: `// Error parsing AI output. Here is the raw text from the model:\n${resultText}`,
      explanation: "Lỗi phân tích cú pháp kết quả trả về từ AI."
    };
  }
}

