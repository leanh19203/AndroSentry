# ANDROSENTRY KNOWLEDGE BASE (KHO TRI THỨC BẢO MẬT)
**Phiên bản:** v1.3.1 (Bản phát hành ổn định)
**Tác giả:** Lê Đức Anh
**Mục tiêu:** Tài liệu chuyên sâu cung cấp kiến thức nền tảng, cơ chế kỹ thuật và các kịch bản kiểm thử xâm nhập thực chiến trên nền tảng Android sử dụng giải pháp AndroSentry.

---

## 1. TỔNG QUAN VỀ HỆ THỐNG ANDROSENTRY

**AndroSentry** là một nền tảng toàn diện tích hợp Trí tuệ nhân tạo (AI-Powered Android Pentesting Framework) được thiết kế riêng cho các chuyên gia đánh giá bảo mật (White Hat Hackers), kỹ sư an toàn thông tin di động và các lập trình viên muốn tự kiểm tra lỗ hổng trên ứng dụng của mình.

### 1.1. Kiến trúc Hệ thống (System Architecture)
Hệ thống được phát triển theo mô hình Full-stack hiện đại:
*   **Giao diện người dùng (Frontend):** Xây dựng trên nền React 18, Vite và Tailwind CSS, tối ưu hóa trải nghiệm mượt mà với hoạt ảnh chuyển động mềm mại (`motion`) từ thư viện `motion/react` và thư viện icon đồng bộ từ `lucide-react`.
*   **Máy chủ dịch vụ (Backend):** Sử dụng Express chạy trực tiếp trên môi trường Node.js giúp xử lý các luồng dữ liệu nặng, thực thi các lệnh hệ thống (ADB, Apktool, Apksigner), quản lý luồng bất đồng bộ (Task Queue) để tránh hiện tượng khóa (blocking) ứng dụng khi decompile/rebuild ứng dụng lớn.
*   **Cốt lõi Trí tuệ nhân tạo (AI Engine):** Tích hợp SDK `@google/genai` chính thức phía máy chủ (Server-side) để kết nối trực tiếp với mô hình Gemini AI, bảo vệ tuyệt đối API Key không bị lộ ra phía client.

---

## 2. KIẾN THỨC NỀN TẢNG & KIẾN TRÚC PHÂN HỆ

### 2.1. Phân hệ Quản lý Thiết bị qua ADB (ADB Device Manager)
Hệ điều hành Android giao tiếp với máy tính thông qua giao thức **ADB (Android Debug Bridge)** chạy trên cổng `5037`.

#### Cơ chế hoạt động của AndroSentry:
*   **Kiểm tra kết nối:** Hệ thống thực thi các tập lệnh ADB ngầm để dò tìm thiết bị (`adb devices`), lấy thông số phần cứng (`adb shell getprop`), phiên bản hệ điều hành (`ro.build.version.release`) và kiến trúc CPU (`ro.product.cpu.abi`) để phục vụ việc lựa chọn phiên bản Frida-Server tương thích.
*   **Trích xuất & Sao lưu (Backup APK):** Để kiểm thử một ứng dụng đã cài đặt trên điện thoại mà không có file gốc, AndroSentry thực hiện quy trình 2 bước:
    1.  Tìm đường dẫn tuyệt đối của gói ứng dụng: `adb shell pm path <package_name>`
    2.  Kéo file APK đó về máy chủ phân tích: `adb pull <remote_path> <local_workspace>`
*   **Mở rộng JADX-GUI:** Cung cấp giải pháp kết nối nhanh tới JADX để dịch ngược file APK thu được về mã nguồn Java nguyên bản, phục vụ quá trình phân tích tĩnh (White-box testing).

### 2.2. Quy trình Dịch ngược & Tái đóng gói (Apktool Pipeline)
Khi một file APK được phân phối, mã nguồn Java/Kotlin đã được biên dịch thành mã bytecode tối ưu hóa chạy trên máy ảo Dalvik/ART dưới dạng các tệp `.dex` (Dalvik Executable).

