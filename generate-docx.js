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
  creator: "Dự án Kali Android Pentest GUI",
  title: "Tài liệu giới thiệu, mô tả và hướng dẫn sử dụng",
  description: "Tài liệu chi tiết về công cụ hỗ trợ kiểm thử xâm nhập thiết bị Android chạy trên Windows và Kali Linux.",
  sections: [
    {
      properties: {},
      children: [
        // TRANG BÌA & TIÊU ĐỀ
        createTitle("BỘ CÔNG CỤ KALI ANDROID PENTEST GUI"),
        createSubtitle("Tài liệu Giới thiệu, Mô tả và Hướng dẫn sử dụng chi tiết"),
        
        createBodyParagraph([
          createText("Được phát triển bởi: ", { bold: true }),
          createText("Nhóm Nghiên cứu An toàn thông tin Android\n"),
          createText("Phiên bản phần mềm: ", { bold: true }),
          createText("v1.0.0\n"),
          createText("Hệ điều hành hỗ trợ: ", { bold: true }),
          createText("Windows 10/11, Kali Linux, Ubuntu"),
        ], { before: 240, after: 480 }),

        // PHẦN I: GIỚI THIỆU TỔNG QUAN
        createHeading1("PHẦN I: GIỚI THIỆU TỔNG QUAN"),
        
        createBodyParagraph([
          createText("Trong kỷ nguyên công nghệ di động phát triển mạnh mẽ, hệ điều hành Android đã trở thành mục tiêu hàng đầu của các cuộc tấn công mạng. Việc đánh giá và kiểm thử an ninh (penetration testing) đối với các thiết bị và ứng dụng Android đóng vai trò tối quan trọng để bảo vệ dữ liệu người dùng và hệ thống doanh nghiệp."),
        ]),

        createBodyParagraph([
          createText("Tuy nhiên, việc sử dụng các công cụ dòng lệnh truyền thống như "),
          createText("adb", { bold: true, italics: true }),
          createText(", "),
          createText("apktool", { bold: true, italics: true }),
          createText(", "),
          createText("apksigner", { bold: true, italics: true }),
          createText(", "),
          createText("jadx-gui", { bold: true, italics: true }),
          createText(", hay "),
          createText("frida", { bold: true, italics: true }),
          createText(" đòi hỏi người dùng phải ghi nhớ hàng trăm cú pháp lệnh phức tạp, dễ xảy ra lỗi gõ phím và tốn nhiều thời gian cấu hình."),
        ]),

        createBodyParagraph([
          createText("Kali Android Pentest GUI ", { bold: true, color: COLOR_PRIMARY }),
          createText("ra đời như một giải pháp đột phá, mang đến một giao diện đồ họa trực quan (GUI) hiện đại, tinh gọn và an toàn. Công cụ giúp tự động hóa toàn bộ quy trình kiểm thử xâm nhập thiết bị Android, rút ngắn thời gian thao tác từ hàng giờ xuống chỉ còn vài cú click chuột, cực kỳ phù hợp cho cả học viên mới bắt đầu lẫn các chuyên gia pentest chuyên nghiệp."),
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

        createHeading2("3. Kiểm thử và Khai thác (Exploitation & Backdoor Generator)"),
        createBodyParagraph([
          createText("Tích hợp các công cụ pentest hàng đầu để thực hiện các bài kiểm tra chuyên sâu:"),
        ]),
        createBulletParagraph([
          createText("Sinh mã độc APK (MSFVenom): ", { bold: true }),
          createText("Giao diện trực quan để sinh tệp tin APK chứa backdoor (Payload: android/meterpreter/reverse_tcp) phục vụ kiểm thử xâm nhập hợp pháp. Người dùng chỉ cần nhập IP (LHOST) và Port (LPORT)."),
        ]),
        createBulletParagraph([
          createText("Dịch ngược và Đóng gói (Apktool): ", { bold: true }),
          createText("Tự động giải nén tài nguyên ứng dụng thành mã nguồn Smali, chỉnh sửa và đóng gói lại một cách tự động."),
        ]),
        createBulletParagraph([
          createText("Ký ứng dụng (Signing Tools): ", { bold: true }),
          createText("Tích hợp quy trình căn chỉnh tối ưu hóa dung lượng (Zipalign) và ký số bảo mật bằng apksigner giúp APK đã sửa đổi có thể cài đặt trực tiếp lên thiết bị Android đích."),
        ]),
        createBulletParagraph([
          createText("Phân tích mã nguồn (JADX-GUI): ", { bold: true }),
          createText("Hỗ trợ mở nhanh trình dịch ngược mã nguồn Java của APK chỉ với một click chuột."),
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
          createText("Mở ứng dụng Kali Android Pentest GUI, tại góc trên cùng bên trái, nhấp chọn nút "),
          createText("Làm mới thiết bị (Refresh Devices)", { bold: true }),
          createText(". Tên thiết bị của bạn sẽ xuất hiện kèm theo trạng thái "),
          createText("device", { bold: true, color: "008000" }),
          createText("."),
        ]),

        createHeading2("Bước 3: Thực hiện quy trình Pentest ứng dụng APK"),
        createBulletParagraph([
          createText("Phân tích tĩnh (Static Analysis): ", { bold: true }),
          createText("Vào tab App Manager, tìm kiếm ứng dụng cần phân tích, nhấp chọn nút trích xuất (Backup APK) để lấy file về máy tính. Tiếp theo, chọn file APK này và bấm "),
          createText("Mở bằng JADX-GUI (Open in JADX)", { bold: true }),
          createText(" để duyệt mã nguồn Java và tìm kiếm các lỗ hổng bảo mật tĩnh (như API key bị lộ, thuật toán mã hóa yếu)."),
        ]),
        createBulletParagraph([
          createText("Phân tích động (Dynamic Analysis): ", { bold: true }),
          createText("Vào tab Frida, nhấp nút "),
          createText("Khởi chạy Frida Server (Start Frida Server)", { bold: true }),
          createText(". Chọn ứng dụng mục tiêu và bấm "),
          createText("Bypass SSL Pinning", { bold: true }),
          createText(". Cấu hình Burp Suite trên máy tính làm Proxy để bắt và chỉnh sửa toàn bộ các gói tin truyền tải qua mạng."),
        ]),

        // PHẦN IV: CƠ CHẾ BẢO MẬT HỆ THỐNG (WHITELIST)
        createHeading1("PHẦN IV: CƠ CHẾ BẢO MẬT HỆ THỐNG (WHITELIST)"),
        
        createBodyParagraph([
          createText("Do ứng dụng thực thi các câu lệnh hệ thống trực tiếp trên máy chủ backend, để ngăn ngừa triệt để nguy cơ tin tặc lạm dụng giao diện web hoặc API để tiêm mã độc (Command Injection), máy chủ backend đã được trang bị cơ chế bảo mật nghiêm ngặt 4 lớp:"),
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
          createText("\n© 2026 Kali Android Pentest GUI Project. All Rights Reserved.", { size: 18, color: COLOR_MUTED, italics: true }),
        ], { before: 240, after: 120 }),
      ]
    }
  ]
});

// Biên dịch tài liệu thành tệp tin .docx
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("Huong_Dan_Su_Dung_Kali_Android_Pentest_GUI.docx", buffer);
  console.log("[SUCCESS] Đã tạo thành công tệp tin tài liệu: Huong_Dan_Su_Dung_Kali_Android_Pentest_GUI.docx");
}).catch((err) => {
  console.error("[ERROR] Lỗi khi tạo file docx:", err);
});
