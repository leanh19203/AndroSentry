export interface LanguageConfig {
  code: string;
  name: string;
  flag: string;
}

export const LANGUAGES: LanguageConfig[] = [
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ja", name: "日本語", flag: "🇯🇵" }
];

export const TRANSLATIONS: Record<string, any> = {
  vi: {
    title: "AndroSentry",
    subtitle: "Hộp công cụ & Hỗ trợ kiểm thử bảo mật ứng dụng Android cho Kali Linux",
    themeSelector: "Giao diện",
    viewGuide: "Xem HDSD",
    viewGuideTooltip: "Xem hướng dẫn sử dụng ngay trên ứng dụng",
    statusEmulator: "Kali OS Emulator Mode",
    aiReady: "AI: Sẵn sàng",
    aiNotConfigured: "AI: Chưa cấu hình Key",
    quickGuide: "HƯỚNG DẪN NHANH:",
    quickStep1: "Bật **Gỡ lỗi USB** trên điện thoại Android",
    quickStep2: "Chạy lệnh `adb devices` để kiểm tra kết nối",
    quickStep3: "Chạy `export GEMINI_API_KEY=\"key\"` để dùng AI",
    tabAdb: "Trình tạo Lệnh ADB",
    tabManifest: "AI Audit Manifest",
    tabApktool: "Quy trình Apktool",
    tabFrida: "Thư viện Frida",
    tabChat: "Trợ lý AI Chatbot",
    aiBadge: "Trí Tuệ Nhân Tạo",
    
    // Target parameters
    targetParamsTitle: "Tham số mục tiêu",
    targetParamsDesc: "Thay đổi giá trị dưới đây để tự động cập nhật trực tiếp vào các khối mã lệnh ADB tương ứng bên phải.",
    labelPackage: "[PACKAGE_NAME] (Tên gói):",
    labelActivity: "[ACTIVITY_NAME] (Activity):",
    labelAction: "[ACTION_NAME] (Intent Action):",
    labelApkPath: "[APK_PATH_ON_DEVICE] (Đường dẫn APK):",
    labelFilter: "[FILTER_KEYWORD] (Từ khóa lọc log):",
    labelLocalPort: "Cổng Kali:",
    labelDevicePort: "Cổng Android:",
    paramTitle: "Tham số mục tiêu",
    paramSubtitle: "Thay đổi giá trị dưới đây để tự động cập nhật trực tiếp vào các khối mã lệnh ADB tương ứng bên phải.",
    paramPackageLabel: "Tên gói",
    paramActivityLabel: "Activity",
    paramActionLabel: "Intent Action",
    paramApkLabel: "Đường dẫn APK",
    paramFilterLabel: "Từ khóa lọc log",
    paramKaliPort: "Cổng Kali",
    paramAndroidPort: "Cổng Android",
    
    // Connection Guide
    connGuideTitle: "Cách kết nối thiết bị với Kali Linux:",
    connStep1: "Bật Tùy chọn cho nhà phát triển trên điện thoại.",
    connStep2: "Bật Gỡ lỗi USB (USB Debugging).",
    connStep3: "Cắm cáp kết nối điện thoại với máy cài Kali Linux.",
    connStep4: "Chấp nhận khóa vân tay RSA trên điện thoại khi có thông báo.",
    connStep5: "Mở terminal trên Kali và dán lệnh kiểm tra kết nối đầu tiên.",
    guideTitle: "Cách kết nối thiết bị với Kali Linux:",
    guideStep1: "Bật Tùy chọn cho nhà phát triển trên điện thoại.",
    guideStep2: "Bật Gỡ lỗi USB (USB Debugging).",
    guideStep3: "Cắm cáp kết nối điện thoại với máy cài Kali Linux.",
    guideStep4: "Chấp nhận khóa vân tay RSA trên điện thoại khi có thông báo.",
    guideStep5: "Mở terminal trên Kali và dán lệnh kiểm tra kết nối đầu tiên.",
    
    // Commands UI
    categoryRecon: "Thu Thập Thông Tin & Trinh Sát (Device Recon)",
    categoryData: "Trích Xuất Dữ Liệu & Sandbox Data Analysis",
    categoryIntent: "Gửi Intent & Khai Thác Thành Phần (Component Interception)",
    categoryNetworking: "Chuyển tiếp & Phân tích Mạng (Networking & Tunneling)",
    runBtn: "Chạy",
    copyBtn: "Sao chép",
    runTooltip: "Chạy lệnh trực tiếp trên Kali",
    copyTooltip: "Sao chép câu lệnh",
    
    // Manifest Scanner UI
    manifestTitle: "Nội dung AndroidManifest.xml",
    useSampleBtn: "Dùng tệp mẫu",
    useSampleTooltip: "Khôi phục lại tệp Manifest mẫu dễ bị tổn thương để thử nghiệm quét",
    manifestEditorDesc: "Dán nội dung tệp tin AndroidManifest.xml thu thập được từ bước decompile APK để bắt đầu quét tự động bằng AI.",
    placeholderXml: "Dán mã XML ở đây...",
    clearXml: "Xóa trắng",
    btnAudit: "Kích hoạt AI Audit bảo mật",
    btnAuditing: "Đang phân tích bảo mật...",
    resultTitle: "Kết quả kiểm định bảo mật",
    scoreLabel: "Điểm bảo mật:",
    emptyResultTitle: "Chưa có kết quả phân tích",
    emptyResultDesc: "Dán tệp tin Manifest của bạn vào ô bên trái và nhấp Kích hoạt AI Audit bảo mật để phân tích thông minh các lỗ hổng tiềm ẩn.",
    auditingTitle: "AI đang giải mã cấu hình Android...",
    auditingDesc: "Phân tích các thẻ permission, exported activities, broadcast receivers, debug settings theo chuẩn bảo mật di động...",
    errorTitle: "Đã xảy ra lỗi:",
    auditSummaryTitle: "Tóm tắt đánh giá:",
    findingsCountTitle: "DANH SÁCH LỖ HỔNG PHÁT HIỆN",
    btnExportMd: "Xuất .MD",
    btnExportHtml: "Xuất HTML",
    exportMdTooltip: "Xuất báo cáo định dạng Markdown (.md)",
    exportHtmlTooltip: "Xuất báo cáo HTML đồ họa đẹp mắt",
    locationLabel: "Vị trí phát hiện:",
    remediationLabel: "Cách khắc phục:",
    noFindings: "🎉 Tuyệt vời! AI không phát hiện bất kỳ lỗ hổng bảo mật nghiêm trọng nào trong tệp Manifest này.",
    
    manifestEditorTitle: "Nội dung AndroidManifest.xml",
    manifestUseSampleBtn: "Dùng tệp mẫu",
    manifestUseSampleTooltip: "Khôi phục lại tệp Manifest mẫu dễ bị tổn thương để thử nghiệm quét",
    manifestTextareaPlaceholder: "Dán mã XML ở đây...",
    manifestClearBtn: "Xóa trắng",
    manifestAuditing: "Đang phân tích bảo mật...",
    manifestAuditBtn: "Kích hoạt AI Audit bảo mật",
    manifestResultTitle: "Kết quả kiểm định bảo mật",
    manifestResultScoreLabel: "Điểm bảo mật:",
    manifestEmptyTitle: "Chưa có kết quả phân tích",
    manifestEmptyDesc: "Dán tệp tin Manifest của bạn vào ô bên trái và nhấp Kích hoạt AI Audit bảo mật để phân tích thông minh các lỗ hổng tiềm ẩn.",
    manifestLoadingTitle: "AI đang giải mã cấu hình Android...",
    manifestLoadingDesc: "Phân tích các thẻ permission, exported activities, broadcast receivers, debug settings theo chuẩn bảo mật di động...",
    manifestErrorTitle: "Đã xảy ra lỗi:",
    manifestSummaryTitle: "Tóm tắt đánh giá:",
    manifestFindingsListTitle: "DANH SÁCH LỖ HỔNG PHÁT HIỆN",
    exportMdBtn: "Xuất .MD",
    exportHtmlBtn: "Xuất HTML",
    findingLocationLabel: "Vị trí phát hiện:",
    findingRemediationLabel: "Cách khắc phục:",
    noFindingsMessage: "🎉 Tuyệt vời! AI không phát hiện bất kỳ lỗ hổng bảo mật nghiêm trọng nào trong tệp Manifest này.",

    // Apktool UI
    transformApkTitle: "Biến đổi APK",
    transformApkDesc: "Thiết lập tên tệp APK của bạn để tạo ra dòng lệnh biên dịch & ký số chính xác cho Kali Linux.",
    labelApkName: "Tên tệp APK gốc (Không bao gồm đuôi .apk):",
    labelOutputDir: "Thư mục đầu ra của Decompile:",
    apktoolErrorsTitle: "Các lỗi đóng gói thường gặp:",
    apktoolError1: "Lỗi Build Resource: Sử dụng thêm cờ -r khi decompile nếu apktool bị crash do lỗi phân tích file resources.arsc.",
    apktoolError2: "Lỗi chữ ký mã: Android 11 trở lên yêu cầu cấu trúc chữ ký V2 hoặc V3. Apksigner là bắt buộc (Jarsigner sẽ không hoạt động trên một số dòng máy mới).",
    apktoolError3: "Zipalign: Luôn chạy zipalign trước khi ký để tối ưu hóa tệp APK và tránh lỗi cài đặt.",
    apktoolWorkflowTitle: "Quy trình kỹ thuật đảo ngược APK & Vá Mã nguồn",
    
    apktoolSidebarTitle: "Biến đổi APK",
    apktoolSidebarDesc: "Thiết lập tên tệp APK của bạn để tạo ra dòng lệnh biên dịch & ký số chính xác cho Kali Linux.",
    apktoolInputOrigLabel: "Tên tệp APK gốc (Không bao gồm đuôi .apk):",
    apktoolInputOutLabel: "Thư mục đầu ra của Decompile:",
    apktoolErrResourceLabel: "Lỗi Build Resource:",
    apktoolErrResourceDesc: "Sử dụng thêm cờ -r khi decompile nếu apktool bị crash do lỗi phân tích file resources.arsc.",
    apktoolErrSignLabel: "Lỗi chữ ký mã:",
    apktoolErrSignDesc: "Android 11 trở lên yêu cầu cấu trúc chữ ký V2 hoặc V3. Apksigner là bắt buộc (Jarsigner sẽ không hoạt động trên một số dòng máy mới).",
    apktoolErrZipalignLabel: "Zipalign:",
    apktoolErrZipalignDesc: "Luôn chạy zipalign trước khi ký để tối ưu hóa tệp APK và tránh lỗi cài đặt.",
    apktoolStepsTitle: "Quy trình kỹ thuật đảo ngược APK & Vá Mã nguồn",

    // Frida UI
    fridaTitle: "Thư viện Frida Script Bypass nâng cao",
    fridaDesc: "Sử dụng Frida để thực hiện kiểm tra dynamic analysis (Hooking) trực tiếp vào máy ảo ART của Android khi ứng dụng đang chạy.",
    fridaCopyTooltip: "Sao chép toàn bộ mã nguồn",
    fridaRunTip: "Lệnh thực thi trên Kali:",
    fridaSetupTitle: "Cách khởi động Frida-Server trên Android:",
    fridaSetup1: "Bước 1: Tải server - Tải frida-server tương ứng với kiến trúc CPU của máy Android (thường là arm64) từ GitHub Frida Releases.",
    fridaSetup2: "Bước 2: Push vào máy - Dùng lệnh:",
    fridaSetup3: "Bước 3: Cấp quyền chạy - Dùng lệnh:",
    fridaSetup4: "Bước 4: Chạy server - Chạy quyền root:",
    
    fridaHeaderTitle: "Thư viện Frida Script Bypass nâng cao",
    fridaHeaderDesc: "Sử dụng Frida để thực hiện kiểm tra dynamic analysis (Hooking) trực tiếp vào máy ảo ART của Android khi ứng dụng đang chạy.",
    fridaStep1Title: "Bước 1: Tải server",
    fridaStep1Desc: "Tải frida-server tương ứng với kiến trúc CPU của máy Android (thường là arm64) từ GitHub Frida Releases.",
    fridaStep2Title: "Bước 2: Push vào máy",
    fridaStep2Desc: "Đưa file server vừa tải lên điện thoại qua ADB:",
    fridaStep3Title: "Bước 3: Cấp quyền chạy",
    fridaStep3Desc: "Cấp quyền thực thi đầy đủ cho file server:",
    fridaStep4Title: "Bước 4: Chạy server",
    fridaStep4Desc: "Bật shell root và chạy server dưới nền:",

    // Chatbot UI
    chatExpertTitle: "Chuyên gia AI Hacker",
    chatExpertDesc: "Trợ lý được tối ưu hóa đặc biệt cho kiểm thử xâm nhập bảo mật Android, có khả năng tạo nhanh các đoạn mã bypass, giải thích lý thuyết bảo mật và viết script frida tùy chỉnh.",
    chatSuggestTitle: "Câu hỏi gợi ý:",
    chatPlaceholder: "Hãy hỏi tôi cách sử dụng adb, dịch ngược apk, viết script bypass,...",
    chatClearHistory: "Xóa lịch sử",
    chatTimePrefix: "Đang phản hồi...",
    chatWelcomeMessage: "Xin chào! Tôi là Trợ lý AI Pentest Android trên Kali Linux. Bạn cần tôi hỗ trợ phân tích mã nguồn, tạo script bypass root/SSL pinning, viết payload, hay giải thích cơ chế bảo mật của Android?",
    chatAgentTitle: "Chuyên gia AI Hacker",
    chatAgentDesc: "Trợ lý được tối ưu hóa đặc biệt cho kiểm thử xâm nhập bảo mật Android, có khả năng tạo nhanh các đoạn mã bypass, giải thích lý thuyết bảo mật và viết script frida tùy chỉnh.",
    chatSuggestionsTitle: "Câu hỏi gợi ý",
    chatPreset1Query: "Hãy chỉ tôi cách dùng Frida để bypass SSL Pinning của ứng dụng Flutter?",
    chatPreset1Text: "Cách bypass SSL Pinning Flutter?",
    chatPreset2Query: "Lỗ hổng Android:exported=\"true\" là gì? Làm thế nào để khai thác và vá?",
    chatPreset2Text: "Giải thích lỗ hổng Exported Component?",
    chatPreset3Query: "Hướng dẫn tôi cách cài đặt và khởi động Drozer trên Kali Linux để pentest Android?",
    chatPreset3Text: "Cách dùng Drozer trên Kali Linux?",
    chatPreset4Query: "Viết giùm tôi một đoạn script Frida cơ bản để hook vào hàm 'checkPassword' trong class 'com.example.AuthClass' và in ra mật khẩu người dùng nhập vào.",
    chatPreset4Text: "Viết script Frida hook hàm đăng nhập?",
    chatAgentSub: "Phản hồi từ Gemini-1.5-Flash (Security Agent)",
    chatClearHistoryBtn: "Xóa lịch sử",
    chatTyping: "Đang phản hồi...",
    chatInputPlaceholder: "Hãy hỏi tôi cách sử dụng adb, dịch ngược apk, viết script bypass,...",
    
    // Terminal Console
    termTitle: "KALI INTERACTIVE CONSOLE",
    termExecuting: "(Đang thực thi...)",
    termClearLogs: "Xóa Logs",
    termCollapse: "▼ Thu nhỏ Console",
    termExpand: "▲ Mở rộng Console & Chạy Lệnh",
    termPlaceholder: "Nhập thủ công lệnh adb (ví dụ: adb devices, adb shell getprop)...",
    termPressEnter: "Nhấn Enter để chạy",
    termEmptyState: "Chưa có lệnh nào được chạy. Click \"Chạy\" trên bất kỳ nút lệnh nào phía trên để xem kết quả trực tiếp tại đây!",
    termSimToggle: "Mô phỏng",
    termSimModeActive: "MÔ PHỎNG: Bật",
    termSimModeInactive: "LIVE MODE (Cần Local)",
    termSimNotice: "[MÔ PHỎNG] Đang giả lập lệnh pentest trên trình duyệt...",
    
    // Footer
    footerCopyright: "© 2026 AndroSentry Project. All Rights Reserved.",
    footerDisclaimer: "Cảnh báo: Chỉ sử dụng phần mềm cho các mục tiêu đã được cấp phép kiểm thử xâm nhập hợp pháp.",
    
    // Guide Modal
    guideModalTitle: "Tài liệu Hướng dẫn sử dụng & Mô tả tính năng",
    guideModalSubtitle: "Chi tiết hướng dẫn cài đặt, quy trình kiểm thử và cơ chế bảo mật",
    guideDownloadMd: "Tải tệp .md",
    guideDownloadDocx: "Tải tệp .docx",
    guideCloseBtn: "Đóng hướng dẫn",
    guideSyncing: "Đang tải và đồng bộ tài liệu hướng dẫn..."
  },
  en: {
    title: "AndroSentry",
    subtitle: "A comprehensive Android pentesting toolbox & assistant for Kali Linux users",
    themeSelector: "Theme",
    viewGuide: "View Guide",
    viewGuideTooltip: "View the user guide directly in the application",
    statusEmulator: "Kali OS Emulator Mode",
    aiReady: "AI: Ready",
    aiNotConfigured: "AI: Key Not Configured",
    quickGuide: "QUICK GUIDE:",
    quickStep1: "Enable **USB Debugging** on your Android phone",
    quickStep2: "Run `adb devices` to check connection status",
    quickStep3: "Run `export GEMINI_API_KEY=\"key\"` to enable AI features",
    tabAdb: "ADB Command Generator",
    tabManifest: "AI Audit Manifest",
    tabApktool: "Apktool Workflow",
    tabFrida: "Frida Library",
    tabChat: "AI Chat Assistant",
    aiBadge: "AI Powered",
    
    // Target parameters
    targetParamsTitle: "Target Parameters",
    targetParamsDesc: "Change these values to automatically update the generated ADB commands in the cards on the right.",
    labelPackage: "[PACKAGE_NAME] (Package Name):",
    labelActivity: "[ACTIVITY_NAME] (Activity):",
    labelAction: "[ACTION_NAME] (Intent Action):",
    labelApkPath: "[APK_PATH_ON_DEVICE] (APK Device Path):",
    labelFilter: "[FILTER_KEYWORD] (Log Filter Keyword):",
    labelLocalPort: "Kali Port:",
    labelDevicePort: "Android Port:",
    paramTitle: "Target Parameters",
    paramSubtitle: "Change these values to automatically update the generated ADB commands in the cards on the right.",
    paramPackageLabel: "Package Name",
    paramActivityLabel: "Activity",
    paramActionLabel: "Intent Action",
    paramApkLabel: "APK Device Path",
    paramFilterLabel: "Log Filter Keyword",
    paramKaliPort: "Kali Port",
    paramAndroidPort: "Android Port",
    
    // Connection Guide
    connGuideTitle: "How to connect a device to Kali Linux:",
    connStep1: "Enable Developer Options on your phone.",
    connStep2: "Enable USB Debugging.",
    connStep3: "Connect your phone to Kali Linux using a USB cable.",
    connStep4: "Accept the RSA fingerprint prompt on your phone when prompted.",
    connStep5: "Open terminal on Kali and paste the first connection check command.",
    guideTitle: "How to connect a device to Kali Linux:",
    guideStep1: "Enable Developer Options on your phone.",
    guideStep2: "Enable USB Debugging.",
    guideStep3: "Connect your phone to Kali Linux using a USB cable.",
    guideStep4: "Accept the RSA fingerprint prompt on your phone when prompted.",
    guideStep5: "Open terminal on Kali and paste the first connection check command.",
    
    // Commands UI
    categoryRecon: "Information Gathering & Reconnaissance (Device Recon)",
    categoryData: "Data Extraction & Sandbox Data Analysis",
    categoryIntent: "Intent Sender & Component Interception",
    categoryNetworking: "Port Forwarding & Network Analysis (Networking)",
    runBtn: "Run",
    copyBtn: "Copy",
    runTooltip: "Run command directly on local Kali system",
    copyTooltip: "Copy command to clipboard",
    
    // Manifest Scanner UI
    manifestTitle: "AndroidManifest.xml Content",
    useSampleBtn: "Use Sample XML",
    useSampleTooltip: "Restore the vulnerable sample Manifest to test scanning",
    manifestEditorDesc: "Paste the raw AndroidManifest.xml file extracted from decompiled APK to scan for vulnerabilities using Gemini AI.",
    placeholderXml: "Paste XML code here...",
    clearXml: "Clear Editor",
    btnAudit: "Run AI Security Audit",
    btnAuditing: "Auditing security...",
    resultTitle: "Security Audit Results",
    scoreLabel: "Security Score:",
    emptyResultTitle: "No Analysis Results Yet",
    emptyResultDesc: "Paste your Manifest file in the editor and click Run AI Security Audit to analyze security weaknesses.",
    auditingTitle: "AI is decoding Android configurations...",
    auditingDesc: "Analyzing permission tags, exported components, broadcast receivers, and debug settings against mobile security standards...",
    errorTitle: "An error occurred:",
    auditSummaryTitle: "Audit Summary:",
    findingsCountTitle: "DETECTED SECURITY VULNERABILITIES",
    btnExportMd: "Export .MD",
    btnExportHtml: "Export HTML",
    exportMdTooltip: "Export audit report as Markdown (.md)",
    exportHtmlTooltip: "Export audit report as highly polished HTML",
    locationLabel: "Detected Location:",
    remediationLabel: "Remediation Guide:",
    noFindings: "🎉 Excellent! AI did not detect any security vulnerabilities in this AndroidManifest.xml file.",
    
    manifestEditorTitle: "AndroidManifest.xml Content",
    manifestUseSampleBtn: "Use Sample XML",
    manifestUseSampleTooltip: "Restore the vulnerable sample Manifest to test scanning",
    manifestTextareaPlaceholder: "Paste XML code here...",
    manifestClearBtn: "Clear Editor",
    manifestAuditing: "Auditing security...",
    manifestAuditBtn: "Run AI Security Audit",
    manifestResultTitle: "Security Audit Results",
    manifestResultScoreLabel: "Security Score:",
    manifestEmptyTitle: "No Analysis Results Yet",
    manifestEmptyDesc: "Paste your Manifest file in the editor and click Run AI Security Audit to analyze security weaknesses.",
    manifestLoadingTitle: "AI is decoding Android configurations...",
    manifestLoadingDesc: "Analyzing permission tags, exported components, broadcast receivers, and debug settings against mobile security standards...",
    manifestErrorTitle: "An error occurred:",
    manifestSummaryTitle: "Audit Summary:",
    manifestFindingsListTitle: "DETECTED VULNERABILITIES LIST",
    exportMdBtn: "Export .MD",
    exportHtmlBtn: "Export HTML",
    findingLocationLabel: "Detected location:",
    findingRemediationLabel: "Remediation guide:",
    noFindingsMessage: "🎉 Great! No critical security vulnerabilities were detected in this AndroidManifest.xml file.",

    // Apktool UI
    transformApkTitle: "APK Builder Parameters",
    transformApkDesc: "Set your APK filenames below to generate precise compiling & signing commands for Kali Linux.",
    labelApkName: "Original APK File Name (without .apk suffix):",
    labelOutputDir: "Decompile Output Directory Name:",
    apktoolErrorsTitle: "Common Recompilation Issues:",
    apktoolError1: "Resource Build Error: Use the -r flag during decompile if apktool crashes due to resources.arsc parsing errors.",
    apktoolError2: "Signature Verification Error: Android 11+ requires V2/V3 signature schemes. apksigner is mandatory (jarsigner won't work).",
    apktoolError3: "Zipalign Optimization: Always run zipalign before signing to align files, preventing package installation crashes.",
    apktoolWorkflowTitle: "APK Reverse Engineering & Patched Code Compile Workflow",
    
    apktoolSidebarTitle: "APK Transformation",
    apktoolSidebarDesc: "Configure your APK filename parameters to generate precise decompiling and signing commands on Kali Linux.",
    apktoolInputOrigLabel: "Original APK filename (Without .apk extension):",
    apktoolInputOutLabel: "Decompile Output Directory:",
    apktoolErrResourceLabel: "Resource Compiling Crash:",
    apktoolErrResourceDesc: "If apktool crashes while parsing resources.arsc, rebuild using the -r flag during decompilation to skip asset parsing.",
    apktoolErrSignLabel: "Signature Block Rejection:",
    apktoolErrSignDesc: "Modern Android releases require V2 or V3 signing blocks. You must use apksigner since jarsigner fails on newer devices.",
    apktoolErrZipalignLabel: "Zipalign Optimization:",
    apktoolErrZipalignDesc: "Ensure you run the zipalign tool prior to signing to structurally optimize your APK file structure and prevent installation bugs.",
    apktoolStepsTitle: "APK Reverse Engineering & Code Patching Workflow",

    // Frida UI
    fridaTitle: "Advanced Frida Bypass Script Library",
    fridaDesc: "Use Frida dynamic hooking to inject code into Android's ART Virtual Machine process during runtime.",
    fridaCopyTooltip: "Copy entire script code",
    fridaRunTip: "Execution command on Kali Linux:",
    fridaSetupTitle: "How to run Frida-Server on Android:",
    fridaSetup1: "Step 1: Download Server - Get frida-server matching your Android CPU (usually arm64) from the official GitHub Releases.",
    fridaSetup2: "Step 2: Push to Device - Execute:",
    fridaSetup3: "Step 3: Grant Execution Rights - Execute:",
    fridaSetup4: "Step 4: Launch Server - Start as root background task:",
    
    fridaHeaderTitle: "Advanced Frida Bypass Script Library",
    fridaHeaderDesc: "Leverage Frida for dynamic binary instrumentation (Hooking) straight into the Android ART virtual machine while the application runs.",
    fridaStep1Title: "Step 1: Download Server Binary",
    fridaStep1Desc: "Fetch the appropriate frida-server matching your Android CPU architecture (typically arm64) from the official Frida GitHub Releases.",
    fridaStep2Title: "Step 2: Transfer to device",
    fridaStep2Desc: "Push the decompressed server binary onto your phone storage path using ADB:",
    fridaStep3Title: "Step 3: Elevate Executable Permissions",
    fridaStep3Desc: "Grant execution permissions to the transferred binary:",
    fridaStep4Title: "Step 4: Execute in Background",
    fridaStep4Desc: "Start a root-level terminal shell and execute the server in the background:",
    
    // Chatbot UI
    chatExpertTitle: "AI Security Hacker Specialist",
    chatExpertDesc: "An AI expert specialized in Android pentesting. Can generate custom Frida hooks, explain mobile vulnerabilities, and build custom exploit payloads.",
    chatSuggestTitle: "Suggested Questions:",
    chatPlaceholder: "Ask me about adb usage, reverse engineering, custom Frida scripts, bypasses...",
    chatClearHistory: "Clear History",
    chatTimePrefix: "Responding...",
    chatWelcomeMessage: "Hello! I am your AI Android Pentesting Assistant on Kali Linux. How can I assist you with reverse engineering, root/SSL pinning bypasses, intent exploitation, or security remediation today?",
    chatAgentTitle: "AI Security Hacker Specialist",
    chatAgentDesc: "An AI expert specialized in Android pentesting. Can generate custom Frida hooks, explain mobile vulnerabilities, and build custom exploit payloads.",
    chatSuggestionsTitle: "Suggested Questions",
    chatPreset1Query: "Show me how to use Frida to bypass SSL Pinning in a Flutter application?",
    chatPreset1Text: "Bypass Flutter SSL Pinning?",
    chatPreset2Query: "What is the Android:exported=\"true\" vulnerability? How do I exploit and patch it?",
    chatPreset2Text: "Exported Component vulnerability?",
    chatPreset3Query: "Guide me on how to install and start Drozer on Kali Linux for Android pentesting?",
    chatPreset3Text: "Using Drozer on Kali Linux?",
    chatPreset4Query: "Write a basic Frida script to hook 'checkPassword' in 'com.example.AuthClass' and print the input password.",
    chatPreset4Text: "Frida script for hooking login?",
    chatAgentSub: "Response from Gemini-1.5-Flash (Security Agent)",
    chatClearHistoryBtn: "Clear History",
    chatTyping: "Responding...",
    chatInputPlaceholder: "Ask me about adb, reverse engineering, bypass scripts,...",
    
    // Terminal Console
    termTitle: "KALI INTERACTIVE CONSOLE",
    termExecuting: "(Executing...)",
    termClearLogs: "Clear Logs",
    termCollapse: "▼ Minimize Console",
    termExpand: "▲ Expand Console & Run Manual Commands",
    termPlaceholder: "Enter manual adb or terminal command (e.g. adb devices, adb shell getprop)...",
    termPressEnter: "Press Enter to run",
    termEmptyState: "No commands run yet. Click \"Run\" on any command block above to see terminal outputs here in real-time!",
    termSimToggle: "Simulate",
    termSimModeActive: "SIMULATE: ON",
    termSimModeInactive: "LIVE MODE (Needs Local)",
    termSimNotice: "[SIMULATE] Simulating pentest command in sandbox...",
    
    // Footer
    footerCopyright: "© 2026 AndroSentry Project. All Rights Reserved.",
    footerDisclaimer: "Disclaimer: Use this software only on legally authorized targets. Unpermitted hacking is strictly illegal.",
    
    // Guide Modal
    guideModalTitle: "User Guide & Feature Documentation Manual",
    guideModalSubtitle: "Detailed installation guides, pentesting workflows, and Android security concepts",
    guideDownloadMd: "Download .md",
    guideDownloadDocx: "Download .docx",
    guideCloseBtn: "Close Manual",
    guideSyncing: "Loading and synchronizing user manual content..."
  },
  ja: {
    title: "AndroSentry",
    subtitle: "Kali Linuxユーザー向けの包括的なAndroid脆弱性診断・ペンテスト支援ツール",
    themeSelector: "テーマ",
    viewGuide: "マニュアル表示",
    viewGuideTooltip: "アプリ内で直接ユーザーガイドを閲覧する",
    statusEmulator: "Kali OS エミュレータモード",
    aiReady: "AI: 準備完了",
    aiNotConfigured: "AI: キー未設定",
    quickGuide: "クイックスタート:",
    quickStep1: "Android携帯の**USBデバッグ**を有効にします",
    quickStep2: "接続状態を確認するために`adb devices`を実行します",
    quickStep3: "AIを有効にするために`export GEMINI_API_KEY=\"key\"`を実行します",
    tabAdb: "ADBコマンド生成",
    tabManifest: "AIマニフェスト監査",
    tabApktool: "Apktoolプロセス",
    tabFrida: "Fridaライブラリ",
    tabChat: "AIチャットアシスタント",
    aiBadge: "AI搭載",
    
    // Target parameters
    targetParamsTitle: "ターゲットパラメータ設定",
    targetParamsDesc: "以下の値を変更すると、右側のコマンドカードに自動的にパラメータが反映されます。",
    labelPackage: "[PACKAGE_NAME] (パッケージ名):",
    labelActivity: "[ACTIVITY_NAME] (アクティビティ名):",
    labelAction: "[ACTION_NAME] (インテントアクション):",
    labelApkPath: "[APK_PATH_ON_DEVICE] (APKパス):",
    labelFilter: "[FILTER_KEYWORD] (ログフィルタキーワード):",
    labelLocalPort: "Kaliポート:",
    labelDevicePort: "Androidポート:",
    paramTitle: "ターゲットパラメータ設定",
    paramSubtitle: "以下の値を変更すると、右側のコマンドカードに自動的にパラメータが反映されます。",
    paramPackageLabel: "パッケージ名",
    paramActivityLabel: "アクティビティ名",
    paramActionLabel: "インテントアクション",
    paramApkLabel: "APKパス",
    paramFilterLabel: "ログフィルタキーワード",
    paramKaliPort: "Kaliポート",
    paramAndroidPort: "Androidポート",
    
    // Connection Guide
    connGuideTitle: "Kali Linuxとデバイスの接続手順:",
    connStep1: "携帯電話の「開発者向けオプション」を有効にします。",
    connStep2: "「USBデバッグ」を有効にします。",
    connStep3: "USBケーブルで携帯電話をKali Linuxに接続します。",
    connStep4: "接続許可のポップアップ（RSAキー確認）が表示されたら、許可を選択します。",
    connStep5: "Kaliでターミナルを開き、最初の接続チェックコマンドを実行します。",
    guideTitle: "Kali Linuxとデバイスの接続手順:",
    guideStep1: "携帯電話の「開発者向けオプション」を有効にします。",
    guideStep2: "「USBデバッグ」を有効にします。",
    guideStep3: "USBケーブルで携帯電話をKali Linuxに接続します。",
    guideStep4: "接続許可のポップアップ（RSAキー確認）が表示されたら、許可を選択します。",
    guideStep5: "Kaliでターミナルを開き、最初の接続チェックコマンドを実行します。",
    
    // Commands UI
    categoryRecon: "情報収集と偵察 (デバイス偵察 - Device Recon)",
    categoryData: "データ抽出とサンドボックス解析 (Data Analysis)",
    categoryIntent: "インテント送信とコンポーネント傍受 (Component Interception)",
    categoryNetworking: "ポートフォワーディングとネットワーク分析 (Networking)",
    runBtn: "実行",
    copyBtn: "コピー",
    runTooltip: "ローカルのKaliシステムでコマンドを直接実行する",
    copyTooltip: "クリップボードにコピー",
    
    // Manifest Scanner UI
    manifestTitle: "AndroidManifest.xml コンテンツ",
    useSampleBtn: "サンプル使用",
    useSampleTooltip: "スキャンテスト用に脆弱なマニフェストサンプルを復元",
    manifestEditorDesc: "逆コンパイルしたAPKから抽出したAndroidManifest.xmlを貼り付け、Gemini AIによる脆弱性自動診断を開始します。",
    placeholderXml: "ここにXMLコードを貼り付けます...",
    clearXml: "エディタをクリア",
    btnAudit: "AIセキュリティ監査を実行",
    btnAuditing: "セキュリティを診断中...",
    resultTitle: "セキュリティ監査結果",
    scoreLabel: "セキュリティスコア:",
    emptyResultTitle: "診断結果がありません",
    emptyResultDesc: "左側のエディタにマニフェストを貼り付け、「AIセキュリティ監査を実行」をクリックして潜在的な脆弱性をスキャンします。",
    auditingTitle: "AIがAndroidマニフェストを分析中...",
    auditingDesc: "パーミッション設定、エクスポートされたコンポーネント、デバッグ構成などを、モバイルセキュリティ基準に沿って分析しています...",
    errorTitle: "エラーが発生しました:",
    auditSummaryTitle: "監査概要:",
    findingsCountTitle: "検出された脆弱性一覧",
    btnExportMd: ".MD出力",
    btnExportHtml: "HTML出力",
    exportMdTooltip: "監査レポートをMarkdown形式（.md）で保存",
    exportHtmlTooltip: "グラフィカルなHTML形式でレポートを保存",
    locationLabel: "検出場所:",
    remediationLabel: "修正方法のガイド:",
    noFindings: "🎉 素晴らしい！このAndroidManifest.xmlに重大なセキュリティ脆弱性は検出されませんでした。",
    
    manifestEditorTitle: "AndroidManifest.xml コンテンツ",
    manifestUseSampleBtn: "サンプル使用",
    manifestUseSampleTooltip: "スキャンテスト用に脆弱なマニフェストサンプルを復元",
    manifestTextareaPlaceholder: "ここにXMLコードを貼り付けます...",
    manifestClearBtn: "エディタをクリア",
    manifestAuditing: "セキュリティを診断中...",
    manifestAuditBtn: "AIセキュリティ監査を実行",
    manifestResultTitle: "セキュリティ監査結果",
    manifestResultScoreLabel: "セキュリティスコア:",
    manifestEmptyTitle: "診断結果がありません",
    manifestEmptyDesc: "左側のエディタにマニフェストを貼り付け、「AIセキュリティ監査を実行」をクリックして潜在的な脆弱性をスキャンします。",
    manifestLoadingTitle: "AIがAndroidマニフェストを分析中...",
    manifestLoadingDesc: "パーミッション設定、エクスポートされたコンポーネント、デバッグ構成などを、モバイルセキュリティ基準に沿って分析しています...",
    manifestErrorTitle: "エラーが発生しました:",
    manifestSummaryTitle: "監査概要:",
    manifestFindingsListTitle: "検出された脆弱性一覧",
    exportMdBtn: ".MD出力",
    exportHtmlBtn: "HTML出力",
    findingLocationLabel: "検出場所:",
    findingRemediationLabel: "修正方法のガイド:",
    noFindingsMessage: "🎉 素晴らしい！このAndroidManifest.xmlに重大なセキュリティ脆弱性は検出されませんでした。",

    // Apktool UI
    transformApkTitle: "APK編集用パラメータ設定",
    transformApkDesc: "APKファイル名を設定し、Kali Linuxで安全にビルド・署名するためのコマンドを生成します。",
    labelApkName: "元のAPKファイル名（.apkの拡張子を除く）:",
    labelOutputDir: "逆コンパイル出力先フォルダ名:",
    apktoolErrorsTitle: "よくあるビルドエラーと対処法:",
    apktoolError1: "リソースコンパイルエラー: resources.arscのエラーでapktoolがクラッシュする場合、逆コンパイル時に -r フラグを付与してリソース解凍をスキップします。",
    apktoolError2: "署名エラー: Android 11以降はV2/V3署名スキームが必要です。apksignerの使用が必須となります（jarsignerはサポートされません）。",
    apktoolError3: "Zipalign最適化: アプリの起動やインストールクラッシュを防ぐため、署名前に必ず zipalign を実行して配置位置を最適化します。",
    apktoolWorkflowTitle: "APK逆コンパイル、ソースパッチ適用、再ビルド、署名フロー",
    
    apktoolSidebarTitle: "APK編集用パラメータ設定",
    apktoolSidebarDesc: "APKファイル名を設定し、Kali Linuxで安全にビルド・署名するためのコマンドを生成します。",
    apktoolInputOrigLabel: "元のAPKファイル名（.apkの拡張子を除く）:",
    apktoolInputOutLabel: "逆コンパイル出力先フォルダ名:",
    apktoolErrResourceLabel: "リソースコンパイルエラー:",
    apktoolErrResourceDesc: "resources.arscのエラーでapktoolがクラッシュする場合、逆コンパイル時に -r フラグを付与してリソース解凍をスキップします。",
    apktoolErrSignLabel: "署名エラー:",
    apktoolErrSignDesc: "Android 11以降はV2/V3署名スキームが必要です。apksignerの使用が必須となります（jarsignerはサポートされません）。",
    apktoolErrZipalignLabel: "Zipalign最適化:",
    apktoolErrZipalignDesc: "アプリの起動やインストールクラッシュを防ぐため、署名前に必ず zipalign を実行して配置位置を最適化します。",
    apktoolStepsTitle: "APK逆コンパイル、ソースパッチ適用、再ビルド、署名フロー",

    // Frida UI
    fridaTitle: "高度なFridaバイパススクリプトライブラリ",
    fridaDesc: "Fridaの動的フッキング機能を利用して、実行中のAndroidのART仮想プロセスに任意のJavaコードを注入・実行します。",
    fridaCopyTooltip: "スクリプト全体をコピーする",
    fridaRunTip: "Kali Linuxでの実行コマンド:",
    fridaSetupTitle: "AndroidでFrida-Serverを起動する方法:",
    fridaSetup1: "ステップ 1: サーバーのダウンロード - FridaのGitHubリリースから、AndroidのCPU（通常はarm64）に一致するfrida-serverをダウンロードします。",
    fridaSetup2: "ステップ 2: デバイスへ転送 - 次を実行:",
    fridaSetup3: "ステップ 3: 実行権限の付与 - 次を実行:",
    fridaSetup4: "ステップ 4: サーバーの起動 - バックグラウンドでroot権限起動します:",
    
    fridaHeaderTitle: "高度なFridaバイパススクリプトライブラリ",
    fridaHeaderDesc: "Fridaの動的フッキング機能を利用して、実行中のAndroidのART仮想プロセスに任意のJavaコードを注入・実行します。",
    fridaStep1Title: "ステップ 1: サーバーのダウンロード",
    fridaStep1Desc: "FridaのGitHubリリースから、AndroidのCPU（通常はarm64）に一致するfrida-serverをダウンロードします。",
    fridaStep2Title: "ステップ 2: デバイスへ転送",
    fridaStep2Desc: "解凍したサーバーバイナリをADBコマンドを使用して携帯電話へプッシュします:",
    fridaStep3Title: "ステップ 3: 実行権限の付与",
    fridaStep3Desc: "プッシュしたサーバーバイナリに十分な実行権限を割り当てます:",
    fridaStep4Title: "ステップ 4: サーバーの起動",
    fridaStep4Desc: "デバイスのrootシェルを開き、バックグラウンドでサーバーを実行します:",
    
    // Chatbot UI
    chatExpertTitle: "AIセキュリティハッカースペシャリスト",
    chatExpertDesc: "Android脆弱性テストに特化したAIアシスタント。カスタムFridaスクリプトの作成、モバイル脆弱性の解説、エクスプロイト手法の作成を行います。",
    chatSuggestTitle: "推奨質問:",
    chatPlaceholder: "adbコマンドの使い方、逆コンパイル、カスタムFridaフックの作成について質問する...",
    chatClearHistory: "履歴クリア",
    chatTimePrefix: "応答生成中...",
    chatWelcomeMessage: "こんにちは！Kali Linux上のAI Androidペンテストアシスタントです。リバースエンジニアリング、root/SSLピンニングのバイパス、インテント悪用、セキュリティ対策についてどのようなサポートが必要ですか？",
    chatAgentTitle: "AIセキュリティハッカースペシャリスト",
    chatAgentDesc: "Android脆弱性テストに特化したAIアシスタント。カスタムFridaスクリプトの作成、モバイル脆弱性の解説、エクスプロイト手法の作成を行います。",
    chatSuggestionsTitle: "推奨質問",
    chatPreset1Query: "FlutterアプリのSSLピンニングをFridaでバイパスする方法を教えてください。",
    chatPreset1Text: "FlutterのSSLピンニング回避？",
    chatPreset2Query: "Android:exported=\"true\"の脆弱性とは何ですか？悪用と修正方法は？",
    chatPreset2Text: "Exportedコンポーネント脆弱性？",
    chatPreset3Query: "Kali LinuxでDrozerをインストールしてAndroidペンテストを開始する手順を教えてください。",
    chatPreset3Text: "KaliでのDrozer使用方法？",
    chatPreset4Query: "com.example.AuthClassのcheckPasswordメソッドをフックして入力されたパスワードを表示するFridaスクリプトを書いてください。",
    chatPreset4Text: "ログインフックのFridaスクリプト？",
    chatAgentSub: "Gemini-1.5-Flash (セキュリティエージェント)からの応答",
    chatClearHistoryBtn: "履歴クリア",
    chatTyping: "応答生成中...",
    chatInputPlaceholder: "adbの使い方、逆コンパイル、バイパススクリプトについて質問する...",
    
    // Terminal Console
    termTitle: "KALI インタラクティブコンソール",
    termExecuting: "(実行中...)",
    termClearLogs: "ログクリア",
    termCollapse: "▼ コンソールを閉じる",
    termExpand: "▲ コンソールを展開して手動コマンドを実行",
    termPlaceholder: "手動でadbまたは端末コマンドを入力します (例: adb devices, adb shell getprop)...",
    termPressEnter: "Enterキーで実行",
    termEmptyState: "実行されたコマンドはありません。上のコマンドブロックの「実行」をクリックして、リアルタイムの出力をここに確認してください！",
    termSimToggle: "シミュレート",
    termSimModeActive: "シミュレーション: オン",
    termSimModeInactive: "ライブモード (要ローカル)",
    termSimNotice: "[シミュレーション] サンドボックス内でペンテストコマンドをシミュレート中...",
    
    // Footer
    footerCopyright: "© 2026 AndroSentry Project. All Rights Reserved.",
    footerDisclaimer: "免責事項：認可された対象に対してのみ脆弱性テストを行ってください。無許可のハッキングは法律で厳しく禁止されています。",
    
    // Guide Modal
    guideModalTitle: "ユーザーマニュアル・機能仕様書",
    guideModalSubtitle: "詳細なセットアップ、診断手順、およびAndroidのセキュリティ基本概念",
    guideDownloadMd: ".mdダウンロード",
    guideDownloadDocx: ".docxダウンロード",
    guideCloseBtn: "マニュアルを閉じる",
    guideSyncing: "マニュアルファイルを同期・読込中..."
  }
};

