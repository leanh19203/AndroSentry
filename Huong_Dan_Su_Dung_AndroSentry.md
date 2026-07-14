# BỘ CÔNG CỤ ANDROSENTRY
## Tài liệu Giới thiệu, Mô tả và Hướng dẫn sử dụng chi tiết

- **Được phát triển bởi:** Lê Đức Anh
- **Phiên bản phần mềm:** v1.2.1
- **Hệ điều hành hỗ trợ:** Linux (Kali Linux, Ubuntu), macOS (hoặc Windows thông qua WSL/Docker)
- **Github:** https://github.com/leanh19203/AndroSentry

---

## PHẦN I: GIỚI THIỆU TỔNG QUAN

Trong bối cảnh chuyển đổi số diễn ra mạnh mẽ, các thiết bị và ứng dụng Android ngày càng được sử dụng rộng rãi trong nhiều lĩnh vực như tài chính, ngân hàng, thương mại điện tử và dịch vụ công. Cùng với sự phát triển đó, Android cũng trở thành một trong những nền tảng thường xuyên đối mặt với các nguy cơ tấn công an ninh mạng. Vì vậy, kiểm thử xâm nhập (Penetration Testing) và đánh giá an toàn bảo mật đối với ứng dụng Android đóng vai trò quan trọng trong việc phát hiện sớm các lỗ hổng, từ đó giảm thiểu rủi ro đối với dữ liệu và hệ thống.

Hiện nay, quy trình kiểm thử Android thường dựa trên nhiều công cụ chuyên biệt như Android Debug Bridge (ADB), Apktool, JADX, Apksigner và Frida. Mỗi công cụ đảm nhiệm một chức năng riêng biệt và chủ yếu được sử dụng thông qua giao diện dòng lệnh (Command Line Interface - CLI). Điều này đòi hỏi người sử dụng phải nắm vững cú pháp lệnh, quản lý nhiều công cụ khác nhau và thực hiện nhiều bước thủ công trong quá trình kiểm thử, gây khó khăn cho việc chuẩn hóa quy trình cũng như nâng cao hiệu quả làm việc.

Xuất phát từ thực tế đó, AndroSentry được phát triển nhằm xây dựng một nền tảng hỗ trợ kiểm thử xâm nhập Android với giao diện đồ họa (Graphical User Interface - GUI) trực quan, tích hợp nhiều công cụ phổ biến trong cùng một môi trường làm việc. Hệ thống hỗ trợ các chức năng như quản lý thiết bị Android thông qua ADB, dịch ngược và phân tích ứng dụng bằng Apktool và JADX, ký số APK, hỗ trợ phân tích động với Frida, đồng thời tích hợp mô hình ngôn ngữ lớn Gemini AI để hỗ trợ phân tích cấu hình ứng dụng và cung cấp các nhận định phục vụ quá trình đánh giá bảo mật.

Mục tiêu của AndroSentry không phải thay thế các công cụ hiện có mà là cung cấp một quy trình làm việc thống nhất, giúp giảm bớt thao tác thủ công, đơn giản hóa việc phối hợp giữa các công cụ và hỗ trợ quá trình kiểm thử Android một cách hiệu quả, thuận tiện và nhất quán hơn.

---

## PHẦN II: MÔ TẢ CÁC TÍNH NĂNG CỐT LÕI

### 1. Trình Quản lý Thiết bị (ADB Device Manager)
Hỗ trợ giám sát và tương tác trực tiếp với thiết bị Android đang kết nối qua cáp USB hoặc mạng WiFi nội bộ:
*   **Quét tìm thiết bị:** Tự động dò tìm các thiết bị đang bật chế độ gỡ lỗi USB (`Developer Options -> USB Debugging`).
*   **Thông tin hệ thống:** Hiển thị chi tiết cấu hình phần cứng, phiên bản hệ điều hành Android, mức pin, nhiệt độ, cấu trúc CPU (`arm64`, `x86`) và địa chỉ IP.
*   **Trình quản lý tệp tin (File Explorer):** Duyệt cây thư mục của thiết bị Android, cho phép tải tệp tin lên (`Push`), tải tệp tin về máy tính (`Pull`) một cách mượt mà.

