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
  Code,
  Info,
  Smartphone,
  CheckCircle,
  XCircle,
  ArrowRight,
  Search,
  MessageSquare
} from "lucide-react";
import { ADB_COMMANDS, APKTOOL_STEPS, FRIDA_SCRIPTS } from "./commandsData";
import { AdbCommand, ManifestFinding, AuditResult, ChatMessage } from "./types";

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

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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

  return (
    <div 
      className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col selection:bg-[#1f6feb] selection:text-white transition-[padding-bottom] duration-300" 
      id="app-root"
      style={{ paddingBottom: showTerminal ? "320px" : "44px" }}
    >
      {/* HEADER BAR */}
      <header className="border-b border-[#21262d] bg-[#161b22] px-6 py-4 sticky top-0 z-50 shadow-md" id="header-bar">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4" id="header-content">
          <div className="flex items-center gap-3" id="logo-section">
            <div className="p-2.5 bg-red-600/10 rounded-xl border border-red-500/30 text-red-500 shadow-inner shadow-red-500/10" id="logo-icon-container">
              <Shield className="w-7 h-7" id="logo-icon" />
            </div>
            <div id="logo-text">
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Kali Android Pentest GUI <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-mono">v1.1</span>
              </h1>
              <p className="text-xs text-[#8b949e]">Hộp công cụ & Hỗ trợ kiểm thử bảo mật ứng dụng Android cho Kali Linux</p>
            </div>
          </div>

          {/* Quick status checks */}
          <div className="flex items-center gap-3 text-xs" id="status-checks">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#21262d] border border-[#30363d]" id="env-badge">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-[#8b949e]">Kali OS Emulator Mode</span>
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
      <div className="bg-[#1f242c] border-b border-[#30363d] py-3 px-6 text-sm text-[#8b949e]" id="info-bar">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>
            <strong>Mẹo:</strong> Cấu hình <strong>GEMINI_API_KEY</strong> trong menu <strong>Settings</strong> phía trên để kích hoạt tính năng kiểm tra tự động Manifest bằng AI và Chat trợ lý chuyên sâu.
          </span>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6" id="main-content">
        
        {/* TAB NAVIGATION */}
        <div className="flex flex-wrap gap-2 border-b border-[#21262d] pb-px" id="tab-navigation">
          <button
            id="tab-adb-btn"
            onClick={() => setActiveTab("adb")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "adb"
                ? "border-red-500 text-white bg-[#161b22]/50"
                : "border-transparent text-[#8b949e] hover:text-white hover:bg-[#161b22]/20"
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
                ? "border-red-500 text-white bg-[#161b22]/50"
                : "border-transparent text-[#8b949e] hover:text-white hover:bg-[#161b22]/20"
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
                ? "border-red-500 text-white bg-[#161b22]/50"
                : "border-transparent text-[#8b949e] hover:text-white hover:bg-[#161b22]/20"
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
                ? "border-red-500 text-white bg-[#161b22]/50"
                : "border-transparent text-[#8b949e] hover:text-white hover:bg-[#161b22]/20"
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
                ? "border-red-500 text-white bg-[#161b22]/50"
                : "border-transparent text-[#8b949e] hover:text-white hover:bg-[#161b22]/20"
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

                    <div className="flex items-center justify-between mt-2" id="findings-count-bar">
                      <span className="text-xs font-bold text-[#8b949e]">DANH SÁCH LỖ HỔNG PHÁT HIỆN ({auditResult.findings?.length || 0})</span>
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
    </div>
  );
}
