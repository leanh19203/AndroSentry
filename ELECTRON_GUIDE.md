# Hướng Dẫn Đóng Gói Và Sử Dụng Với Electron (Windows & Kali Linux)

Hướng dẫn này giúp bạn chuyển đổi và biên dịch dự án **Kali Android Pentest GUI** thành ứng dụng desktop (`.exe` cho Windows và `.deb`/`AppImage` cho Kali Linux) sử dụng **Electron**.

Do ứng dụng của chúng ta sử dụng một máy chủ **Express (Node.js)** ở backend để trực tiếp giao tiếp với ADB và hệ thống, **Electron** là sự lựa chọn tối ưu nhất (vượt trội hơn Tauri) vì Electron tích hợp sẵn môi trường Node.js gốc, cho phép chạy song song máy chủ nền mà không cần viết lại toàn bộ logic thực thi lệnh bằng Rust.

---

## 🚀 1. Chuẩn Bị Môi Trường

Để chạy và đóng gói ứng dụng ngay trên máy tính của bạn (Windows hoặc Kali Linux), hãy đảm bảo đã cài đặt:

1. **Node.js (phiên bản v18 trở lên) & NPM**:
   - **Trên Windows**: Tải trình cài đặt từ trang chủ [nodejs.org](https://nodejs.org/).
   - **Trên Kali Linux / Ubuntu**:
     ```bash
     sudo apt update
     sudo apt install -y nodejs npm
     ```
2. **Các công cụ pentest phụ thuộc (Nếu muốn tính năng "Chạy Lệnh" hoạt động)**:
   - Đảm bảo hệ thống của bạn đã cài đặt sẵn `adb`, `apktool`, `apksigner`, `keytool`, `zipalign`, và `jadx-gui` và đã khai báo chúng vào biến môi trường **PATH** để gọi trực tiếp ở bất kỳ đâu trong terminal.

---

## 🛠️ 2. Các Bước Cài Đặt Ban Đầu

Tải mã nguồn này về máy tính của bạn, giải nén và mở terminal (hoặc Command Prompt) tại thư mục chứa dự án:

```bash
# 1. Cài đặt toàn bộ thư viện dependencies bao gồm Electron
npm install
```

---

## 💻 3. Chạy Thử Ứng Dụng (Development Mode)

Chạy câu lệnh dưới đây để tự động biên dịch code React + khởi tạo server Node.js và mở ứng dụng lên dạng cửa sổ desktop:

```bash
npm run electron:dev
```

*Lúc này, một cửa sổ ứng dụng Windows/Linux sẽ xuất hiện cực kỳ mượt mà. Mọi thao tác click "Chạy" lệnh sẽ gọi thẳng qua localhost để tương tác với thiết bị Android của bạn.*

---

## 📦 4. Đóng Gói Thành Tệp Cài Đặt (.exe / .deb / AppImage)

Bộ builder đã được cấu hình tự động gom toàn bộ mã nguồn Frontend và server Backend và xuất ra bộ cài đặt hoàn chỉnh.

### A. Đóng gói cho Windows (Tạo file `.exe` cài đặt)
Chạy lệnh này trên hệ điều hành Windows:
```bash
npm run electron:dist
```
Sau khi hoàn thành, hãy vào thư mục `dist-electron/` ở gốc dự án, bạn sẽ thấy tệp cài đặt **`Kali Android Pentest GUI Setup.exe`**.

---

### B. Đóng gói cho Kali Linux (Tạo file `.deb` hoặc `AppImage`)
Chạy lệnh này trên máy Kali Linux của bạn:
```bash
npm run electron:dist
```
Sau khi hoàn thành, kiểm tra thư mục `dist-electron/` bạn sẽ nhận được:
- File `.deb` (Ví dụ: `kali-android-pentest-gui.deb`) để cài đặt trực tiếp qua `dpkg -i`.
- File `AppImage` có thể double-click là chạy ngay mà không cần cài đặt.

---

## 🔒 5. Các Lưu Ý Về Bảo Mật Khi Đóng Gói
1. **Quyền Thực Thi Lệnh**: Để bảo vệ người dùng, server Express của chúng ta đã được trang bị bộ lọc bảo mật thông minh:
   - Chỉ cho phép chạy các lệnh bắt đầu bằng: `adb`, `apktool`, `apksigner`, `keytool`, `zipalign`, `frida`, `frida-ps`, `jadx`, `jadx-gui`.
   - Ngăn chặn triệt để các hành vi tiêm mã độc hoặc tải tệp phá hoại như `rm -rf`, `wget`, `curl`, `bash`, `sh`.
2. **Xác Thực (Auth)**: Khi chạy offline cục bộ trên máy của bạn (localhost), server sẽ tự động cho phép gọi API. Khi ứng dụng được deploy lên môi trường web công cộng (Cloud Run), tính năng chạy lệnh sẽ bị khóa tự động để tránh tin tặc phá hoại hạ tầng máy chủ của bạn.
