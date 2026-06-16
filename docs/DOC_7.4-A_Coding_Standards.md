# DOC 7.4-A: TIÊU CHUẨN VIẾT MÃ (CODING STANDARDS)

Tài liệu này thiết lập các quy ước lập trình (Coding Conventions) và tiêu chuẩn định dạng mã nguồn bắt buộc áp dụng trong toàn dự án nhằm đảm bảo tính nhất quán, dễ đọc và dễ bảo trì mã nguồn giữa các thành viên trong nhóm.

---

## 1. Quy Ước Đặt Tên (Naming Conventions)

Dự án áp dụng các quy tắc đặt tên tiêu chuẩn cho JavaScript và cơ sở dữ liệu:

### 1.1. Trong Mã Nguồn JavaScript/React
* **Tên tệp tin JSX (Components):** Sử dụng quy tắc **PascalCase** (ví dụ: `Login.jsx`, `AdminDashboard.jsx`, `DispatcherDashboard.jsx`).
* **Tên tệp tin JS (Routers/Controllers/Configs):** Sử dụng quy tắc **camelCase** hoặc **PascalCase** đồng bộ theo phân hệ (ví dụ: `authRouters.js`, `db.js`, `UserControllers.js`).
* **Tên lớp/Models (Mongoose models):** Sử dụng quy tắc **PascalCase**, danh từ số ít (ví dụ: `User`, `Driver`, `Vehicle`, `Order`).
* **Tên hàm và biến:** Sử dụng quy tắc **camelCase** (ví dụ: `createOrder`, `updateAssignmentStatus`, `currentUser`, `isCheckingSession`).
* **Hằng số (Constants):** Viết hoa toàn bộ và phân cách bằng dấu gạch dưới (ví dụ: `PORT`, `MONGODB_CONNECTION_STRING`).

### 1.2. Trong Cơ Sở Dữ Liệu (MongoDB / SQL)
* **Tên trường thông tin (Fields/Columns):** Sử dụng quy tắc **snake_case** (ví dụ: `full_name`, `pickup_address`, `plate_number`, `experience_years`).
* **Khóa ngoại/Tham chiếu ngoại:** Sử dụng định dạng `tên_bảng_id` (ví dụ: `user_id`, `order_id`, `driver_id`).

---

## 2. Định Dạng Mã Nguồn (Formatting Rules)

* **Thụt lề (Indentation):** Sử dụng **2 khoảng trắng (2 spaces)**. Tuyệt đối không sử dụng phím Tab cứng để tránh lệch giao diện hiển thị giữa các trình soạn thảo code khác nhau (VS Code, WebStorm).
* **Độ dài dòng tối đa:** Giới hạn từ **80 đến 100 ký tự** trên một dòng. Các dòng code quá dài phải xuống dòng một cách logic.
* **Dấu chấm phẩy (Semicolons):** Bắt buộc sử dụng dấu chấm phẩy `;` kết thúc câu lệnh để tránh các lỗi phân tích cú pháp tự động ngoài ý muốn của JavaScript.
* **Cặp ngoặc nhọn:** Cấu trúc ngoặc nhọn mở `{` nằm cùng dòng với từ khóa khai báo, ngoặc nhọn đóng `}` nằm trên dòng riêng biệt thẳng lề đầu dòng khai báo:
  ```javascript
  if (currentUser) {
    console.log("Chào mừng quay lại");
  } else {
    console.log("Vui lòng đăng nhập");
  }
  ```

---

## 3. Quy Tắc Viết Bình Luận (Commenting Guidelines)

* **Bình luận giải thích thuật toán:** Viết bình luận ngắn gọn trước mỗi hàm xử lý nghiệp vụ phức tạp (như đồng bộ trạng thái đơn hàng, tính toán di chuyển xe) giải thích mục đích, dữ liệu đầu vào và kết quả đầu ra.
* **Bình luận mã nguồn chưa hoàn thiện:** Sử dụng tag `// TODO:` kèm mô tả công việc cần làm tiếp theo ở các tuần sau để các thành viên khác dễ dàng nắm bắt tiến độ.
* **Ngôn ngữ bình luận:** Cho phép viết bình luận bằng tiếng Việt không dấu hoặc tiếng Việt có dấu rõ ràng để các thành viên trong nhóm trao đổi dễ dàng nhất.

---

## 4. Tổ Chức Thư Mục Dự Án (Folder Organization)

Cấu trúc thư mục mã nguồn được phân bổ như sau:

* `/backend/src/config/`: Thiết lập cấu hình hệ thống (kết nối database, cổng mạng).
* `/backend/src/controllers/`: Xử lý logic nghiệp vụ nghiệp vụ API.
* `/backend/src/models/`: Định nghĩa các cấu trúc Schema cơ sở dữ liệu.
* `/backend/src/routes/`: Phân tuyến các API endpoint.
* `/frontend/src/components/`: Tập hợp các React UI Dashboard cho từng vai trò người dùng.
* `/docs/`: Lưu trữ toàn bộ tài liệu phân tích thiết kế của đồ án qua các tuần.
