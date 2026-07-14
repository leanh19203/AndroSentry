import { AdbCommand, ApkToolStep } from "./types";

export const ADB_COMMANDS: AdbCommand[] = [
  // RECON & DEVICE INFORMATION
  {
    id: "recon-1",
    category: "recon",
    title: "Liệt kê thiết bị đang kết nối",
    description: "Hiển thị danh sách thiết bị Android (hoặc trình giả lập) đang hoạt động và kết nối với máy tính thông qua ADB.",
    command: "adb devices -l",
    kaliTool: "adb"
  },
  {
    id: "recon-2",
    category: "recon",
    title: "Xem thông tin phiên bản Android",
    description: "Truy vấn phiên bản hệ điều hành Android (SDK API Level) của thiết bị mục tiêu.",
    command: "adb shell getprop ro.build.version.sdk",
    kaliTool: "adb"
  },
  {
    id: "recon-3",
    category: "recon",
    title: "Liệt kê tất cả các gói ứng dụng (Packages)",
    description: "Hiển thị toàn bộ tên gói (package name) của các ứng dụng đã cài đặt trên thiết bị.",
    command: "adb shell pm list packages",
    kaliTool: "adb / pm"
  },
  {
    id: "recon-4",
    category: "recon",
    title: "Tìm vị trí lưu tệp APK của ứng dụng",
    description: "Xác định đường dẫn lưu trữ tuyệt đối của tệp APK gốc của một ứng dụng cụ thể trên thiết bị.",
    command: "adb shell pm path [PACKAGE_NAME]",
    placeholder: "com.example.app",
    kaliTool: "pm"
  },

  // DATA EXTRACTION & ANALYSIS
  {
    id: "data-1",
    category: "data",
    title: "Sao lưu tệp APK về máy tính Kali",
    description: "Tải xuống tệp APK gốc từ thiết bị Android về máy Kali Linux để tiến hành dịch ngược.",
    command: "adb pull [APK_PATH_ON_DEVICE] ./base.apk",
    placeholder: "/data/app/~~.../base.apk",
    kaliTool: "adb pull"
  },
  {
    id: "data-2",
    category: "data",
    title: "Xem logs thời gian thực (Logcat)",
    description: "Theo dõi luồng log hệ thống và ứng dụng nhằm phát hiện rò rỉ dữ liệu nhạy cảm (Credentials, Tokens, v.v.).",
    command: "adb logcat | grep -i '[FILTER_KEYWORD]'",
    placeholder: "com.example.app",
    kaliTool: "logcat / grep"
  },
  {
    id: "data-3",
    category: "data",
    title: "Tải thư mục dữ liệu cá nhân (Sandbox Data)",
    description: "Sao chép thư mục dữ liệu nội bộ (SharedPreferences, SQLite) của ứng dụng về máy để phân tích ngoại tuyến.",
    command: "adb pull /data/data/[PACKAGE_NAME]/ ./app_data/",
    placeholder: "com.example.app",
    kaliTool: "adb pull"
  },
  {
    id: "data-4",
    category: "data",
    title: "Chụp ảnh màn hình thiết bị Android",
    description: "Lưu ảnh màn hình hiện tại của thiết bị và sao chép về máy Kali Linux.",
    command: "adb shell screencap -p /sdcard/screen.png && adb pull /sdcard/screen.png .",
    kaliTool: "screencap"
  },

  // INTENT EXPLOITATION
  {
    id: "intent-1",
    category: "intent",
    title: "Khởi chạy một Activity (Ví dụ: bypass login)",
    description: "Khởi chạy trực tiếp một Activity đã xuất khẩu (Exported Activity) mà không cần đi qua màn hình đăng nhập.",
    command: "adb shell am start -n [PACKAGE_NAME]/[ACTIVITY_NAME]",
    placeholder: "com.example.app/com.example.app.DashboardActivity",
    kaliTool: "am (Activity Manager)"
  },
  {
    id: "intent-2",
    category: "intent",
    title: "Gửi một Broadcast Intent tùy chỉnh",
    description: "Kích hoạt một Broadcast Receiver cụ thể với các tham số đi kèm để kiểm thử khả năng xử lý thông điệp.",
    command: "adb shell am broadcast -a [ACTION_NAME] --es [KEY] [VALUE]",
    placeholder: "com.example.app.CUSTOM_ACTION --es code 1234",
    kaliTool: "am"
  },
  {
    id: "intent-3",
    category: "intent",
    title: "Khởi chạy một Background Service",
    description: "Bắt đầu một service chạy ngầm được khai báo trong ứng dụng mục tiêu.",
    command: "adb shell am startservice -n [PACKAGE_NAME]/[SERVICE_NAME]",
    placeholder: "com.example.app/com.example.app.SyncService",
    kaliTool: "am"
  },

  // SHELL & PRIVILEGES
  {
    id: "shell-1",
    category: "shell",
    title: "Truy cập Android Shell",
    description: "Mở một phiên terminal tương tác trực tiếp với hệ điều hành Android.",
    command: "adb shell",
    kaliTool: "adb shell"
  },
  {
    id: "shell-2",
    category: "shell",
    title: "Khởi động lại thiết bị sang Recovery",
    description: "Khởi động lại thiết bị vào chế độ khôi phục (Recovery Mode) để nạp rom hoặc can thiệp sâu.",
    command: "adb reboot recovery",
    kaliTool: "adb reboot"
  },
  {
    id: "shell-3",
    category: "shell",
    title: "Yêu cầu quyền Root (Nếu thiết bị đã root)",
    description: "Chuyển đổi tài khoản người dùng shell thông thường sang người dùng quản trị tối cao (root).",
    command: "adb shell \"su -c 'whoami'\"",
    kaliTool: "su"
  },

  // PORT REVERSING & NETWORKING
  {
    id: "reverse-1",
    category: "reverse",
    title: "Chuyển tiếp cổng (Port Forwarding)",
    description: "Chuyển tiếp lưu lượng từ cổng máy tính cục bộ sang cổng trên thiết bị Android (Thường dùng cho Frida, gdb).",
    command: "adb forward tcp:[LOCAL_PORT] tcp:[DEVICE_PORT]",
    placeholder: "27042 27042",
    kaliTool: "adb forward"
  },
  {
    id: "reverse-2",
    category: "reverse",
    title: "Kiểm tra các cổng mạng đang mở trên Android",
    description: "Liệt kê các tiến trình mạng và cổng TCP/UDP đang lắng nghe trên thiết bị Android mục tiêu.",
    command: "adb shell netstat -tuln",
    kaliTool: "netstat"
  }
];