### 2. Quản lý Ứng dụng (App Manager)
Hỗ trợ quản lý toàn diện các ứng dụng đã cài đặt trên thiết bị:
*   **Phân loại ứng dụng:** Liệt kê riêng biệt ứng dụng do người dùng cài đặt (`User Apps`) và ứng dụng mặc định của hệ thống (`System Apps`).
*   **Trích xuất và Sao lưu:** Xuất ngược gói cài đặt ứng dụng thành tệp APK (`.apk`) về máy tính để phân tích và dịch ngược.
*   **Gỡ cài đặt & Cài đặt nhanh:** Gỡ bỏ ứng dụng bất kỳ hoặc cài đặt tệp APK mới trực tiếp thông qua thao tác kéo thả hoặc chọn tệp.

### 3. Kiểm thử và Đóng gói ứng dụng (Application Decompilation & Signer)
Tích hợp các công cụ dịch ngược và đóng gói hàng đầu:
*   **Dịch ngược và Đóng gói (Apktool):** Tự động giải nén tài nguyên ứng dụng thành mã nguồn Smali, chỉnh sửa cấu trúc tệp tin và đóng gói lại một cách tự động thông qua hàng đợi tác vụ bất đồng bộ.
*   **Ký ứng dụng (Signing Tools):** Tích hợp quy trình căn chỉnh tối ưu hóa dung lượng (`Zipalign`) và ký số bảo mật bằng `apksigner` với keystore tự sinh, giúp APK đã sửa đổi có thể cài đặt trực tiếp lên thiết bị Android mục tiêu.
*   **Phân tích mã nguồn (JADX-GUI):** Hỗ trợ mở nhanh trình dịch ngược mã nguồn Java của APK chỉ với một click chuột từ giao diện để kiểm thử tĩnh (Static Analysis).

### 4. Phân tích Động & Frida Instrumentation
Cho phép can thiệp vào luồng thực thi của ứng dụng khi đang chạy (Runtime Instrumentation):
*   **Bypass SSL Pinning:** Tự động đẩy Frida Server lên thiết bị Android, khởi chạy server và tiêm (`inject`) script bypass cơ chế ghim chứng chỉ bảo mật (SSL Pinning), giúp phân tích các gói tin HTTPS qua Burp Suite.
*   **Giám sát Logcat thời gian thực:** Bộ lọc thông minh giúp theo dõi luồng thông báo hệ thống và log lỗi của thiết bị Android trực tiếp trên giao diện console.

### 5. Kiểm thử Tĩnh và Đánh giá Cấu hình (AI AndroidManifest Auditor)
Phát hiện sớm các lỗ hổng bảo mật cấu hình trước khi ứng dụng được biên dịch hoặc phân phối:
*   **Phân tích tệp AndroidManifest.xml:** Tự động đọc và hiển thị cấu trúc tệp tin cấu hình hệ thống của ứng dụng đã được dịch ngược từ tab Quy trình Apktool.
*   **Đánh giá bảo mật tự động:** Sử dụng mô hình trí tuệ nhân tạo (Gemini AI) tích hợp để quét và phát hiện các rủi ro bảo mật nghiêm trọng trong cấu hình, bao gồm các thành phần (`Activity`, `Service`, `Receiver`, `Provider`) bị lộ ra ngoài không có kiểm soát truy cập (`exported="true"`), quyền truy cập quá mức cần thiết, bật chế độ gỡ lỗi (`android:debuggable="true"`), hay cho phép sao lưu không an toàn (`android:allowBackup="true"`).

### 6. Trợ lý Bảo mật AI (AI Chat Assistant)
Hệ thống AI chuyên biệt hỗ trợ Pentester phân tích, tư vấn và giải quyết các bài toán bảo mật thực tế:
*   **Giải đáp và Tư vấn chuyên nghiệp:** Hỗ trợ giải thích chi tiết các lỗ hổng bảo mật, đưa ra khuyến nghị khắc phục chuẩn hóa theo tiêu chuẩn an toàn OWASP Mobile Top 10.
*   **Tự động sinh mã nguồn hỗ trợ:** Tự động soạn thảo các đoạn mã script Frida tùy biến, câu lệnh ADB nâng cao hoặc mã khai thác thử nghiệm (PoC) dựa theo ngữ cảnh phân tích được cung cấp.
*   **Hội thoại ngữ cảnh cao:** Trải nghiệm chatbot mượt mà, bảo mật, lưu trữ lịch sử phiên làm việc cục bộ và cá nhân hóa tư vấn dựa trên cấu hình thiết bị hiện tại.