```
[File APK Gốc] ---> (Apktool Decompile) ---> [Mã Smali & Tài nguyên] ---> (Chỉnh sửa mã)
                                                                                  |
[File APK Mới] <--- (Apksigner) <--- (Zipalign) <--- (Apktool Rebuild) <-----------+
```

#### Các kỹ thuật cốt lõi trong Apktool:
*   **Dịch ngược (Decompile):** Phân rã file APK thành các file mã nguồn hợp ngữ trung gian **Smali** và các tài nguyên XML gốc (giao diện, cấu hình mạng). Việc phân tích mã Smali giúp pentester hiểu được logic ứng dụng và thực hiện chỉnh sửa mã tĩnh (Patching).
*   **Xây dựng lại (Rebuild):** Đóng gói thư mục mã Smali và tài nguyên đã chỉnh sửa trở lại thành một file APK chưa được ký.
*   **Căn chỉnh bộ nhớ (Zipalign):** Một bước cực kỳ quan trọng giúp sắp xếp lại các dữ liệu chưa nén trong APK theo ranh giới 4-byte. Giúp giảm thiểu lượng RAM tiêu thụ khi ứng dụng chạy trên thiết bị thực tế.
*   **Ký số ứng dụng (Apksigner):** Hệ điều hành Android nghiêm cấm cài đặt các ứng dụng không có chữ ký số hợp lệ. AndroSentry tự động tạo một cặp khóa Keystore mới và ký số tệp APK đã căn chỉnh bằng công cụ `apksigner` để đảm bảo ứng dụng có thể vượt qua cơ chế xác thực cài đặt của Android (hỗ trợ đầy đủ các chuẩn chữ ký V1, V2, V3).

### 2.3. Kiểm thử Cấu hình (AndroidManifest AI Auditor)
Tệp `AndroidManifest.xml` là trung tâm điều phối của mọi ứng dụng Android, định nghĩa các quyền truy cập, các thành phần ứng dụng và cấu hình bảo mật cốt lõi.

#### Các lỗ hổng phổ biến được AndroSentry kiểm tra tự động bằng AI:
1.  **android:debuggable="true"**
    *   *Rủi ro:* Cho phép tin tặc kết nối các bộ gỡ lỗi (debugger) như jdb, gdb vào tiến trình ứng dụng đang chạy để thay đổi giá trị biến, rẽ nhánh luồng thực thi và trích xuất thông tin nhạy cảm.
2.  **android:allowBackup="true"**
    *   *Rủi ro:* Cho phép người dùng hoặc kẻ xấu sao lưu toàn bộ thư mục dữ liệu nội bộ (`/data/data/<package_name>`) của ứng dụng ra máy tính thông qua lệnh `adb backup` mà không cần quyền root. Toàn bộ Token, cơ sở dữ liệu SQLite, SharedPreferences lưu mật khẩu sẽ bị rò rỉ.
3.  **Exposed Exported Components**
    *   *Rủi ro:* Các thành phần (`Activity`, `Service`, `Receiver`) có thuộc tính `android:exported="true"` nhưng không có cấu hình quyền bảo vệ (`android:permission`) cho phép bất kỳ ứng dụng độc hại nào khác trên thiết bị gọi trực tiếp đến nó, vượt qua màn hình đăng nhập hoặc rò rỉ thông tin nội bộ.

---

## 3. PHÂN TÍCH ĐỘNG & FRIDA INSTRUMENTATION (FRIDA STUDIO)

**Frida** là một bộ công cụ can thiệp mã nguồn động (Dynamic Instrumentation Toolkit) vô cùng mạnh mẽ cho phép các nhà nghiên cứu tiêm các tập lệnh JavaScript của riêng họ vào các tiến trình đang chạy của ứng dụng trên Android.