export const ADB_COMMANDS_TRANSLATIONS: Record<string, Record<string, { title: string; description: string }>> = {
  vi: {
    "recon-1": { title: "Liệt kê thiết bị đang kết nối", description: "Hiển thị danh sách thiết bị Android đang kết nối với máy tính." },
    "recon-2": { title: "Xem thông tin phiên bản Android", description: "Truy vấn phiên bản hệ điều hành Android (SDK API Level) của thiết bị mục tiêu." },
    "recon-3": { title: "Liệt kê tất cả các gói ứng dụng (Packages)", description: "Hiển thị toàn bộ tên gói (package name) của các ứng dụng đã cài đặt." },
    "recon-4": { title: "Tìm vị trí lưu tệp APK của ứng dụng", description: "Xác định đường dẫn lưu trữ tuyệt đối của tệp APK gốc của ứng dụng trên thiết bị." },
    "data-1": { title: "Sao lưu tệp APK về máy tính Kali", description: "Tải xuống tệp APK gốc từ thiết bị Android về máy Kali Linux để tiến hành dịch ngược." },
    "data-2": { title: "Xem logs thời gian thực (Logcat)", description: "Theo dõi luồng log hệ thống nhằm phát hiện rò rỉ dữ liệu nhạy cảm." },
    "data-3": { title: "Tải thư mục dữ liệu cá nhân (Sandbox Data)", description: "Sao chép thư mục dữ liệu nội bộ của ứng dụng về máy để phân tích ngoại tuyến." },
    "data-4": { title: "Chụp ảnh màn hình thiết bị Android", description: "Lưu ảnh màn hình hiện tại của thiết bị và sao chép về máy Kali Linux." },
    "intent-1": { title: "Khởi chạy một Activity (Ví dụ: bypass login)", description: "Khởi chạy trực tiếp một Activity đã xuất khẩu (Exported Activity) không cần mật khẩu." },
    "intent-2": { title: "Gửi một Broadcast Intent tùy chỉnh", description: "Kích hoạt một Broadcast Receiver cụ thể với các tham số đi kèm." },
    "intent-3": { title: "Khởi chạy một Background Service", description: "Bắt đầu một service chạy ngầm được khai báo trong ứng dụng mục tiêu." },
    "shell-1": { title: "Truy cập Android Shell", description: "Mở một phiên terminal tương tác trực tiếp với hệ điều hành Android." },
    "shell-2": { title: "Khởi động lại thiết bị sang Recovery", description: "Khởi động lại thiết bị vào chế độ khôi phục (Recovery Mode)." },
    "shell-3": { title: "Yêu cầu quyền Root (Nếu thiết bị đã root)", description: "Chuyển đổi tài khoản người dùng shell thông thường sang người dùng quản trị tối cao (root)." },
    "reverse-1": { title: "Chuyển tiếp cổng (Port Forwarding)", description: "Chuyển tiếp lưu lượng từ cổng máy tính cục bộ sang cổng trên thiết bị Android." },
    "reverse-2": { title: "Kiểm tra các cổng mạng đang mở trên Android", description: "Liệt kê các tiến trình mạng và cổng TCP/UDP đang lắng nghe trên thiết bị Android mục tiêu." }
  },
  en: {
    "recon-1": { title: "List Connected Devices", description: "Displays a list of active Android devices or emulators currently connected." },
    "recon-2": { title: "Check Android SDK Version", description: "Queries the target device for its active Android Operating System version (API level)." },
    "recon-3": { title: "List Installed Packages", description: "Retrieves a complete list of application package names installed on the target device." },
    "recon-4": { title: "Locate App APK File Path", description: "Finds the exact absolute filesystem path of the original APK file stored on the device." },
    "data-1": { title: "Pull APK File to Local System", description: "Downloads the original APK file from the Android device to your Kali Linux directory." },
    "data-2": { title: "Monitor Real-time Logs (Logcat)", description: "Filters active system messages to spot private credentials, debug statements, or tokens." },
    "data-3": { title: "Backup App Private Sandbox Data", description: "Pulls local databases, shared preferences, and files to Kali for forensic analysis." },
    "data-4": { title: "Capture Android Screenshot", description: "Saves a high-resolution PNG image of the target's current screen directly to Kali." },
    "intent-1": { title: "Start Activity (e.g. bypass login)", description: "Launches any exported Android Activity component directly, ignoring the login barrier." },
    "intent-2": { title: "Broadcast Custom Intent Payload", description: "Trigger exported broadcast receivers directly with customized key-value parameters." },
    "intent-3": { title: "Launch Background Service", description: "Directly runs background services declared inside the target application." },
    "shell-1": { title: "Open Android Interactive Shell", description: "Spawns a shell environment allowing direct command execution inside the Android OS." },
    "shell-2": { title: "Reboot Device to Recovery", description: "Forces the connected Android hardware to restart in recovery firmware mode." },
    "shell-3": { title: "Escalate to Root Shell (su)", description: "Requests administrative root privileges on the device's shell if pre-rooted." },
    "reverse-1": { title: "ADB Port Forwarding", description: "Binds a local machine TCP port to a target Android port (ideal for Frida/GDB)." },
    "reverse-2": { title: "Inspect Open Network Ports", description: "List active listening TCP/UDP endpoints and network sockets inside Android." }
  },
  ja: {
    "recon-1": { title: "接続中のデバイス一覧", description: "現在接続されているアクティブなAndroid端末やエミュレータを表示します。" },
    "recon-2": { title: "Android OSバージョンの確認", description: "ターゲット端末のAndroid SDK APIレベルを取得します。" },
    "recon-3": { title: "インストール済みパッケージ一覧", description: "接続端末にインストールされている全アプリのパッケージ名を表示します。" },
    "recon-4": { title: "アプリAPKファイルの保存先検索", description: "デバイス上にインストールされているアプリのAPKへの絶対パスを調べます。" },
    "data-1": { title: "APKファイルをKaliにダウンロード", description: "端末からオリジナルAPKファイルをダウンロードして逆コンパイルの準備をします。" },
    "data-2": { title: "リアルタイムログの監視 (Logcat)", description: "システムログをストリーム監視し、認証情報やトークンの漏洩がないか検証します。" },
    "data-3": { title: "アプリの秘密領域データの抽出", description: "アプリ内部のデータベースや共有ファイル（Sandbox）をKaliに転送します。" },
    "data-4": { title: "画面キャプチャの保存", description: "Android画面のスクリーンショットを撮影し、Kali Linuxに保存します。" },
    "intent-1": { title: "任意のアクティビティを強制起動", description: "エクスポートされたActivityコンポーネントを、ログインをスキップして起動します。" },
    "intent-2": { title: "カスタムブロードキャスト送信", description: "引数となるキー/値パラメータを付与し、特定の受信レシーバーを起動します。" },
    "intent-3": { title: "バックグラウンドサービスの強制開始", description: "対象アプリで宣言されているサービスコンポーネントを強制起動します。" },
    "shell-1": { title: "Androidシェルの起動", description: "Android OS内で直接コマンドを実行するためのインタラクティブ端末を開きます。" },
    "shell-2": { title: "デバイスをリカバリモードで再起動", description: "端末をリカバリモードに強制的に再起動させます。" },
    "shell-3": { title: "Root特権の要求 (su)", description: "端末がルート化されている場合、一般シェルから管理特権（root）に昇格します。" },
    "reverse-1": { title: "ポートフォワーディング転送", description: "ローカルマシンのポートをAndroid端末の通信ポートへバインドします（Frida用に最適）。" },
    "reverse-2": { title: "Androidの解放ネットワークポート確認", description: "Android内でリッスンしているTCP/UDPソケットとアクティブ通信を確認します。" }
  }
};

