# BỘ CÔNG CỤ ANDROSENTRY
## Tài liệu Giới thiệu, Mô tả và Hướng dẫn sử dụng chi tiết

- **Được phát triển bởi:** Nhóm Nghiên cứu An toàn thông tin Android
- **Phiên bản phần mềm:** v1.2.1
- **Hệ điều hành hỗ trợ:** Windows 10/11, Kali Linux, Ubuntu

---

## PHẦN I: GIỚI THIỆU TỔNG QUAN

Trong kỷ nguyên công nghệ di động phát triển mạnh mẽ, hệ điều hành Android đã trở thành mục tiêu hàng đầu của các cuộc tấn công mạng. Việc đánh giá và kiểm thử an ninh (penetration testing) đối với các thiết bị và ứng dụng Android đóng vai trò tối quan trọng để bảo vệ dữ liệu người dùng và hệ thống doanh nghiệp.

Tuy nhiên, việc sử dụng các công cụ dòng lệnh truyền thống như `adb`, `apktool`, `apksigner`, `jadx-gui`, hay `frida` đòi hỏi người dùng phải ghi nhớ hàng trăm cú pháp lệnh phức tạp, dễ xảy ra lỗi gõ phím và tốn nhiều thời gian cấu hình.

**AndroSentry** ra đời như một giải pháp đột phá, mang đến một giao diện đồ họa trực quan (GUI) hiện đại, tinh gọn và an toàn. Công cụ giúp tự động hóa toàn bộ quy trình kiểm thử xâm nhập thiết bị Android, rút ngắn thời gian thao tác từ hàng giờ xuống chỉ còn vài cú click chuột, cực kỳ phù hợp cho cả học viên mới bắt đầu lẫn các chuyên gia pentest chuyên nghiệp.

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

### 3. Kiểm thử và Khai thác (Exploitation & Backdoor Generator)
Tích hợp các công cụ pentest hàng đầu để thực hiện các bài kiểm tra chuyên sâu:
*   **Sinh mã độc APK (MSFVenom):** Giao diện trực quan để sinh tệp tin APK chứa backdoor (Payload: `android/meterpreter/reverse_tcp`) phục vụ kiểm thử xâm nhập hợp pháp. Người dùng chỉ cần nhập IP (`LHOST`) và Port (`LPORT`).
*   **Dịch ngược và Đóng gói (Apktool):** Tự động giải nén tài nguyên ứng dụng thành mã nguồn Smali, chỉnh sửa và đóng gói lại một cách tự động.
*   **Ký ứng dụng (Signing Tools):** Tích hợp quy trình căn chỉnh tối ưu hóa dung lượng (`Zipalign`) và ký số bảo mật bằng `apksigner` giúp APK đã sửa đổi có thể cài đặt trực tiếp lên thiết bị Android đích.
*   **Phân tích mã nguồn (JADX-GUI):** Hỗ trợ mở nhanh trình dịch ngược mã nguồn Java của APK chỉ với một click chuột.

### 4. Phân tích Động & Frida Instrumentation
Cho phép can thiệp vào luồng thực thi của ứng dụng khi đang chạy (Runtime Instrumentation):
*   **Bypass SSL Pinning:** Tự động đẩy Frida Server lên thiết bị Android, khởi chạy server và tiêm (`inject`) script bypass cơ chế ghim chứng chỉ bảo mật (SSL Pinning), giúp phân tích các gói tin HTTPS qua Burp Suite.
*   **Giám sát Logcat thời gian thực:** Bộ lọc thông minh giúp theo dõi luồng thông báo hệ thống và log lỗi của thiết bị Android trực tiếp trên giao diện console.

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
1.  **Phân tích tĩnh (Static Analysis):** Vào tab App Manager, tìm kiếm ứng dụng cần phân tích, nhấp chọn nút trích xuất (Backup APK) để lấy file về máy tính. Tiếp theo, chọn file APK này và bấm **Mở bằng JADX-GUI (Open in JADX)** để duyệt mã nguồn Java và tìm kiếm các lỗ hổng bảo mật tĩnh (như API key bị lộ, thuật toán mã hóa yếu).
2.  **Phân tích động (Dynamic Analysis):** Vào tab Frida, nhấp nút **Khởi chạy Frida Server (Start Frida Server)**. Chọn ứng dụng mục tiêu và bấm **Bypass SSL Pinning**. Cấu hình Burp Suite trên máy tính làm Proxy để bắt và chỉnh sửa toàn bộ các gói tin truyền tải qua mạng.

---

## PHẦN IV: CƠ CHẾ BẢO MẬT HỆ THỐNG (WHITELIST)

Do ứng dụng thực thi các câu lệnh hệ thống trực tiếp trên máy chủ backend, để ngăn ngừa triệt để nguy cơ tin tặc lạm dụng giao diện web hoặc API để tiêm mã độc (Command Injection), máy chủ backend đã được trang bị cơ chế bảo mật nghiêm ngặt 4 lớp:

1.  **Danh sách công cụ được phép (Allowed Binary Whitelist):** Chỉ cho phép chạy các tiến trình cụ thể bao gồm: `adb`, `apktool`, `apksigner`, `keytool`, `zipalign`, `frida`, `frida-ps`, `jadx`, `jadx-gui`, `echo`, `ls`, và `grep`.
2.  **Ngăn chặn phân mảnh lệnh (Delimiter Split Validation):** Ứng dụng tự động bóc tách các câu lệnh nối nhau thông qua các toán tử (`&&`, `||`, `;`, `|`). Mỗi phân đoạn nhỏ đều phải trải qua quá trình xác thực và kiểm tra whitelist nhị phân.
3.  **Cấm chuyển hướng dữ liệu (Redirection Blocking):** Hệ thống từ chối tất cả các câu lệnh chứa ký tự chuyển hướng ghi/đọc file như `>` hoặc `<` nhằm bảo vệ tính toàn vẹn của tệp tin hệ thống máy chủ.
4.  **Bộ lọc từ khóa nguy hiểm (Destructive Command Blocklist):** Các từ khóa phá hoại như `rm -rf`, `wget`, `curl`, `netcat`, `nc`, `python`, `perl`, `gcc`, `clang`, hoặc các đường dẫn nhạy cảm như `/etc/passwd` đều bị chặn đứng hoàn toàn và trả về lỗi 403 Forbidden.

---

## PHẦN V: TUYÊN BỐ MIỄN TRỪ TRÁCH NHIỆM PHÁP LÝ

*   **Phần mềm này được thiết kế và cung cấp hoàn toàn cho mục đích giáo dục, học thuật, nghiên cứu an toàn thông tin và thử nghiệm xâm nhập (penetration testing) hợp pháp.**
*   **Người dùng tuyệt đối không được sử dụng công cụ này trên bất kỳ thiết bị, ứng dụng hoặc mạng lưới nào mà không có sự đồng ý bằng văn bản rõ ràng của chủ sở hữu hợp pháp.**
*   **Tác giả và những người đóng góp cho dự án này không chịu bất kỳ trách nhiệm nào đối với bất kỳ thiệt hại trực tiếp, gián tiếp, vô tình hoặc cố ý nào phát sinh từ việc sử dụng sai mục đích hoặc sử dụng trái phép phần mềm này.**
*   **Bạn hoàn toàn chịu trách nhiệm về hành vi của mình và phải đảm bảo rằng việc sử dụng công cụ này tuân thủ tất cả các luật pháp hiện hành tại quốc gia hoặc khu vực của bạn.**

---
*© 2026 AndroSentry Project. All Rights Reserved.*
