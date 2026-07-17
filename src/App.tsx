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
  FolderOpen,
  X,
  Menu,
  ChevronDown,
  Wrench,
  Sliders
} from "lucide-react";
import { ADB_COMMANDS, APKTOOL_STEPS, FRIDA_SCRIPTS } from "./commandsData";
import { AdbCommand, ManifestFinding, AuditResult, ChatMessage } from "./types";
import { LANGUAGES, TRANSLATIONS, ADB_COMMANDS_TRANSLATIONS, APKTOOL_STEPS_TRANSLATIONS, FRIDA_SCRIPTS_TRANSLATIONS } from "./languages";
import { getSimulatedOutput } from "./simulation";
import StaticScanTab from "./components/StaticScanTab";

export const THEME_CONFIGS = {
  "kali-dark": {
    name: "Kali Cyber",
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
    name: "Nord Operator",
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
    name: "Dracula",
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
    name: "Matrix Code",
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
    name: "White Hat",
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
  const [language, setLanguage] = useState<string>(() => {
    return localStorage.getItem("kali-android-pentest-lang") || "vi";
  });

  const t = TRANSLATIONS[language] || TRANSLATIONS["vi"];

  const [activeTab, setActiveTab] = useState<"adb" | "manifest" | "apktool" | "frida" | "chat" | "staticScan">("adb");
  const [isTabDropdownOpen, setIsTabDropdownOpen] = useState(false);
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

  // Task Queue & Workspace Isolation State (Phase 4 Integration)
  const [tasksList, setTasksList] = useState<any[]>([]);
  const [selectedQueueTask, setSelectedQueueTask] = useState<any | null>(null);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          setTasksList(data);
        } else {
          console.warn("Task queue endpoint returned non-JSON response (likely HTML fallback during startup).");
        }
      }
    } catch (err) {
      console.error("Error fetching task queue:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 4000);
    return () => clearInterval(interval);
  }, []);

  // Manifest Audit State
  const [manifestText, setManifestText] = useState(SAMPLE_MANIFEST);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [isLoadingDecompiledManifest, setIsLoadingDecompiledManifest] = useState(false);

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (chatMessages.length === 0 || (chatMessages.length === 1 && chatMessages[0].id === "welcome")) {
      setChatMessages([
        {
          id: "welcome",
          role: "assistant",
          content: t.chatWelcomeMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [language]);

  const [userChatInput, setUserChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);

  // ========================================================
  // Frida Studio (Interactive & AI) States & Handlers
  // ========================================================
  const [fridaSubTab, setFridaSubTab] = useState<"presets" | "builder" | "ai">("presets");
  const [builderPkg, setBuilderPkg] = useState(() => packageName || "com.example.app");
  const [builderClass, setBuilderClass] = useState("com.example.app.MainActivity");
  const [builderMethod, setBuilderMethod] = useState("checkPremium");
  const [builderParams, setBuilderParams] = useState("java.lang.String, int");
  const [builderAction, setBuilderAction] = useState<"log" | "true" | "false" | "custom" | "void">("log");
  const [builderCustomInt, setBuilderCustomInt] = useState(1);
  const [builderDelay, setBuilderDelay] = useState(0);
  const [builderScript, setBuilderScript] = useState("");

  const [fridaAIPrompt, setFridaAIPrompt] = useState("");
  const [fridaAILoading, setFridaAILoading] = useState(false);
  const [fridaAIResult, setFridaAIResult] = useState<{ script: string; explanation: string } | null>(null);
  const [fridaAIError, setFridaAIError] = useState<string | null>(null);

  useEffect(() => {
    setBuilderPkg(packageName);
  }, [packageName]);

  const generateLocalFridaScript = () => {
    const cleanPkg = builderPkg.trim() || "com.target.app";
    const cleanCls = builderClass.trim() || "com.target.app.MainActivity";
    const cleanMethod = builderMethod.trim() || "targetMethod";
    const paramList = builderParams.split(",").map(p => p.trim()).filter(p => p !== "");
    const delayCode = builderDelay > 0 ? `\n    // Delayed start by ${builderDelay}ms\n    setTimeout(function() {\n        runHook();\n    }, ${builderDelay});` : "    runHook();";

    let hookCode = "";
    if (paramList.length > 0) {
      const paramArgs = paramList.map((_, i) => `arg${i}`).join(", ");
      const paramOverload = paramList.map(p => `'${p}'`).join(", ");
      const hookFunc = `function(${paramArgs}) {`;

      if (builderAction === "log") {
        hookCode = `
            targetClass["${cleanMethod}"].overload(${paramOverload}).implementation = ${hookFunc}
                console.log("[AndroSentry] Hooked ${cleanCls}.${cleanMethod} with args:");
                ${paramList.map((p, i) => `console.log("  - Arg ${i} (${p}): " + arg${i});`).join("\n                ")}
                var result = this["${cleanMethod}"](${paramArgs});
                console.log("  - Return Value: " + result);
                return result;
            };`;
      } else if (builderAction === "true") {
        hookCode = `
            targetClass["${cleanMethod}"].overload(${paramOverload}).implementation = ${hookFunc}
                console.log("[AndroSentry] Hooked ${cleanCls}.${cleanMethod} - Overriding return value to true");
                return true;
            };`;
      } else if (builderAction === "false") {
        hookCode = `
            targetClass["${cleanMethod}"].overload(${paramOverload}).implementation = ${hookFunc}
                console.log("[AndroSentry] Hooked ${cleanCls}.${cleanMethod} - Overriding return value to false");
                return false;
            };`;
      } else if (builderAction === "custom") {
        hookCode = `
            targetClass["${cleanMethod}"].overload(${paramOverload}).implementation = ${hookFunc}
                console.log("[AndroSentry] Hooked ${cleanCls}.${cleanMethod} - Overriding return value to ${builderCustomInt}");
                return ${builderCustomInt};
            };`;
      } else if (builderAction === "void") {
        hookCode = `
            targetClass["${cleanMethod}"].overload(${paramOverload}).implementation = ${hookFunc}
                console.log("[AndroSentry] Hooked ${cleanCls}.${cleanMethod} (void)");
                this["${cleanMethod}"](${paramArgs});
            };`;
      }
    } else {
      if (builderAction === "log") {
        hookCode = `
            // Hook all overloads of ${cleanMethod}
            var methodOverloads = targetClass["${cleanMethod}"].overloads;
            for (var i = 0; i < methodOverloads.length; i++) {
                (function(index) {
                    var overload = methodOverloads[index];
                    overload.implementation = function() {
                        console.log("[AndroSentry] Hooked ${cleanCls}.${cleanMethod} (Overload " + index + ")");
                        for (var j = 0; j < arguments.length; j++) {
                            console.log("  - Arg " + j + ": " + arguments[j]);
                        }
                        var result = overload.apply(this, arguments);
                        console.log("  - Return Value: " + result);
                        return result;
                    };
                })(i);
            }`;
      } else if (builderAction === "true") {
        hookCode = `
            var methodOverloads = targetClass["${cleanMethod}"].overloads;
            for (var i = 0; i < methodOverloads.length; i++) {
                methodOverloads[i].implementation = function() {
                    console.log("[AndroSentry] Hooked ${cleanCls}.${cleanMethod} (Overload " + i + ") - Overriding return value to true");
                    return true;
                };
            }`;
      } else if (builderAction === "false") {
        hookCode = `
            var methodOverloads = targetClass["${cleanMethod}"].overloads;
            for (var i = 0; i < methodOverloads.length; i++) {
                methodOverloads[i].implementation = function() {
                    console.log("[AndroSentry] Hooked ${cleanCls}.${cleanMethod} (Overload " + i + ") - Overriding return value to false");
                    return false;
                };
            }`;
      } else if (builderAction === "custom") {
        hookCode = `
            var methodOverloads = targetClass["${cleanMethod}"].overloads;
            for (var i = 0; i < methodOverloads.length; i++) {
                methodOverloads[i].implementation = function() {
                    console.log("[AndroSentry] Hooked ${cleanCls}.${cleanMethod} (Overload " + i + ") - Overriding return value to ${builderCustomInt}");
                    return ${builderCustomInt};
                };
            }`;
      } else if (builderAction === "void") {
        hookCode = `
            var methodOverloads = targetClass["${cleanMethod}"].overloads;
            for (var i = 0; i < methodOverloads.length; i++) {
                methodOverloads[i].implementation = function() {
                    console.log("[AndroSentry] Hooked ${cleanCls}.${cleanMethod} (Overload " + i + ") (void)");
                    overload.apply(this, arguments);
                };
            }`;
      }
    }

    const compiled = `/*
 * AndroSentry v1.3.1 Generated Frida Script
 * Target Package: ${cleanPkg}
 * Target Class  : ${cleanCls}
 * Target Method : ${cleanMethod}
 */

Java.perform(function() {
    function runHook() {
        console.log("[AndroSentry] Starting instrumentation hook...");
        try {
            var targetClass = Java.use("${cleanCls}");
            ${hookCode.trim()}
            console.log("[AndroSentry] Hook applied successfully to ${cleanCls}.${cleanMethod}");
        } catch (err) {
            console.error("[AndroSentry] Error applying hook: " + err.message);
        }
    }

${delayCode}
});`;
    setBuilderScript(compiled);
  };

  useEffect(() => {
    generateLocalFridaScript();
  }, [builderPkg, builderClass, builderMethod, builderParams, builderAction, builderCustomInt, builderDelay]);

  const handleAIGenerateFrida = async () => {
    if (!fridaAIPrompt.trim()) return;
    setFridaAILoading(true);
    setFridaAIError(null);
    setFridaAIResult(null);
    try {
      const response = await fetch("/api/generate-frida", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: fridaAIPrompt,
          language: language
        })
      });

      if (!response.ok) {
        throw new Error(language === "vi" ? "Lỗi kết nối máy chủ khi tạo mã." : "Server connection error during generation.");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setFridaAIResult(data);
    } catch (err: any) {
      console.error("AI Frida generation error:", err);
      setFridaAIError(err.message || "An unexpected error occurred.");
    } finally {
      setFridaAILoading(false);
    }
  };


  const getTranslatedAdbCommand = (cmd: any) => {
    const tr = ADB_COMMANDS_TRANSLATIONS[language]?.[cmd.id];
    return {
      ...cmd,
      title: tr?.title || cmd.title,
      description: tr?.description || cmd.description,
    };
  };

  const getTranslatedApktoolStep = (step: any) => {
    const tr = APKTOOL_STEPS_TRANSLATIONS[language]?.[step.id];
    return {
      ...step,
      title: tr?.title || step.title,
      description: tr?.description || step.description,
      tip: tr?.tip || step.tip,
    };
  };

  const getTranslatedFridaScript = (script: any, idx: number) => {
    const id = `frida-${idx + 1}`;
    const tr = FRIDA_SCRIPTS_TRANSLATIONS[language]?.[id];
    return {
      ...script,
      title: tr?.title || script.title,
      description: tr?.description || script.description,
    };
  };

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
  const [terminalHeight, setTerminalHeight] = useState(320);
  const [isDraggingTerminal, setIsDraggingTerminal] = useState(false);
  const [simulationMode, setSimulationMode] = useState<boolean>(false);

  useEffect(() => {
    if (!isDraggingTerminal) return;

    const originalUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";

    const handleMouseMove = (e: MouseEvent) => {
      const newHeight = window.innerHeight - e.clientY;
      const maxHeight = window.innerHeight * 0.85;
      const minHeight = 110;
      if (newHeight >= minHeight && newHeight <= maxHeight) {
        setTerminalHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingTerminal(false);
      document.body.style.userSelect = originalUserSelect;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const clientY = e.touches[0].clientY;
      const newHeight = window.innerHeight - clientY;
      const maxHeight = window.innerHeight * 0.85;
      const minHeight = 110;
      if (newHeight >= minHeight && newHeight <= maxHeight) {
        setTerminalHeight(newHeight);
      }
    };

    const handleTouchEnd = () => {
      setIsDraggingTerminal(false);
      document.body.style.userSelect = originalUserSelect;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      document.body.style.userSelect = originalUserSelect;
    };
  }, [isDraggingTerminal]);

  const handleExecuteCommand = async (cmdString: string) => {
    setShowTerminal(true);
    setIsExecutingCmd(true);

    const newHistoryItem = {
      command: cmdString,
      output: simulationMode 
        ? " [MÔ PHỎNG] Đang tính toán và giả lập kết quả lệnh..."
        : " đang thực thi lệnh trên Kali Linux...",
      isError: false,
      timestamp: new Date().toLocaleTimeString()
    };

    setTerminalHistory(prev => [...prev, newHistoryItem]);
    const targetIdx = terminalHistory.length; // Index since we just appended one

    if (simulationMode) {
      // Simulate real delay for pentest output
      setTimeout(() => {
        const simResult = getSimulatedOutput(cmdString, language);
        setTerminalHistory(prev => {
          const copy = [...prev];
          copy[targetIdx] = {
            command: cmdString,
            output: simResult.output,
            isError: simResult.isError,
            timestamp: new Date().toLocaleTimeString()
          };
          return copy;
        });
        setIsExecutingCmd(false);
      }, 1000);
      return;
    }

    try {
      const response = await fetch("/api/execute-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmdString })
      });

      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");
      const data = isJson ? await response.json() : { error: "Không nhận được phản hồi JSON hợp lệ từ máy chủ." };

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
          const isSecurityBlock = response.status === 403;
          let output = `Lỗi: ${data.error || "Thực thi thất bại."}`;
          if (isSecurityBlock) {
            output += `\n\n💡 Mẹo: Bạn đang chạy trên môi trường Web đám mây. Hãy click bật nút "Mô phỏng" (Simulation Mode) màu đỏ ở góc bên phải thanh tiêu đề Console để trải nghiệm chạy thử nghiệm ảo cực kỳ mượt mà ngay bây giờ!`;
          }
          copy[targetIdx] = {
            command: cmdString,
            output: output,
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
          output: `Lỗi kết nối: ${err.message || "Không thể kết nối đến server Kali Localhost."}\n\n💡 Mẹo: Nếu bạn đang truy cập trực tuyến, hãy click bật nút "Mô phỏng" (Simulation Mode) ở góc bên phải thanh tiêu đề Console để trải nghiệm chạy thử nghiệm ảo ngay lập tức!`,
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
      .then((res) => {
        if (!res.ok) throw new Error("Yêu cầu kiểm tra sức khỏe thất bại.");
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return res.json();
        }
        throw new Error("Phản hồi không ở định dạng JSON.");
      })
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
      a.download = "Huong_Dan_Su_Dung_AndroSentry.docx";
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
      a.download = "Huong_Dan_Su_Dung_AndroSentry.md";
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
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Phản hồi từ máy chủ không hợp lệ.");
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
        body: JSON.stringify({ manifestContent: manifestText, language }),
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (response.ok) {
          setAuditResult(data);
        } else {
          setAuditError(data.error || "Có lỗi bất ngờ xảy ra trong quá trình phân tích.");
        }
      } else {
        setAuditError("Không nhận được phản hồi JSON hợp lệ từ máy chủ.");
      }
    } catch (err: any) {
      setAuditError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại cấu hình ứng dụng.");
    } finally {
      setIsAuditing(false);
    }
  };

  const handleLoadDecompiledManifest = async () => {
    setIsLoadingDecompiledManifest(true);
    setAuditError(null);
    try {
      const response = await fetch(`/api/get-decompiled-manifest?outputDir=${encodeURIComponent(apktoolOutputDir)}`);
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (response.ok && data.success) {
          setManifestText(data.content);
        } else {
          setAuditError(data.error || "Không thể tải tệp AndroidManifest.xml.");
        }
      } else {
        setAuditError("Không nhận được phản hồi JSON hợp lệ từ máy chủ.");
      }
    } catch (err: any) {
      setAuditError("Không thể kết nối đến máy chủ để đọc tệp Manifest.");
    } finally {
      setIsLoadingDecompiledManifest(false);
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
    
    md += `\n*Báo cáo được tạo tự động bởi AndroSentry - Trí tuệ nhân tạo hỗ trợ White Hat Hacker.*\n`;

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
          Báo cáo bảo mật được kết xuất bởi AndroSentry - Trợ lý Kiểm thử Xâm nhập Di động Chuyên nghiệp.
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
        body: JSON.stringify({ messages: history, language }),
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
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
      } else {
        setChatMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            role: "assistant",
            content: "⚠️ Lỗi: Máy chủ trả về định dạng phản hồi không hợp lệ.",
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
      className={`min-h-screen bg-primary-bg text-txt-main flex flex-col selection:bg-accent/35 selection:text-white ${isDraggingTerminal ? "" : "transition-[padding-bottom] duration-300"}`} 
      id="app-root"
      style={{ paddingBottom: showTerminal ? `${terminalHeight}px` : "44px", ...activeThemeVars as React.CSSProperties }}
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
                {t.title} <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-mono transition-all duration-300">v1.3.1</span>
              </h1>
              <p className="text-xs text-txt-muted transition-colors duration-300">{t.subtitle}</p>
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
                title={t.themeSelector}
              >
                {Object.entries(THEME_CONFIGS).map(([key, config]) => (
                  <option key={key} value={key} className="bg-secondary-bg text-txt-main">
                    {config.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-bg border border-border-main text-txt-muted hover:border-accent/40 transition-all duration-300" id="language-selector-container">
              <span className="text-xs">{LANGUAGES.find(l => l.code === language)?.flag || "🇻🇳"}</span>
              <select
                value={language}
                onChange={(e) => {
                  const newLang = e.target.value;
                  setLanguage(newLang);
                  localStorage.setItem("kali-android-pentest-lang", newLang);
                }}
                className="bg-transparent border-none text-white text-xs focus:ring-0 focus:outline-none font-medium cursor-pointer"
                id="language-select"
                title="Language"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-secondary-bg text-txt-main">
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleOpenGuide}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/35 border border-emerald-500/30 text-emerald-400 hover:text-white transition-all cursor-pointer font-medium" 
              id="view-guide-btn"
              title={t.viewGuideTooltip}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t.viewGuide}</span>
              <Eye className="w-3 h-3 opacity-70" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-bg border border-border-main" id="env-badge">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-txt-muted">{t.statusEmulator}</span>
            </div>
            {healthStatus.checked && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                healthStatus.aiConfigured 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                  : "bg-amber-500/10 border-amber-500/20 text-amber-400"
              }`} id="ai-status-badge">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{healthStatus.aiConfigured ? t.aiReady : t.aiNotConfigured}</span>
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
              <span>{t.quickGuide}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-accent/10 text-accent flex items-center justify-center font-mono text-[10px] font-bold border border-accent/30">1</span>
              <span>{parseInlineStyles(t.quickStep1)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-accent/10 text-accent flex items-center justify-center font-mono text-[10px] font-bold border border-accent/30">2</span>
              <span>{parseInlineStyles(t.quickStep2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-accent/10 text-accent flex items-center justify-center font-mono text-[10px] font-bold border border-accent/30">3</span>
              <span>{parseInlineStyles(t.quickStep3)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6" id="main-content">
        
        {/* TAB NAVIGATION */}
        <div className="flex items-center justify-between border-b border-border-head gap-4 relative pb-px" id="tab-navigation-container">
          {/* Subtle horizontal gradient overlay to indicate scroll availability on mobile */}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-primary-bg to-transparent pointer-events-none z-10 md:hidden opacity-40"></div>
          
          <div className="flex-1 flex overflow-x-auto whitespace-nowrap flex-nowrap gap-1.5 scrollbar-none scroll-smooth pb-px w-full" id="tab-navigation">
            <button
              id="tab-adb-btn"
              onClick={() => setActiveTab("adb")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer flex-shrink-0 ${
                activeTab === "adb"
                  ? "border-accent text-txt-main bg-secondary-bg"
                  : "border-transparent text-txt-muted hover:text-txt-main hover:bg-secondary-bg/30"
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>{t.tabAdb}</span>
            </button>

            <button
              id="tab-manifest-btn"
              onClick={() => setActiveTab("manifest")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer flex-shrink-0 ${
                activeTab === "manifest"
                  ? "border-accent text-txt-main bg-secondary-bg"
                  : "border-transparent text-txt-muted hover:text-txt-main hover:bg-secondary-bg/30"
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>{t.tabManifest}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-normal">{t.aiBadge}</span>
            </button>

            <button
              id="tab-apktool-btn"
              onClick={() => setActiveTab("apktool")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer flex-shrink-0 ${
                activeTab === "apktool"
                  ? "border-accent text-txt-main bg-secondary-bg"
                  : "border-transparent text-txt-muted hover:text-txt-main hover:bg-secondary-bg/30"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{t.tabApktool}</span>
            </button>

            <button
              id="tab-frida-btn"
              onClick={() => setActiveTab("frida")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer flex-shrink-0 ${
                activeTab === "frida"
                  ? "border-accent text-txt-main bg-secondary-bg"
                  : "border-transparent text-txt-muted hover:text-txt-main hover:bg-secondary-bg/30"
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>{t.tabFrida}</span>
            </button>

            <button
              id="tab-chat-btn"
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer flex-shrink-0 ${
                activeTab === "chat"
                  ? "border-accent text-txt-main bg-secondary-bg"
                  : "border-transparent text-txt-muted hover:text-txt-main hover:bg-secondary-bg/30"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t.tabChat}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </button>

            <button
              id="tab-staticscan-btn"
              onClick={() => setActiveTab("staticScan")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer flex-shrink-0 ${
                activeTab === "staticScan"
                  ? "border-accent text-txt-main bg-secondary-bg"
                  : "border-transparent text-txt-muted hover:text-txt-main hover:bg-secondary-bg/30"
              }`}
            >
              <Shield className="w-4 h-4 text-red-500 animate-pulse" />
              <span>{t.tabStaticScan}</span>
            </button>
          </div>

          {/* Persistent Quick Jump Dropdown Button */}
          <div className="relative pb-px flex-shrink-0" id="tab-more-dropdown-container">
            <button
              onClick={() => setIsTabDropdownOpen(!isTabDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-secondary-bg hover:bg-[#30363d] text-txt-muted hover:text-white border border-border-main cursor-pointer transition-all h-[36px]"
              id="tab-more-btn"
              title={t.tabMoreBtnTitle}
            >
              <Menu className="w-3.5 h-3.5 text-accent" />
              <span className="hidden sm:inline">{t.tabMoreBtnLabel}</span>
              <ChevronDown className="w-3 h-3 transition-transform duration-200" style={{ transform: isTabDropdownOpen ? 'rotate(180deg)' : 'none' }} />
            </button>
            
            {isTabDropdownOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsTabDropdownOpen(false)}></div>
                <div className="absolute right-0 mt-1.5 w-60 rounded-xl bg-[#161b22] border border-[#30363d] shadow-2xl p-1.5 z-40 flex flex-col gap-1 animate-slide-down">
                  <div className="px-2.5 py-1.5 text-[10px] text-[#8b949e] font-mono border-b border-[#21262d] mb-1">
                    {t.tabMoreBtnHeader}
                  </div>
                  
                  <button
                    onClick={() => { setActiveTab("adb"); setIsTabDropdownOpen(false); }}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                      activeTab === "adb" 
                        ? "bg-accent/10 text-white font-semibold" 
                        : "text-[#c9d1d9] hover:bg-[#21262d]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-[#8b949e]" />
                      <span>{t.tabAdb}</span>
                    </div>
                    {activeTab === "adb" && <Check className="w-3.5 h-3.5 text-accent" />}
                  </button>

                  <button
                    onClick={() => { setActiveTab("manifest"); setIsTabDropdownOpen(false); }}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                      activeTab === "manifest" 
                        ? "bg-accent/10 text-white font-semibold" 
                        : "text-[#c9d1d9] hover:bg-[#21262d]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{t.tabManifest}</span>
                    </div>
                    {activeTab === "manifest" && <Check className="w-3.5 h-3.5 text-accent" />}
                  </button>

                  <button
                    onClick={() => { setActiveTab("apktool"); setIsTabDropdownOpen(false); }}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                      activeTab === "apktool" 
                        ? "bg-accent/10 text-white font-semibold" 
                        : "text-[#c9d1d9] hover:bg-[#21262d]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-[#8b949e]" />
                      <span>{t.tabApktool}</span>
                    </div>
                    {activeTab === "apktool" && <Check className="w-3.5 h-3.5 text-accent" />}
                  </button>

                  <button
                    onClick={() => { setActiveTab("frida"); setIsTabDropdownOpen(false); }}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                      activeTab === "frida" 
                        ? "bg-accent/10 text-white font-semibold" 
                        : "text-[#c9d1d9] hover:bg-[#21262d]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-[#8b949e]" />
                      <span>{t.tabFrida}</span>
                    </div>
                    {activeTab === "frida" && <Check className="w-3.5 h-3.5 text-accent" />}
                  </button>

                  <button
                    onClick={() => { setActiveTab("chat"); setIsTabDropdownOpen(false); }}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                      activeTab === "chat" 
                        ? "bg-accent/10 text-white font-semibold" 
                        : "text-[#c9d1d9] hover:bg-[#21262d]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t.tabChat}</span>
                    </div>
                    {activeTab === "chat" && <Check className="w-3.5 h-3.5 text-accent" />}
                  </button>

                  <button
                    onClick={() => { setActiveTab("staticScan"); setIsTabDropdownOpen(false); }}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                      activeTab === "staticScan" 
                        ? "bg-accent/10 text-white font-semibold" 
                        : "text-[#c9d1d9] hover:bg-[#21262d]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                      <span>{t.tabStaticScan}</span>
                    </div>
                    {activeTab === "staticScan" && <Check className="w-3.5 h-3.5 text-accent" />}
                  </button>
                </div>
              </>
            )}
          </div>
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
                  <h3 className="font-semibold text-white">{t.paramTitle}</h3>
                </div>
                <p className="text-xs text-[#8b949e] mb-4">
                  {t.paramSubtitle}
                </p>

                <div className="flex flex-col gap-4" id="adb-inputs">
                  <div className="flex flex-col gap-1.5" id="input-package">
                    <label className="text-xs text-[#8b949e] font-mono">[PACKAGE_NAME] ({t.paramPackageLabel}):</label>
                    <input
                      type="text"
                      value={packageName}
                      onChange={(e) => setPackageName(e.target.value)}
                      className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-mono transition-colors"
                      placeholder="e.g. com.example.app"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5" id="input-activity">
                    <label className="text-xs text-[#8b949e] font-mono">[ACTIVITY_NAME] ({t.paramActivityLabel}):</label>
                    <input
                      type="text"
                      value={activityName}
                      onChange={(e) => setActivityName(e.target.value)}
                      className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-mono transition-colors"
                      placeholder="e.g. com.example.app.DashboardActivity"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5" id="input-action">
                    <label className="text-xs text-[#8b949e] font-mono">[ACTION_NAME] ({t.paramActionLabel}):</label>
                    <input
                      type="text"
                      value={actionName}
                      onChange={(e) => setActionName(e.target.value)}
                      className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-mono transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5" id="input-apkpath">
                    <label className="text-xs text-[#8b949e] font-mono">[APK_PATH_ON_DEVICE] ({t.paramApkLabel}):</label>
                    <input
                      type="text"
                      value={apkPath}
                      onChange={(e) => setApkPath(e.target.value)}
                      className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-mono transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5" id="input-filter">
                    <label className="text-xs text-[#8b949e] font-mono">[FILTER_KEYWORD] ({t.paramFilterLabel}):</label>
                    <input
                      type="text"
                      value={filterKeyword}
                      onChange={(e) => setFilterKeyword(e.target.value)}
                      className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-mono transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3" id="input-ports-grid">
                    <div className="flex flex-col gap-1.5" id="input-localport">
                      <label className="text-xs text-[#8b949e] font-mono">{t.paramKaliPort}:</label>
                      <input
                        type="text"
                        value={localPort}
                        onChange={(e) => setLocalPort(e.target.value)}
                        className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-mono transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5" id="input-deviceport">
                      <label className="text-xs text-[#8b949e] font-mono">{t.paramAndroidPort}:</label>
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
                <span className="font-semibold text-white uppercase text-[10px] tracking-wider text-red-400">{t.guideTitle}</span>
                <ol className="list-decimal pl-4 flex flex-col gap-1.5">
                  <li>{t.guideStep1}</li>
                  <li>{t.guideStep2}</li>
                  <li>{t.guideStep3}</li>
                  <li>{t.guideStep4}</li>
                  <li>{t.guideStep5}</li>
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
                    <span className="font-semibold text-white text-sm">{t.categoryRecon}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#30363d] text-[#8b949e] font-mono">ADB SHELL</span>
                </div>
                <div className="divide-y divide-[#21262d]" id="recon-commands">
                  {ADB_COMMANDS.filter(c => c.category === "recon").map(getTranslatedAdbCommand).map(cmd => (
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
                          title={t.runTooltip}
                          id={`run-btn-${cmd.id}`}
                        >
                          <Play className="w-3.5 h-3.5 fill-emerald-400" />
                          <span>{t.runBtn}</span>
                        </button>
                        <button
                          onClick={() => handleCopy(getProcessedCommand(cmd), cmd.id)}
                          className="p-1.5 rounded bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-white transition-colors cursor-pointer"
                          title={t.copyTooltip}
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
                    <span className="font-semibold text-white text-sm">{t.categoryData}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#30363d] text-[#8b949e] font-mono">PULL / LOGCAT</span>
                </div>
                <div className="divide-y divide-[#21262d]" id="data-commands">
                  {ADB_COMMANDS.filter(c => c.category === "data").map(getTranslatedAdbCommand).map(cmd => (
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
                          title={t.runTooltip}
                          id={`run-btn-${cmd.id}`}
                        >
                          <Play className="w-3.5 h-3.5 fill-emerald-400" />
                          <span>{t.runBtn}</span>
                        </button>
                        <button
                          onClick={() => handleCopy(getProcessedCommand(cmd), cmd.id)}
                          className="p-1.5 rounded bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-white transition-colors cursor-pointer"
                          title={t.copyTooltip}
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
                    <span className="font-semibold text-white text-sm">{t.categoryIntent}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#30363d] text-[#8b949e] font-mono">AM START / SEND</span>
                </div>
                <div className="divide-y divide-[#21262d]" id="intent-commands">
                  {ADB_COMMANDS.filter(c => c.category === "intent").map(getTranslatedAdbCommand).map(cmd => (
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
                          title={t.runTooltip}
                          id={`run-btn-${cmd.id}`}
                        >
                          <Play className="w-3.5 h-3.5 fill-emerald-400" />
                          <span>{t.runBtn}</span>
                        </button>
                        <button
                          onClick={() => handleCopy(getProcessedCommand(cmd), cmd.id)}
                          className="p-1.5 rounded bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-white transition-colors cursor-pointer"
                          title={t.copyTooltip}
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
                    <span className="font-semibold text-white text-sm">{t.categoryNetworking}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#30363d] text-[#8b949e] font-mono">ADB PORT</span>
                </div>
                <div className="divide-y divide-[#21262d]" id="reverse-commands">
                  {ADB_COMMANDS.filter(c => c.category === "reverse" || c.category === "shell").map(getTranslatedAdbCommand).map(cmd => (
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
                          title={t.runTooltip}
                          id={`run-btn-${cmd.id}`}
                        >
                          <Play className="w-3.5 h-3.5 fill-emerald-400" />
                          <span>{t.runBtn}</span>
                        </button>
                        <button
                          onClick={() => handleCopy(getProcessedCommand(cmd), cmd.id)}
                          className="p-1.5 rounded bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-white transition-colors cursor-pointer"
                          title={t.copyTooltip}
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
                    <span className="font-semibold text-white">{t.manifestEditorTitle}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleLoadDecompiledManifest}
                      disabled={isLoadingDecompiledManifest}
                      className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 disabled:text-emerald-800 transition-colors cursor-pointer"
                      title="Đọc tệp AndroidManifest.xml trực tiếp từ thư mục bạn đã decompile ở tab Quy trình Apktool"
                      id="load-decompiled-manifest-btn"
                    >
                      {isLoadingDecompiledManifest ? (
                        <div className="w-3.5 h-3.5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                      ) : (
                        <FolderOpen className="w-3.5 h-3.5" />
                      )}
                      <span>Đọc tệp đã Decompile</span>
                    </button>
                    <button
                      onClick={() => setManifestText(SAMPLE_MANIFEST)}
                      className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                      title={t.manifestUseSampleTooltip}
                      id="reset-sample-btn"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t.manifestUseSampleBtn}</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#8b949e]">
                  {t.manifestEditorDesc}
                </p>

                <div className="relative font-mono text-sm" id="textarea-container">
                  <textarea
                    id="manifest-textarea"
                    value={manifestText}
                    onChange={(e) => setManifestText(e.target.value)}
                    className="w-full h-[400px] bg-[#0d1117] border border-[#30363d] rounded-lg p-4 font-mono text-xs text-emerald-400 focus:outline-none focus:border-red-500 resize-y leading-relaxed"
                    placeholder={t.manifestTextareaPlaceholder}
                  />
                </div>

                <div className="flex items-center justify-between gap-4 mt-2" id="action-buttons">
                  <button
                    onClick={() => setManifestText("")}
                    className="px-4 py-2 text-xs border border-[#30363d] text-[#8b949e] hover:text-white rounded-lg hover:bg-[#21262d] transition-colors cursor-pointer"
                    id="clear-xml-btn"
                  >
                    {t.manifestClearBtn}
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
                        <span>{t.manifestAuditing}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                        <span>{t.manifestAuditBtn}</span>
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
                    <span className="font-semibold text-white">{t.manifestResultTitle}</span>
                  </div>
                  {auditResult && (
                    <div className="flex items-center gap-2" id="score-badge">
                      <span className="text-xs text-[#8b949e]">{t.manifestResultScoreLabel}</span>
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
                    <p className="font-medium text-white mb-1 text-sm">{t.manifestEmptyTitle}</p>
                    <p className="text-xs max-w-sm">
                      {t.manifestEmptyDesc}
                    </p>
                  </div>
                )}

                {/* Loading State */}
                {isAuditing && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8" id="loading-state">
                    <div className="w-10 h-10 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-white font-medium text-sm">{t.manifestLoadingTitle}</p>
                    <p className="text-xs text-[#8b949e] mt-1 max-w-xs">
                      {t.manifestLoadingDesc}
                    </p>
                  </div>
                )}

                {/* Error State */}
                {auditError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex gap-3" id="error-alert">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div id="error-message">
                      <p className="font-semibold">{t.manifestErrorTitle}</p>
                      <p className="text-xs text-red-300 mt-1">{auditError}</p>
                    </div>
                  </div>
                )}

                {/* Success: Findings List */}
                {auditResult && (
                  <div className="flex-1 flex flex-col gap-4" id="findings-container">
                    <div className="bg-[#1f242c] p-4 rounded-lg border border-[#21262d]" id="audit-summary">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">{t.manifestSummaryTitle}</h4>
                      <p className="text-xs text-[#8b949e] leading-relaxed">{auditResult.summary}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mt-2 border-b border-[#21262d] pb-2" id="findings-count-bar">
                      <span className="text-xs font-bold text-[#8b949e]">{t.manifestFindingsListTitle} ({auditResult.findings?.length || 0})</span>
                      <div className="flex items-center gap-2" id="report-export-buttons">
                        <button
                          onClick={handleExportMarkdown}
                          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-[#ef4444] hover:text-[#ef4444]/80 border border-[#ef4444]/20 hover:border-[#ef4444]/40 transition-colors cursor-pointer font-mono"
                          title={t.exportMdTooltip}
                          id="export-md-btn"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{t.exportMdBtn}</span>
                        </button>
                        <button
                          onClick={handleExportHtml}
                          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded bg-[#ef4444]/10 hover:bg-[#ef4444]/25 text-white hover:text-white border border-[#ef4444]/30 hover:border-[#ef4444]/50 transition-colors cursor-pointer font-mono"
                          title={t.exportHtmlTooltip}
                          id="export-html-btn"
                        >
                          <Download className="w-3.5 h-3.5 text-[#ef4444]" />
                          <span>{t.exportHtmlBtn}</span>
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
                              <span className="text-red-400">{t.findingLocationLabel}:</span>
                              <span className="text-white">{finding.location}</span>
                            </div>

                            <div className="bg-[#0d1117]/50 rounded border border-[#21262d] p-3" id="finding-remediation">
                              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">{t.findingRemediationLabel}:</span>
                              <p className="text-xs text-[#8b949e] whitespace-pre-wrap">{finding.remediation}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-xs text-[#8b949e]" id="no-findings">
                          🎉 {t.noFindingsMessage}
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
                  <h3 className="font-semibold text-white">{t.apktoolSidebarTitle}</h3>
                </div>
                <p className="text-xs text-[#8b949e] mb-4">
                  {t.apktoolSidebarDesc}
                </p>

                <div className="flex flex-col gap-4" id="apktool-fields">
                  <div className="flex flex-col gap-1.5" id="apktool-name-field">
                    <label className="text-xs text-[#8b949e] font-mono">{t.apktoolInputOrigLabel}</label>
                    <input
                      type="text"
                      value={apktoolFileName}
                      onChange={(e) => setApktoolFileName(e.target.value)}
                      className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-mono transition-colors"
                      placeholder="e.g. vulnerable_app"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5" id="apktool-out-field">
                    <label className="text-xs text-[#8b949e] font-mono">{t.apktoolInputOutLabel}</label>
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
                <span className="font-semibold text-white uppercase text-[10px] tracking-wider text-red-400">{t.apktoolErrorsTitle}:</span>
                <ul className="list-disc pl-4 flex flex-col gap-1.5">
                  <li><strong className="text-white">{t.apktoolErrResourceLabel}</strong> {t.apktoolErrResourceDesc}</li>
                  <li><strong className="text-white">{t.apktoolErrSignLabel}</strong> {t.apktoolErrSignDesc}</li>
                  <li><strong className="text-white">{t.apktoolErrZipalignLabel}</strong> {t.apktoolErrZipalignDesc}</li>
                </ul>
              </div>
            </div>

            {/* Step-by-Step CLI command logs */}
            <div className="lg:col-span-8 flex flex-col gap-4" id="apktool-steps-panel">
              <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-5" id="apktool-steps-card">
                <h3 className="font-semibold text-white border-b border-[#21262d] pb-3 mb-4 flex items-center justify-between">
                  <span>{t.apktoolStepsTitle}</span>
                  <span className="text-xs font-normal text-[#8b949e]">Kali Terminal Commands</span>
                </h3>

                <div className="flex flex-col gap-6" id="steps-timeline">
                  {APKTOOL_STEPS.map(getTranslatedApktoolStep).map((step, idx) => {
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
                                title={t.runTooltip}
                                id={`step-run-btn-${step.id}`}
                              >
                                <Play className="w-3 h-3 fill-emerald-400" />
                                <span>{t.runBtn}</span>
                              </button>
                              <button
                                onClick={() => handleCopy(finalCmd, step.id)}
                                className="p-1.5 rounded bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-white transition-colors cursor-pointer"
                                title={t.copyTooltip}
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

            {/* Task Queue & Workspace Status (Phase 4 Integration) */}
            <div className="lg:col-span-12 bg-[#161b22] border border-[#21262d] rounded-xl p-5 mt-4" id="task-queue-card">
              <h3 className="font-semibold text-white border-b border-[#21262d] pb-3 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-red-500 animate-pulse" />
                  <span>{t.queueTitle}</span>
                </div>
                <button
                  onClick={fetchTasks}
                  className="p-1 rounded hover:bg-[#21262d] text-[#8b949e] hover:text-white transition-colors cursor-pointer"
                  title={t.queueRefreshTooltip}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </h3>

              <div className="text-xs text-[#8b949e] mb-4 leading-relaxed">
                {t.queueDescText1}<code className="text-red-400 font-mono">apktool</code>{t.queueDescText2}<code className="text-red-400 font-mono">jadx</code>{t.queueDescText3}<code className="text-cyan-400 font-mono">Workspace Isolation</code>{t.queueDescText4}<code className="text-cyan-400 font-mono">workspaces/task-id</code>{t.queueDescText5}
              </div>

              {tasksList.length === 0 ? (
                <div className="text-center py-6 text-[#8b949e] text-xs border border-dashed border-[#21262d] rounded-lg">
                  {t.queueEmpty}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#21262d] text-[#8b949e] font-mono text-[10px] uppercase">
                        <th className="py-2 px-3">{t.queueThId}</th>
                        <th className="py-2 px-3">{t.queueThCmd}</th>
                        <th className="py-2 px-3">{t.queueThStatus}</th>
                        <th className="py-2 px-3">{t.queueThWorkspace}</th>
                        <th className="py-2 px-3 text-right">{t.queueThActions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasksList.slice(0, 5).map((task) => (
                        <tr key={task.id} className="border-b border-[#21262d] hover:bg-[#1c2128]/50 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-[11px] text-gray-400">
                            task-{task.id.slice(0, 8)}...
                          </td>
                          <td className="py-2.5 px-3 font-mono text-emerald-400 truncate max-w-[240px]" title={task.command}>
                            {task.command}
                          </td>
                          <td className="py-2.5 px-3">
                            {task.status === "pending" && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-medium">
                                {t.queueStatusPending}
                              </span>
                            )}
                            {task.status === "running" && (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                {t.queueStatusRunning}
                              </span>
                            )}
                            {task.status === "completed" && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                                {t.queueStatusCompleted}
                              </span>
                            )}
                            {task.status === "failed" && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
                                {t.queueStatusFailed}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[10px] text-cyan-400">
                            workspaces/task-{task.id.slice(0, 6)}...
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => setSelectedQueueTask(task)}
                              className="px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] hover:text-white transition-colors text-[11px] cursor-pointer"
                            >
                              {t.queueActionViewLogs}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Selected Task Details Modal (Task Queue Logs) */}
        {selectedQueueTask && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in" id="task-logs-modal">
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl" id="task-logs-modal-container">
              {/* Header */}
              <div className="p-4 border-b border-[#21262d] flex justify-between items-center" id="task-logs-header">
                <div>
                  <h3 className="font-bold text-white text-sm">{t.logsModalTitle} task-{selectedQueueTask.id.slice(0, 12)}</h3>
                  <p className="text-xs text-[#8b949e] font-mono mt-0.5">{t.logsModalWorkspace} {selectedQueueTask.workspaceDir}</p>
                </div>
                <button
                  onClick={() => setSelectedQueueTask(null)}
                  className="p-1 rounded hover:bg-[#21262d] text-[#8b949e] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Info Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-[#0d1117] border-b border-[#21262d] text-[11px]">
                <div>
                  <span className="text-[#8b949e] block">{t.logsModalStatus}</span>
                  <strong className="text-white capitalize">
                    {selectedQueueTask.status === "pending" && t.queueStatusPending}
                    {selectedQueueTask.status === "running" && t.queueStatusRunning}
                    {selectedQueueTask.status === "completed" && t.queueStatusCompleted}
                    {selectedQueueTask.status === "failed" && t.queueStatusFailed}
                  </strong>
                </div>
                <div>
                  <span className="text-[#8b949e] block">{t.logsModalExitCode}</span>
                  <strong className="text-white">{selectedQueueTask.code !== null ? selectedQueueTask.code : "N/A"}</strong>
                </div>
                <div>
                  <span className="text-[#8b949e] block">{t.logsModalCreatedAt}</span>
                  <strong className="text-white">{new Date(selectedQueueTask.createdAt).toLocaleTimeString()}</strong>
                </div>
                <div>
                  <span className="text-[#8b949e] block">{t.logsModalStartedAt}</span>
                  <strong className="text-white">
                    {selectedQueueTask.startedAt ? new Date(selectedQueueTask.startedAt).toLocaleTimeString() : "N/A"}
                  </strong>
                </div>
              </div>

              {/* Logs terminal area */}
              <div className="flex-1 overflow-y-auto p-4 bg-[#0d1117] font-mono text-xs text-gray-300 flex flex-col gap-3 min-h-[300px]">
                <div>
                  <span className="text-red-500">$ </span>
                  <span className="text-yellow-500">{selectedQueueTask.originalCommand}</span>
                </div>
                
                {selectedQueueTask.stdout && (
                  <div className="whitespace-pre-wrap">
                    <span className="text-[#8b949e] block border-b border-[#21262d] pb-1 mb-1 font-sans text-[10px] uppercase tracking-wider">{t.logsModalStdout}</span>
                    {selectedQueueTask.stdout}
                  </div>
                )}

                {selectedQueueTask.stderr && (
                  <div className="whitespace-pre-wrap text-red-400">
                    <span className="text-[#8b949e] block border-b border-[#21262d] pb-1 mb-1 font-sans text-[10px] uppercase tracking-wider">{t.logsModalStderr}</span>
                    {selectedQueueTask.stderr}
                  </div>
                )}

                {selectedQueueTask.error && (
                  <div className="whitespace-pre-wrap text-red-500 font-bold">
                    <span className="text-red-500 block border-b border-[#21262d] pb-1 mb-1 font-sans text-[10px] uppercase tracking-wider">{t.logsModalSysError}</span>
                    {selectedQueueTask.error}
                  </div>
                )}

                {!selectedQueueTask.stdout && !selectedQueueTask.stderr && !selectedQueueTask.error && (
                  <div className="text-gray-500 italic">{t.logsModalWaiting}</div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-[#21262d] flex justify-end" id="task-logs-footer">
                <button
                  onClick={() => setSelectedQueueTask(null)}
                  className="px-4 py-1.5 rounded bg-[#21262d] hover:bg-[#30363d] text-white transition-colors text-xs cursor-pointer"
                >
                  {t.logsModalCloseBtn}
                </button>
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
                  <span>{t.fridaStudioTitle}</span>
                </h2>
                <p className="text-xs text-[#8b949e] mt-1">
                  {t.fridaStudioDesc}
                </p>
              </div>

              {/* Subtabs Nav */}
              <div className="flex border-b border-[#21262d] mb-6 gap-2 overflow-x-auto scrollbar-none" id="frida-subtabs-nav">
                <button
                  onClick={() => setFridaSubTab("presets")}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    fridaSubTab === "presets"
                      ? "border-red-500 text-white bg-[#21262d]/30"
                      : "border-transparent text-[#8b949e] hover:text-white"
                  }`}
                  id="frida-subtab-btn-presets"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>{t.fridaTabPresets}</span>
                </button>
                <button
                  onClick={() => setFridaSubTab("builder")}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    fridaSubTab === "builder"
                      ? "border-red-500 text-white bg-[#21262d]/30"
                      : "border-transparent text-[#8b949e] hover:text-white"
                  }`}
                  id="frida-subtab-btn-builder"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>{t.fridaTabBuilder}</span>
                </button>
                <button
                  onClick={() => setFridaSubTab("ai")}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    fridaSubTab === "ai"
                      ? "border-red-500 text-white bg-[#21262d]/30"
                      : "border-transparent text-[#8b949e] hover:text-white"
                  }`}
                  id="frida-subtab-btn-ai"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  <span>{t.fridaTabAI}</span>
                </button>
              </div>

              {/* TAB CONTENT: PRESETS */}
              {fridaSubTab === "presets" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in" id="frida-list-grid">
                  {FRIDA_SCRIPTS.map(getTranslatedFridaScript).map((script, idx) => (
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
                            title={t.copyTooltip}
                            id={`frida-copy-${idx}`}
                          >
                            {copiedId === `frida-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="bg-[#0d1117] rounded-lg p-2 px-3 border border-[#21262d] text-[10px] font-mono text-[#8b949e] flex items-center justify-between mt-2" id={`frida-run-tip-${idx}`}>
                        <span>{t.fridaRunTip}</span>
                        <code className="text-cyan-400">frida -U -f {packageName} -l script.js</code>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB CONTENT: INTERACTIVE BUILDER */}
              {fridaSubTab === "builder" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in" id="frida-builder-layout">
                  {/* Left Controls Form */}
                  <div className="lg:col-span-5 flex flex-col gap-4" id="frida-builder-inputs">
                    <div className="bg-[#1c2128] border border-[#30363d] rounded-xl p-4 flex flex-col gap-4">
                      {/* Package Name */}
                      <div id="builder-pkg-group">
                        <label className="block text-xs font-semibold text-[#8b949e] mb-1.5">{t.fridaLabelPackage}</label>
                        <input
                          type="text"
                          value={builderPkg}
                          onChange={(e) => setBuilderPkg(e.target.value)}
                          className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 transition-colors"
                          placeholder="com.example.app"
                          id="builder-input-pkg"
                        />
                      </div>

                      {/* Class Name */}
                      <div id="builder-class-group">
                        <label className="block text-xs font-semibold text-[#8b949e] mb-1.5">{t.fridaLabelClass}</label>
                        <input
                          type="text"
                          value={builderClass}
                          onChange={(e) => setBuilderClass(e.target.value)}
                          className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 transition-colors font-mono"
                          placeholder="com.example.app.MainActivity"
                          id="builder-input-class"
                        />
                      </div>

                      {/* Method Name */}
                      <div id="builder-method-group">
                        <label className="block text-xs font-semibold text-[#8b949e] mb-1.5">{t.fridaLabelMethod}</label>
                        <input
                          type="text"
                          value={builderMethod}
                          onChange={(e) => setBuilderMethod(e.target.value)}
                          className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 transition-colors font-mono"
                          placeholder="checkPremium"
                          id="builder-input-method"
                        />
                      </div>

                      {/* Params types */}
                      <div id="builder-params-group">
                        <label className="block text-xs font-semibold text-[#8b949e] mb-1.5">
                          {t.fridaLabelParams}
                          <span className="text-[10px] text-[#58a6ff] ml-1 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={builderParams}
                          onChange={(e) => setBuilderParams(e.target.value)}
                          className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 transition-colors font-mono"
                          placeholder="java.lang.String, int"
                          id="builder-input-params"
                        />
                      </div>

                      {/* Action Selection */}
                      <div id="builder-action-group">
                        <label className="block text-xs font-semibold text-[#8b949e] mb-1.5">{t.fridaLabelAction}</label>
                        <div className="flex flex-col gap-2">
                          {[
                            { value: "log", label: t.fridaActionLog },
                            { value: "true", label: t.fridaActionTrue },
                            { value: "false", label: t.fridaActionFalse },
                            { value: "custom", label: t.fridaActionCustom },
                            { value: "void", label: t.fridaActionVoid },
                          ].map((act) => (
                            <label key={act.value} className="flex items-center gap-2 cursor-pointer text-xs text-white">
                              <input
                                type="radio"
                                name="builderAction"
                                value={act.value}
                                checked={builderAction === act.value}
                                onChange={() => setBuilderAction(act.value as any)}
                                className="text-red-500 accent-red-500 focus:ring-0 cursor-pointer"
                              />
                              <span className={builderAction === act.value ? "text-white font-medium" : "text-[#8b949e]"}>{act.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Custom Integer Input */}
                      {builderAction === "custom" && (
                        <div className="animate-fade-in" id="builder-customint-group">
                          <label className="block text-xs font-semibold text-[#8b949e] mb-1.5">{t.fridaCustomIntLabel}</label>
                          <input
                            type="number"
                            value={builderCustomInt}
                            onChange={(e) => setBuilderCustomInt(parseInt(e.target.value) || 0)}
                            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 transition-colors"
                            id="builder-input-customint"
                          />
                        </div>
                      )}

                      {/* Delay Start */}
                      <div id="builder-delay-group">
                        <label className="block text-xs font-semibold text-[#8b949e] mb-1.5">{t.fridaLabelDelay}</label>
                        <input
                          type="number"
                          value={builderDelay}
                          onChange={(e) => setBuilderDelay(parseInt(e.target.value) || 0)}
                          className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 transition-colors"
                          placeholder="0"
                          id="builder-input-delay"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Generated Output View */}
                  <div className="lg:col-span-7 flex flex-col gap-4" id="frida-builder-output">
                    <div className="bg-[#1c2128] border border-[#30363d] rounded-xl p-5 flex flex-col gap-3 h-full">
                      <div className="flex items-center justify-between border-b border-[#30363d] pb-3 mb-2" id="builder-output-header">
                        <h4 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                          <Sliders className="w-3.5 h-3.5 text-red-500" />
                          <span>{t.fridaGeneratedScriptHeader}</span>
                        </h4>
                        <button
                          onClick={() => handleCopy(builderScript, "builder-script")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                          id="builder-copy-btn"
                        >
                          {copiedId === "builder-script" ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Script</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="relative flex-grow flex" id="builder-code-editor">
                        <pre className="bg-[#0d1117] border border-[#21262d] rounded-xl p-4 text-xs font-mono text-emerald-400 overflow-x-auto overflow-y-auto max-h-[480px] lg:max-h-none min-h-[300px] w-full leading-relaxed">
                          {builderScript}
                        </pre>
                      </div>

                      <div className="bg-[#0d1117] rounded-lg p-3 border border-[#21262d] text-xs font-mono text-[#8b949e] flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2" id="builder-run-tip">
                        <span>{t.fridaRunTip}</span>
                        <code className="text-cyan-400 break-all">frida -U -f {builderPkg} -l script.js</code>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: AI SCRIPT GENERATOR */}
              {fridaSubTab === "ai" && (
                <div className="flex flex-col gap-5 animate-fade-in" id="frida-ai-layout">
                  {/* Prompt input card */}
                  <div className="bg-[#1c2128] border border-[#30363d] rounded-xl p-5 flex flex-col gap-4" id="frida-ai-input-card">
                    <div className="flex items-center gap-2 text-white font-bold text-sm" id="frida-ai-prompt-header">
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                      <span>{t.fridaTabAI}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3" id="frida-ai-prompt-field">
                      <input
                        type="text"
                        value={fridaAIPrompt}
                        onChange={(e) => setFridaAIPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAIGenerateFrida()}
                        className="flex-grow bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-red-500 transition-colors"
                        placeholder={t.fridaAIPromptPlaceholder}
                        disabled={fridaAILoading}
                        id="frida-ai-prompt-input"
                      />
                      <button
                        onClick={handleAIGenerateFrida}
                        disabled={fridaAILoading || !fridaAIPrompt.trim()}
                        className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                        id="frida-ai-generate-btn"
                      >
                        {fridaAILoading ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                            <span>{t.fridaAIBtn}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Pre-defined fast prompts */}
                    <div className="flex flex-wrap gap-2 text-xs" id="frida-ai-quick-prompts">
                      {[
                        { label: "Bypass SSL Pinning (OkHttp3)", prompt: "Write a Frida script to bypass SSL pinning in OkHttp3" },
                        { label: "Bypass Root Detection (RootBeer)", prompt: "Write a Frida script to bypass RootBeer root detection libraries" },
                        { label: "Hook AES Crypto Keys", prompt: "Write a Frida script to hook javax.crypto.Cipher.init to print secret key and initialization vector" },
                        { label: "Hook Logcat Strings", prompt: "Write a Frida script to intercept android.util.Log.d and print all debug messages" },
                      ].map((qp, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setFridaAIPrompt(qp.prompt);
                            // Auto-focus input
                            const input = document.getElementById("frida-ai-prompt-input");
                            if (input) input.focus();
                          }}
                          className="bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] hover:border-[#8b949e] text-[#8b949e] hover:text-white px-2.5 py-1 rounded-full transition-all text-[11px] cursor-pointer"
                          id={`frida-ai-qp-${index}`}
                        >
                          {qp.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Errors display */}
                  {fridaAIError && (
                    <div className="bg-[#2a1215] border border-[#fa3b4c]/30 rounded-xl p-4 text-xs text-[#ff7b72] flex items-start gap-3 animate-fade-in" id="frida-ai-error-box">
                      <AlertTriangle className="w-4 h-4 text-[#ff7b72] shrink-0 mt-0.5" />
                      <span>{fridaAIError}</span>
                    </div>
                  )}

                  {/* AI Output Result Layout */}
                  {fridaAIResult && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in" id="frida-ai-result-panel">
                      {/* Code Block */}
                      <div className="bg-[#1c2128] border border-[#30363d] rounded-xl p-5 flex flex-col gap-3" id="frida-ai-result-script">
                        <div className="flex items-center justify-between border-b border-[#30363d] pb-3" id="frida-ai-code-header">
                          <h4 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                            <Code className="w-3.5 h-3.5 text-red-500" />
                            <span>{t.fridaGeneratedScriptHeader}</span>
                          </h4>
                          <button
                            onClick={() => handleCopy(fridaAIResult.script, "ai-script")}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                            id="ai-copy-btn"
                          >
                            {copiedId === "ai-script" ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Script</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="bg-[#0d1117] border border-[#21262d] rounded-xl p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-[450px] leading-relaxed">
                          {fridaAIResult.script}
                        </pre>
                        <div className="bg-[#0d1117] rounded-lg p-3 border border-[#21262d] text-xs font-mono text-[#8b949e] flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-1" id="ai-run-tip">
                          <span>{t.fridaRunTip}</span>
                          <code className="text-cyan-400 break-all">frida -U -f {packageName} -l script.js</code>
                        </div>
                      </div>

                      {/* Explanation Block */}
                      <div className="bg-[#1c2128] border border-[#30363d] rounded-xl p-5 flex flex-col gap-3" id="frida-ai-result-explanation">
                        <h4 className="text-xs font-bold text-white border-b border-[#30363d] pb-3 uppercase tracking-wider flex items-center gap-2">
                          <Info className="w-3.5 h-3.5 text-red-500" />
                          <span>{t.fridaAIExplanationHeader}</span>
                        </h4>
                        <div className="text-xs text-[#c9d1d9] leading-relaxed whitespace-pre-wrap max-h-[450px] overflow-y-auto pr-2" id="frida-ai-explanation-text">
                          {fridaAIResult.explanation}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick guide to install Frida on phone */}
            <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-5" id="frida-setup-guide">
              <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-red-500" />
                <span>{t.fridaSetupTitle}</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-[#8b949e]" id="frida-setup-steps">
                <div className="bg-[#0d1117] p-3 rounded-lg border border-[#21262d]" id="frida-step-1">
                  <span className="font-bold text-white block mb-1">{t.fridaStep1Title}</span>
                  {t.fridaStep1Desc}
                </div>
                <div className="bg-[#0d1117] p-3 rounded-lg border border-[#21262d]" id="frida-step-2">
                  <span className="font-bold text-white block mb-1">{t.fridaStep2Title}</span>
                  {t.fridaStep2Desc}
                  <code className="block mt-1 text-emerald-400 bg-[#161b22] p-1 rounded">adb push frida-server /data/local/tmp/</code>
                </div>
                <div className="bg-[#0d1117] p-3 rounded-lg border border-[#21262d]" id="frida-step-3">
                  <span className="font-bold text-white block mb-1">{t.fridaStep3Title}</span>
                  {t.fridaStep3Desc}
                  <code className="block mt-1 text-emerald-400 bg-[#161b22] p-1 rounded">adb shell "chmod 755 /data/local/tmp/frida-server"</code>
                </div>
                <div className="bg-[#0d1117] p-3 rounded-lg border border-[#21262d]" id="frida-step-4">
                  <span className="font-bold text-white block mb-1">{t.fridaStep4Title}</span>
                  {t.fridaStep4Desc}
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
                  <h3 className="font-semibold text-white">{t.chatAgentTitle}</h3>
                </div>
                <p className="text-xs text-[#8b949e] leading-relaxed mb-4">
                  {t.chatAgentDesc}
                </p>

                <div className="flex flex-col gap-2.5" id="preset-buttons">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-red-400 block">{t.chatSuggestionsTitle}:</span>
                  
                  <button
                    onClick={() => setUserChatInput(t.chatPreset1Query)}
                    className="w-full text-left p-2.5 rounded-lg bg-[#0d1117] hover:bg-[#21262d] border border-[#21262d] hover:border-[#30363d] text-xs text-[#c9d1d9] transition-all cursor-pointer"
                    id="preset-btn-1"
                  >
                    🚀 {t.chatPreset1Text}
                  </button>

                  <button
                    onClick={() => setUserChatInput(t.chatPreset2Query)}
                    className="w-full text-left p-2.5 rounded-lg bg-[#0d1117] hover:bg-[#21262d] border border-[#21262d] hover:border-[#30363d] text-xs text-[#c9d1d9] transition-all cursor-pointer"
                    id="preset-btn-2"
                  >
                    🔒 {t.chatPreset2Text}
                  </button>

                  <button
                    onClick={() => setUserChatInput(t.chatPreset3Query)}
                    className="w-full text-left p-2.5 rounded-lg bg-[#0d1117] hover:bg-[#21262d] border border-[#21262d] hover:border-[#30363d] text-xs text-[#c9d1d9] transition-all cursor-pointer"
                    id="preset-btn-3"
                  >
                    🛠️ {t.chatPreset3Text}
                  </button>

                  <button
                    onClick={() => setUserChatInput(t.chatPreset4Query)}
                    className="w-full text-left p-2.5 rounded-lg bg-[#0d1117] hover:bg-[#21262d] border border-[#21262d] hover:border-[#30363d] text-xs text-[#c9d1d9] transition-all cursor-pointer"
                    id="preset-btn-4"
                  >
                    🔑 {t.chatPreset4Text}
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
                      <p className="text-[10px] text-[#8b949e]">{t.chatAgentSub}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setChatMessages([
                      {
                        id: "welcome",
                        role: "assistant",
                        content: t.chatWelcomeMessage,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }
                    ])}
                    className="text-xs text-[#8b949e] hover:text-white transition-colors cursor-pointer"
                    id="reset-chat-btn"
                  >
                    {t.chatClearHistoryBtn}
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
                      <span className="text-[10px] text-[#8b949e] mb-1 font-mono">{t.chatTyping}</span>
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
                    placeholder={t.chatInputPlaceholder}
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

        {activeTab === "staticScan" && (
          <StaticScanTab
            simulationMode={simulationMode}
            language={language}
            t={t}
          />
        )}

      </main>

      {/* PERSISTENT KALI LIVE TERMINAL DRAWER */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-[#0d1117] border-t border-[#30363d] z-50 flex flex-col ${
          isDraggingTerminal ? "" : "transition-all duration-300"
        }`}
        style={{ height: showTerminal ? `${terminalHeight}px` : "44px" }}
        id="kali-terminal-drawer"
      >
        {/* Resize Drag Handle */}
        {showTerminal && (
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              setIsDraggingTerminal(true);
            }}
            onTouchStart={() => {
              setIsDraggingTerminal(true);
            }}
            className="absolute top-[-5px] left-0 right-0 h-[10px] cursor-ns-resize bg-transparent hover:bg-red-500/30 active:bg-red-500/50 transition-colors z-[60] flex items-center justify-center group"
            title="Kéo để thay đổi chiều cao console"
          >
            <div className="w-16 h-[3px] bg-red-500/10 group-hover:bg-red-500/80 rounded transition-colors" />
          </div>
        )}
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
              {t.termTitle} {isExecutingCmd && <span className="text-[10px] text-amber-400 font-normal animate-pulse">{t.termExecuting}</span>}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSimulationMode(!simulationMode);
              }}
              className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border transition-all duration-300 flex items-center gap-1.5 ${
                simulationMode 
                  ? "bg-red-950/40 text-red-400 border-red-500/30 hover:bg-red-900/40" 
                  : "bg-[#21262d] text-[#8b949e] border-[#30363d] hover:text-white"
              }`}
              id="toggle-simulation-mode-btn"
              title="Chuyển đổi giữa chế độ chạy thật (Localhost) và chế độ mô phỏng ảo (Web)"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${simulationMode ? "bg-red-500 animate-pulse" : "bg-[#8b949e]"}`} />
              {simulationMode ? t.termSimModeActive : t.termSimModeInactive}
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setTerminalHistory([]);
              }}
              className="text-[10px] text-[#8b949e] hover:text-white font-mono bg-[#21262d] px-2 py-0.5 rounded border border-[#30363d] transition-colors"
              id="clear-terminal-history-btn"
            >
              {t.termClearLogs}
            </button>
            <span className="text-xs text-[#8b949e] font-mono">
              {showTerminal ? t.termCollapse : t.termExpand}
            </span>
          </div>
        </div>

        {/* Console logs */}
        {showTerminal && (
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-[#c9d1d9] flex flex-col gap-3 bg-[#090d13]" id="terminal-logs-container">
            {simulationMode && (
              <div className="bg-red-950/15 border border-red-900/25 text-red-400 px-3 py-1.5 rounded text-[10px] font-mono flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                <span>{t.termSimNotice}</span>
              </div>
            )}
            {terminalHistory.length === 0 ? (
              <div className="text-[#8b949e] italic text-center py-8">{t.termEmptyState}</div>
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
              placeholder={t.termPlaceholder}
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
            <span className="text-[10px] text-[#8b949e] font-mono">{t.termPressEnter}</span>
          </div>
        )}
      </div>

      {/* FOOTER BAR */}
      <footer className="border-t border-[#21262d] bg-[#161b22] py-4 px-6 text-center text-xs text-[#8b949e]" id="footer-bar">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2" id="footer-content">
          <p id="footer-copyright">
            {t.footerCopyright}
          </p>
          <p className="font-mono text-[10px]" id="disclaimer">
            {t.footerDisclaimer}
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
                    {t.guideModalTitle}
                  </h3>
                  <p className="text-xs text-[#8b949e]">{t.guideModalSubtitle}</p>
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
                  title={t.guideDownloadMd}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>{isDownloadingGuideMd ? "..." : t.guideDownloadMd}</span>
                </button>
                <button
                  onClick={handleDownloadGuide}
                  disabled={isDownloadingGuide}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:text-white text-xs font-medium transition-colors cursor-pointer ${
                    isDownloadingGuide ? "bg-red-600/5 opacity-50 cursor-not-allowed" : "bg-red-600/10 hover:bg-red-600/35"
                  }`}
                  id="modal-download-docx"
                  title={t.guideDownloadDocx}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isDownloadingGuide ? "..." : t.guideDownloadDocx}</span>
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
                  <p className="text-sm text-[#8b949e] animate-pulse">{t.guideSyncing}</p>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto pb-8">
                  {renderFormattedMarkdown(guideContent)}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-secondary-bg border-t border-border-main px-6 py-3 flex items-center justify-between text-xs text-[#8b949e]" id="guide-modal-footer">
              <span className="font-mono text-[10px]">v1.3.1</span>
              <button
                onClick={() => setIsGuideOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-primary-bg border border-border-main text-white hover:bg-[#30363d] transition-colors font-medium text-xs cursor-pointer"
                id="close-guide-modal-footer-btn"
              >
                {t.guideCloseBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
