# 1. Cài đặt các công cụ bổ trợ trên Kali Linux
Mở terminal trên máy Kali Linux của bạn và cài đặt các gói cần thiết: sudo apt update Cài đặt Node.js và trình quản lý gói npm:

sudo apt install -y nodejs npm

Cài đặt các công cụ Android Pentest thực tế để sử dụng kèm theo:

sudo apt install -y adb apktool jadx apksigner zipalign

# 2. Cài đặt các thư viện phụ thuộc của ứng dụng
Tải trực tiếp bằng git clone từ GitHub:

git clone https://github.com/leanh19203/Kali-Android-Pentest-GUI.git

cd Kali-Android-Pentest-GUI

Tiến hành cài đặt các thư viện Node.js:

npm install

# 3. Cấu hình khóa API Gemini (Nếu muốn dùng AI Chat & AI Manifest Scanner)
Để các tính năng AI thông minh hoạt động mượt mà trên máy Kali Linux của bạn:

a. Lấy API Key miễn phí từ Google AI Studio.

b. Thiết lập biến môi trường trên Kali terminal:

  export GEMINI_API_KEY="AIzaSyYourActualGeminiApiKeyGoesHere"
# 4. Khởi chạy ứng dụng
Chạy chế độ thử nghiệm (Development Mode):

npm run dev

Sau khi khởi chạy thành công, terminal sẽ hiển thị đường dẫn truy cập. Bạn chỉ cần mở trình duyệt Web trên Kali Linux (Firefox) và truy cập vào địa chỉ: http://localhost:3000

Chạy chế độ tối ưu hiệu năng (Production Mode):

npm run build

npm run start

# 5. GỠ CÀI ĐẶT (UNINSTALL) KHỎI MÁY KALI LINUX
Bước 1: Tắt ứng dụng đang chạy

Nếu bạn đang chạy trực tiếp trên Terminal hãy nhấn tổ hợp phím Ctrl + C để tắt server:

Bước 2: Xóa thư mục chứa mã nguồn ứng dụng

Bạn chỉ cần xóa thư mục chứa dự án mà bạn đã tải về máy Kali (ví dụ thư mục tên là Kali-Android-Pentest-GUI đặt ở thư mục người dùng):

rm -rf ~/Kali-Android-Pentest-GUI