export const APKTOOL_STEPS: ApkToolStep[] = [
  {
    id: "apktool-1",
    title: "Giải nén & dịch ngược mã nguồn (Decompile)",
    description: "Sử dụng Apktool để dịch ngược tệp base.apk thành các tệp mã nguồn Smali, tài nguyên XML và tệp Manifest dạng thô.",
    command: "apktool d [APK_NAME].apk -o [OUTPUT_DIR]",
    tip: "Giúp bạn chỉnh sửa trực tiếp tệp AndroidManifest.xml hoặc sửa đổi các hằng số trong thư mục smali."
  },
  {
    id: "apktool-2",
    title: "Chạy Jadx-GUI để phân tích mã Java",
    description: "Khởi chạy công cụ Jadx-GUI trên Kali Linux nhằm chuyển đổi mã bytecode Dalvik (.dex) sang mã nguồn Java có độ đọc hiểu cao.",
    command: "jadx-gui [APK_NAME].apk",
    tip: "Lựa chọn lý tưởng cho việc đọc hiểu thuật toán, tìm khóa mã hóa AES/RSA hoặc URL ẩn trong ứng dụng."
  },
  {
    id: "apktool-3",
    title: "Đóng gói lại ứng dụng sau chỉnh sửa (Recompile)",
    description: "Biên dịch thư mục chứa mã nguồn smali đã được vá bảo mật (hoặc cài backdoor kiểm thử) trở lại thành tệp APK mới.",
    command: "apktool b [DECOMPILED_DIR] -o patched.apk",
    tip: "Thư mục đầu ra thường chứa tệp patched.apk mới nhưng chưa được ký mã số."
  },
  {
    id: "apktool-4",
    title: "Tạo khóa ký tự ký mã (Keystore Generation)",
    description: "Tạo một chứng chỉ số tự ký (Self-signed Certificate) để sử dụng cho việc ký ứng dụng APK đã sửa đổi.",
    command: "keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-alias",
    tip: "Hãy nhập các thông tin mô phỏng và ghi nhớ mật khẩu đã thiết lập."
  },
  {
    id: "apktool-5",
    title: "Ký tệp APK patched (Signing)",
    description: "Ký tệp APK patched bằng chứng chỉ số vừa tạo để Android cho phép cài đặt và chạy ứng dụng trên thiết bị thực tế.",
    command: "apksigner sign --keystore my-release-key.jks --ks-key-alias my-alias patched.apk",
    tip: "Trên các phiên bản Kali Linux mới, bạn có thể kiểm tra chữ ký thông qua lệnh: apksigner verify patched.apk"
  }
];