---

## PHẦN III: HƯỚNG DẪN SỬ DỤNG CHI TIẾT

### Bước 1: Chuẩn bị thiết bị Android
1.  Trên điện thoại/máy ảo Android, truy cập **Cài đặt (Settings) -> Thông tin điện thoại (About Phone)**.
2.  Nhấp liên tục 7 lần vào mục **Số phiên bản (Build Number)** cho đến khi xuất hiện thông báo bạn đã là nhà phát triển.
3.  Quay lại Cài đặt, vào mục **Tùy chọn nhà phát triển (Developer Options)**, kích hoạt hai tính năng **Gỡ lỗi USB (USB Debugging)** và **Gỡ lỗi không dây (Wireless Debugging)** (nếu muốn kết nối không dây).

### Bước 2: Kết nối thiết bị với ứng dụng
1.  Kết nối điện thoại với máy tính bằng cáp USB chất lượng tốt. Khi điện thoại hiển thị hộp thoại yêu cầu xác nhận vân tay khóa RSA gỡ lỗi, hãy nhấp chọn **Luôn cho phép từ máy tính này (Always allow from this computer)** và chọn OK.
2.  Mở ứng dụng AndroSentry, tại góc trên cùng bên trái, nhấp chọn nút **Làm mới thiết bị (Refresh Devices)**. Tên thiết bị của bạn sẽ xuất hiện kèm theo trạng thái `device`.

### Bước 3: Thực hiện quy trình Pentest ứng dụng APK
1.  **Dịch ngược mã nguồn ứng dụng (Decompilation):** Truy cập tab **Quy trình Apktool (Apktool)**, chọn tệp APK hoặc kéo thả trực tiếp tệp cài đặt để thực hiện giải nén mã nguồn Smali và tài nguyên. Quá trình decompile sẽ được xếp vào **Hàng đợi Tác vụ (Task Queue)** để thực thi bất đồng bộ tránh nghẽn luồng.
2.  **Đánh giá cấu hình tự động (Manifest AI Audit):** Sau khi quá trình dịch ngược hoàn tất, chuyển sang tab **Kiểm thử tệp AndroidManifest (Manifest)**. Hệ thống sẽ tự động tìm kiếm tệp `AndroidManifest.xml` trong thư mục workspace tương ứng. Hãy nhấp nút **Gửi phân tích AI (Send to AI Audit)** để mô hình trí tuệ nhân tạo Gemini tự động quét và phân tích các sơ hở trong tệp tin cấu hình.
3.  **Duyệt mã nguồn chi tiết (JADX Static Analysis):** Vào tab **Quản lý thiết bị (ADB)**, tìm kiếm ứng dụng trên thiết bị mục tiêu, nhấp chọn nút trích xuất (`Backup APK`) để lấy file cài đặt về máy chủ. Tiếp theo, nhấp nút **Mở bằng JADX-GUI (Open in JADX)** để mở nhanh giao diện dịch ngược Java của file APK đó, giúp kiểm thử tĩnh tìm kiếm lỗ hổng logic hoặc thông tin nhạy cảm.
4.  **Phân tích động và can thiệp Runtime (Frida Instrumentation):** Di chuyển đến tab **Phân tích Frida (Frida)**, nhấp nút **Khởi chạy Frida Server (Start Frida Server)**. Chọn ứng dụng mục tiêu cần phân tích và bấm **Bypass SSL Pinning** để tiêm tập lệnh cấu hình bypass ghim chứng chỉ. Sau đó cấu hình Burp Suite làm proxy để chụp bắt dữ liệu HTTPS. Đồng thời, theo dõi log hệ thống thời gian thực tại khung giám sát Logcat ở bên dưới.
5.  **Tương tác với Trợ lý bảo mật chuyên sâu (AI Chat Assistant):** Trong suốt quá trình kiểm thử, nếu gặp phải bất kỳ đoạn mã Smali/Java khó hiểu hoặc cần tạo tập lệnh Frida/ADB tùy biến, hãy chuyển sang tab **Trợ lý AI (AI Chat)** để gửi yêu cầu hỗ trợ. AI sẽ đồng hành giải thích và sinh mã tối ưu theo thời gian thực.

