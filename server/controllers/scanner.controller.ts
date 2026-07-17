import { Request, Response } from "express";
import { ScannerService, ScanResult } from "../services/scanner.service";

/**
 * Handle Static Code Scanning Request
 */
export async function handleRunStaticScan(req: Request, res: Response): Promise<void> {
  const { workspaceDir, simulation } = req.body;

  // If simulation is requested, or if we are not on localhost (optional backup check)
  const isSimulation = simulation === true;

  if (isSimulation) {
    // Generate an exciting, highly-educational pentest scan report
    const mockReport: ScanResult = {
      success: true,
      score: 42,
      workspaceDir: workspaceDir || "androsentry_demo_task-e82b7",
      totalFilesScanned: 84,
      summary: "Phát hiện tổng cộng 6 điểm yếu bảo mật trên tổng số 84 tệp được phân tích. Bao gồm: 1 Nghiêm trọng (Critical), 2 Cao (High), 2 Trung bình (Medium), và 1 Thấp (Low). Ứng dụng này có mức độ rủi ro cực kỳ nghiêm trọng. Cần tiến hành gỡ bỏ các khóa API cứng và vá lỗ hổng WebView ngay lập tức trước khi xuất bản!",
      findings: [
        {
          ruleId: "SAST-001",
          ruleName: "Lộ thông tin nhạy cảm / AWS Access Key",
          severity: "CRITICAL",
          category: "Hardcoded Secrets",
          file: "app/src/main/java/com/androsentry/security/ApiClient.java",
          line: 125,
          codeLine: "private static final String AWS_KEY = \"AKIAIOSFODNN7EXAMPLE\";",
          description: "Phát hiện mã định danh AWS Access Key hardcoded trực tiếp trong mã nguồn ứng dụng. Điều này cho phép tin tặc truy cập trực tiếp vào hạ tầng đám mây AWS của doanh nghiệp.",
          remediation: "Hãy gỡ bỏ Access Key khỏi mã nguồn. Sử dụng giải pháp quản lý cấu hình tập trung hoặc AWS STS để lấy Credentials tạm thời có thời hạn."
        },
        {
          ruleId: "SAST-004",
          ruleName: "Sử dụng chế độ mã hóa ECB không an toàn",
          severity: "HIGH",
          category: "Weak Cryptography",
          file: "app/src/main/java/com/androsentry/security/CryptoUtils.java",
          line: 32,
          codeLine: "Cipher cipher = Cipher.getInstance(\"AES/ECB/PKCS5Padding\");",
          description: "Chế độ ECB (Electronic Codebook) mã hóa các khối dữ liệu giống nhau thành bản mã giống nhau. Điều này cho phép tin tặc nhận dạng các mẫu lặp lại trong bản mã để dò tìm và khôi phục bản rõ mà không cần khóa.",
          remediation: "Thay đổi chế độ mã hóa sang các chế độ an toàn hơn có sử dụng Vector khởi tạo (IV) ngẫu nhiên như AES/CBC/PKCS5Padding hoặc AES/GCM/NoPadding."
        },
        {
          ruleId: "SAST-010",
          ruleName: "Bỏ qua xác thực SSL (TrustManager rỗng)",
          severity: "CRITICAL",
          category: "SSL Pinning / Network",
          file: "app/src/main/java/com/androsentry/network/SslPinningManager.java",
          line: 18,
          codeLine: "@Override public void checkServerTrusted(X509Certificate[] chain, String authType) {}",
          description: "Hàm kiểm thử chứng chỉ checkServerTrusted hoặc checkClientTrusted bị bỏ rỗng. Cấu hình này chấp nhận mọi chứng chỉ SSL giả mạo, tự ký, mở đường cho tin tặc thực hiện tấn công nghe lén Man-In-The-Middle (MITM) để lấy cắp tài khoản của người dùng.",
          remediation: "Hãy cài đặt kiểm tra chuỗi chứng thực SSL đầy đủ và chính xác bằng cách sử dụng Network Security Configuration của Android."
        },
        {
          ruleId: "SAST-007",
          ruleName: "Kích hoạt thực thi JavaScript trong WebView",
          severity: "MEDIUM",
          category: "WebView Risk",
          file: "app/src/main/java/com/androsentry/ui/BrowserActivity.java",
          line: 45,
          codeLine: "webView.getSettings().setJavaScriptEnabled(true);",
          description: "Việc bật JavaScript trong WebView mở ra nguy cơ tấn công Cross-Site Scripting (XSS). Nếu ứng dụng tải các trang web bên thứ ba không an toàn hoặc bị tiêm mã độc vào trang nội bộ, mã độc JavaScript có thể chiếm quyền điều khiển tài nguyên thiết bị.",
          remediation: "Chỉ kích hoạt JavaScript khi thực sự cần thiết. Thực hiện lọc và kiểm duyệt URL tải vào WebView bằng Hostname Whitelist nghiêm ngặt."
        },
        {
          ruleId: "SAST-012",
          ruleName: "Xuất bản thành phần Android không an toàn (Exported Component)",
          severity: "MEDIUM",
          category: "Exported Components",
          file: "app/src/main/AndroidManifest.xml",
          line: 14,
          codeLine: "<activity android:name=\".FileSharingActivity\" android:exported=\"true\">",
          description: "Thành phần Android (Activity, Service, Receiver) được thiết lập exported='true' mà không có thuộc tính permission bảo vệ. Bất kỳ ứng dụng độc hại nào khác cài trên cùng thiết bị đều có thể gọi trực tiếp thành phần này để đánh cắp dữ liệu hoặc thực thi các đặc quyền trái phép.",
          remediation: "Nếu thành phần không cần chia sẻ với ứng dụng khác, hãy đặt android:exported='false'. Nếu cần chia sẻ, hãy bảo vệ thành phần bằng một thẻ <permission> tùy chỉnh với mức độ bảo vệ 'signature'."
        },
        {
          ruleId: "SAST-015",
          ruleName: "Ghi Log gỡ lỗi nhạy cảm trong bản Release",
          severity: "LOW",
          category: "Debug Log exposure",
          file: "app/src/main/java/com/androsentry/analytics/LogHelper.java",
          line: 52,
          codeLine: "Log.d(\"AndroSentrySession\", \"User Bearer Token: \" + token);",
          description: "Ghi log gỡ lỗi (Log.d hoặc Log.v) trực tiếp ra màn hình console của Android (Logcat). Tin tặc có thể cắm cáp USB và theo dõi các thông tin nhạy cảm (như phiên đăng nhập, khóa giải mã, dữ liệu người dùng) thông qua lệnh adb logcat.",
          remediation: "Sử dụng cơ chế ghi log thông minh Proguard / R8 để tự động loại bỏ các câu lệnh Log.d và Log.v khi đóng gói bản phát hành thương mại (Release Build)."
        }
      ]
    };

    res.json(mockReport);
    return;
  }

  // Real engine scan
  let targetDir = "";
  if (workspaceDir) {
    // Standard relative or workspace directory
    targetDir = workspaceDir.includes("/") ? workspaceDir : `/workspaces/${workspaceDir}`;
  } else {
    // Auto-detect latest workspace
    const latest = ScannerService.getLatestWorkspaceDir();
    if (!latest) {
      res.status(404).json({
        error: "Không tìm thấy bất kỳ thư mục quy trình giải nén nào trong hệ thống. Hãy thực hiện Decompile APK trước để tiến hành quét bảo mật."
      });
      return;
    }
    targetDir = latest;
  }

  try {
    const report = await ScannerService.analyze(targetDir);
    res.json(report);
  } catch (error: any) {
    console.error("Static analysis error:", error);
    res.status(500).json({ error: error.message || "Lỗi khi chạy quét phân tích mã nguồn tĩnh." });
  }
}
