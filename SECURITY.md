# Chính sách Bảo mật của Dự án AndroSentry (Security Policy)

Chào mừng bạn đến với chính sách bảo mật của **AndroSentry**! Là một bộ công cụ hỗ trợ kiểm thử xâm nhập bảo mật (Penetration Testing Tool), chúng tôi luôn đặt tính an toàn và bảo mật lên hàng đầu. 

Nếu bạn tìm thấy bất kỳ lỗ hổng bảo mật nào trong mã nguồn AndroSentry hoặc các thư viện đi kèm, chúng tôi rất mong nhận được thông báo từ bạn để có thể khắc phục nhanh chóng nhất.

---

## Phiên bản được Hỗ trợ

Chúng tôi hiện tại chỉ hỗ trợ và vá lỗi bảo mật cho phiên bản mới nhất:

| Phiên bản | Trạng thái hỗ trợ |
| :--- | :--- |
| **v1.3.1** (Bản mới nhất) | :white_check_mark: Được hỗ trợ |
| < v1.3.1 | :x: Không hỗ trợ |

---

## Cách báo cáo Lỗ hổng Bảo mật (Responsible Disclosure)

**LƯU Ý QUAN TRỌNG:** Vui lòng **KHÔNG** tạo các Issue công khai trên GitHub để báo cáo lỗ hổng bảo mật nhằm tránh rủi ro kẻ xấu lợi dụng trước khi lỗ hổng được vá.

Hãy thực hiện quy trình báo cáo bảo mật an toàn sau:

1. Gửi email trực tiếp mô tả chi tiết lỗ hổng về địa chỉ: **leanh19203@gmail.com**
2. Email của bạn nên bao gồm:
   * **Mô tả lỗ hổng:** Nó là gì và mức độ ảnh hưởng thế nào?
   * **Các bước tái hiện (PoC):** Chi tiết các bước hoặc đoạn mã mô tả để chúng tôi có thể tự kiểm tra và xác minh lỗ hổng.
   * **Đề xuất khắc phục (nếu có):** Gợi ý cách sửa đổi mã nguồn để vá lỗi.

---

## Quy trình Xử lý của Chúng tôi

Sau khi nhận được báo cáo của bạn qua email:

* **Trong vòng 48 giờ:** Chúng tôi sẽ xác nhận đã nhận được email và bắt đầu tiến hành phân tích, xác minh lỗ hổng.
* **Trong vòng 7 ngày:** Chúng tôi sẽ gửi thông tin phản hồi về kết quả xác minh và lộ trình dự kiến để phát hành bản vá lỗi (Patch).
* **Công bố:** Sau khi bản vá đã được cập nhật thành công lên GitHub, chúng tôi sẽ công khai gửi lời cảm ơn và vinh danh bạn trong lịch sử thay đổi (Changelog) nếu bạn đồng ý.

---

## Lịch sử Lỗ hổng Bảo mật đã Xử lý (Security Advisories & Disclosures)

Dưới đây là danh sách các lỗ hổng bảo mật được phát hiện trong các đợt kiểm thử nội bộ hoặc do cộng đồng báo cáo thông qua quy trình **Responsible Disclosure**, đã được đội ngũ AndroSentry tiếp nhận và khắc phục triệt để.

### 🛡️ [AS-2026-001] Lỗ hổng Đọc tệp tin tùy ý & Vượt quyền thư mục (Arbitrary File Read & Path Traversal) via `/api/scan`

* **Mức độ nghiêm trọng:** **HIGH** (Cao) - Do có khả năng rò rỉ dữ liệu nhạy cảm của hệ thống.
* **Phiên bản bị ảnh hưởng:** Toàn bộ các phiên bản trước **v1.3.1** (khi chạy trên môi trường có quyền truy cập file hệ thống).
* **Trạng thái:** :white_check_mark: **Đã vá hoàn toàn trong phiên bản v1.3.1**.

#### Chi tiết Kỹ thuật & Nguyên nhân gốc rễ (Root Cause)
Lỗ hổng nằm tại controller xử lý quét tĩnh ứng dụng `/server/controllers/scanner.controller.ts` liên kết với endpoint `/api/scan`. 
1. **Thiếu kiểm tra địa chỉ Client (No local IP enforcement):** Endpoint `/api/scan` không có lớp middleware hoặc logic kiểm tra IP nguồn, cho phép bất kỳ client nào từ xa cũng có thể kích hoạt tiến trình quét thư mục.
2. **Thiếu làm sạch đầu vào và Path Traversal:** Biến đầu vào `workspaceDir` được lấy trực tiếp từ request body mà không qua kiểm tra tính hợp lệ hay lọc các ký tự độc hại (như `../`, `/`). Đoạn mã gốc ghép nối trực tiếp:
   ```ts
   targetDir = workspaceDir.includes("/") ? workspaceDir : `/workspaces/${workspaceDir}`;
   ```
   Nếu kẻ tấn công gửi payload JSON dạng: `{"workspaceDir": "/etc"}` hoặc `{"workspaceDir": "/home/user"}` lên API, hệ thống sẽ chuyển đổi thành đường dẫn tuyệt đối của hệ điều hành, sau đó tiến hành quét đệ quy toàn bộ các file dưới 1MB và hiển thị nội dung các tệp tin cấu hình (`.json`, `.properties`, `.xml`, `.gradle`) trong kết quả phản hồi.

#### Giải pháp & Bản vá (Mitigation & Patch)
Trong phiên bản **v1.3.1**, chúng tôi đã vá triệt để lỗ hổng này bằng 3 cơ chế bảo vệ theo chiều sâu (Defense-in-depth):
1. **Giới hạn IP localhost (`isLocal` Check):** Chỉ cho phép client nội bộ (`127.0.0.1`, `::1`) gọi API thực tế. Chặn các request từ internet bên ngoài để tránh rò rỉ khi deploy trên cloud.
2. **Kiểm duyệt đầu vào nghiêm ngặt qua Zod Schema:** Sử dụng regex `^[a-zA-Z0-9_\-]+$` để ép buộc `workspaceDir` chỉ chứa các ký tự an toàn. Loại bỏ hoàn toàn khả năng sử dụng ký tự phân tách đường dẫn `/` hoặc `..`.
3. **Neo giữ đường dẫn tuyệt đối (Absolute Path Anchoring):** Sử dụng `path.resolve` và đối chiếu ngược lại với thư mục làm việc hiện tại (`process.cwd()`). Bất kỳ đường dẫn nào sau khi giải quyết nằm ngoài thư mục làm việc sẽ lập tức bị hệ thống từ chối (`startsWith(process.cwd())`).

---

Cảm ơn bạn đã đồng hành cùng chúng tôi để giúp cộng đồng an toàn thông tin trở nên tốt đẹp và bảo mật hơn!