### 3.1. Nguyên lý Hoạt động của Frida trên Android
1.  **Frida-Server:** Một tiến trình daemon chạy dưới quyền root trên thiết bị Android (`/data/local/tmp/frida-server`). Server này sẽ lắng nghe các kết nối từ cổng USB của máy tính.
2.  **Frida-Client:** Máy tính gửi yêu cầu đính kèm (`attach`) vào tiến trình ứng dụng mục tiêu thông qua Frida-Server.
3.  **V8 Engine Injection:** Frida-Server tạo một tiến trình phụ hoặc chiếm quyền luồng thực thi của ứng dụng mục tiêu, tiêm thư viện V8 Javascript Engine vào không gian bộ nhớ của ứng dụng đó.
4.  **Hooking:** Đoạn mã Javascript của pentester được biên dịch và thực thi trực tiếp bên trong tiến trình của ứng dụng, cho phép trỏ lại địa chỉ hàm (Function redirection) hoặc thay đổi tham số/giá trị trả về của các lớp Java.

### 3.2. Ba Trụ cột tính năng trong Frida Studio v1.3.1 của AndroSentry

#### Trụ cột 1: Thư viện Mẫu Bypass (Presets)
AndroSentry đóng gói sẵn các tập lệnh vượt rào cản tối tân:
*   **SSL Pinning Bypass (OkHttp3 / TrustManager):** Cơ chế ghim chứng chỉ buộc ứng dụng chỉ tin tưởng một chứng chỉ duy nhất được định nghĩa sẵn, chặn đứng kỹ thuật tấn công Man-in-the-Middle (MitM) qua Burp Suite. Đoạn mã của chúng tôi sẽ hook vào hàm khởi tạo của `X509TrustManager` hoặc `CertificatePinner` để ép buộc chúng chấp nhận mọi chứng chỉ tùy chỉnh được cài vào thiết bị.
*   **Root Detection Bypass (RootBeer):** Hook vào các lớp kiểm tra sự hiện diện của tệp tin `su`, các thư mục nhạy cảm như `/system/app/Superuser.apk` hoặc kiểm tra quyền thực thi để luôn trả về giá trị `false` (thiết bị chưa root).

#### Trụ cột 2: Bộ dựng mã Hooking tương tác (Interactive Builder)
Đối với các hàm nghiệp vụ thông thường của ứng dụng (ví dụ hàm kiểm tra đăng nhập, kiểm tra VIP, kiểm tra bản quyền), pentester không cần viết code từ đầu. Chỉ cần điền:
*   **Class Name (Tên Lớp):** Tên đầy đủ kèm package (ví dụ: `com.androsentry.licensing.LicenseManager`)
*   **Method Name (Tên Phương thức):** Tên hàm cần hook (ví dụ: `isPremiumUser`)
*   **Action (Hành động):**
    *   `log`: Ghi nhận nhật ký mỗi lần hàm được gọi kèm theo giá trị của các đối số truyền vào và kết quả trả về.
    *   `true` / `false`: Ép buộc hàm (kiểu trả về Boolean) luôn trả về giá trị mong muốn để mở khóa tính năng.
    *   `custom int`: Ép trả về một mã số nguyên cố định (ví dụ: mã lỗi hệ thống hoặc phân quyền tài khoản).
    *   `void`: Vô hiệu hóa hoàn toàn nội dung thực thi của hàm (hữu ích để tắt các hàm phát hiện giả lập, root...).

#### Trụ cột 3: AI Sinh Frida Script chuyên sâu (Gemini AI Generator)
Khi ứng dụng áp dụng các cơ chế bảo mật tùy biến phức tạp (như mã hóa dữ liệu tùy biến AES/RSA, obfuscation mã nguồn), pentester chỉ cần viết yêu cầu tự nhiên vào khung prompt của AndroSentry. Gemini AI sẽ phân tích ngữ cảnh bảo mật Android để viết ra đoạn mã Hook chính xác, xử lý overload hàm và giải thích chi tiết cơ chế can thiệp.

---

## 4. KỊCH BẢN THỰC CHIẾN (STEP-BY-STEP PENTEST SCENARIOS)