export const APKTOOL_STEPS_TRANSLATIONS: Record<string, Record<string, { title: string; description: string; tip?: string }>> = {
  vi: {
    "apktool-1": {
      title: "Giải nén & dịch ngược mã nguồn (Decompile)",
      description: "Sử dụng Apktool để dịch ngược tệp base.apk thành các tệp mã nguồn Smali, tài nguyên XML và tệp Manifest dạng thô.",
      tip: "Giúp bạn chỉnh sửa trực tiếp tệp AndroidManifest.xml hoặc sửa đổi các hằng số trong thư mục smali."
    },
    "apktool-2": {
      title: "Chạy Jadx-GUI để phân tích mã Java",
      description: "Khởi chạy công cụ Jadx-GUI trên Kali Linux nhằm chuyển đổi mã bytecode Dalvik (.dex) sang mã nguồn Java có độ đọc hiểu cao.",
      tip: "Lựa chọn lý tưởng cho việc đọc hiểu thuật toán, tìm khóa mã hóa AES/RSA hoặc URL ẩn trong ứng dụng."
    },
    "apktool-3": {
      title: "Đóng gói lại ứng dụng sau chỉnh sửa (Recompile)",
      description: "Biên dịch thư mục chứa mã nguồn smali đã được vá bảo mật (hoặc cài backdoor kiểm thử) trở lại thành tệp APK mới.",
      tip: "Thư mục đầu ra thường chứa tệp patched.apk mới nhưng chưa được ký mã số."
    },
    "apktool-4": {
      title: "Tạo khóa ký tự ký mã (Keystore Generation)",
      description: "Tạo một chứng chỉ số tự ký (Self-signed Certificate) để sử dụng cho việc ký ứng dụng APK đã sửa đổi.",
      tip: "Hãy nhập các thông tin mô phỏng và ghi nhớ mật khẩu đã thiết lập."
    },
    "apktool-5": {
      title: "Ký tệp APK patched (Signing)",
      description: "Ký tệp APK patched bằng chứng chỉ số vừa tạo để Android cho phép cài đặt và chạy ứng dụng trên thiết bị thực tế.",
      tip: "Trên các phiên bản Kali Linux mới, bạn có thể kiểm tra chữ ký thông qua lệnh: apksigner verify patched.apk"
    }
  },
  en: {
    "apktool-1": {
      title: "Extract & Decompile APK Source Code",
      description: "Invokes Apktool to reverse compile base.apk into legible Smali assembly code, resource assets, and layout XML sheets.",
      tip: "Allows you to perform modifications to AndroidManifest.xml or inject code blocks directly in smali folders."
    },
    "apktool-2": {
      title: "Inspect Java Source with Jadx-GUI",
      description: "Starts Jadx-GUI on Kali Linux, converting raw compiled Dalvik bytecode (.dex) back into human-readable Java structures.",
      tip: "Perfect for code reviews, finding static AES/RSA cryptography keys, or scanning for API endpoint URLs."
    },
    "apktool-3": {
      title: "Rebuild Modified Application (Recompile)",
      description: "Assembles the decompiled directory containing customized or patched files back into a clean installable APK package.",
      tip: "This creates the fresh patched.apk, which is unsigned and needs security signatures before install."
    },
    "apktool-4": {
      title: "Create Self-Signed Certificate Key",
      description: "Generates a custom development cryptographic keystore used to sign edited or modified APK applications.",
      tip: "Enter arbitrary organization details and keep note of the key password you create."
    },
    "apktool-5": {
      title: "Sign the Patched APK Package",
      description: "Signs the final patched APK with the generated developer keystore so Android devices can trust and run the app.",
      tip: "Verify your signature details on Kali using the command: apksigner verify patched.apk"
    }
  },
  ja: {
    "apktool-1": {
      title: "APKファイルの解凍・逆コンパイル (Decompile)",
      description: "Apktoolを使用してbase.apkをSmaliアセンブリ、XML、および暗号化されていないマニフェストファイルに分解します。",
      tip: "AndroidManifest.xmlの直接編集や、smaliフォルダ内へのコード変更を可能にします。"
    },
    "apktool-2": {
      title: "Jadx-GUIを起動してJavaコードを静的解析",
      description: "Kali Linux上でJadx-GUIを起動し、Dalvikバイトコード（.dex）を読みやすいJava言語へデコンパイルします。",
      tip: "暗号化アルゴリズムの解読、埋め込まれたAES/RSAキーの探索、隠しエンドポイントの調査に最適です。"
    },
    "apktool-3": {
      title: "パッチ適用済みアプリの再ビルド (Recompile)",
      description: "編集したsmaliソースコードやマニフェストを含むフォルダを、新しいAPKファイルへ再コンパイルします。",
      tip: "生成されたpatched.apkは署名されていないため、実機インストール前に署名プロセスが必要です。"
    },
    "apktool-4": {
      title: "コード署名用証明書（Keystore）の作成",
      description: "独自開発者として再署名を行うための、自己署名入り電子証明書ファイルを生成します。",
      tip: "プロンプトに従って任意の所属情報を入力し、指定した証明書パスワードを控えておきます。"
    },
    "apktool-5": {
      title: "改変されたAPKの電子署名 (Signing)",
      description: "生成した電子証明書でパッチ適用済みAPKを署名し、Android実機にアプリをインストール可能にします。",
      tip: "最新のKali Linuxでは次のコマンドで署名の整合性を確認できます: apksigner verify patched.apk"
    }
  }
};

