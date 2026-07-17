import fs from "fs";
import path from "path";

export interface Finding {
  ruleId: string;
  ruleName: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  category: string;
  file: string; // Relative path
  line: number;
  codeLine: string;
  description: string;
  remediation: string;
}

export interface ScanResult {
  success: boolean;
  score: number;
  workspaceDir: string;
  totalFilesScanned: number;
  findings: Finding[];
  summary: string;
}

interface ScannerRule {
  id: string;
  name: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  category: string;
  pattern: RegExp;
  description: string;
  remediation: string;
}

const RULES: ScannerRule[] = [
  {
    id: "SAST-001",
    name: "Lộ thông tin nhạy cảm / AWS Access Key",
    severity: "CRITICAL",
    category: "Hardcoded Secrets",
    pattern: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANTA|ASCA|ASIA)[A-Z0-9]{16}/,
    description: "Phát hiện mã định danh AWS Access Key hardcoded trực tiếp trong mã nguồn ứng dụng. Điều này cho phép tin tặc truy cập trực tiếp vào hạ tầng đám mây AWS của doanh nghiệp.",
    remediation: "Hãy gỡ bỏ Access Key khỏi mã nguồn. Sử dụng giải pháp quản lý cấu hình tập trung hoặc AWS STS để lấy Credentials tạm thời có thời hạn."
  },
  {
    id: "SAST-002",
    name: "Lộ thông tin nhạy cảm / Stripe API Key",
    severity: "CRITICAL",
    category: "Hardcoded Secrets",
    pattern: /sk_live_[0-9a-zA-Z]{24}/,
    description: "Phát hiện Stripe Secret Live Key nằm trực tiếp trong mã nguồn. Tin tặc có thể lấy khóa này để thực hiện giao dịch giả mạo, hoàn tiền hoặc lấy cắp thông tin thẻ của khách hàng.",
    remediation: "Gỡ bỏ khóa bí mật khỏi client-side ngay lập tức. Mọi tác vụ thanh toán phải được thực hiện thông qua máy chủ backend có xác thực an toàn."
  },
  {
    id: "SAST-003",
    name: "Lộ mật khẩu hoặc API Key Chung",
    severity: "HIGH",
    category: "Hardcoded Secrets",
    pattern: /(?:api_key|apikey|api-key|secret_key|secret-key|app_secret|appsecret|client_secret|client-secret|private_key|private-key|auth_token|authtoken|db_password|db_pass|db_user|dbuser|access_token|accessToken|firebase_token)\s*=\s*["']([A-Za-z0-9_\-\.\/]{12,80})["']/i,
    description: "Phát hiện các biến chứa chuỗi nhạy cảm như api_key, secret_key, access_token hoặc db_password được gán trực tiếp bằng chuỗi hằng số.",
    remediation: "Sử dụng Keystore, Android EncryptedSharedPreferences hoặc tải thông tin cấu hình bảo mật động từ máy chủ API bảo mật thông qua HTTPS."
  },
  {
    id: "SAST-004",
    name: "Sử dụng chế độ mã hóa ECB không an toàn",
    severity: "HIGH",
    category: "Weak Cryptography",
    pattern: /Cipher\.getInstance\s*\(\s*["']AES\/ECB\/[a-zA-Z0-9]+/i,
    description: "Chế độ ECB (Electronic Codebook) mã hóa các khối dữ liệu giống nhau thành bản mã giống nhau. Điều này cho phép tin tặc nhận dạng các mẫu lặp lại trong bản mã để dò tìm và khôi phục bản rõ mà không cần khóa.",
    remediation: "Thay đổi chế độ mã hóa sang các chế độ an toàn hơn có sử dụng Vector khởi tạo (IV) ngẫu nhiên như AES/CBC/PKCS5Padding hoặc AES/GCM/NoPadding."
  },
  {
    id: "SAST-005",
    name: "Sử dụng thuật toán băm yếu (MD5)",
    severity: "MEDIUM",
    category: "Weak Cryptography",
    pattern: /MessageDigest\.getInstance\s*\(\s*["']MD5["']\s*\)/i,
    description: "MD5 là thuật toán băm lỗi thời đã bị chứng minh là không an toàn trước các cuộc tấn công va chạm mật mã (collision attacks). Bản băm MD5 có thể bị giải mã cực nhanh qua các kho dữ liệu cầu vồng (Rainbow tables).",
    remediation: "Thay đổi thuật toán băm thành SHA-256 hoặc SHA-512 để bảo vệ toàn vẹn dữ liệu."
  },
  {
    id: "SAST-006",
    name: "Sử dụng thuật toán băm yếu (SHA-1)",
    severity: "LOW",
    category: "Weak Cryptography",
    pattern: /MessageDigest\.getInstance\s*\(\s*["']SHA-1["']\s*\)/i,
    description: "SHA-1 không còn đảm bảo an toàn trước các cuộc tấn công va chạm mật mã có chi phí thấp. Việc sử dụng SHA-1 cho kiểm thử chữ ký số có rủi ro bị giả mạo.",
    remediation: "Thay thế bằng thuật toán SHA-256."
  },
  {
    id: "SAST-007",
    name: "Kích hoạt thực thi JavaScript trong WebView",
    severity: "MEDIUM",
    category: "WebView Risk",
    pattern: /\.getSettings\s*\(\s*\)\s*\.setJavaScriptEnabled\s*\(\s*true\s*\)/i,
    description: "Việc bật JavaScript trong WebView mở ra nguy cơ tấn công Cross-Site Scripting (XSS). Nếu ứng dụng tải các trang web bên thứ ba không an toàn hoặc bị tiêm mã độc vào trang nội bộ, mã độc JavaScript có thể chiếm quyền điều khiển tài nguyên thiết bị.",
    remediation: "Chỉ kích hoạt JavaScript khi thực sự cần thiết. Thực hiện lọc và kiểm duyệt URL tải vào WebView bằng Hostname Whitelist nghiêm ngặt."
  },
  {
    id: "SAST-008",
    name: "Cho phép WebView truy cập tệp cục bộ",
    severity: "HIGH",
    category: "WebView Risk",
    pattern: /\.getSettings\s*\(\s*\)\s*\.setAllowFileAccess\s*\(\s*true\s*\)/i,
    description: "Bật tùy chọn setAllowFileAccess(true) cho phép WebView đọc các tệp cục bộ lưu trong bộ nhớ riêng của ứng dụng (ví dụ: cơ sở dữ liệu SQLite, thông tin cấu hình cá nhân Shared Preferences) nếu bị dính lỗi XSS.",
    remediation: "Nên tắt tùy chọn này bằng cách gọi setAllowFileAccess(false). Kể từ Android 11, tùy chọn này đã mặc định được tắt."
  },
  {
    id: "SAST-009",
    name: "WebView cho phép truy cập tài nguyên toàn cầu từ File URL",
    severity: "HIGH",
    category: "WebView Risk",
    pattern: /\.getSettings\s*\(\s*\)\s*\.setAllowUniversalAccessFromFileURLs\s*\(\s*true\s*\)/i,
    description: "Cấu hình setAllowUniversalAccessFromFileURLs cho phép các mã JavaScript chạy trong ngữ cảnh tệp 'file://' gửi yêu cầu chéo miền (Cross-Origin) để đọc bất kỳ tệp cục bộ nào trên hệ thống.",
    remediation: "Hãy đổi cấu hình này thành false để ngăn chặn rò rỉ dữ liệu qua file URL."
  },
  {
    id: "SAST-010",
    name: "Bỏ qua xác thực SSL (TrustManager rỗng)",
    severity: "CRITICAL",
    category: "SSL Pinning / Network",
    pattern: /void\s+check(?:Client|Server)Trusted\s*\(\s*[^)]*\s*\)\s*\{\s*\}/i,
    description: "Hàm kiểm thử chứng chỉ checkServerTrusted hoặc checkClientTrusted bị bỏ rỗng. Cấu hình này chấp nhận mọi chứng chỉ SSL giả mạo, tự ký, mở đường cho tin tặc thực hiện tấn công nghe lén Man-In-The-Middle (MITM) để lấy cắp tài khoản của người dùng.",
    remediation: "Hãy cài đặt kiểm tra chuỗi chứng thực SSL đầy đủ và chính xác bằng cách sử dụng Network Security Configuration của Android."
  },
  {
    id: "SAST-011",
    name: "Chấp nhận mọi Hostname không hợp lệ trong HTTPS",
    severity: "HIGH",
    category: "SSL Pinning / Network",
    pattern: /HostnameVerifier\s+[^=]*=\s*new\s+HostnameVerifier\s*\(\s*\)\s*\{\s*@Override\s+public\s+boolean\s+verify\s*\(\s*String\s+[^,]*,\s*SSLSession\s+[^)]*\s*\)\s*\{\s*return\s+true;\s*\}/i,
    description: "Hàm xác thực Hostname luôn trả về 'true' vô điều kiện. Điều này vô hiệu hóa cơ chế bảo vệ tên miền của SSL/TLS, cho phép bất kỳ ai đứng giữa kết nối giả mạo máy chủ ứng dụng.",
    remediation: "Luôn kiểm tra hostname khớp với tên miền đã được đăng ký trong chứng chỉ số chính thức."
  },
  {
    id: "SAST-012",
    name: "Xuất bản thành phần Android không an toàn (Exported Component)",
    severity: "MEDIUM",
    category: "Exported Components",
    pattern: /<(?:activity|service|receiver)[^>]+android:exported="true"[^>]*>/i,
    description: "Thành phần Android (Activity, Service, Receiver) được thiết lập exported='true' mà không có thuộc tính permission bảo vệ. Bất kỳ ứng dụng độc hại nào khác cài trên cùng thiết bị đều có thể gọi trực tiếp thành phần này để đánh cắp dữ liệu hoặc thực thi các đặc quyền trái phép.",
    remediation: "Nếu thành phần không cần chia sẻ với ứng dụng khác, hãy đặt android:exported='false'. Nếu cần chia sẻ, hãy bảo vệ thành phần bằng một thẻ <permission> tùy chỉnh với mức độ bảo vệ 'signature'."
  },
  {
    id: "SAST-013",
    name: "Nguy cơ SQL Injection thông qua ghép chuỗi",
    severity: "HIGH",
    category: "SQL Injection",
    pattern: /\.(?:rawQuery|execSQL)\s*\(\s*["']SELECT\s+[^"']+\s+WHERE\s+[^"']+\s*["']\s*\+\s*[a-zA-Z0-9_\.]+/i,
    description: "Phát hiện câu lệnh SQL được xây dựng bằng cách cộng chuỗi thủ công thay vì sử dụng tham số hóa (Parameterized Queries). Nếu đầu vào của người dùng chứa ký tự điều khiển SQL, cơ sở dữ liệu SQLite cục bộ có thể bị thao túng hoặc trích xuất dữ liệu trái phép.",
    remediation: "Sử dụng dấu chấm hỏi làm tham số giữ chỗ và truyền mảng tham số riêng biệt: db.rawQuery('SELECT * FROM users WHERE username = ?', new String[]{username});"
  },
  {
    id: "SAST-014",
    name: "Thực thi câu lệnh hệ thống trực tiếp (Runtime.exec)",
    severity: "HIGH",
    category: "Command Execution",
    pattern: /Runtime\.getRuntime\s*\(\s*\)\s*\.exec\s*\(/i,
    description: "Ứng dụng gọi Runtime.exec() để thực thi các câu lệnh shell của hệ điều hành Android. Nếu các tham số đầu vào không được chuẩn hóa, ứng dụng sẽ có nguy cơ bị tấn công Command Injection cực kỳ nghiêm trọng.",
    remediation: "Hạn chế tối đa việc gọi câu lệnh hệ thống trực tiếp. Nếu bắt buộc, hãy sử dụng ProcessBuilder và lọc cực kỳ nghiêm ngặt các tham số đầu vào bằng Whitelist."
  },
  {
    id: "SAST-015",
    name: "Ghi Log gỡ lỗi nhạy cảm trong bản Release",
    severity: "LOW",
    category: "Debug Log exposure",
    pattern: /Log\.(?:d|v)\s*\(\s*["'][^"']+["']\s*,\s*[^\)]+\)/i,
    description: "Ghi log gỡ lỗi (Log.d hoặc Log.v) trực tiếp ra màn hình console của Android (Logcat). Tin tặc có thể cắm cáp USB và theo dõi các thông tin nhạy cảm (như phiên đăng nhập, khóa giải mã, dữ liệu người dùng) thông qua lệnh adb logcat.",
    remediation: "Sử dụng cơ chế ghi log thông minh Proguard / R8 để tự động loại bỏ các câu lệnh Log.d và Log.v khi đóng gói bản phát hành thương mại (Release Build)."
  },
  {
    id: "SAST-016",
    name: "Sử dụng giao thức truyền tải không an toàn (HTTP cleartext)",
    severity: "MEDIUM",
    category: "SSL Pinning / Network",
    pattern: /android:usesCleartextTraffic=["']true["']/i,
    description: "Cấu hình ứng dụng cho phép thực hiện các kết nối mạng HTTP không mã hóa (Cleartext Traffic). Toàn bộ dữ liệu truyền nhận qua mạng sẽ dễ dàng bị đánh cắp bởi các cuộc tấn công MITM ở các điểm wifi công cộng.",
    remediation: "Hãy đặt thuộc tính android:usesCleartextTraffic='false' và ép buộc mọi kết nối phải sử dụng giao thức HTTPS bảo mật."
  },
  {
    id: "SAST-017",
    name: "Thiết lập debuggable hoạt động trong ứng dụng thương mại",
    severity: "HIGH",
    category: "Exported Components",
    pattern: /android:debuggable=["']true["']/i,
    description: "Thuộc tính debuggable='true' cho phép tin tặc đính kèm một trình gỡ lỗi (debugger như jdb, Android Studio, Frida) trực tiếp vào tiến trình ứng dụng đang chạy để theo dõi bộ nhớ, gọi hàm và thay đổi luồng xử lý tùy ý.",
    remediation: "Đảm bảo gỡ bỏ hoàn toàn thuộc tính android:debuggable hoặc đặt nó bằng 'false' trước khi xuất bản ứng dụng lên chợ ứng dụng Google Play Store."
  },
  {
    id: "SAST-018",
    name: "Lộ cấu hình Firebase công cộng",
    severity: "INFO",
    category: "Hardcoded Secrets",
    pattern: /https:\/\/[a-zA-Z0-9-]+\.firebaseio\.com/i,
    description: "Phát hiện URL cơ sở dữ liệu Firebase Realtime Database nằm trong tệp cấu hình hoặc mã nguồn. Nếu quy tắc bảo mật (Security Rules) của Firebase không được phân quyền, tin tặc có thể đọc ghi trực tiếp cơ sở dữ liệu của bạn từ Internet.",
    remediation: "Đảm bảo cấu hình Security Rules trên Firebase Console chặt chẽ để chặn các truy vấn ẩn danh không được xác thực."
  }
];

export class ScannerService {
  /**
   * Helper to recursively scan directories for relevant files
   */
  private static walkDir(dir: string, fileList: string[] = []): string[] {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          // Avoid scanning extremely large folders that might lead to memory overflow or infinite loops
          const base = path.basename(filePath);
          if (base !== "node_modules" && base !== ".git" && base !== "dist" && base !== "build") {
            this.walkDir(filePath, fileList);
          }
        } else {
          const ext = path.extname(file).toLowerCase();
          if (ext === ".java" || ext === ".xml" || ext === ".smali" || ext === ".kt" || ext === ".json" || ext === ".gradle" || ext === ".properties") {
            fileList.push(filePath);
          }
        }
      }
    } catch (err) {
      console.error("[SCANNER WALK ERROR]", err);
    }
    return fileList;
  }

  /**
   * Find the most recent task workspace directory containing decompiled source code
   */
  public static getLatestWorkspaceDir(): string | null {
    const workspacesRoot = path.join(process.cwd(), "workspaces");
    if (!fs.existsSync(workspacesRoot)) return null;

    try {
      const tasks = fs.readdirSync(workspacesRoot);
      if (tasks.length === 0) return null;

      // Sort tasks by modification time descending
      const sortedTasks = tasks
        .map((taskDir) => {
          const taskPath = path.join(workspacesRoot, taskDir);
          const stat = fs.statSync(taskPath);
          return { name: taskDir, path: taskPath, mtime: stat.mtime.getTime() };
        })
        .sort((a, b) => b.mtime - a.mtime);

      return sortedTasks[0].path;
    } catch (err) {
      console.error("[SCANNER WORKSPACE FIND ERROR]", err);
      return null;
    }
  }

  /**
   * Run the actual static analysis scanner on files inside a directory
   */
  public static async analyze(targetDir: string): Promise<ScanResult> {
    if (!fs.existsSync(targetDir)) {
      return {
        success: false,
        score: 100,
        workspaceDir: targetDir,
        totalFilesScanned: 0,
        findings: [],
        summary: "Thư mục đích không tồn tại hoặc chưa giải nén thành công mã nguồn."
      };
    }

    const files = this.walkDir(targetDir);
    const findings: Finding[] = [];
    let filesScannedCount = 0;

    // Scan each file
    for (const file of files) {
      try {
        const stat = fs.statSync(file);
        // Skip files larger than 1MB to prevent out-of-memory or high CPU lockup
        if (stat.size > 1024 * 1024) continue;

        filesScannedCount++;
        const content = fs.readFileSync(file, "utf-8");
        const lines = content.split(/\r?\n/);

        // Scan line-by-line or full file depending on regex context
        for (let lIndex = 0; lIndex < lines.length; lIndex++) {
          const lineText = lines[lIndex];
          const lineNumber = lIndex + 1;

          for (const rule of RULES) {
            // Check match on individual line
            if (rule.pattern.test(lineText)) {
              // Add finding
              findings.push({
                ruleId: rule.id,
                ruleName: rule.name,
                severity: rule.severity,
                category: rule.category,
                file: path.relative(targetDir, file),
                line: lineNumber,
                codeLine: lineText.trim().substring(0, 150), // Truncate if extremely long
                description: rule.description,
                remediation: rule.remediation
              });
            }
          }
        }
      } catch (err) {
        console.error(`[SCANNER FILE ERROR] Failed scanning file: ${file}`, err);
      }
    }

    // Calculate dynamic security score (Starts at 100, drops for each vulnerability based on severity)
    let score = 100;
    findings.forEach((f) => {
      if (f.severity === "CRITICAL") score -= 15;
      else if (f.severity === "HIGH") score -= 10;
      else if (f.severity === "MEDIUM") score -= 5;
      else if (f.severity === "LOW") score -= 2;
    });
    score = Math.max(0, score);

    // Dynamic overview generation based on findings
    let summary = "";
    if (findings.length === 0) {
      summary = `Quá trình quét tĩnh hoàn thành mỹ mãn! Hệ thống đã phân tích kỹ lưỡng ${filesScannedCount} tệp mã nguồn và tệp cấu hình mà không tìm thấy bất kỳ dấu hiệu lỗ hổng nghiêm trọng nào. Xin chúc mừng ứng dụng của bạn cực kỳ an toàn!`;
    } else {
      const crits = findings.filter((f) => f.severity === "CRITICAL").length;
      const highs = findings.filter((f) => f.severity === "HIGH").length;
      const meds = findings.filter((f) => f.severity === "MEDIUM").length;
      const lows = findings.filter((f) => f.severity === "LOW").length;

      summary = `Phát hiện tổng cộng ${findings.length} điểm yếu bảo mật trên tổng số ${filesScannedCount} tệp được phân tích. `;
      summary += `Bao gồm: ${crits} Nghiêm trọng (Critical), ${highs} Cao (High), ${meds} Trung bình (Medium), và ${lows} Thấp (Low). `;
      if (score < 40) {
        summary += "Ứng dụng này có mức độ rủi ro cực kỳ nghiêm trọng. Cần tiến hành gỡ bỏ các khóa API cứng và vá lỗ hổng WebView ngay lập tức trước khi xuất bản!";
      } else if (score < 75) {
        summary += "Mức độ rủi ro ở ngưỡng trung bình. Khuyến nghị thực hiện mã hóa các tệp tin lưu trữ và cấu hình lại Network Security Configuration.";
      } else {
        summary += "Ứng dụng tương đối an toàn nhưng cần tinh chỉnh các cơ chế log debug và cấu hình đóng gói để đạt bảo mật tối ưu.";
      }
    }

    return {
      success: true,
      score,
      workspaceDir: path.basename(targetDir),
      totalFilesScanned: filesScannedCount,
      findings,
      summary
    };
  }
}
