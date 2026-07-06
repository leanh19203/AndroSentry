export interface AdbCommand {
  id: string;
  category: "recon" | "data" | "intent" | "shell" | "reverse";
  title: string;
  description: string;
  command: string;
  placeholder?: string;
  kaliTool?: string;
}

export interface ManifestFinding {
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  title: string;
  description: string;
  location: string;
  remediation: string;
}

export interface AuditResult {
  score: number;
  summary: string;
  findings: ManifestFinding[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ApkToolStep {
  id: string;
  title: string;
  description: string;
  command: string;
  tip?: string;
}
