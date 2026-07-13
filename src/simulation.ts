/**
 * Simulated Terminal outputs for the AndroSentry Graphical Assistant.
 * Provides realistic console responses when running on public web sandbox without local ADB.
 */

export function getSimulatedOutput(command: string, language: string = "vi"): { output: string; isError: boolean } {
  const trimmed = command.trim().toLowerCase();

  // Helper strings based on language
  const isVi = language === "vi";
  const isJa = language === "ja";
  
  const successLabel = isVi ? "[THÀNH CÔNG]" : isJa ? "[成功]" : "[SUCCESS]";
  const errorLabel = isVi ? "[LỖI]" : isJa ? "[エラー]" : "[ERROR]";

  // 1. ADB DEVICES
  if (trimmed.startsWith("adb devices")) {
    return {
      output: `List of devices attached\n` +
              `emulator-5554          device product:sdk_gphone64_arm64 model:gphone64_arm64 device:emulator64_arm64 transport_id:1\n` +
              `Pixel_8_Pro_API_34     device product:husky model:Pixel_8_Pro device:husky transport_id:2\n\n` +
              `${successLabel} Đã tìm thấy 2 thiết bị Android đang kết nối qua cổng ADB (1 Trình giả lập, 1 Thiết bị thật qua USB Debugging).`,
      isError: false
    };
  }

  // 2. ADB SHELL GETPROP SDK VERSION
  if (trimmed.includes("getprop ro.build.version.sdk")) {
    return {
      output: `34\n\n` +
              `${successLabel} Thiết bị mục tiêu chạy Android 14 (API Level 34).`,
      isError: false
    };
  }

  // 3. ADB SHELL PM LIST PACKAGES
  if (trimmed.includes("pm list packages")) {
    return {
      output: `package:com.android.fmradio\n` +
              `package:com.android.providers.contacts\n` +
              `package:com.android.chrome\n` +
              `package:com.vulnerable.android.app\n` +
              `package:com.example.secureapp\n` +
              `package:com.kali.pentest.target\n` +
              `package:com.android.vending\n\n` +
              `${successLabel} Truy xuất thành công danh sách các gói ứng dụng đang cài đặt trên thiết bị.`,
      isError: false
    };
  }

  // 4. ADB SHELL PM PATH
  if (trimmed.includes("pm path")) {
    const pkg = command.split(/\s+/).pop() || "com.vulnerable.android.app";
    return {
      output: `package:/data/app/~~G7x_vT8hL2p==/${pkg}-x9Jks8a==/base.apk\n\n` +
              `${successLabel} Đã xác định vị trí tệp cài đặt APK của ${pkg} trên hệ thống tập tin Android.`,
      isError: false
    };
  }

  // 5. ADB PULL APK
  if (trimmed.includes("adb pull") && trimmed.includes(".apk")) {
    return {
      output: `/data/app/~~G7x_vT8hL2p==/com.vulnerable.android.app-x9Jks8a==/base.apk: 1 file pulled, 0 skipped. 45.8 MB/s (24856102 bytes in 0.518s)\n\n` +
              `${successLabel} Tải xuống thành công tệp base.apk về thư mục làm việc hiện hành trên Kali Linux.`,
      isError: false
    };
  }

  // 6. ADB PULL SANDBOX DATA
  if (trimmed.includes("adb pull") && trimmed.includes("/data/data/")) {
    const pkg = trimmed.match(/\/data\/data\/([a-zA-Z0-9._]+)/)?.[1] || "com.vulnerable.android.app";
    return {
      output: `pull: /data/data/${pkg}/shared_prefs/user_credentials.xml -> ./app_data/shared_prefs/user_credentials.xml\n` +
              `pull: /data/data/${pkg}/databases/local_cache.db -> ./app_data/databases/local_cache.db\n` +
              `2 files pulled, 0 skipped. 12.4 MB/s (45821 bytes in 0.003s)\n\n` +
              `${successLabel} Đã trích xuất toàn bộ dữ liệu Sandbox (SharedPreferences, SQLite) của gói ${pkg} về thư mục ./app_data/ để phân tích ngoại tuyến.`,
      isError: false
    };
  }

  // 7. ADB LOGCAT
  if (trimmed.includes("logcat")) {
    return {
      output: `--------- beginning of main\n` +
              `07-10 12:45:12.381  1204  1450 I ActivityManager: Start proc com.vulnerable.android.app for activity com.vulnerable.android.app/.LoginActivity\n` +
              `07-10 12:45:14.992  8452  8452 D VulnerableApp: [DEBUG] Initializing login request handler...\n` +
              `07-10 12:45:15.105  8452  8452 W VulnerableApp: [SECURITY RISK] Writing credentials to insecure logs: username=admin_dev, token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\n` +
              `07-10 12:45:15.520  8452  8452 I SQLiteDatabase: Database opened: /data/data/com.vulnerable.android.app/databases/local_cache.db\n` +
              `07-10 12:45:16.012  8452  8470 D OkHttpClient: Sending request https://api.vulnerable.com/v1/auth\n` +
              `07-10 12:45:16.891  8452  8470 D OkHttpClient: Received response: {"status":"success","session_id":"7cc6b7d2f9b84ab3"}\n\n` +
              `${successLabel} Luồng log hệ thống được bắt bộ lọc thành công. Phát hiện rủi ro ghi đè dữ liệu nhạy cảm lên Logcat (Token JWT, Username).`,
      isError: false
    };
  }

  // 8. ADB SHELL SCREEN CAPTURE
  if (trimmed.includes("screencap")) {
    return {
      output: `[100%] /sdcard/screen.png\n` +
              `/sdcard/screen.png: 1 file pulled, 0 skipped. 32.1 MB/s (1450201 bytes in 0.043s)\n\n` +
              `${successLabel} Chụp ảnh màn hình thiết bị thành công và lưu tại file ./screen.png trên Kali Linux.`,
      isError: false
    };
  }

  // 9. APKTOOL DECOMPILE
  if (trimmed.startsWith("apktool d")) {
    const apkFile = command.split(/\s+/)[2] || "base.apk";
    return {
      output: `I: Using Apktool 2.9.3 on ${apkFile}\n` +
              `I: Loading resource table...\n` +
              `I: Decoding AndroidManifest.xml with resources...\n` +
              `I: Loading resource table from file: /root/.local/share/apktool/framework/1.apk\n` +
              `I: Regular manifest structure...\n` +
              `I: Decoding file-resources...\n` +
              `I: Decoding values */* XMLs...\n` +
              `I: Baksmaling classes.dex...\n` +
              `I: Copying assets and libs...\n` +
              `I: Copying unknown files...\n` +
              `I: Copying original files...\n\n` +
              `${successLabel} Dịch ngược (Decompile) thành công tệp ${apkFile}!\n` +
              `Thư mục mã nguồn và tài nguyên XML đã được lưu tại thư mục đầu ra. Bạn có thể mở AndroidManifest.xml để bắt đầu quét tự động bằng AI.`,
      isError: false
    };
  }

  // 10. APKTOOL RECOMPILE
  if (trimmed.startsWith("apktool b")) {
    return {
      output: `I: Using Apktool 2.9.3\n` +
              `I: Checking whether sources has changed...\n` +
              `I: Smaling smali folder into classes.dex...\n` +
              `I: Checking whether resources has changed...\n` +
              `I: Building resources...\n` +
              `I: Copying libs...\n` +
              `I: Building apk file...\n` +
              `I: Copying unknown files...\n\n` +
              `${successLabel} Đóng gói (Recompile) mã nguồn Smali thành công! Tệp tin đầu ra: patched.apk`,
      isError: false
    };
  }

  // 11. APKSIGNER
  if (trimmed.startsWith("apksigner") || trimmed.includes("sign")) {
    return {
      output: `Keystore password: *****\n` +
              `Signed successfully.\n\n` +
              `${successLabel} Đã ký số ứng dụng (Signed) bằng khóa ký kiểm thử. Tệp patched.apk đã sẵn sàng để cài đặt và chạy bypass trên thiết bị mục tiêu!`,
      isError: false
    };
  }

  // 12. FRIDA-PS
  if (trimmed.startsWith("frida-ps")) {
    return {
      output: ` PID  Name                 Identifier\n` +
              `-----  -------------------  ----------------------------------\n` +
              ` 8210  Chrome               com.android.chrome\n` +
              ` 8452  Vulnerable App       com.vulnerable.android.app\n` +
              ` 8611  Frida Server         re.frida.server\n` +
              `    -  Google Play Store    com.android.vending\n` +
              `    -  Settings             com.android.settings\n\n` +
              `${successLabel} Đã kết nối với Frida Server thành công trên thiết bị mục tiêu (USB Debugging Mode).`,
      isError: false
    };
  }

  // 13. FRIDA EXECUTION
  if (trimmed.startsWith("frida")) {
    const scriptFile = command.includes("-l") ? command.split("-l")[1].trim().split(" ")[0] : "bypass.js";
    const pkg = command.includes("-f") ? command.split("-f")[1].trim().split(" ")[0] : "com.vulnerable.android.app";
    return {
      output: `     ____\n` +
              `    / _  |   Frida 16.2.1 - A world-class dynamic instrumentation toolkit\n` +
              `   | (_| |\n` +
              `    > _  |   Commands:\n` +
              `   /_/ |_|     help      -> Displays the help system\n` +
              `               list      -> List active sessions\n` +
              `               ps        -> List running processes\n\n` +
              `[USB::Pixel 8 Pro]::Spawned \`${pkg}\`\n` +
              `[+] Script [${scriptFile}] loaded successfully. Injecting hooks...\n` +
              `[+] Hooking Root Detection checks (common directories, root binaries)...\n` +
              `[+] Hooking KeyStore / Cert Validation to bypass SSL Pinning...\n` +
              `[+] [HOOK] Intercepted SSL verification check - Overriding to TRUST_ALL\n` +
              `[+] [HOOK] Bypassed Root check for path: /system/app/Superuser.apk\n` +
              `[+] [HOOK] Bypassed Root check for binary: /system/xbin/su\n` +
              `[+] Bypass successful! Ứng dụng ${pkg} hiện có thể kết nối thông qua Burp Suite Proxy mà không bị chặn bởi SSL Pinning/Root Detection.`,
      isError: false
    };
  }

  // 14. AM START ACTIVITIES / SERVICES / BROADCASTS
  if (trimmed.includes("am start") || trimmed.includes("am broadcast") || trimmed.includes("am startservice")) {
    return {
      output: `Starting: Intent { act=android.intent.action.MAIN cmp=com.vulnerable.android.app/.DashboardActivity }\n` +
              `Status: ok\n\n` +
              `${successLabel} Đã ép buộc khởi chạy thành công Intent mục tiêu thông qua quyền root ADB. Vượt qua kiểm tra đăng nhập trên ứng dụng!`,
      isError: false
    };
  }

  // 15. DEFAULT GENERIC FALLBACK
  return {
    output: `[MÔ PHỎNG HỆ THỐNG KALI LINUX]\n` +
            `$ ${command}\n\n` +
            `[ĐANG KHỞI CHẠY THỬ NGHIỆM]\n` +
            `Kiểm thử giả lập lệnh pentest thành công. Lệnh này đòi hỏi một hệ thống Kali Linux có cài đặt adb/apktool kết nối trực tiếp với thiết bị Android thực tế.\n\n` +
            `${successLabel} Lệnh đã được phân tích cú pháp hợp lệ.\n` +
            `Để chạy lệnh thực tế này, bạn hãy tải mã nguồn công cụ về máy và khởi chạy trên localhost (Kali Linux) của bạn!`,
    isError: false
  };
}
