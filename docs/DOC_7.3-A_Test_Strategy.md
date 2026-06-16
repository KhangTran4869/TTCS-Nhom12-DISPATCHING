# DOC 7.3-A: CHIẾN LƯỢC KIỂM THỬ (TEST STRATEGY)

Tài liệu này định nghĩa chiến lược, phương pháp tiếp cận và danh mục các kịch bản kiểm thử (Test Cases) nhằm đảm bảo hệ thống quản lý điều phối vận tải hoạt động ổn định và đáp ứng đầy đủ các yêu cầu nghiệp vụ.

---

## 1. Cách Tiếp Cận Kiểm Thử (Testing Approach)

Hệ thống được kiểm thử thông qua 3 cấp độ bổ trợ lẫn nhau:

1. **Kiểm thử đơn vị (Unit Testing):** Tập trung kiểm tra các hàm xử lý logic nghiệp vụ độc lập tại Backend (đặc biệt là các logic băm mật khẩu, chuyển đổi trạng thái của Mongoose Schema và tính toán tọa độ GPS mô phỏng).
2. **Kiểm thử tích hợp (Integration Testing):** Kiểm tra hoạt động của các REST API endpoint bằng cách mô phỏng các yêu cầu HTTP gửi tới server và xác nhận cấu trúc dữ liệu phản hồi cùng mã trạng thái (HTTP status codes).
3. **Kiểm thử thủ công (Manual End-to-End Testing):** Kiểm thử toàn bộ quy trình nghiệp vụ thông qua tương tác trực tiếp trên giao diện React (từ tạo đơn, phân xe đến cập nhật GPS xe di chuyển thực tế trên bản đồ).

* **Mục tiêu độ bao phủ mã nguồn (Code Coverage Target):** Tối thiểu **70%** các nhánh logic trong tầng Services và Controllers trên Backend.

---

## 2. Kịch Bản Kiểm Thử (Test Scenarios Catalog)

### 2.1. Kiểm Thử Đơn Vị (Unit Test Scenarios)
* **UT-01 (Xác thực mật khẩu):** Kiểm tra hàm băm `bcrypt.hash` sinh chuỗi chính xác và hàm `bcrypt.compare` trả về `true` khi khớp mật khẩu gốc.
* **UT-02 (Ràng buộc Schema Đơn hàng):** Gửi bản ghi tạo đơn hàng thiếu trường `order_code`, xác nhận Mongoose ném ra lỗi validation lỗi.
* **UT-03 (Trọng tải xe hợp lệ):** Tạo xe mới với dung tích `capacity` âm, xác nhận Schema ném lỗi `min constraint`.
* **UT-04 (Xác nhận tọa độ GPS hợp lệ):** Ghi nhận tọa độ GPS có `lat: 120` (vượt quá 90 độ vĩ bắc), xác nhận Schema DriverLocation trả về lỗi validation.
* **UT-05 (Đánh giá tài xế):** Cập nhật `rating` của tài xế bằng 6, xác nhận lỗi vượt quá giá trị cực đại (max: 5).

### 2.2. Kiểm Thử Tích Hợp (Integration Test Scenarios - API Testing)
* **IT-01 (Đăng ký tài khoản):** Gọi `POST /api/auth/register` với thông tin đầy đủ, nhận phản hồi `201 Created` kèm theo dữ liệu user đã ẩn mật khẩu.
* **IT-02 (Trùng lặp email):** Đăng ký tài khoản có email đã tồn tại, nhận phản hồi `400 Bad Request` kèm thông điệp báo trùng email.
* **IT-03 (Đăng nhập sai):** Gọi `POST /api/auth/login` với mật khẩu sai, nhận phản hồi `400 Bad Request`.
* **IT-04 (Tạo đơn hàng):** Gọi `POST /api/orders` với cấu trúc JSON đầy đủ, nhận phản hồi `201 Created` và trạng thái đơn hàng là `pending`.
* **IT-05 (Giao xe bận):** Tạo phân công cho một tài xế có `current_status = "on_trip"`, nhận phản hồi lỗi `400 Bad Request` cảnh báo tài xế đang bận.
* **IT-06 (Cập nhật vị trí GPS):** Gọi `POST /api/driver-locations` truyền tọa độ xe, nhận phản hồi `201 Created`.

### 2.3. Kiểm Thử Thủ Công Giao Diện (Manual UI Test Scenarios)
* **MT-01 (Đăng nhập đa vai trò):** Đăng nhập lần lượt bằng tài khoản `admin`, `dispatcher`, `driver`, `manager`. Kiểm tra xem hệ thống có điều hướng chính xác vào Dashboard tương ứng hay không.
* **MT-02 (Quy trình Điều phối đơn hàng):**
  * Điều phối viên tạo đơn hàng mới $\rightarrow$ Đơn hàng hiển thị ở tab "Chờ phân công".
  * Thực hiện gán tài xế và phương tiện cho đơn hàng $\rightarrow$ Đơn hàng chuyển sang tab "Đang giao".
* **MT-03 (Quy trình Tài xế chạy đơn):**
  * Tài xế đăng nhập $\rightarrow$ Thấy đơn hàng được phân công hiển thị trên màn hình.
  * Tài xế nhấn "Chấp nhận" $\rightarrow$ Nhấn "Đang di chuyển" $\rightarrow$ GPS mô phỏng bắt đầu cập nhật.
  * Kiểm tra xem trên màn hình Dispatcher xe có di chuyển thực tế trên bản đồ hay không.
  * Tài xế nhấn "Hoàn thành giao hàng" $\rightarrow$ Đơn hàng chuyển sang trạng thái Delivered. Xe và tài xế tự động trở lại trạng thái sẵn sàng để phân công tiếp.

---

## 3. Công Cụ Kiểm Thử (Testing Tools)

* **Kiểm thử API:** Sử dụng công cụ **Postman** để thiết lập tập hợp các request (collection) kiểm tra tự động các API.
* **Kiểm thử thủ công UI:** Sử dụng trình duyệt Chrome kết hợp công cụ **Chrome DevTools** (Tab Network để kiểm tra tốc độ phản hồi API, tab Console để theo dõi lỗi JavaScript phát sinh).

---

## 4. Ví Dụ Trường Hợp Kiểm Thử Chi Tiết (Detailed Test Case Example)

### **Test Case ID: TC-001 (Điều Phối Xe Thành Công)**
* **Mô tả:** Kiểm tra tính năng tạo phân công xe từ màn hình Dispatcher Dashboard.
* **Tiền điều kiện:** 
  * Đơn hàng `ORD100` ở trạng thái `pending`.
  * Tài xế `Nguyen Van Tai` ở trạng thái `available`.
  * Xe tải `29C-888.88` ở trạng thái `available`.
* **Các bước thực hiện:**
  1. Đăng nhập vào hệ thống bằng tài khoản `dispatcher@dispatching.com`.
  2. Tại màn hình điều phối, chọn đơn hàng `ORD100`.
  3. Chọn tài xế `Nguyen Van Tai` từ danh sách tài xế trống.
  4. Chọn xe `29C-888.88` từ danh sách xe trống.
  5. Bấm nút "Phân công vận chuyển".
* **Kết quả mong đợi:**
  * Hệ thống hiển thị thông báo nổi "Phân công vận chuyển thành công".
  * Đơn hàng chuyển sang trạng thái `assigned`.
  * Trạng thái tài xế `Nguyen Van Tai` chuyển sang `assigned`.
  * Trạng thái xe `29C-888.88` chuyển sang `in_use`.
  * Bản ghi mới được ghi nhận thành công trong cơ sở dữ liệu `dispatch_assignments`.
