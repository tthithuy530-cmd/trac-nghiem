# Triển khai GitHub Pages + Firebase Spark (miễn phí)
## Cách hoạt động
- Giao diện trò chơi chạy trên GitHub Pages; không cần backend tự host.
- Firebase Authentication (Anonymous) tạo phiên ẩn danh phía sau, người chơi **chỉ nhập tên**.
- Cloud Firestore là database chung giữa các máy, bảng xếp hạng cập nhật theo thời gian thực.
- Hai người nhập tên giống nhau trên **hai thiết bị khác nhau** là hai UID riêng, vì tên không phải định danh được xác thực. Trên cùng trình duyệt, phiên Firebase được duy trì qua lần tải trang.
- Firebase dùng NoSQL (Firestore), **không phải SQLite**.
- Cấu hình Web App (apiKey...) là dữ liệu client được phép công khai; không bao giờ đặt service account/private key ở frontend.
- **Không có xác minh đáp án server-side** trong Spark thuần. Firestore Rules kiểm tra phạm vi và quyền chỉnh sửa, nhưng người có chủ ý có thể giả mạo thành tích. Không dùng bảng xếp hạng này cho cuộc thi có giải thưởng thật.

## Bước 1. Tạo Firebase miễn phí
1. Mở https://console.firebase.google.com/ và tạo một Firebase project.
2. Chọn gói **Spark (No-cost)** và **không liên kết tài khoản thanh toán**.
3. Project settings (biểu tượng bánh răng) > Your apps > Add app > Web (</>), đăng ký ứng dụng.
4. Sao chép thông tin firebaseConfig gồm `apiKey`, `authDomain`, `projectId`, `appId`.
5. Điền bốn giá trị vào `E:\trac-nghiem\firebase-config.js`.

## Bước 2. Bật đăng nhập ẩn danh
Authentication > Sign-in method > Anonymous > Enable.

Đây là đăng nhập hệ thống tự động; trang web **không yêu cầu người chơi có tài khoản Firebase**.

## Bước 3. Tạo Firestore và cấu hình Security Rules
Firestore Database > Create database > chọn Standard Edition, chế độ sản xuất, chọn vùng thuận tiện.
Firestore Database > Rules: dán **toàn bộ** nội dung file `E:\trac-nghiem\firestore.rules` và chọn Publish.

Nếu bỏ qua Rules, chức năng tạo hồ sơ và lưu điểm sẽ báo `Missing or insufficient permissions`.
Các quy tắc chỉ cho UID sửa hồ sơ của mình, giới hạn điểm/thời gian và không cho đọc toàn bộ lịch sử lượt chơi của người khác. Không thể chống gian lận hoàn toàn với JavaScript công khai.

## Bước 4. Triển khai GitHub Pages
Chạy một server local trong thư mục `E:\trac-nghiem` để thử trên máy:
```powershell
cd E:\trac-nghiem
python -m http.server 8000
```
Mở `http://localhost:8000`. Đừng chạy bằng file://, trình duyệt có thể chặn module JavaScript.

Firebase Authentication > Settings > Authorized domains: nếu domain GitHub Pages chưa có, thêm `USERNAME.github.io` (chỉ hostname, không kèm https:// hoặc đường dẫn repo). Để chạy ở localhost, thêm `localhost` nếu chưa được cho phép.

Đẩy code lên GitHub nhánh `main`. File `.github/workflows/pages.yml` đã được cập nhật để xuất bản `firebase-config.js`, `account.js` và `account.css`.
Không cần deploy server, Cloudflare, Wrangler hay GitHub Secret.

## Thử nghiệm nhiều thiết bị
1. Máy A truy cập website, nhập tên Minh, chơi một lượt.
2. Máy B truy cập cùng URL, nhập Nam.
3. Máy B sẽ thấy điểm của Minh trên bảng xếp hạng trực tuyến.
4. Cả hai chỉ cần trang web + kết nối Internet, không cần đăng ký tài khoản.

## Giới hạn cần biết
- Một nickname không xác minh được chủ sở hữu. Cùng tên trên nhiều máy sẽ tạo nhiều hồ sơ khác nhau.
- Đổi tên trong cùng trình duyệt sẽ khởi tạo một UID ẩn danh mới để bảo toàn kết quả cũ.
- Nếu người dùng xóa dữ liệu đăng nhập của trình duyệt, có thể mất khả năng quản lý hồ sơ cũ.
- Firestore Spark có quota; vượt giới hạn có thể bị tạm ngừng tính năng đến khi quota được đặt lại. Tránh nâng cấp lên Blaze nếu muốn không bị tính tiền.
- Không có service-side anti-cheat; người cố ý có thể can thiệp mã frontend hoặc yêu cầu mạng.
