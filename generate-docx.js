import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import fs from "fs";

// Cấu hình các hằng số màu sắc và font chữ
const FONT_SANS = "Calibri";
const COLOR_PRIMARY = "1F4E79";   // Xanh dương đậm chuyên nghiệp
const COLOR_SECONDARY = "2E75B6"; // Xanh dương trung bình
const COLOR_TEXT = "333333";      // Xám đậm dễ đọc
const COLOR_MUTED = "666666";     // Xám nhạt cho chú thích
const COLOR_DANGER = "C00000";    // Đỏ cho tuyên bố miễn trừ và cảnh báo

// Hàm helper tạo TextRun chuẩn
const createText = (text, options = {}) => {
  return new TextRun({
    text: text,
    font: FONT_SANS,
    size: options.size || 22, // 11pt mặc định
    color: options.color || COLOR_TEXT,
    bold: options.bold || false,
    italics: options.italics || false,
    underline: options.underline || false,
  });
};

// Hàm helper tạo tiêu đề lớn (Title)
const createTitle = (text) => {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 240 },
    children: [
      new TextRun({
        text: text,
        font: FONT_SANS,
        size: 36, // 18pt
        color: COLOR_PRIMARY,
        bold: true,
      })
    ]
  });
};

// Hàm helper tạo tiêu đề phụ (Subtitle)
const createSubtitle = (text) => {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 240 },
    children: [
      new TextRun({
        text: text,
        font: FONT_SANS,
        size: 24, // 12pt
        color: COLOR_MUTED,
        italics: true,
      })
    ]
  });
};

// Hàm helper tạo Heading 1 (Chương)
const createHeading1 = (text) => {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 120 },
    children: [
      new TextRun({
        text: text,
        font: FONT_SANS,
        size: 28, // 14pt
        color: COLOR_PRIMARY,
        bold: true,
      })
    ]
  });
};

// Hàm helper tạo Heading 2 (Mục nhỏ)
const createHeading2 = (text) => {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({
        text: text,
        font: FONT_SANS,
        size: 24, // 12pt
        color: COLOR_SECONDARY,
        bold: true,
      })
    ]
  });
};

// Hàm helper tạo đoạn văn bản body thông thường
const createBodyParagraph = (children, spacing = {}) => {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFY,
    spacing: { before: spacing.before || 60, after: spacing.after || 120, line: 276 }, // Line spacing 1.15
    children: children,
  });
};

// Hàm helper tạo bullet point
const createBulletParagraph = (children) => {
  return new Paragraph({
    bullet: {
      level: 0,
    },
    spacing: { before: 40, after: 80, line: 276 },
    children: children,
  });
};