export const FRIDA_SCRIPTS_TRANSLATIONS: Record<string, Record<string, { title: string; description: string }>> = {
  vi: {
    "frida-1": {
      title: "Bypass SSL Pinning (Bảo mật kênh truyền)",
      description: "Mã script Frida phổ biến giúp ghi đè các hàm TrustManager và OkHttpClient để chặn bắt dữ liệu HTTPS qua các proxy như Burp Suite."
    },
    "frida-2": {
      title: "Bypass Root Detection (Kiểm tra thiết bị root)",
      description: "Mã script Frida để lừa ứng dụng tin rằng thiết bị kiểm thử không hề bị root bằng cách ghi đè hàm kiểm tra tệp tin 'su' hoặc RootBeer."
    },
    "frida-3": {
      title: "Ghi đè hàm mã hóa AES (Crypto Inspection)",
      description: "Script theo dõi trực tiếp tham số đầu vào và đầu ra của thư viện mật mã học Java (Cipher) để thu thập khóa bí mật AES trong thời gian thực."
    }
  },
  en: {
    "frida-1": {
      title: "Bypass SSL Pinning (Network Proxy Interception)",
      description: "A popular Frida hook script that overrides standard TrustManager and OkHttpClient routines to inspect HTTPS traffic via proxy tools like Burp Suite."
    },
    "frida-2": {
      title: "Bypass Android Root Detection",
      description: "Infects system File classes to pretend critical root binaries like 'su', 'busybox', or 'Superuser.apk' do not exist, tricking libraries like RootBeer."
    },
    "frida-3": {
      title: "AES Crypto Key & Payload Inspector",
      description: "Injects hooks directly into the Java Cipher class, outputting raw byte payloads and secret AES keys onto your Kali console in real time."
    }
  },
  ja: {
    "frida-1": {
      title: "SSLピンニングの強制解除 (通信傍受)",
      description: "ConscryptのTrustManagerやOkHttpClientの検証処理を上書きし、Burp Suite等のProxy経由でHTTPS暗号通信をキャプチャ可能にします。"
    },
    "frida-2": {
      title: "ルート化検出機能のバイパス (Root Detection Bypass)",
      description: "「su」ファイル、「busybox」、「Superuser.apk」などの存在確認をフックし、RootBeerライブラリ等の検知システムを偽装突破します。"
    },
    "frida-3": {
      title: "AES暗号鍵とペイロードのリアルタイム監視",
      description: "JavaのCipherクラスのdoFinal関数をフックし、暗号・復号処理の対象バイト数や秘密AESキーをKaliコンソールに平文出力させます。"
    }
  }
};