### Kịch bản 1: Đánh chặn Lưu lượng mạng HTTPS (Bypass SSL Pinning)
*   **Mục tiêu:** Chụp và phân tích các API Request/Response mã hóa HTTPS gửi đi từ ứng dụng trên điện thoại bằng Burp Suite.
*   **Các bước thực hiện:**
    1.  Cài đặt chứng chỉ CA của Burp Suite vào mục **User Credentials** (hoặc chuyển sang thư mục **System** nếu chạy Android 7+ và đã Root) trên thiết bị Android mục tiêu.
    2.  Cấu hình Proxy trên điện thoại trỏ về địa chỉ IP của máy chạy Burp Suite thông qua cổng `8080`.
    3.  Bật ứng dụng AndroSentry, chuyển tới tab **Frida**, chọn ứng dụng cần quét.
    4.  Sử dụng tập lệnh bypass SSL Pinning từ kho **Presets** hoặc dựng mã tùy chỉnh trong **Frida Studio**.
    5.  Nhấp nút **Khởi chạy Frida Server** trên AndroSentry. Hệ thống sẽ tự động khởi động server ngầm trên điện thoại.
    6.  Chạy lệnh đính kèm script: `frida -U -f <package_name> -l script.js --no-pause`
    7.  Thực hiện thao tác trên ứng dụng di động, các yêu cầu mạng được giải mã thành công và hiện thị đầy đủ trên Burp Suite Proxy HTTP History.

### Kịch bản 2: Vượt qua Kiểm tra Thiết bị Root (Bypass Root Detection)
*   **Mục tiêu:** Chạy ứng dụng ngân hàng hoặc game vốn từ chối hoạt động trên các thiết bị đã Root.
*   **Các bước thực hiện:**
    1.  Mở tab **Frida Studio**, chuyển qua tab **Presets** hoặc **AI Script Generator**.
    2.  Chọn preset **Bypass Root Detection (RootBeer)** hoặc mô tả cho AI sinh script bypass.
    3.  Nạp mã Script vào tệp phân tích.
    4.  Chạy ứng dụng bằng Frida kèm theo script bypass. Hệ thống sẽ thay thế các lời gọi kiểm tra file hệ thống như `java.io.File.exists()` đối với các tệp tin `su` thành `false`, giúp ứng dụng tin rằng đây là thiết bị hoàn toàn an toàn và tiếp tục khởi chạy bình thường.

---

## 5. CẤU HÌNH PHÒNG THÍ NGHIỆM TIÊU CHUẨN (LAB SETUP GUIDE)

Để sử dụng tối đa sức mạnh của AndroSentry, pentester nên chuẩn bị một môi trường lab thực nghiệm chuẩn hóa:

### 5.1. Thiết lập Thiết bị Android Mục tiêu
Khuyên dùng một trong các phương án sau:
1.  **Thiết bị Thật (Rooted):** Điện thoại Google Pixel hoặc OnePlus chạy Android gốc, đã được unlock bootloader và root bằng **Magisk**. Đây là môi trường chuẩn xác nhất.
2.  **Máy ảo Genymotion:** Trình giả lập x86/ARM cực kỳ mượt mà, hỗ trợ sẵn quyền Root và dễ dàng tương thích với Frida-server phiên bản `android-x86` hoặc `android-x86_64`.
3.  **Trình giả lập Android Studio (AVD):** Tạo máy ảo không có Google Play Services (nhằm kích hoạt quyền Root mặc định qua ADB: `adb root` và `adb remount`).

### 5.2. Cài đặt các gói công cụ phụ trợ (Helper Utilities)
AndroSentry đã tích hợp sẵn hầu hết các tác vụ tự động, tuy nhiên để hỗ trợ debug thủ công sâu hơn, máy tính phân tích nên được cài đặt:
*   **Platform Tools:** Bao gồm `adb`, `fastboot`. Thêm chúng vào biến môi trường PATH của hệ điều hành.
*   **Burp Suite Community / Professional Edition:** Trình chặn bắt và phân tích dữ liệu mạng.
*   **JADX:** Trình biên dịch ngược mã nguồn DEX/APK sang Java dạng đồ họa tiện lợi.

---

*Tài liệu này được biên soạn và cập nhật liên tục bởi Trợ lý Bảo mật AndroSentry nhằm đồng hành cùng các pentester trên hành trình bảo vệ thế giới số di động.*