// Khởi tạo tài liệu
const doc = new Document({
  creator: "Lê Đức Anh",
  title: "Tài liệu giới thiệu, mô tả và hướng dẫn sử dụng",
  description: "Tài liệu chi tiết về công cụ hỗ trợ kiểm thử xâm nhập thiết bị Android.",
  sections: [
    {
      properties: {},
      children: [
        // TRANG BÌA & TIÊU ĐỀ
        createTitle("BỘ CÔNG CỤ ANDROSENTRY"),
        createSubtitle("Tài liệu Giới thiệu, Mô tả và Hướng dẫn sử dụng chi tiết"),
        
        createBodyParagraph([
          createText("Được phát triển bởi: ", { bold: true }),
          createText("Lê Đức Anh\n"),
          createText("Phiên bản phần mềm: ", { bold: true }),
          createText("v1.3.0\n"),
          createText("Hệ điều hành hỗ trợ: ", { bold: true }),
          createText("Linux (Kali Linux, Ubuntu), macOS (hoặc Windows thông qua WSL/Docker)\n"),
          createText("Github: ", { bold: true }),
          createText("https://github.com/leanh19203/AndroSentry"),
        ], { before: 240, after: 480 }),

        // PHẦN I: GIỚI THIỆU TỔNG QUAN
        createHeading1("PHẦN I: GIỚI THIỆU TỔNG QUAN"),
        
        createBodyParagraph([
          createText("Trong bối cảnh chuyển đổi số diễn ra mạnh mẽ, các thiết bị và ứng dụng Android ngày càng được sử dụng rộng rãi trong nhiều lĩnh vực như tài chính, ngân hàng, thương mại điện tử và dịch vụ công. Cùng với sự phát triển đó, Android cũng trở thành một trong những nền tảng thường xuyên đối mặt với các nguy cơ tấn công an ninh mạng. Vì vậy, kiểm thử xâm nhập (Penetration Testing) và đánh giá an toàn bảo mật đối với ứng dụng Android đóng vai trò quan trọng trong việc phát hiện sớm các lỗ hổng, từ đó giảm thiểu rủi ro đối với dữ liệu và hệ thống."),
        ]),

        createBodyParagraph([
          createText("Hiện nay, quy trình kiểm thử Android thường dựa trên nhiều công cụ chuyên biệt như Android Debug Bridge (ADB), Apktool, JADX, Apksigner và Frida. Mỗi công cụ đảm nhiệm một chức năng riêng biệt và chủ yếu được sử dụng thông qua giao diện dòng lệnh (Command Line Interface - CLI). Điều này đòi hỏi người sử dụng phải nắm vững cú pháp lệnh, quản lý nhiều công cụ khác nhau và thực hiện nhiều bước thủ công trong quá trình kiểm thử, gây khó khăn cho việc chuẩn hóa quy trình cũng như nâng cao hiệu quả làm việc."),
        ]),

        createBodyParagraph([
          createText("Xuất phát từ thực tế đó, "),
          createText("AndroSentry", { bold: true }),
          createText(" được phát triển nhằm xây dựng một nền tảng hỗ trợ kiểm thử xâm nhập Android với giao diện đồ họa (Graphical User Interface - GUI) trực quan, tích hợp nhiều công cụ phổ biến trong cùng một môi trường làm việc. Hệ thống hỗ trợ các chức năng như quản lý thiết bị Android thông qua ADB, dịch ngược và phân tích ứng dụng bằng Apktool và JADX, ký số APK, hỗ trợ phân tích động với Frida, đồng thời tích hợp mô hình ngôn ngữ lớn Gemini AI để hỗ trợ phân tích cấu hình ứng dụng và cung cấp các nhận định phục vụ quá trình đánh giá bảo mật."),
        ]),

        createBodyParagraph([
          createText("Mục tiêu của "),
          createText("AndroSentry", { bold: true }),
          createText(" không phải thay thế các công cụ hiện có mà là cung cấp một quy trình làm việc thống nhất, giúp giảm bớt thao tác thủ công, đơn giản hóa việc phối hợp giữa các công cụ và hỗ trợ quá trình kiểm thử Android một cách hiệu quả, thuận tiện và nhất quán hơn."),
        ]),

        // PHẦN II: MÔ TẢ CÁC TÍNH NĂNG CỐT LÕI
        createHeading1("PHẦN II: MÔ TẢ CÁC TÍNH NĂNG CỐT LÕI"),
        
        createHeading2("1. Trình Quản lý Thiết bị (ADB Device Manager)"),
        createBodyParagraph([
          createText("Hỗ trợ giám sát và tương tác trực tiếp với thiết bị Android đang kết nối qua cáp USB hoặc mạng WiFi nội bộ:"),
        ]),
        createBulletParagraph([
          createText("Quét tìm thiết bị: ", { bold: true }),
          createText("Tự động dò tìm các thiết bị đang bật chế độ gỡ lỗi USB (Developer Options -> USB Debugging)."),
        ]),
        createBulletParagraph([
          createText("Thông tin hệ thống: ", { bold: true }),
          createText("Hiển thị chi tiết cấu hình phần cứng, phiên bản hệ điều hành Android, mức pin, nhiệt độ, cấu trúc CPU (arm64, x86) và địa chỉ IP."),
        ]),
        createBulletParagraph([
          createText("Trình quản lý tệp tin (File Explorer): ", { bold: true }),
          createText("Duyệt cây thư mục của thiết bị Android, cho phép tải tệp tin lên (Push), tải tệp tin về máy tính (Pull) một cách mượt mà."),
        ]),

        createHeading2("2. Quản lý Ứng dụng (App Manager)"),
        createBodyParagraph([
          createText("Hỗ trợ quản lý toàn diện các ứng dụng đã cài đặt trên thiết bị:"),
        ]),
        createBulletParagraph([
          createText("Phân loại ứng dụng: ", { bold: true }),
          createText("Liệt kê riêng biệt ứng dụng do người dùng cài đặt (User Apps) và ứng dụng mặc định của hệ thống (System Apps)."),
        ]),
        createBulletParagraph([
          createText("Trích xuất và Sao lưu: ", { bold: true }),
          createText("Xuất ngược gói cài đặt ứng dụng thành tệp APK (.apk) về máy tính để phân tích và dịch ngược."),
        ]),
        createBulletParagraph([
          createText("Gỡ cài đặt & Cài đặt nhanh: ", { bold: true }),
          createText("Gỡ bỏ ứng dụng bất kỳ hoặc cài đặt tệp APK mới trực tiếp thông qua thao tác kéo thả hoặc chọn tệp."),
        ]),

        createHeading2("3. Kiểm thử và Đóng gói ứng dụng (Application Decompilation & Signer)"),
        createBodyParagraph([
          createText("Tích hợp các công cụ dịch ngược và đóng gói hàng đầu:"),
        ]),
        createBulletParagraph([
          createText("Dịch ngược và Đóng gói (Apktool): ", { bold: true }),
          createText("Tự động giải nén tài nguyên ứng dụng thành mã nguồn Smali, chỉnh sửa cấu trúc tệp tin và đóng gói lại một cách tự động thông qua hàng đợi tác vụ bất đồng bộ."),
        ]),
        createBulletParagraph([
          createText("Ký ứng dụng (Signing Tools): ", { bold: true }),
          createText("Tích hợp quy trình căn chỉnh tối ưu hóa dung lượng (Zipalign) và ký số bảo mật bằng apksigner với keystore tự sinh, giúp APK đã sửa đổi có thể cài đặt trực tiếp lên thiết bị Android mục tiêu."),
        ]),
        createBulletParagraph([
          createText("Phân tích mã nguồn (JADX-GUI): ", { bold: true }),
          createText("Hỗ trợ mở nhanh trình dịch ngược mã nguồn Java của APK chỉ với một click chuột từ giao diện để kiểm thử tĩnh (Static Analysis)."),
        ]),

        createHeading2("4. Phân tích Động & Frida Instrumentation"),
        createBodyParagraph([
          createText("Cho phép can thiệp vào luồng thực thi của ứng dụng khi đang chạy (Runtime Instrumentation):"),
        ]),
        createBulletParagraph([
          createText("Bypass SSL Pinning: ", { bold: true }),
          createText("Tự động đẩy Frida Server lên thiết bị Android, khởi chạy server và tiêm (inject) script bypass cơ chế ghim chứng chỉ bảo mật (SSL Pinning), giúp phân tích các gói tin HTTPS qua Burp Suite."),
        ]),
        createBulletParagraph([
          createText("Giám sát Logcat thời gian thực: ", { bold: true }),
          createText("Bộ lọc thông minh giúp theo dõi luồng thông báo hệ thống và log lỗi của thiết bị Android trực tiếp trên giao diện console."),
        ]),

        createHeading2("5. Kiểm thử Tĩnh và Đánh giá Cấu hình (AI AndroidManifest Auditor)"),
        createBodyParagraph([
          createText("Phát hiện sớm các lỗ hổng bảo mật cấu hình trước khi ứng dụng được biên dịch hoặc phân phối:"),
        ]),
        createBulletParagraph([
          createText("Phân tích tệp AndroidManifest.xml: ", { bold: true }),
          createText("Tự động đọc và hiển thị cấu trúc tệp tin cấu hình hệ thống của ứng dụng đã được dịch ngược từ tab Quy trình Apktool."),
        ]),
        createBulletParagraph([
          createText("Đánh giá bảo mật tự động: ", { bold: true }),
          createText("Sử dụng mô hình trí tuệ nhân tạo (Gemini AI) tích hợp để quét và phát hiện các rủi ro bảo mật nghiêm trọng trong cấu hình, bao gồm các thành phần (Activity, Service, Receiver, Provider) bị lộ ra ngoài không có kiểm soát truy cập (exported=\"true\"), quyền truy cập quá mức cần thiết, bật chế độ gỡ lỗi (android:debuggable=\"true\"), hay cho phép sao lưu không an toàn (android:allowBackup=\"true\")."),
        ]),

        createHeading2("6. Trợ lý Bảo mật AI (AI Chat Assistant)"),
        createBodyParagraph([
          createText("Hệ thống AI chuyên biệt hỗ trợ Pentester phân tích, tư vấn và giải quyết các bài toán bảo mật thực tế:"),
        ]),
        createBulletParagraph([
          createText("Giải đáp và Tư vấn chuyên nghiệp: ", { bold: true }),
          createText("Hỗ trợ giải thích chi tiết các lỗ hổng bảo mật, đưa ra khuyến nghị khắc phục chuẩn hóa theo tiêu chuẩn an toàn OWASP Mobile Top 10."),
        ]),
        createBulletParagraph([
          createText("Tự động sinh mã nguồn hỗ trợ: ", { bold: true }),
          createText("Tự động soạn thảo các đoạn mã script Frida tùy biến, câu lệnh ADB nâng cao hoặc mã khai thác thử nghiệm (PoC) dựa theo ngữ cảnh phân tích được cung cấp."),
        ]),
        createBulletParagraph([
          createText("Hội thoại ngữ cảnh cao: ", { bold: true }),
          createText("Trải nghiệm chatbot mượt mà, bảo mật, lưu trữ lịch sử phiên làm việc cục bộ và cá nhân hóa tư vấn dựa trên cấu hình thiết bị hiện tại."),
        ]),

        // PHẦN III: HƯỚNG DẪN SỬ DỤNG CHI TIẾT
        createHeading1("PHẦN III: HƯỚNG DẪN SỬ DỤNG CHI TIẾT"),
        
        createHeading2("Bước 1: Chuẩn bị thiết bị Android"),
        createBulletParagraph([
          createText("Trên điện thoại/máy ảo Android, truy cập "),
          createText("Cài đặt (Settings) -> Thông tin điện thoại (About Phone)", { bold: true }),
          createText("."),
        ]),
        createBulletParagraph([
          createText("Nhấp liên tục 7 lần vào mục "),
          createText("Số phiên bản (Build Number)", { bold: true }),
          createText(" cho đến khi xuất hiện thông báo bạn đã là nhà phát triển."),
        ]),
        createBulletParagraph([
          createText("Quay lại Cài đặt, vào mục "),
          createText("Tùy chọn nhà phát triển (Developer Options)", { bold: true }),
          createText(", kích hoạt hai tính năng "),
          createText("Gỡ lỗi USB (USB Debugging)", { bold: true }),
          createText(" và "),
          createText("Gỡ lỗi không dây (Wireless Debugging)", { bold: true }),
          createText(" (nếu muốn kết nối không dây)."),
        ]),

        createHeading2("Bước 2: Kết nối thiết bị với ứng dụng"),
        createBulletParagraph([
          createText("Kết nối điện thoại với máy tính bằng cáp USB chất lượng tốt."),
          createText(" Khi điện thoại hiển thị hộp thoại yêu cầu xác nhận vân tay khóa RSA gỡ lỗi, hãy nhấp chọn "),
          createText("Luôn cho phép từ máy tính này (Always allow from this computer)", { bold: true }),
          createText(" và chọn OK."),
        ]),
        createBulletParagraph([
          createText("Mở ứng dụng AndroSentry, tại góc trên cùng bên trái, nhấp chọn nút "),
          createText("Làm mới thiết bị (Refresh Devices)", { bold: true }),
          createText(". Tên thiết bị của bạn sẽ xuất hiện kèm theo trạng thái "),
          createText("device", { bold: true, color: "008000" }),
          createText("."),
        ]),

        createHeading2("Bước 3: Thực hiện quy trình Pentest ứng dụng APK"),
        createBulletParagraph([
          createText("Dịch ngược mã nguồn ứng dụng (Decompilation): ", { bold: true }),
          createText("Truy cập tab Quy trình Apktool (Apktool), chọn tệp APK hoặc kéo thả trực tiếp tệp cài đặt để thực hiện giải nén mã nguồn Smali và tài nguyên. Quá trình decompile sẽ được xếp vào Hàng đợi Tác vụ (Task Queue) để thực thi bất đồng bộ tránh nghẽn luồng."),
        ]),
        createBulletParagraph([
          createText("Đánh giá cấu hình tự động (Manifest AI Audit): ", { bold: true }),
          createText("Sau khi quá trình dịch ngược hoàn tất, chuyển sang tab Kiểm thử tệp AndroidManifest (Manifest). Hệ thống sẽ tự động tìm kiếm tệp AndroidManifest.xml trong thư mục workspace tương ứng. Hãy nhấp nút Gửi phân tích AI (Send to AI Audit) để mô hình trí tuệ nhân tạo Gemini tự động quét và phân tích các sơ hở trong tệp tin cấu hình."),
        ]),
        createBulletParagraph([
          createText("Duyệt mã nguồn chi tiết (JADX Static Analysis): ", { bold: true }),
          createText("Vào tab Quản lý thiết bị (ADB), tìm kiếm ứng dụng trên thiết bị mục tiêu, nhấp chọn nút trích xuất (Backup APK) để lấy file cài đặt về máy chủ. Tiếp theo, nhấp nút Mở bằng JADX-GUI (Open in JADX) để mở nhanh giao diện dịch ngược Java của file APK đó, giúp kiểm thử tĩnh tìm kiếm lỗ hổng logic hoặc thông tin nhạy cảm."),
        ]),
        createBulletParagraph([
          createText("Phân tích động và can thiệp Runtime (Frida Instrumentation): ", { bold: true }),
          createText("Di chuyển đến tab Phân tích Frida (Frida), nhấp nút Khởi chạy Frida Server (Start Frida Server). Chọn ứng dụng mục tiêu cần phân tích và bấm Bypass SSL Pinning để tiêm tập lệnh cấu hình bypass ghim chứng chỉ. Sau đó cấu hình Burp Suite làm proxy để chụp bắt dữ liệu HTTPS. Đồng thời, theo dõi log hệ thống thời gian thực tại khung giám sát Logcat ở bên dưới."),
        ]),
        createBulletParagraph([
          createText("Tương tác với Trợ lý bảo mật chuyên sâu (AI Chat Assistant): ", { bold: true }),
          createText("Trong suốt quá trình kiểm thử, nếu gặp phải bất kỳ đoạn mã Smali/Java khó hiểu hoặc cần tạo tập lệnh Frida/ADB tùy biến, hãy chuyển sang tab Trợ lý AI (AI Chat) để gửi yêu cầu hỗ trợ. AI sẽ đồng hành giải thích và sinh mã tối ưu theo thời gian thực."),
        ]),

        // PHẦN IV: CƠ CHẾ BẢO MẬT HỆ THỐNG (WHITELIST)
        createHeading1("PHẦN IV: CƠ CHẾ BẢO MẬT HỆ THỐNG (WHITELIST)"),
        
        createBodyParagraph([
          createText("Do ứng dụng thực thi các câu lệnh hệ thống trực tiếp trên máy chủ backend, để ngăn ngừa triệt để nguy cơ tin tặc lạm dụng giao diện web hoặc API để tiêm mã độc (Command Injection), máy chủ backend đã được trang bị cơ chế bảo mật nghiêm ngặt 6 lớp:"),
        ]),
        createBulletParagraph([
          createText("Danh sách công cụ được phép (Allowed Binary Whitelist): ", { bold: true }),
          createText("Chỉ cho phép chạy các tiến trình cụ thể bao gồm: adb, apktool, apksigner, keytool, zipalign, frida, frida-ps, jadx, jadx-gui, echo, ls, và grep."),
        ]),
        createBulletParagraph([
          createText("Ngăn chặn phân mảnh lệnh (Delimiter Split Validation): ", { bold: true }),
          createText("Ứng dụng tự động bóc tách các câu lệnh nối nhau thông qua các toán tử (&&, ||, ;, |). Mỗi phân đoạn nhỏ đều phải trải qua quá trình xác thực và kiểm tra whitelist nhị phân."),
        ]),
        createBulletParagraph([
          createText("Cấm chuyển hướng dữ liệu (Redirection Blocking): ", { bold: true }),
          createText("Hệ thống từ chối tất cả các câu lệnh chứa ký tự chuyển hướng ghi/đọc file như '>' hoặc '<' nhằm bảo vệ tính toàn vẹn của tệp tin hệ thống máy chủ."),
        ]),
        createBulletParagraph([
          createText("Bộ lọc từ khóa nguy hiểm (Destructive Command Blocklist): ", { bold: true }),
          createText("Các từ khóa phá hoại như rm -rf, wget, curl, netcat, nc, python, perl, gcc, clang, hoặc các đường dẫn nhạy cảm như /etc/passwd đều bị chặn đứng hoàn toàn và trả về lỗi 403 Forbidden."),
        ]),
        createBulletParagraph([
          createText("Giới hạn thực thi Localhost (Localhost Execution Guard): ", { bold: true }),
          createText("Hệ thống tự động kiểm tra nguồn gốc IP của yêu cầu. Các câu lệnh chỉ được phép thực thi trực tiếp khi xuất phát từ chính máy chủ cục bộ (localhost / 127.0.0.1), ngăn chặn tuyệt đối các nỗ lực xâm nhập và điều khiển trái phép từ môi trường Internet công cộng."),
        ]),
        createBulletParagraph([
          createText("Phòng ngừa xung đột tiến trình & Cách ly Workspace (Task Isolation): ", { bold: true }),
          createText("Các tác vụ nặng và tốn thời gian như dịch ngược (apktool d) và trích xuất mã nguồn Java (jadx) sẽ được xếp vào hàng đợi bất đồng bộ và thực hiện hoàn toàn trong các thư mục tạm thời độc lập dạng workspaces/task-id. Cơ chế này loại bỏ nguy cơ ghi đè dữ liệu chéo giữa các phiên pentest và chống lại các kỹ thuật tấn công Symbolic Link."),
        ]),

        // PHẦN V: TUYÊN BỐ MIỄN TRỪ TRÁCH NHIỆM PHÁP LÝ
        createHeading1("PHẦN V: TUYÊN BỐ MIỄN TRỪ TRÁCH NHIỆM PHÁP LÝ"),
        
        createBodyParagraph([
          createText("Vui lòng đọc kỹ tuyên bố này trước khi sử dụng bất kỳ tính năng nào của bộ công cụ:"),
        ]),
        createBulletParagraph([
          createText("Phần mềm này được thiết kế và cung cấp hoàn toàn cho mục đích giáo dục, học thuật, nghiên cứu an toàn thông tin và thử nghiệm xâm nhập (penetration testing) hợp pháp.", { color: COLOR_DANGER, bold: true }),
        ]),
        createBulletParagraph([
          createText("Người dùng tuyệt đối không được sử dụng công cụ này trên bất kỳ thiết bị, ứng dụng hoặc mạng lưới nào mà không có sự đồng ý bằng văn bản rõ ràng của chủ sở hữu hợp pháp.", { color: COLOR_DANGER, bold: true }),
        ]),
        createBulletParagraph([
          createText("Tác giả và những người đóng góp cho dự án này không chịu bất kỳ trách nhiệm nào đối với bất kỳ thiệt hại trực tiếp, gián tiếp, vô tình hoặc cố ý nào phát sinh từ việc sử dụng sai mục đích hoặc sử dụng trái phép phần mềm này.", { color: COLOR_DANGER, bold: true }),
        ]),
        createBulletParagraph([
          createText("Bạn hoàn toàn chịu trách nhiệm về hành vi của mình và phải đảm bảo rằng việc sử dụng công cụ này tuân thủ tất cả các luật pháp hiện hành tại quốc gia hoặc khu vực của bạn.", { color: COLOR_DANGER, bold: true }),
        ]),
        
        createBodyParagraph([
          createText("\n© 2026 AndroSentry Project. All Rights Reserved.", { size: 18, color: COLOR_MUTED, italics: true }),
        ], { before: 240, after: 120 }),
      ]
    }
  ]
});

// Biên dịch tài liệu thành tệp tin .docx
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("Huong_Dan_Su_Dung_AndroSentry.docx", buffer);
  console.log("[SUCCESS] Đã tạo thành công tệp tin tài liệu: Huong_Dan_Su_Dung_AndroSentry.docx");
}).catch((err) => {
  console.error("[ERROR] Lỗi khi tạo file docx:", err);
});