---

## PHẦN IV: CƠ CHẾ BẢO MẬT HỆ THỐNG (WHITELIST)

Do ứng dụng thực thi các câu lệnh hệ thống trực tiếp trên máy chủ backend, để ngăn ngừa triệt để nguy cơ tin tặc lạm dụng giao diện web hoặc API để tiêm mã độc (Command Injection), máy chủ backend đã được trang bị cơ chế bảo mật nghiêm ngặt 6 lớp:

1.  **Danh sách công cụ được phép (Allowed Binary Whitelist):** Chỉ cho phép chạy các tiến trình cụ thể bao gồm: `adb`, `apktool`, `apksigner`, `keytool`, `zipalign`, `frida`, `frida-ps`, `jadx`, `jadx-gui`, `echo`, `ls`, và `grep`.
2.  **Ngăn chặn phân mảnh lệnh (Delimiter Split Validation):** Ứng dụng tự động bóc tách các câu lệnh nối nhau thông qua các toán tử (`&&`, `||`, `;`, `|`). Mỗi phân đoạn nhỏ đều phải trải qua quá trình xác thực và kiểm tra whitelist nhị phân.
3.  **Cấm chuyển hướng dữ liệu (Redirection Blocking):** Hệ thống từ chối tất cả các câu lệnh chứa ký tự chuyển hướng ghi/đọc file như `>` hoặc `<` nhằm bảo vệ tính toàn vẹn của tệp tin hệ thống máy chủ.
4.  **Bộ lọc từ khóa nguy hiểm (Destructive Command Blocklist):** Các từ khóa phá hoại như `rm -rf`, `wget`, `curl`, `netcat`, `nc`, `python`, `perl`, `gcc`, `clang`, hoặc các đường dẫn nhạy cảm như `/etc/passwd` đều bị chặn đứng hoàn toàn và trả về lỗi 403 Forbidden.
5.  **Giới hạn thực thi Localhost (Localhost Execution Guard):** Hệ thống tự động kiểm tra nguồn gốc IP của yêu cầu. Các câu lệnh chỉ được phép thực thi trực tiếp khi xuất phát từ chính máy chủ cục bộ (`localhost` / `127.0.0.1`), ngăn chặn tuyệt đối các nỗ lực xâm nhập và điều khiển trái phép từ môi trường Internet công cộng.
6.  **Phòng ngừa xung đột tiến trình & Cách ly Workspace (Task Isolation):** Các tác vụ nặng và tốn thời gian như dịch ngược (`apktool d`) và trích xuất mã nguồn Java (`jadx`) sẽ được xếp vào hàng đợi bất đồng bộ và thực hiện hoàn toàn trong các thư mục tạm thời độc lập dạng `workspaces/task-id`. Cơ chế này loại bỏ nguy cơ ghi đè dữ liệu chéo giữa các phiên pentest và chống lại các kỹ thuật tấn công Symbolic Link.

---

## PHẦN V: TUYÊN BỐ MIỄN TRỪ TRÁCH NHIỆM PHÁP LÝ

*   **Phần mềm này được thiết kế và cung cấp hoàn toàn cho mục đích giáo dục, học thuật, nghiên cứu an toàn thông tin và thử nghiệm xâm nhập (penetration testing) hợp pháp.**
*   **Người dùng tuyệt đối không được sử dụng công cụ này trên bất kỳ thiết bị, ứng dụng hoặc mạng lưới nào mà không có sự đồng ý bằng văn bản rõ ràng của chủ sở hữu hợp pháp.**
*   **Tác giả và những người đóng góp cho dự án này không chịu bất kỳ trách nhiệm nào đối với bất kỳ thiệt hại trực tiếp, gián tiếp, vô tình hoặc cố ý nào phát sinh từ việc sử dụng sai mục đích hoặc sử dụng trái phép phần mềm này.**
*   **Bạn hoàn toàn chịu trách nhiệm về hành vi của mình và phải đảm bảo rằng việc sử dụng công cụ này tuân thủ tất cả các luật pháp hiện hành tại quốc gia hoặc khu vực của bạn.**

---
*© 2026 AndroSentry Project. All Rights Reserved.*
