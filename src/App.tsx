import React, { useState, useEffect } from "react";
import {
  Terminal,
  Shield,
  FileCode,
  Layers,
  Cpu,
  Copy,
  Check,
  Send,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Palette,
  Code,
  Info,
  Smartphone,
  CheckCircle,
  XCircle,
  ArrowRight,
  Search,
  MessageSquare,
  FileText,
  Download,
  BookOpen,
  Eye,
  X
} from "lucide-react";
import { ADB_COMMANDS, APKTOOL_STEPS, FRIDA_SCRIPTS } from "./commandsData";
import { AdbCommand, ManifestFinding, AuditResult, ChatMessage } from "./types";

export const THEME_CONFIGS = {
  "kali-dark": {
    name: "Kali Cyber (Mặc định)",
    variables: {
      "--bg-primary": "#0d1117",
      "--bg-secondary": "#161b22",
      "--bg-header": "#161b22",
      "--border-color": "#30363d",
      "--border-header": "#21262d",
      "--accent-color": "#ef4444",
      "--accent-hover": "#dc2626",
      "--accent-rgb": "239, 68, 68",
      "--text-primary": "#c9d1d9",
      "--text-secondary": "#8b949e"
    }
  },
  "nord-tech": {
    name: "Nord Operator (Xanh Băng)",
    variables: {
      "--bg-primary": "#2e3440",
      "--bg-secondary": "#3b4252",
      "--bg-header": "#3b4252",
      "--border-color": "#4c566a",
      "--border-header": "#434c5e",
      "--accent-color": "#88c0d0",
      "--accent-hover": "#81a1c1",
      "--accent-rgb": "136, 192, 208",
      "--text-primary": "#e5e9f0",
      "--text-secondary": "#8892b0"
    }
  },
  "dracula": {
    name: "Dracula (Huyền Bí)",
    variables: {
      "--bg-primary": "#1e1f29",
      "--bg-secondary": "#282a36",
      "--bg-header": "#282a36",
      "--border-color": "#44475a",
      "--border-header": "#343746",
      "--accent-color": "#ff79c6",
      "--accent-hover": "#ff92df",
      "--accent-rgb": "255, 121, 198",
      "--text-primary": "#f8f8f2",
      "--text-secondary": "#6272a4"
    }
  },
  "matrix-forest": {
    name: "Matrix Code (Đặc Vụ)",
    variables: {
      "--bg-primary": "#020503",
      "--bg-secondary": "#091008",
      "--bg-header": "#091008",
      "--border-color": "#1e3a1e",
      "--border-header": "#152a15",
      "--accent-color": "#22c55e",
      "--accent-hover": "#15803d",
      "--accent-rgb": "34, 197, 94",
      "--text-primary": "#a7f3d0",
      "--text-secondary": "#34d399"
    }
  },
  "white-hat": {
    name: "White Hat (Chuyên Gia)",
    variables: {
      "--bg-primary": "#f8fafc",
      "--bg-secondary": "#ffffff",
      "--bg-header": "#1e293b",
      "--border-color": "#e2e8f0",
      "--border-header": "#cbd5e1",
      "--accent-color": "#2563eb",
      "--accent-hover": "#1d4ed8",
      "--accent-rgb": "37, 99, 235",
      "--text-primary": "#1e293b",
      "--text-secondary": "#475569"
    }
  }
};

// Sample vulnerable AndroidManifest.xml for user testing
const SAMPLE_MANIFEST = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.vulnerable.bankingapp"
    android:versionCode="1"
    android:versionName="1.0">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />

    <application
        android:allowBackup="true"
        android:debuggable="true"
        android:theme="@style/AppTheme"
        android:hardwareAccelerated="true"
        android:networkSecurityConfig="@xml/network_security_config">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Lỗ hổng: Activity nhạy cảm xuất khẩu mà không có quyền bảo vệ -->
        <activity
            android:name=".AdminDashboardActivity"
            android:exported="true" />

        <!-- Lỗ hổng: Receiver nhận lệnh khôi phục mật khẩu không an toàn -->
        <receiver
            android:name=".PasswordResetReceiver"
            android:exported="true">
            <intent-filter>
                <action android:name="com.vulnerable.bankingapp.RESET_PASSWORD" />
            </intent-filter>
        </receiver>

        <!-- Lỗ hổng: Content Provider cho phép truy cập tệp tùy ý -->
        <provider
            android:name=".UserDataProvider"
            android:authorities="com.vulnerable.bankingapp.provider"
            android:exported="true"
            android:grantUriPermissions="true" />

    </application>