export const FRIDA_SCRIPTS = [
  {
    title: "Bypass SSL Pinning (Bảo mật kênh truyền)",
    description: "Mã script Frida phổ biến giúp ghi đè các hàm TrustManager và OkHttpClient để chặn bắt dữ liệu HTTPS qua các proxy như Burp Suite.",
    code: `Java.perform(function () {
    var array_list = Java.use("java.util.ArrayList");
    var ApiClient = Java.use("com.android.org.conscrypt.TrustManagerImpl");

    ApiClient.checkTrustedRecursive.implementation = function(a1, a2, a3, a4, a5, a6) {
        console.log("[+] Bypassed Conscrypt TrustManagerImpl check");
        return array_list.$new();
    };
});`
  },
  {
    title: "Bypass Root Detection (Kiểm tra thiết bị root)",
    description: "Mã script Frida để lừa ứng dụng tin rằng thiết bị kiểm thử không hề bị root bằng cách ghi đè hàm kiểm tra tệp tin 'su' hoặc RootBeer.",
    code: `Java.perform(function () {
    var File = Java.use("java.io.File");
    File.exists.implementation = function () {
        var name = this.getName();
        if (name === "su" || name === "busybox" || name === "Superuser.apk") {
            console.log("[*] Intercepted Root check file: " + name);
            return false;
        }
        return this.exists();
    };
});`
  },
  {
    title: "Ghi đè hàm mã hóa AES (Crypto Inspection)",
    description: "Script theo dõi trực tiếp tham số đầu vào và đầu ra của thư viện mật mã học Java (Cipher) để thu thập khóa bí mật AES trong thời gian thực.",
    code: `Java.perform(function () {
    var Cipher = Java.use("javax.crypto.Cipher");
    Cipher.doFinal.overload("[B").implementation = function (bytes) {
        console.log("[*] AES doFinal called!");
        var result = this.doFinal(bytes);
        try {
            console.log("Raw Input (Length): " + bytes.length);
            console.log("Decrypted output: " + String.fromCharCode.apply(null, new Uint8Array(result)));
        } catch(e) {}
        return result;
    };
});`
  },
  {
    title: "Bypass Xác thực Vân tay / Biometric",
    description: "Script Frida để vượt qua kiểm tra sinh trắc học (vân tay, khuôn mặt) bằng cách ghi đè kết quả xác thực trong các thư viện hỗ trợ Biometric Android.",
    code: `Java.perform(function () {
    // Hook androidx.biometric.BiometricManager
    try {
        var BiometricManager = Java.use("androidx.biometric.BiometricManager");
        BiometricManager.canAuthenticate.overload("int").implementation = function (authenticators) {
            console.log("[+] Bypassed androidx.biometric canAuthenticate()");
            return 0; // BIOMETRIC_SUCCESS
        };
    } catch (e) {
        console.log("[-] androidx.biometric.BiometricManager not found");
    }

    // Hook android.hardware.fingerprint.FingerprintManager
    try {
        var FingerprintManager = Java.use("android.hardware.fingerprint.FingerprintManager");
        FingerprintManager.hasEnrolledFingerprints.implementation = function () {
            console.log("[+] Bypassed hasEnrolledFingerprints() checks");
            return true;
        };
    } catch (e) {
        console.log("[-] android.hardware.fingerprint.FingerprintManager not found");
    }
});`
  },
  {
    title: "Ghi đè Hàm kiểm tra Tùy chỉnh (Custom Hook)",
    description: "Mẫu script can thiệp vào các lớp Java tùy chỉnh của ứng dụng để ép buộc trạng thái đăng nhập, kích hoạt tính năng Premium hoặc bypass mã PIN bảo vệ.",
    code: `Java.perform(function () {
    // Lưu ý: Thay đổi 'com.example.app' và tên các lớp/hàm tương ứng với thực tế phân tích từ JADX
    try {
        var AuthManager = Java.use("com.example.app.security.AuthManager");
        
        AuthManager.isUserPremium.implementation = function () {
            console.log("[+] Hooked isUserPremium() and forced to return TRUE");
            return true;
        };

        AuthManager.verifyLocalPin.implementation = function (userPin) {
            console.log("[+] Hooked verifyLocalPin() with input: " + userPin + " -> forced TRUE");
            return true;
        };
    } catch (e) {
        console.log("[-] Class com.example.app.security.AuthManager not found, please check class path");
    }
});`
  }
];