</manifest>`;

export default function App() {
  const [activeTab, setActiveTab] = useState<"adb" | "manifest" | "apktool" | "frida" | "chat">("adb");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // General variables for interactive builders
  const [packageName, setPackageName] = useState("com.example.app");
  const [activityName, setActivityName] = useState("com.example.app.MainActivity");
  const [actionName, setActionName] = useState("com.example.app.CUSTOM_ACTION");
  const [apkPath, setApkPath] = useState("/data/app/~~.../base.apk");
  const [filterKeyword, setFilterKeyword] = useState("com.example.app");
  const [localPort, setLocalPort] = useState("27042");
  const [devicePort, setDevicePort] = useState("27042");

  // Apktool variables
  const [apktoolFileName, setApktoolFileName] = useState("app_target");
  const [apktoolOutputDir, setApktoolOutputDir] = useState("decompiled_src");

  // Manifest Audit State
  const [manifestText, setManifestText] = useState(SAMPLE_MANIFEST);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Xin chào! Tôi là Trợ lý AI Pentest Android trên Kali Linux. Bạn cần tôi hỗ trợ phân tích mã nguồn, tạo script bypass root/SSL pinning, viết payload, hay giải thích cơ chế bảo mật của Android?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [userChatInput, setUserChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Terminal Emulator State
  const [terminalHistory, setTerminalHistory] = useState<{ command: string; output: string; isError: boolean; timestamp: string }[]>([
    {
      command: "adb devices",
      output: "List of devices attached\nemulator-5554\tdevice\n\n[INFO] Hệ thống giả lập sẵn sàng.",
      isError: false,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [isExecutingCmd, setIsExecutingCmd] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);

  const handleExecuteCommand = async (cmdString: string) => {
    setShowTerminal(true);
    setIsExecutingCmd(true);

    const newHistoryItem = {
      command: cmdString,
      output: " đang thực thi lệnh trên Kali Linux...",
      isError: false,
      timestamp: new Date().toLocaleTimeString()
    };

    setTerminalHistory(prev => [...prev, newHistoryItem]);
    const targetIdx = terminalHistory.length; // Index since we just appended one

    try {
      const response = await fetch("/api/execute-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmdString })
      });

      const data = await response.json();

      setTerminalHistory(prev => {
        const copy = [...prev];
        if (response.ok) {
          let output = "";
          if (data.stdout) output += data.stdout;
          if (data.stderr) output += `\n[STDERR]\n${data.stderr}`;
          if (!data.stdout && !data.stderr) output = "Lệnh đã hoàn thành thành công nhưng không có kết quả văn bản (No Output).";

          copy[targetIdx] = {
            command: cmdString,
            output: output,
            isError: !!data.error || data.code !== 0,
            timestamp: new Date().toLocaleTimeString()
          };
        } else {
          copy[targetIdx] = {
            command: cmdString,
            output: `Lỗi: ${data.error || "Thực thi thất bại."}`,
            isError: true,
            timestamp: new Date().toLocaleTimeString()
          };
        }
        return copy;
      });
    } catch (err: any) {
      setTerminalHistory(prev => {
        const copy = [...prev];
        copy[targetIdx] = {
          command: cmdString,
          output: `Lỗi kết nối: ${err.message || "Không thể kết nối đến server Kali Localhost."}`,
          isError: true,
          timestamp: new Date().toLocaleTimeString()
        };
        return copy;
      });
    } finally {
      setIsExecutingCmd(false);
    }
  };

  // Quick setup check state
  const [healthStatus, setHealthStatus] = useState<{ aiConfigured: boolean; checked: boolean }>({
    aiConfigured: false,
    checked: false,
  });

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setHealthStatus({ aiConfigured: data.aiConfigured, checked: true });
      })
      .catch(() => {
        setHealthStatus({ aiConfigured: false, checked: true });
      });
  }, []);

  const [isDownloadingGuide, setIsDownloadingGuide] = useState(false);
  const [isDownloadingGuideMd, setIsDownloadingGuideMd] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [guideContent, setGuideContent] = useState("");
  const [isLoadingGuideContent, setIsLoadingGuideContent] = useState(false);

  // Theme state: "kali-dark" | "nord-tech" | "dracula" | "matrix-forest" | "white-hat"
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    return localStorage.getItem("kali-android-pentest-theme") || "kali-dark";
  });

  const changeTheme = (newTheme: string) => {
    setCurrentTheme(newTheme);
    localStorage.setItem("kali-android-pentest-theme", newTheme);
  };

  useEffect(() => {
    const activeThemeVars = THEME_CONFIGS[currentTheme as keyof typeof THEME_CONFIGS]?.variables || THEME_CONFIGS["kali-dark"].variables;
    const root = document.documentElement;
    Object.entries(activeThemeVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [currentTheme]);

  const handleDownloadGuide = async () => {
    if (isDownloadingGuide) return;
    setIsDownloadingGuide(true);
    try {
      const response = await fetch("/api/download-guide");
      if (!response.ok) {
        throw new Error("Tệp tài liệu không tồn tại hoặc lỗi máy chủ.");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Huong_Dan_Su_Dung_Kali_Android_Pentest_GUI.docx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Lỗi tải tài liệu:", error);
    } finally {
      setIsDownloadingGuide(false);
    }
  };

  const handleDownloadGuideMd = async () => {
    if (isDownloadingGuideMd) return;
    setIsDownloadingGuideMd(true);
    try {
      const response = await fetch("/api/download-guide-md");
      if (!response.ok) {
        throw new Error("Tệp tài liệu Markdown không tồn tại hoặc lỗi máy chủ.");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Huong_Dan_Su_Dung_Kali_Android_Pentest_GUI.md";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Lỗi tải tài liệu Markdown:", error);
    } finally {
      setIsDownloadingGuideMd(false);
    }
  };

  const handleOpenGuide = async () => {
    setIsGuideOpen(true);
    if (guideContent) return;
    setIsLoadingGuideContent(true);
    try {
      const response = await fetch("/api/read-guide");
      if (!response.ok) {
        throw new Error("Không thể đọc tệp tài liệu hướng dẫn.");
      }
      const data = await response.json();
      setGuideContent(data.content || "");
    } catch (error: any) {
      console.error("Lỗi đọc tài liệu:", error);
      setGuideContent("Không thể tải nội dung hướng dẫn sử dụng. Vui lòng thử lại.");
    } finally {
      setIsLoadingGuideContent(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const parseInlineStyles = (text: string): React.ReactNode[] => {
    // Basic parser for **bold** and `code`
    let parts: React.ReactNode[] = [text];

    // Parse bold **text**
    const boldRegex = /\*\*(.*?)\*\*/g;
    let newParts: React.ReactNode[] = [];
    for (const part of parts) {
      if (typeof part === "string") {
        let lastIndex = 0;
        let match;
        const subParts: React.ReactNode[] = [];
        let indexKey = 0;
        while ((match = boldRegex.exec(part)) !== null) {
          if (match.index > lastIndex) {
            subParts.push(part.slice(lastIndex, match.index));
          }
          subParts.push(
            <strong key={`bold-${match.index}-${indexKey++}`} className="text-white font-semibold">
              {match[1]}
            </strong>
          );
          lastIndex = boldRegex.lastIndex;
        }
        if (lastIndex < part.length) {
          subParts.push(part.slice(lastIndex));
        }
        newParts.push(...subParts);
      } else {
        newParts.push(part);
      }
    }
    parts = newParts;

    // Parse inline code `code`
    const codeRegex = /`(.*?)`/g;
    newParts = [];
    for (const part of parts) {
      if (typeof part === "string") {
        let lastIndex = 0;
        let match;
        const subParts: React.ReactNode[] = [];
        let indexKey = 0;
        while ((match = codeRegex.exec(part)) !== null) {
          if (match.index > lastIndex) {
            subParts.push(part.slice(lastIndex, match.index));
          }
          subParts.push(
            <code key={`code-${match.index}-${indexKey++}`} className="font-mono bg-red-500/10 border border-red-500/25 text-red-400 px-1.5 py-0.5 rounded text-xs select-all">
              {match[1]}
            </code>
          );
          lastIndex = codeRegex.lastIndex;
        }
        if (lastIndex < part.length) {
          subParts.push(part.slice(lastIndex));
        }
        newParts.push(...subParts);
      } else {
        newParts.push(part);
      }
    }
    parts = newParts;

    return parts;
  };

  const renderFormattedMarkdown = (markdownText: string) => {
    if (!markdownText) return null;
    const lines = markdownText.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={`empty-${idx}`} className="h-2"></div>;

      // Divider
      if (trimmed === "---") {
        return <hr key={`divider-${idx}`} className="my-6 border-[#30363d]" />;
      }

      // Headers
      if (trimmed.startsWith("# ")) {
        return (
          <h1 key={`h1-${idx}`} className="text-2xl font-extrabold text-white mt-6 mb-4 tracking-tight border-b border-[#30363d] pb-2 text-red-500 flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            {parseInlineStyles(trimmed.slice(2))}
          </h1>
        );
      }
      if (trimmed.startsWith("## ")) {
        return (
          <h2 key={`h2-${idx}`} className="text-xl font-bold text-white mt-5 mb-3 tracking-tight text-cyan-400">
            {parseInlineStyles(trimmed.slice(3))}
          </h2>
        );
      }
      if (trimmed.startsWith("### ")) {
        return (
          <h3 key={`h3-${idx}`} className="text-lg font-bold text-white mt-4 mb-2 tracking-tight text-amber-400">
            {parseInlineStyles(trimmed.slice(4))}
          </h3>
        );
      }

      // Lists
      if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
        const content = trimmed.slice(2);
        return (
          <div key={`li-${idx}`} className="flex items-start gap-2.5 my-1.5 pl-4 text-sm leading-relaxed text-[#c9d1d9]">
            <span className="text-cyan-500 mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
            <div>{parseInlineStyles(content)}</div>
          </div>
        );
      }

      if (/^\d+\.\s+/.test(trimmed)) {
        const numMatch = trimmed.match(/^(\d+)\.\s+/);
        const num = numMatch ? numMatch[1] : "";
        const content = trimmed.replace(/^\d+\.\s+/, "");
        return (
          <div key={`ol-${idx}`} className="flex items-start gap-2.5 my-1.5 pl-4 text-sm leading-relaxed text-[#c9d1d9]">
            <span className="text-red-500 font-mono font-bold mt-0.5 flex-shrink-0 text-xs">{num}.</span>
            <div>{parseInlineStyles(content)}</div>
          </div>
        );
      }

      // Regular paragraph
      return (
        <p key={`p-${idx}`} className="my-2.5 text-sm leading-relaxed text-[#c9d1d9] text-justify">
          {parseInlineStyles(trimmed)}
        </p>
      );
    });
  };

  // Process command parameters based on user input
  const getProcessedCommand = (cmd: AdbCommand) => {
    let finalCmd = cmd.command;
    finalCmd = finalCmd.replace(/\[PACKAGE_NAME\]/g, packageName);
    finalCmd = finalCmd.replace(/\[ACTIVITY_NAME\]/g, activityName);
    finalCmd = finalCmd.replace(/\[ACTION_NAME\]/g, actionName);
    finalCmd = finalCmd.replace(/\[APK_PATH_ON_DEVICE\]/g, apkPath);
    finalCmd = finalCmd.replace(/\[FILTER_KEYWORD\]/g, filterKeyword);
    finalCmd = finalCmd.replace(/\[LOCAL_PORT\]/g, localPort);
    finalCmd = finalCmd.replace(/\[DEVICE_PORT\]/g, devicePort);
    return finalCmd;
  };

  // Run AI Manifest Audit
  const handleManifestAudit = async () => {
    if (!manifestText.trim()) {
      setAuditError("Vui lòng nhập hoặc dán nội dung tệp AndroidManifest.xml.");
      return;
    }

    setIsAuditing(true);
    setAuditError(null);
    setAuditResult(null);

    try {
      const response = await fetch("/api/audit-manifest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manifestContent: manifestText }),
      });

      const data = await response.json();
      if (response.ok) {
        setAuditResult(data);
      } else {
        setAuditError(data.error || "Có lỗi bất ngờ xảy ra trong quá trình phân tích.");
      }
    } catch (err: any) {
      setAuditError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại cấu hình ứng dụng.");
    } finally {
      setIsAuditing(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!auditResult) return;
    
    let md = `# BÁO CÁO ĐÁNH GIÁ BẢO MẬT ANDROID MANIFEST\n`;
    md += `*Thời gian thực hiện: ${new Date().toLocaleString("vi-VN")}*\n`;
    md += `*Điểm số bảo mật hệ thống: **${auditResult.score}/100***\n\n`;
    md += `## 1. Tóm tắt đánh giá\n`;
    md += `${auditResult.summary}\n\n`;
    md += `## 2. Danh sách lỗ hổng phát hiện (${auditResult.findings?.length || 0})\n\n`;
    
    if (auditResult.findings && auditResult.findings.length > 0) {
      auditResult.findings.forEach((finding, idx) => {
        md += `### [${finding.severity}] ${idx + 1}. ${finding.title}\n`;
        md += `- **Mức độ nghiêm trọng:** ${finding.severity}\n`;
        md += `- **Vị trí phát hiện:** \`${finding.location}\`\n\n`;
        md += `#### Mô tả chi tiết:\n${finding.description}\n\n`;
        md += `#### Cách khắc phục & Khuyến nghị:\n\`\`\`xml\n${finding.remediation}\n\`\`\`\n\n`;
        md += `---\n\n`;
      });
    } else {
      md += `🎉 Tuyệt vời! Không phát hiện bất kỳ lỗ hổng bảo mật nghiêm trọng nào.\n`;
    }
    
    md += `\n*Báo cáo được tạo tự động bởi Kali Android Pentest GUI - Trí tuệ nhân tạo hỗ trợ White Hat Hacker.*\n`;

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bao_Cao_Mat_An_AndroidManifest_${new Date().toISOString().slice(0,10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportHtml = () => {
    if (!auditResult) return;

    let findingsHtml = "";
    if (auditResult.findings && auditResult.findings.length > 0) {
      auditResult.findings.forEach((finding, idx) => {
        let severityColor = "gray";
        if (finding.severity === "CRITICAL") severityColor = "#ef4444";
        else if (finding.severity === "HIGH") severityColor = "#f97316";
        else if (finding.severity === "MEDIUM") severityColor = "#eab308";
        else if (finding.severity === "LOW") severityColor = "#3b82f6";

        findingsHtml += `
        <div class="finding-card">
          <div class="finding-header">
            <span class="finding-title">${idx + 1}. ${finding.title}</span>
            <span class="severity-badge" style="background: ${severityColor}20; color: ${severityColor}; border: 1px solid ${severityColor}40;">${finding.severity}</span>
          </div>
          <p class="finding-desc"><strong>Mô tả rủi ro:</strong> ${finding.description}</p>
          <div class="finding-location"><strong>Vị trí phát hiện:</strong> <code>${finding.location}</code></div>
          <div class="remediation-block">
            <strong>Cách khắc phục đề xuất:</strong>
            <pre><code>${finding.remediation.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>
          </div>
        </div>
        `;
      });
    } else {
      findingsHtml = `<p style="text-align:center; color:#8b949e; padding: 40px 0;">🎉 Tuyệt vời! Không phát hiện lỗ hổng bảo mật nào trong file AndroidManifest.xml này.</p>`;
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Báo cáo Đánh giá Bảo mật AndroidManifest.xml</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #0d1117;
          color: #c9d1d9;
          margin: 0;
          padding: 40px 20px;
          line-height: 1.6;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        }
        h1 {
          color: #ef4444;
          font-size: 24px;
          border-bottom: 2px solid #30363d;
          padding-bottom: 10px;
          margin-top: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .meta-info {
          font-size: 13px;
          color: #8b949e;
          margin-bottom: 25px;
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #21262d;
          padding-bottom: 15px;
        }
        .score-badge {
          background: ${auditResult.score >= 80 ? '#10b98120' : auditResult.score >= 50 ? '#f59e0b20' : '#ef444420'};
          color: ${auditResult.score >= 80 ? '#10b981' : auditResult.score >= 50 ? '#f59e0b' : '#ef4444'};
          font-weight: bold;
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid ${auditResult.score >= 80 ? '#10b98140' : auditResult.score >= 50 ? '#f59e0b40' : '#ef444440'};
        }
        .summary-box {
          background: #1f242c;
          border: 1px solid #30363d;
          border-radius: 8px;
          padding: 15px 20px;
          margin-bottom: 30px;
        }
        .summary-box h2 {
          font-size: 16px;
          color: #ffffff;
          margin-top: 0;
          margin-bottom: 8px;
        }
        .finding-card {
          background: #0d1117;
          border: 1px solid #21262d;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .finding-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
          gap: 15px;
        }
        .finding-title {
          font-weight: bold;
          font-size: 16px;
          color: #ffffff;
        }
        .severity-badge {
          font-size: 11px;
          font-family: monospace;
          font-weight: bold;
          padding: 3px 8px;
          border-radius: 4px;
        }
        .finding-desc {
          font-size: 14px;
          margin-bottom: 12px;
          color: #c9d1d9;
        }
        .finding-location {
          font-size: 13px;
          font-family: monospace;
          color: #8b949e;
          background: #161b22;
          padding: 6px 12px;
          border-radius: 4px;
          border: 1px solid #21262d;
          margin-bottom: 15px;
        }
        .remediation-block {
          background: #161b22;
          border-left: 3px solid #10b981;
          border-radius: 0 4px 4px 0;
          padding: 12px 15px;
        }
        .remediation-block strong {
          font-size: 12px;
          color: #10b981;
          text-transform: uppercase;
          display: block;
          margin-bottom: 5px;
        }
        pre {
          background: #0d1117;
          padding: 10px;
          border-radius: 4px;
          overflow-x: auto;
          margin: 5px 0 0 0;
          border: 1px solid #21262d;
        }
        code {
          font-family: 'Courier New', Courier, monospace;
          font-size: 12px;
        }
        .footer {
          text-align: center;
          font-size: 11px;
          color: #8b949e;
          margin-top: 40px;
          border-top: 1px solid #21262d;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🛡️ Báo cáo Bảo mật AndroidManifest.xml</h1>
        <div class="meta-info">
          <span>Thời gian: ${new Date().toLocaleString("vi-VN")}</span>
          <div>
            <span>Đánh giá chung: </span>
            <span class="score-badge">${auditResult.score}/100</span>
          </div>
        </div>

        <div class="summary-box">
          <h2>Tóm tắt kiểm định</h2>
          <p style="margin: 0; font-size: 14px; color: #8b949e;">${auditResult.summary}</p>
        </div>

        <h3 style="color: #ffffff; border-bottom: 1px solid #30363d; padding-bottom: 8px; margin-bottom: 20px;">Danh sách lỗ hổng (${auditResult.findings?.length || 0})</h3>
        ${findingsHtml}

        <div class="footer">
          Báo cáo bảo mật được kết xuất bởi Kali Android Pentest GUI - Trợ lý Kiểm thử Xâm nhập Di động Chuyên nghiệp.
        </div>
      </div>
    </body>
    </html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bao_Cao_Mat_An_AndroidManifest_${new Date().toISOString().slice(0,10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Submit chat message
  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userChatInput.trim() || isSendingChat) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: userChatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    const inputToSend = userChatInput;
    setUserChatInput("");
    setIsSendingChat(true);

    try {
      // Build history
      const history = [...chatMessages, userMsg].map((m) => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      const data = await response.json();
      if (response.ok) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            role: "assistant",
            content: data.content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            role: "assistant",
            content: `⚠️ Lỗi: ${data.error || "Không thể tải phản hồi từ trợ lý ảo."}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "assistant",
          content: "⚠️ Lỗi kết nối mạng: Không thể truyền dữ liệu đến máy chủ AI.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity.toUpperCase()) {
      case "CRITICAL":
        return "bg-red-500/15 text-red-400 border border-red-500/30";
      case "HIGH":
        return "bg-orange-500/15 text-orange-400 border border-orange-500/30";
      case "MEDIUM":
        return "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30";
      case "LOW":
        return "bg-blue-500/15 text-blue-400 border border-blue-500/30";
      default:
        return "bg-gray-500/15 text-gray-400 border border-gray-500/30";
    }
  };

  const activeThemeVars = THEME_CONFIGS[currentTheme as keyof typeof THEME_CONFIGS]?.variables || THEME_CONFIGS["kali-dark"].variables;

  return (
    <div 
      className="min-h-screen bg-primary-bg text-txt-main flex flex-col selection:bg-accent/35 selection:text-white transition-[padding-bottom] duration-300" 
      id="app-root"
      style={{ paddingBottom: showTerminal ? "320px" : "44px", ...activeThemeVars as React.CSSProperties }}
    >
      {/* HEADER BAR */}
      <header className="border-b border-border-head bg-secondary-bg px-6 py-4 sticky top-0 z-50 shadow-md transition-all duration-300" id="header-bar">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4" id="header-content">
          <div className="flex items-center gap-3" id="logo-section">
            <div className="p-2.5 bg-accent/10 rounded-xl border border-accent/30 text-accent shadow-inner shadow-accent/10 transition-all duration-300" id="logo-icon-container">
              <Shield className="w-7 h-7 animate-pulse" id="logo-icon" />
            </div>
            <div id="logo-text">
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Kali Android Pentest GUI <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-mono transition-all duration-300">v1.1</span>
              </h1>
              <p className="text-xs text-txt-muted transition-colors duration-300">Hộp công cụ & Hỗ trợ kiểm thử bảo mật ứng dụng Android cho Kali Linux</p>
            </div>
          </div>
 
          {/* Quick status checks */}
          <div className="flex flex-wrap items-center gap-3 text-xs" id="status-checks">
            {/* Theme Selector */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-bg border border-border-main text-txt-muted hover:border-accent/40 transition-all duration-300" id="theme-selector-container">
              <Palette className="w-3.5 h-3.5 text-accent transition-colors duration-300" />
              <select
                value={currentTheme}
                onChange={(e) => changeTheme(e.target.value)}
                className="bg-transparent border-none text-white text-xs focus:ring-0 focus:outline-none font-medium cursor-pointer"
                id="theme-select"
                title="Thay đổi giao diện ứng dụng"
              >
                {Object.entries(THEME_CONFIGS).map(([key, config]) => (
                  <option key={key} value={key} className="bg-secondary-bg text-txt-main">
                    {config.name}
                  </option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleOpenGuide}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/35 border border-emerald-500/30 text-emerald-400 hover:text-white transition-all cursor-pointer font-medium" 
              id="view-guide-btn"
              title="Xem hướng dẫn sử dụng ngay trên ứng dụng"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Xem HDSD</span>
              <Eye className="w-3 h-3 opacity-70" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-bg border border-border-main" id="env-badge">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-txt-muted">Kali OS Emulator Mode</span>
            </div>
            {healthStatus.checked && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                healthStatus.aiConfigured 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                  : "bg-amber-500/10 border-amber-500/20 text-amber-400"
              }`} id="ai-status-badge">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{healthStatus.aiConfigured ? "AI: Sẵn sàng" : "AI: Chưa cấu hình Key"}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* DETAILED APPS BANNER / TIPS */}
      <div className="bg-secondary-bg/60 border-b border-border-main py-3.5 px-6 text-xs text-txt-muted transition-all duration-300" id="info-bar">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 w-full" id="local-pentest-checklist">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Smartphone className="w-4 h-4 text-accent" />
              <span>HƯỚNG DẪN NHANH:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-accent/10 text-accent flex items-center justify-center font-mono text-[10px] font-bold border border-accent/30">1</span>
              <span>Bật <strong>Gỡ lỗi USB</strong> trên điện thoại Android</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-accent/10 text-accent flex items-center justify-center font-mono text-[10px] font-bold border border-accent/30">2</span>
              <span>Chạy lệnh <code className="bg-primary-bg px-1 rounded text-emerald-400 font-mono text-[11px] border border-border-main">adb devices</code> để kiểm tra kết nối</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-accent/10 text-accent flex items-center justify-center font-mono text-[10px] font-bold border border-accent/30">3</span>
              <span>Chạy <code className="bg-primary-bg px-1 rounded text-accent font-mono text-[11px] border border-border-main">export GEMINI_API_KEY="key"</code> để dùng AI</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6" id="main-content">
        
        {/* TAB NAVIGATION */}
        <div className="flex flex-wrap gap-2 border-b border-border-head pb-px" id="tab-navigation">
          <button
            id="tab-adb-btn"
            onClick={() => setActiveTab("adb")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "adb"
                ? "border-accent text-txt-main bg-secondary-bg"
                : "border-transparent text-txt-muted hover:text-txt-main hover:bg-secondary-bg/30"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Trình tạo Lệnh ADB</span>
          </button>

          <button
            id="tab-manifest-btn"
            onClick={() => setActiveTab("manifest")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "manifest"
                ? "border-accent text-txt-main bg-secondary-bg"
                : "border-transparent text-txt-muted hover:text-txt-main hover:bg-secondary-bg/30"
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>AI Audit Manifest</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-normal">Trí Tuệ Nhân Tạo</span>
          </button>

          <button
            id="tab-apktool-btn"
            onClick={() => setActiveTab("apktool")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "apktool"
                ? "border-accent text-txt-main bg-secondary-bg"
                : "border-transparent text-txt-muted hover:text-txt-main hover:bg-secondary-bg/30"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Quy trình Apktool</span>
          </button>

          <button
            id="tab-frida-btn"
            onClick={() => setActiveTab("frida")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "frida"
                ? "border-accent text-txt-main bg-secondary-bg"
                : "border-transparent text-txt-muted hover:text-txt-main hover:bg-secondary-bg/30"
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Thư viện Frida</span>
          </button>

          <button
            id="tab-chat-btn"
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "chat"
                ? "border-accent text-txt-main bg-secondary-bg"
                : "border-transparent text-txt-muted hover:text-txt-main hover:bg-secondary-bg/30"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Trợ lý AI Chatbot</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          </button>
        </div>

        {/* ========================================================
            TAB: ADB COMMAND GENERATOR
            ======================================================== */}
        {activeTab === "adb" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in" id="adb-tab-container">
            {/* Left Parameters Config */}
            <div className="lg:col-span-4 flex flex-col gap-5" id="adb-config-panel">
              <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-5" id="adb-params-card">
                <div className="flex items-center gap-2 pb-4 mb-4 border-b border-[#21262d]" id="params-header">
                  <Smartphone className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-white">Tham số mục tiêu</h3>
                </div>
                <p className="text-xs text-[#8b949e] mb-4">
                  Thay đổi giá trị dưới đây để tự động cập nhật trực tiếp vào các khối mã lệnh ADB tương ứng bên phải.
                </p>

                <div className="flex flex-col gap-4" id="adb-inputs">
                  <div className="flex flex-col gap-1.5" id="input-package">
                    <label className="text-xs text-[#8b949e] font-mono">[PACKAGE_NAME] (Tên gói):</label>
                    <input
                      type="text"
                      value={packageName}
                      onChange={(e) => setPackageName(e.target.value)}
                      className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-mono transition-colors"
                      placeholder="e.g. com.example.app"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5" id="input-activity">
                    <label className="text-xs text-[#8b949e] font-mono">[ACTIVITY_NAME] (Activity):</label>
                    <input
                      type="text"
                      value={activityName}
                      onChange={(e) => setActivityName(e.target.value)}
                      className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-mono transition-colors"
                      placeholder="e.g. com.example.app.DashboardActivity"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5" id="input-action">
                    <label className="text-xs text-[#8b949e] font-mono">[ACTION_NAME] (Intent Action):</label>
                    <input
                      type="text"
                      value={actionName}
                      onChange={(e) => setActionName(e.target.value)}
                      className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-mono transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5" id="input-apkpath">
                    <label className="text-xs text-[#8b949e] font-mono">[APK_PATH_ON_DEVICE] (Đường dẫn APK):</label>
                    <input
                      type="text"
                      value={apkPath}
                      onChange={(e) => setApkPath(e.target.value)}
                      className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-mono transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5" id="input-filter">
                    <label className="text-xs text-[#8b949e] font-mono">[FILTER_KEYWORD] (Từ khóa lọc log):</label>
                    <input
                      type="text"
                      value={filterKeyword}
                      onChange={(e) => setFilterKeyword(e.target.value)}
                      className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-mono transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3" id="input-ports-grid">
                    <div className="flex flex-col gap-1.5" id="input-localport">
                      <label className="text-xs text-[#8b949e] font-mono">Cổng Kali:</label>
                      <input
                        type="text"
                        value={localPort}
                        onChange={(e) => setLocalPort(e.target.value)}
                        className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-mono transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5" id="input-deviceport">
                      <label className="text-xs text-[#8b949e] font-mono">Cổng Android:</label>
                      <input
                        type="text"
                        value={devicePort}
                        onChange={(e) => setDevicePort(e.target.value)}
                        className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-mono transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Useful guide short summary */}
              <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-5 text-xs text-[#8b949e] flex flex-col gap-2.5" id="adb-helpful-tips">
                <span className="font-semibold text-white uppercase text-[10px] tracking-wider text-red-400">Cách kết nối thiết bị với Kali Linux:</span>
                <ol className="list-decimal pl-4 flex flex-col gap-1.5">
                  <li>Bật <strong className="text-white">Tùy chọn cho nhà phát triển</strong> trên điện thoại.</li>
                  <li>Bật <strong className="text-white">Gỡ lỗi USB (USB Debugging)</strong>.</li>
                  <li>Cắm cáp kết nối điện thoại với máy cài Kali Linux.</li>
                  <li>Chấp nhận khóa vân tay RSA trên điện thoại khi có thông báo.</li>
                  <li>Mở terminal trên Kali và dán lệnh kiểm tra kết nối đầu tiên.</li>
                </ol>
              </div>
            </div>

            {/* Right Interactive Command Categories */}
            <div className="lg:col-span-8 flex flex-col gap-6" id="adb-commands-list">
              {/* Category: Recon */}
              <div className="bg-[#161b22] border border-[#21262d] rounded-xl overflow-hidden" id="category-recon-card">
                <div className="bg-[#1f242c] px-5 py-3 border-b border-[#21262d] flex items-center justify-between" id="category-recon-header">
                  <div className="flex items-center gap-2">
                    <Search className="w-4.5 h-4.5 text-cyan-400" />
                    <span className="font-semibold text-white text-sm">Thu Thập Thông Tin & Trinh Sát (Device Recon)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#30363d] text-[#8b949e] font-mono">ADB SHELL</span>
                </div>
                <div className="divide-y divide-[#21262d]" id="recon-commands">
                  {ADB_COMMANDS.filter(c => c.category === "recon").map(cmd => (
                    <div key={cmd.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-[#161b22]/40 transition-colors" id={`cmd-${cmd.id}`}>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                          {cmd.title}
                          {cmd.kaliTool && <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/10 text-red-400 border border-red-500/20">{cmd.kaliTool}</span>}
                        </h4>
                        <p className="text-xs text-[#8b949e] mt-1">{cmd.description}</p>
                      </div>
                      <div className="w-full md:w-auto flex items-center gap-2 bg-[#0d1117] border border-[#30363d] rounded-lg p-1.5 pl-3" id={`code-block-${cmd.id}`}>
                        <code className="text-xs font-mono text-emerald-400 overflow-x-auto whitespace-nowrap max-w-[250px] md:max-w-[320px]">
                          {getProcessedCommand(cmd)}
                        </code>
                        <button
                          onClick={() => handleExecuteCommand(getProcessedCommand(cmd))}
                          className="p-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 hover:border-emerald-500/45 text-emerald-400 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                          title="Chạy lệnh trực tiếp trên Kali"
                          id={`run-btn-${cmd.id}`}
                        >
                          <Play className="w-3.5 h-3.5 fill-emerald-400" />
                          <span>Chạy</span>
                        </button>
                        <button
                          onClick={() => handleCopy(getProcessedCommand(cmd), cmd.id)}
                          className="p-1.5 rounded bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-white transition-colors cursor-pointer"
                          title="Sao chép"
                          id={`copy-btn-${cmd.id}`}
                        >
                          {copiedId === cmd.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category: Data */}
              <div className="bg-[#161b22] border border-[#21262d] rounded-xl overflow-hidden" id="category-data-card">
                <div className="bg-[#1f242c] px-5 py-3 border-b border-[#21262d] flex items-center justify-between" id="category-data-header">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4.5 h-4.5 text-orange-400" />
                    <span className="font-semibold text-white text-sm">Trích Xuất Dữ Liệu & Sandbox Data Analysis</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#30363d] text-[#8b949e] font-mono">PULL / LOGCAT</span>
                </div>
                <div className="divide-y divide-[#21262d]" id="data-commands">
                  {ADB_COMMANDS.filter(c => c.category === "data").map(cmd => (
                    <div key={cmd.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-[#161b22]/40 transition-colors" id={`cmd-${cmd.id}`}>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                          {cmd.title}
                          {cmd.kaliTool && <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/10 text-red-400 border border-red-500/20">{cmd.kaliTool}</span>}
                        </h4>
                        <p className="text-xs text-[#8b949e] mt-1">{cmd.description}</p>
                      </div>
                      <div className="w-full md:w-auto flex items-center gap-2 bg-[#0d1117] border border-[#30363d] rounded-lg p-1.5 pl-3" id={`code-block-${cmd.id}`}>
                        <code className="text-xs font-mono text-emerald-400 overflow-x-auto whitespace-nowrap max-w-[250px] md:max-w-[320px]">
                          {getProcessedCommand(cmd)}
                        </code>
                        <button
                          onClick={() => handleExecuteCommand(getProcessedCommand(cmd))}
                          className="p-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 hover:border-emerald-500/45 text-emerald-400 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                          title="Chạy lệnh trực tiếp trên Kali"
                          id={`run-btn-${cmd.id}`}
                        >
                          <Play className="w-3.5 h-3.5 fill-emerald-400" />
                          <span>Chạy</span>
                        </button>
                        <button
                          onClick={() => handleCopy(getProcessedCommand(cmd), cmd.id)}
                          className="p-1.5 rounded bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-white transition-colors cursor-pointer"
                          title="Sao chép"
                          id={`copy-btn-${cmd.id}`}
                        >
                          {copiedId === cmd.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category: Intent Exploitation */}
              <div className="bg-[#161b22] border border-[#21262d] rounded-xl overflow-hidden" id="category-intent-card">
                <div className="bg-[#1f242c] px-5 py-3 border-b border-[#21262d] flex items-center justify-between" id="category-intent-header">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4.5 h-4.5 text-yellow-400" />
                    <span className="font-semibold text-white text-sm">Gửi Intent & Khai Thác Thành Phần (Component Interception)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#30363d] text-[#8b949e] font-mono">AM START / SEND</span>
                </div>
                <div className="divide-y divide-[#21262d]" id="intent-commands">
                  {ADB_COMMANDS.filter(c => c.category === "intent").map(cmd => (
                    <div key={cmd.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-[#161b22]/40 transition-colors" id={`cmd-${cmd.id}`}>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                          {cmd.title}
                          {cmd.kaliTool && <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/10 text-red-400 border border-red-500/20">{cmd.kaliTool}</span>}
                        </h4>
                        <p className="text-xs text-[#8b949e] mt-1">{cmd.description}</p>
                      </div>
                      <div className="w-full md:w-auto flex items-center gap-2 bg-[#0d1117] border border-[#30363d] rounded-lg p-1.5 pl-3" id={`code-block-${cmd.id}`}>
                        <code className="text-xs font-mono text-emerald-400 overflow-x-auto whitespace-nowrap max-w-[250px] md:max-w-[320px]">
                          {getProcessedCommand(cmd)}
                        </code>
                        <button
                          onClick={() => handleExecuteCommand(getProcessedCommand(cmd))}
                          className="p-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 hover:border-emerald-500/45 text-emerald-400 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                          title="Chạy lệnh trực tiếp trên Kali"
                          id={`run-btn-${cmd.id}`}
                        >
                          <Play className="w-3.5 h-3.5 fill-emerald-400" />
                          <span>Chạy</span>
                        </button>
                        <button
                          onClick={() => handleCopy(getProcessedCommand(cmd), cmd.id)}
                          className="p-1.5 rounded bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-white transition-colors cursor-pointer"
                          title="Sao chép"
                          id={`copy-btn-${cmd.id}`}
                        >
                          {copiedId === cmd.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category: Networking & Ports */}
              <div className="bg-[#161b22] border border-[#21262d] rounded-xl overflow-hidden" id="category-networking-card">
                <div className="bg-[#1f242c] px-5 py-3 border-b border-[#21262d] flex items-center justify-between" id="category-networking-header">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4.5 h-4.5 text-indigo-400" />
                    <span className="font-semibold text-white text-sm">Chuyển tiếp & Phân tích Mạng (Networking & Tunneling)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#30363d] text-[#8b949e] font-mono">ADB PORT</span>
                </div>
                <div className="divide-y divide-[#21262d]" id="reverse-commands">
                  {ADB_COMMANDS.filter(c => c.category === "reverse" || c.category === "shell").map(cmd => (
                    <div key={cmd.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-[#161b22]/40 transition-colors" id={`cmd-${cmd.id}`}>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                          {cmd.title}
                          {cmd.kaliTool && <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/10 text-red-400 border border-red-500/20">{cmd.kaliTool}</span>}
                        </h4>
                        <p className="text-xs text-[#8b949e] mt-1">{cmd.description}</p>
                      </div>
                      <div className="w-full md:w-auto flex items-center gap-2 bg-[#0d1117] border border-[#30363d] rounded-lg p-1.5 pl-3" id={`code-block-${cmd.id}`}>
                        <code className="text-xs font-mono text-emerald-400 overflow-x-auto whitespace-nowrap max-w-[250px] md:max-w-[320px]">
                          {getProcessedCommand(cmd)}
                        </code>
                        <button
                          onClick={() => handleExecuteCommand(getProcessedCommand(cmd))}
                          className="p-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 hover:border-emerald-500/45 text-emerald-400 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                          title="Chạy lệnh trực tiếp trên Kali"
                          id={`run-btn-${cmd.id}`}
                        >
                          <Play className="w-3.5 h-3.5 fill-emerald-400" />
                          <span>Chạy</span>
                        </button>
                        <button
                          onClick={() => handleCopy(getProcessedCommand(cmd), cmd.id)}
                          className="p-1.5 rounded bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-white transition-colors cursor-pointer"
                          title="Sao chép"
                          id={`copy-btn-${cmd.id}`}
                        >
                          {copiedId === cmd.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: AI AUDIT MANIFEST
            ======================================================== */}
        {activeTab === "manifest" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in" id="manifest-tab-container">
            {/* Left Hand: XML Input */}
            <div className="lg:col-span-6 flex flex-col gap-4" id="manifest-input-panel">
              <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-5 flex flex-col gap-4" id="manifest-editor-card">
                <div className="flex items-center justify-between border-b border-[#21262d] pb-3" id="manifest-editor-header">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-red-500" />
                    <span className="font-semibold text-white">Nội dung AndroidManifest.xml</span>
                  </div>
                  <button
                    onClick={() => setManifestText(SAMPLE_MANIFEST)}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                    title="Khôi phục lại tệp Manifest mẫu dễ bị tổn thương để thử nghiệm quét"
                    id="reset-sample-btn"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Dùng tệp mẫu</span>
                  </button>
                </div>

                <p className="text-xs text-[#8b949e]">
                  Dán nội dung tệp tin AndroidManifest.xml thu thập được từ bước decompile APK để bắt đầu quét tự động bằng AI.
                </p>

                <div className="relative font-mono text-sm" id="textarea-container">
                  <textarea
                    id="manifest-textarea"
                    value={manifestText}
                    onChange={(e) => setManifestText(e.target.value)}
                    className="w-full h-[400px] bg-[#0d1117] border border-[#30363d] rounded-lg p-4 font-mono text-xs text-emerald-400 focus:outline-none focus:border-red-500 resize-y leading-relaxed"
                    placeholder="Dán mã XML ở đây..."
                  />
                </div>

                <div className="flex items-center justify-between gap-4 mt-2" id="action-buttons">
                  <button
                    onClick={() => setManifestText("")}
                    className="px-4 py-2 text-xs border border-[#30363d] text-[#8b949e] hover:text-white rounded-lg hover:bg-[#21262d] transition-colors cursor-pointer"
                    id="clear-xml-btn"
                  >
                    Xóa trắng
                  </button>
                  <button
                    id="run-audit-btn"
                    onClick={handleManifestAudit}
                    disabled={isAuditing}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:from-red-800 disabled:to-red-900 text-white font-semibold px-5 py-2.5 rounded-lg transition-all shadow-lg hover:shadow-red-600/10 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isAuditing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Đang phân tích bảo mật...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                        <span>Kích hoạt AI Audit bảo mật</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Hand: Scan Results */}
            <div className="lg:col-span-6 flex flex-col gap-4" id="manifest-result-panel">
              <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-5 min-h-[500px] flex flex-col" id="manifest-result-card">
                <div className="flex items-center justify-between border-b border-[#21262d] pb-3 mb-4" id="result-header">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <span className="font-semibold text-white">Kết quả kiểm định bảo mật</span>
                  </div>
                  {auditResult && (
                    <div className="flex items-center gap-2" id="score-badge">
                      <span className="text-xs text-[#8b949e]">Điểm bảo mật:</span>
                      <span className={`text-base font-bold font-mono px-2.5 py-0.5 rounded-lg ${
                        auditResult.score >= 80 
                          ? "bg-emerald-500/10 text-emerald-400" 
                          : auditResult.score >= 50 
                          ? "bg-yellow-500/10 text-yellow-400" 
                          : "bg-red-500/10 text-red-400"
                      }`}>
                        {auditResult.score}/100
                      </span>
                    </div>
                  )}
                </div>

                {/* Initial Instruction State */}
                {!isAuditing && !auditResult && !auditError && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#8b949e] border border-dashed border-[#21262d] rounded-lg bg-[#0d1117]/30" id="empty-state">
                    <HelpCircle className="w-12 h-12 text-[#30363d] mb-3" />
                    <p className="font-medium text-white mb-1 text-sm">Chưa có kết quả phân tích</p>
                    <p className="text-xs max-w-sm">
                      Dán tệp tin Manifest của bạn vào ô bên trái và nhấp <strong>Kích hoạt AI Audit bảo mật</strong> để phân tích thông minh các lỗ hổng tiềm ẩn.
                    </p>
                  </div>
                )}

                {/* Loading State */}
                {isAuditing && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8" id="loading-state">
                    <div className="w-10 h-10 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-white font-medium text-sm">AI đang giải mã cấu hình Android...</p>
                    <p className="text-xs text-[#8b949e] mt-1 max-w-xs">
                      Phân tích các thẻ permission, exported activities, broadcast receivers, debug settings theo chuẩn bảo mật di động...
                    </p>
                  </div>
                )}

                {/* Error State */}
                {auditError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex gap-3" id="error-alert">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div id="error-message">
                      <p className="font-semibold">Đã xảy ra lỗi:</p>
                      <p className="text-xs text-red-300 mt-1">{auditError}</p>
                    </div>
                  </div>
                )}

                {/* Success: Findings List */}
                {auditResult && (
                  <div className="flex-1 flex flex-col gap-4" id="findings-container">
                    <div className="bg-[#1f242c] p-4 rounded-lg border border-[#21262d]" id="audit-summary">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Tóm tắt đánh giá:</h4>
                      <p className="text-xs text-[#8b949e] leading-relaxed">{auditResult.summary}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mt-2 border-b border-[#21262d] pb-2" id="findings-count-bar">
                      <span className="text-xs font-bold text-[#8b949e]">DANH SÁCH LỖ HỔNG PHÁT HIỆN ({auditResult.findings?.length || 0})</span>
                      <div className="flex items-center gap-2" id="report-export-buttons">
                        <button
                          onClick={handleExportMarkdown}
                          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-[#ef4444] hover:text-[#ef4444]/80 border border-[#ef4444]/20 hover:border-[#ef4444]/40 transition-colors cursor-pointer font-mono"
                          title="Xuất báo cáo định dạng Markdown (.md)"
                          id="export-md-btn"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Xuất .MD</span>
                        </button>
                        <button
                          onClick={handleExportHtml}
                          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded bg-[#ef4444]/10 hover:bg-[#ef4444]/25 text-white hover:text-white border border-[#ef4444]/30 hover:border-[#ef4444]/50 transition-colors cursor-pointer font-mono"
                          title="Xuất báo cáo HTML đồ họa đẹp mắt"
                          id="export-html-btn"
                        >
                          <Download className="w-3.5 h-3.5 text-[#ef4444]" />
                          <span>Xuất HTML</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 overflow-y-auto max-h-[450px] pr-1" id="findings-list">
                      {auditResult.findings && auditResult.findings.length > 0 ? (
                        auditResult.findings.map((finding, idx) => (
                          <div key={idx} className="bg-[#161b22] border border-[#21262d] rounded-lg p-4 hover:border-[#30363d] transition-colors" id={`finding-item-${idx}`}>
                            <div className="flex items-start justify-between gap-3 mb-2" id="finding-header">
                              <h5 className="font-bold text-white text-sm">{finding.title}</h5>
                              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${getSeverityBadgeClass(finding.severity)}`}>
                                {finding.severity}
                              </span>
                            </div>
                            <p className="text-xs text-[#8b949e] leading-relaxed mb-3">{finding.description}</p>
                            
                            <div className="text-[11px] font-mono bg-[#0d1117] px-2.5 py-1.5 rounded border border-[#21262d] text-[#8b949e] mb-3 flex items-center gap-1.5 overflow-x-auto" id="finding-location">
                              <span className="text-red-400">Vị trí phát hiện:</span>
                              <span className="text-white">{finding.location}</span>
                            </div>

                            <div className="bg-[#0d1117]/50 rounded border border-[#21262d] p-3" id="finding-remediation">
                              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">Cách khắc phục:</span>
                              <p className="text-xs text-[#8b949e] whitespace-pre-wrap">{finding.remediation}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-xs text-[#8b949e]" id="no-findings">
                          🎉 Tuyệt vời! AI không phát hiện bất kỳ lỗ hổng bảo mật nghiêm trọng nào trong tệp Manifest này.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: APKTOOL WORKFLOW
            ======================================================== */}
        {activeTab === "apktool" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in" id="apktool-tab-container">
            {/* Input Config apk names */}
            <div className="lg:col-span-4 flex flex-col gap-4" id="apktool-sidebar">
              <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-5" id="apktool-inputs-card">
                <div className="flex items-center gap-2 pb-4 mb-4 border-b border-[#21262d]" id="apktool-inputs-header">
                  <Layers className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-white">Biến đổi APK</h3>
                </div>
                <p className="text-xs text-[#8b949e] mb-4">
                  Thiết lập tên tệp APK của bạn để tạo ra dòng lệnh biên dịch & ký số chính xác cho Kali Linux.
                </p>

                <div className="flex flex-col gap-4" id="apktool-fields">
                  <div className="flex flex-col gap-1.5" id="apktool-name-field">
                    <label className="text-xs text-[#8b949e] font-mono">Tên tệp APK gốc (Không bao gồm đuôi .apk):</label>
                    <input
                      type="text"
                      value={apktoolFileName}
                      onChange={(e) => setApktoolFileName(e.target.value)}
                      className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-mono transition-colors"
                      placeholder="e.g. vulnerable_app"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5" id="apktool-out-field">
                    <label className="text-xs text-[#8b949e] font-mono">Thư mục đầu ra của Decompile:</label>
                    <input
                      type="text"
                      value={apktoolOutputDir}
                      onChange={(e) => setApktoolOutputDir(e.target.value)}
                      className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-mono transition-colors"
                      placeholder="e.g. vulnerable_app_decompiled"
                    />
                  </div>
                </div>
              </div>

              {/* Reverse flow notes */}
              <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-5 text-xs text-[#8b949e] flex flex-col gap-3" id="reverse-flow-notes">
                <span className="font-semibold text-white uppercase text-[10px] tracking-wider text-red-400">Các lỗi đóng gói thường gặp:</span>
                <ul className="list-disc pl-4 flex flex-col gap-1.5">
                  <li><strong className="text-white">Lỗi Build Resource:</strong> Sử dụng thêm cờ <code className="text-red-400 font-mono">-r</code> khi decompile nếu apktool bị crash do lỗi phân tích file resources.arsc.</li>
                  <li><strong className="text-white">Lỗi chữ ký mã:</strong> Android 11 trở lên yêu cầu cấu trúc chữ ký V2 hoặc V3. Apksigner là bắt buộc (Jarsigner sẽ không hoạt động trên một số dòng máy mới).</li>
                  <li><strong className="text-white">Zipalign:</strong> Luôn chạy zipalign trước khi ký để tối ưu hóa tệp APK và tránh lỗi cài đặt.</li>
                </ul>
              </div>
            </div>

            {/* Step-by-Step CLI command logs */}
            <div className="lg:col-span-8 flex flex-col gap-4" id="apktool-steps-panel">
              <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-5" id="apktool-steps-card">
                <h3 className="font-semibold text-white border-b border-[#21262d] pb-3 mb-4 flex items-center justify-between">
                  <span>Quy trình kỹ thuật đảo ngược APK & Vá Mã nguồn</span>
                  <span className="text-xs font-normal text-[#8b949e]">Kali Terminal Commands</span>
                </h3>

                <div className="flex flex-col gap-6" id="steps-timeline">
                  {APKTOOL_STEPS.map((step, idx) => {
                    // process step command in real-time
                    let finalCmd = step.command;
                    finalCmd = finalCmd.replace(/\[APK_NAME\]/g, apktoolFileName);
                    finalCmd = finalCmd.replace(/\[OUTPUT_DIR\]/g, apktoolOutputDir);
                    finalCmd = finalCmd.replace(/\[DECOMPILED_DIR\]/g, apktoolOutputDir);

                    return (
                      <div key={step.id} className="flex gap-4 items-start" id={`step-item-${step.id}`}>
                        {/* Number Indicator */}
                        <div className="flex flex-col items-center" id={`indicator-${step.id}`}>
                          <div className="w-7 h-7 rounded-full bg-red-600/15 border border-red-500/40 text-red-400 flex items-center justify-center text-xs font-mono font-bold" id={`step-number-${step.id}`}>
                            {idx + 1}
                          </div>
                          {idx !== APKTOOL_STEPS.length - 1 && (
                            <div className="w-0.5 h-16 bg-[#21262d] mt-2" id={`timeline-line-${step.id}`}></div>
                          )}
                        </div>

                        {/* Content Card */}
                        <div className="flex-1 min-w-0 bg-[#1c2128] border border-[#30363d] rounded-xl p-4" id={`step-card-${step.id}`}>
                          <h4 className="text-sm font-bold text-white mb-1">{step.title}</h4>
                          <p className="text-xs text-[#8b949e] mb-3">{step.description}</p>

                          {/* Render Terminal Box */}
                          <div className="bg-[#0d1117] border border-[#21262d] rounded-lg p-3 flex items-center justify-between gap-3 font-mono text-xs mb-3 w-full overflow-hidden" id={`terminal-box-${step.id}`}>
                            <div className="flex items-center gap-2 overflow-x-auto min-w-0" id={`cmd-text-container-${step.id}`}>
                              <span className="text-red-500 flex-shrink-0">kali@root:~#</span>
                              <code className="text-emerald-400 whitespace-nowrap">{finalCmd}</code>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0" id={`actions-${step.id}`}>
                              <button
                                onClick={() => handleExecuteCommand(finalCmd)}
                                className="p-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 hover:border-emerald-500/45 text-emerald-400 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                                title="Chạy lệnh trực tiếp trên Kali"
                                id={`step-run-btn-${step.id}`}
                              >
                                <Play className="w-3 h-3 fill-emerald-400" />
                                <span>Chạy</span>
                              </button>
                              <button
                                onClick={() => handleCopy(finalCmd, step.id)}
                                className="p-1.5 rounded bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-white transition-colors cursor-pointer"
                                title="Sao chép câu lệnh"
                                id={`step-copy-btn-${step.id}`}
                              >
                                {copiedId === step.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          {step.tip && (
                            <div className="flex items-center gap-2 text-[11px] text-cyan-400" id={`tip-box-${step.id}`}>
                              <Info className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>{step.tip}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: FRIDA SCRIPTS
            ======================================================== */}
        {activeTab === "frida" && (
          <div className="grid grid-cols-1 gap-6 animate-fade-in" id="frida-tab-container">
            <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-5" id="frida-main-card">
              <div className="border-b border-[#21262d] pb-4 mb-4" id="frida-header">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-red-500" />
                  <span>Thư viện Frida Script Bypass nâng cao</span>
                </h2>
                <p className="text-xs text-[#8b949e] mt-1">
                  Sử dụng Frida để thực hiện kiểm tra dynamic analysis (Hooking) trực tiếp vào máy ảo ART của Android khi ứng dụng đang chạy.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="frida-list-grid">
                {FRIDA_SCRIPTS.map((script, idx) => (
                  <div key={idx} className="bg-[#1c2128] border border-[#30363d] rounded-xl p-5 flex flex-col gap-3 justify-between" id={`frida-item-${idx}`}>
                    <div id={`frida-content-${idx}`}>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        {script.title}
                      </h4>
                      <p className="text-xs text-[#8b949e] mt-1 mb-4">{script.description}</p>

                      <div className="relative" id={`code-container-${idx}`}>
                        <pre className="bg-[#0d1117] border border-[#21262d] rounded-lg p-3 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-[160px] leading-relaxed">
                          {script.code}
                        </pre>
                        <button
                          onClick={() => handleCopy(script.code, `frida-${idx}`)}
                          className="absolute top-2 right-2 p-1.5 rounded bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-white transition-colors cursor-pointer"
                          title="Sao chép toàn bộ mã nguồn"
                          id={`frida-copy-${idx}`}
                        >
                          {copiedId === `frida-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#0d1117] rounded-lg p-2 px-3 border border-[#21262d] text-[10px] font-mono text-[#8b949e] flex items-center justify-between mt-2" id={`frida-run-tip-${idx}`}>
                      <span>Lệnh thực thi trên Kali:</span>
                      <code className="text-cyan-400">frida -U -f {packageName} -l script.js</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick guide to install Frida on phone */}
            <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-5" id="frida-setup-guide">
              <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-red-500" />
                <span>Cách khởi động Frida-Server trên Android:</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-[#8b949e]" id="frida-setup-steps">
                <div className="bg-[#0d1117] p-3 rounded-lg border border-[#21262d]" id="frida-step-1">
                  <span className="font-bold text-white block mb-1">Bước 1: Tải server</span>
                  Tải <strong className="text-white">frida-server</strong> tương ứng với kiến trúc CPU của máy Android (thường là arm64) từ GitHub Frida Releases.
                </div>
                <div className="bg-[#0d1117] p-3 rounded-lg border border-[#21262d]" id="frida-step-2">
                  <span className="font-bold text-white block mb-1">Bước 2: Push vào máy</span>
                  Dùng lệnh:
                  <code className="block mt-1 text-emerald-400 bg-[#161b22] p-1 rounded">adb push frida-server /data/local/tmp/</code>
                </div>
                <div className="bg-[#0d1117] p-3 rounded-lg border border-[#21262d]" id="frida-step-3">
                  <span className="font-bold text-white block mb-1">Bước 3: Cấp quyền chạy</span>
                  Dùng lệnh:
                  <code className="block mt-1 text-emerald-400 bg-[#161b22] p-1 rounded">adb shell "chmod 755 /data/local/tmp/frida-server"</code>
                </div>
                <div className="bg-[#0d1117] p-3 rounded-lg border border-[#21262d]" id="frida-step-4">
                  <span className="font-bold text-white block mb-1">Bước 4: Chạy server</span>
                  Chạy quyền root:
                  <code className="block mt-1 text-emerald-400 bg-[#161b22] p-1 rounded">adb shell "su -c '/data/local/tmp/frida-server &'"</code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: AI PENTEST ASSISTANT CHATBOT
            ======================================================== */}
        {activeTab === "chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in" id="chat-tab-container">
            {/* Left columns - presets questions */}
            <div className="lg:col-span-4 flex flex-col gap-4" id="chat-presets-panel">
              <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-5" id="chat-info-card">
                <div className="flex items-center gap-2 pb-3 mb-3 border-b border-[#21262d]" id="chat-info-header">
                  <Sparkles className="w-4.5 h-4.5 text-yellow-400" />
                  <h3 className="font-semibold text-white">Chuyên gia AI Hacker</h3>
                </div>
                <p className="text-xs text-[#8b949e] leading-relaxed mb-4">
                  Trợ lý được tối ưu hóa đặc biệt cho kiểm thử xâm nhập bảo mật Android, có khả năng tạo nhanh các đoạn mã bypass, giải thích lý thuyết bảo mật và viết script frida tùy chỉnh.
                </p>

                <div className="flex flex-col gap-2.5" id="preset-buttons">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-red-400 block">Câu hỏi gợi ý:</span>
                  
                  <button
                    onClick={() => setUserChatInput("Hãy chỉ tôi cách dùng Frida để bypass SSL Pinning của ứng dụng Flutter?")}
                    className="w-full text-left p-2.5 rounded-lg bg-[#0d1117] hover:bg-[#21262d] border border-[#21262d] hover:border-[#30363d] text-xs text-[#c9d1d9] transition-all cursor-pointer"
                    id="preset-btn-1"
                  >
                    🚀 Cách bypass SSL Pinning Flutter?
                  </button>

                  <button
                    onClick={() => setUserChatInput("Lỗ hổng Android:exported=\"true\" là gì? Làm thế nào để khai thác và vá?")}
                    className="w-full text-left p-2.5 rounded-lg bg-[#0d1117] hover:bg-[#21262d] border border-[#21262d] hover:border-[#30363d] text-xs text-[#c9d1d9] transition-all cursor-pointer"
                    id="preset-btn-2"
                  >
                    🔒 Giải thích lỗ hổng Exported Component?
                  </button>

                  <button
                    onClick={() => setUserChatInput("Hướng dẫn tôi cách cài đặt và khởi động Drozer trên Kali Linux để pentest Android?")}
                    className="w-full text-left p-2.5 rounded-lg bg-[#0d1117] hover:bg-[#21262d] border border-[#21262d] hover:border-[#30363d] text-xs text-[#c9d1d9] transition-all cursor-pointer"
                    id="preset-btn-3"
                  >
                    🛠️ Cách dùng Drozer trên Kali Linux?
                  </button>

                  <button
                    onClick={() => setUserChatInput("Viết giùm tôi một đoạn script Frida cơ bản để hook vào hàm 'checkPassword' trong class 'com.example.AuthClass' và in ra mật khẩu người dùng nhập vào.")}
                    className="w-full text-left p-2.5 rounded-lg bg-[#0d1117] hover:bg-[#21262d] border border-[#21262d] hover:border-[#30363d] text-xs text-[#c9d1d9] transition-all cursor-pointer"
                    id="preset-btn-4"
                  >
                    🔑 Viết script Frida hook hàm đăng nhập?
                  </button>
                </div>
              </div>
            </div>

            {/* Right column - interactive chatbot screen */}
            <div className="lg:col-span-8 flex flex-col" id="chat-screen-panel">
              <div className="bg-[#161b22] border border-[#21262d] rounded-xl flex flex-col h-[550px] overflow-hidden" id="chatbot-frame">
                {/* Chat window header */}
                <div className="bg-[#1f242c] p-4 border-b border-[#21262d] flex items-center justify-between" id="chat-header">
                  <div className="flex items-center gap-2.5" id="chat-title">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Interactive Security Assistant</h4>
                      <p className="text-[10px] text-[#8b949e]">Phản hồi từ Gemini-3.5-Flash (Security Agent)</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setChatMessages([
                      {
                        id: "welcome",
                        role: "assistant",
                        content: "Cuộc trò chuyện đã được làm sạch. Tôi có thể giúp gì tiếp cho bạn trong việc phân tích bảo mật Android?",
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }
                    ])}
                    className="text-xs text-[#8b949e] hover:text-white transition-colors cursor-pointer"
                    id="reset-chat-btn"
                  >
                    Xóa lịch sử
                  </button>
                </div>

                {/* Chat content stream */}
                <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-[#0d1117]/30" id="chat-messages-container">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] ${
                        msg.role === "user" ? "self-end items-end" : "self-start items-start"
                      }`}
                      id={`msg-bubble-${msg.id}`}
                    >
                      <span className="text-[10px] text-[#8b949e] mb-1 font-mono">{msg.timestamp}</span>
                      <div
                        className={`rounded-xl p-3 px-4 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-red-600 text-white rounded-tr-none"
                            : "bg-[#21262d] text-[#c9d1d9] border border-[#30363d] rounded-tl-none"
                        }`}
                        id={`msg-text-${msg.id}`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}

                  {/* AI Generating Indicator */}
                  {isSendingChat && (
                    <div className="self-start flex flex-col items-start max-w-[85%]" id="assistant-typing-indicator">
                      <span className="text-[10px] text-[#8b949e] mb-1 font-mono">Đang phản hồi...</span>
                      <div className="bg-[#21262d] text-[#8b949e] border border-[#30363d] rounded-xl rounded-tl-none p-3 px-4 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce delay-100"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce delay-200"></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat input box form */}
                <form onSubmit={handleSendChat} className="border-t border-[#21262d] p-3 bg-[#161b22] flex gap-2" id="chat-form">
                  <input
                    type="text"
                    id="chat-input"
                    value={userChatInput}
                    onChange={(e) => setUserChatInput(e.target.value)}
                    placeholder="Hãy hỏi tôi cách sử dụng adb, dịch ngược apk, viết script bypass,..."
                    className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="submit"
                    disabled={!userChatInput.trim() || isSendingChat}
                    className="p-2.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-semibold transition-colors cursor-pointer"
                    id="chat-send-btn"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* PERSISTENT KALI LIVE TERMINAL DRAWER */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-[#0d1117] border-t border-[#30363d] z-50 transition-all duration-300 flex flex-col ${
          showTerminal ? "h-[320px]" : "h-11"
        }`}
        id="kali-terminal-drawer"
      >
        {/* Header bar */}
        <div 
          onClick={() => setShowTerminal(!showTerminal)}
          className="bg-[#161b22] px-4 py-2.5 border-b border-[#21262d] flex items-center justify-between cursor-pointer select-none hover:bg-[#1f242c] transition-colors"
          id="terminal-drawer-header"
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isExecutingCmd ? "bg-amber-500 animate-ping" : "bg-emerald-500"}`}></div>
            <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              KALI INTERACTIVE CONSOLE {isExecutingCmd && <span className="text-[10px] text-amber-400 font-normal animate-pulse">(Đang thực thi...)</span>}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setTerminalHistory([]);
              }}
              className="text-[10px] text-[#8b949e] hover:text-white font-mono bg-[#21262d] px-2 py-0.5 rounded border border-[#30363d] transition-colors"
              id="clear-terminal-history-btn"
            >
              Xóa Logs
            </button>
            <span className="text-xs text-[#8b949e] font-mono">
              {showTerminal ? "▼ Thu nhỏ Console" : "▲ Mở rộng Console & Chạy Lệnh"}
            </span>
          </div>
        </div>

        {/* Console logs */}
        {showTerminal && (
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-[#c9d1d9] flex flex-col gap-3 bg-[#090d13]" id="terminal-logs-container">
            {terminalHistory.length === 0 ? (
              <div className="text-[#8b949e] italic text-center py-8">Chưa có lệnh nào được chạy. Click "Chạy" trên bất kỳ nút lệnh nào phía trên để xem kết quả trực tiếp tại đây!</div>
            ) : (
              terminalHistory.map((item, index) => (
                <div key={index} className="border-b border-[#21262d]/50 pb-2.5 last:border-b-0">
                  <div className="flex items-center justify-between text-[#8b949e] mb-1">
                    <span className="text-red-400 flex items-center gap-1">
                      <span className="text-[#8b949e]">kali@root:~#</span> {item.command}
                    </span>
                    <span>{item.timestamp}</span>
                  </div>
                  <pre className={`whitespace-pre-wrap p-3 rounded bg-[#0d1117] border font-mono text-xs leading-relaxed ${
                    item.isError ? "border-red-500/25 text-red-400 bg-red-900/10" : "border-emerald-500/20 text-emerald-400 bg-emerald-950/5"
                  }`}>
                    {item.output}
                  </pre>
                </div>
              ))
            )}
            <div id="terminal-bottom-anchor"></div>
          </div>
        )}

        {/* Input bar inside terminal */}
        {showTerminal && (
          <div className="bg-[#161b22] border-t border-[#21262d] p-2 px-4 flex items-center gap-2">
            <span className="text-xs font-mono text-red-500 flex-shrink-0">kali@root:~#</span>
            <input 
              type="text"
              placeholder="Nhập thủ công lệnh adb (ví dụ: adb devices, adb shell getprop)..."
              className="flex-1 bg-[#0d1117] border border-[#30363d] rounded px-3 py-1 text-xs text-white font-mono focus:outline-none focus:border-red-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const inputVal = (e.target as HTMLInputElement).value;
                  if (inputVal.trim()) {
                    handleExecuteCommand(inputVal.trim());
                    (e.target as HTMLInputElement).value = "";
                  }
                }
              }}
            />
            <span className="text-[10px] text-[#8b949e] font-mono">Nhấn Enter để chạy</span>
          </div>
        )}
      </div>

      {/* FOOTER BAR */}
      <footer className="border-t border-[#21262d] bg-[#161b22] py-4 px-6 text-center text-xs text-[#8b949e]" id="footer-bar">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2" id="footer-content">
          <p id="footer-copyright">
            © 2026 Kali Android Pentest Graphical Assistant — Được thiết kế bởi Hacker Mũ Trắng.
          </p>
          <p className="font-mono text-[10px]" id="disclaimer">
            Cảnh báo: Chỉ sử dụng phần mềm cho các mục tiêu đã được cấp phép kiểm thử xâm nhập hợp pháp.
          </p>
        </div>
      </footer>

      {/* ONLINE USER GUIDE MODAL (POPUP) */}
      {isGuideOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-6 transition-all duration-300" id="guide-modal-backdrop">
          <div className="bg-secondary-bg border border-border-main w-full max-w-4xl h-[85vh] flex flex-col rounded-xl shadow-2xl overflow-hidden animate-fade-in" id="guide-modal-container">
            {/* Modal Header */}
            <div className="bg-secondary-bg/80 border-b border-border-main px-6 py-4 flex items-center justify-between border-t border-t-accent/20" id="guide-modal-header">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600/10 rounded-lg border border-emerald-500/30 text-emerald-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    Tài liệu Hướng dẫn sử dụng & Mô tả tính năng
                  </h3>
                  <p className="text-xs text-[#8b949e]">Chi tiết hướng dẫn cài đặt, quy trình kiểm thử và cơ chế bảo mật</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadGuideMd}
                  disabled={isDownloadingGuideMd}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/30 text-cyan-400 hover:text-white text-xs font-medium transition-colors cursor-pointer ${
                    isDownloadingGuideMd ? "bg-cyan-600/5 opacity-50 cursor-not-allowed" : "bg-cyan-600/10 hover:bg-cyan-600/35"
                  }`}
                  id="modal-download-md"
                  title="Tải hướng dẫn dạng Markdown"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>{isDownloadingGuideMd ? "Đang tải..." : "Tải tệp .md"}</span>
                </button>
                <button
                  onClick={handleDownloadGuide}
                  disabled={isDownloadingGuide}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:text-white text-xs font-medium transition-colors cursor-pointer ${
                    isDownloadingGuide ? "bg-red-600/5 opacity-50 cursor-not-allowed" : "bg-red-600/10 hover:bg-red-600/35"
                  }`}
                  id="modal-download-docx"
                  title="Tải tệp tài liệu hướng dẫn Word (.docx)"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isDownloadingGuide ? "Đang tải..." : "Tải tệp .docx"}</span>
                </button>
                <button
                  onClick={() => setIsGuideOpen(false)}
                  className="p-1.5 rounded-lg bg-primary-bg border border-border-main text-[#8b949e] hover:text-white hover:border-[#8b949e] transition-colors ml-2 cursor-pointer"
                  id="close-guide-modal-btn"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-primary-bg space-y-4" id="guide-modal-body">
              {isLoadingGuideContent ? (
                <div className="h-full flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                  <p className="text-sm text-[#8b949e] animate-pulse">Đang tải và đồng bộ tài liệu hướng dẫn...</p>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto pb-8">
                  {renderFormattedMarkdown(guideContent)}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-secondary-bg border-t border-border-main px-6 py-3 flex items-center justify-between text-xs text-[#8b949e]" id="guide-modal-footer">
              <span className="font-mono text-[10px]">Tài liệu chính thức v1.0.0</span>
              <button
                onClick={() => setIsGuideOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-primary-bg border border-border-main text-white hover:bg-[#30363d] transition-colors font-medium text-xs cursor-pointer"
                id="close-guide-modal-footer-btn"
              >
                Đóng hướng dẫn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
