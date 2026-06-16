# DOC 5.4-A: THIẾT KẾ BẢO MẬT

Tài liệu này xác định các nguyên tắc, kiến trúc và biện pháp bảo mật nhằm bảo vệ dữ liệu hệ thống, ngăn ngừa truy cập trái phép và giảm thiểu các lỗ hổng bảo mật phổ biến.

---

## 1. Thiết Kế Xác Thực (Authentication Design)

Hệ thống điều phối vận tải áp dụng quy trình xác thực dựa trên thông tin đăng nhập và quản lý phiên làm việc ở phía client:

### 1.1. Quy Trình Đăng Nhập (Login Flow)
1. Người dùng nhập Email và Mật khẩu tại giao diện `Login.jsx`.
2. Trình duyệt gửi yêu cầu `POST /api/auth/login` chứa thông tin đăng nhập dưới dạng JSON.
3. Server nhận dữ liệu, tìm kiếm tài khoản người dùng trong collection `users` bằng `email`.
4. Nếu tài khoản tồn tại, server dùng thư viện `bcrypt` so sánh mật khẩu nhập vào với mã băm `password_hash` được lưu trong DB.
5. Nếu mật khẩu khớp và tài khoản có trạng thái `status: "active"`, backend trả về dữ liệu người dùng bao gồm: `_id`, `full_name`, `email`, `role`, và `phone`.
6. Client lưu thông tin người dùng này vào **LocalStorage** (`localStorage.setItem('dispatching_user', ...)`) để duy trì trạng thái đăng nhập trên trình duyệt.

### 1.2. Mã Hóa Mật Khẩu
* Hệ thống tuyệt đối không lưu trữ mật khẩu dưới dạng văn bản thuần (plain text).
* Sử dụng thư viện `bcrypt` (phiên bản `^6.0.0`) thực hiện băm mật khẩu một chiều có kèm muối (salted hashing) trước khi lưu.
* **Salt rounds mặc định:** 10 (mức cân bằng tốt giữa hiệu năng của CPU và độ an toàn trước các cuộc tấn công brute-force).

---

## 2. Thiết Kế Ủy Quyền (Authorization Design)

Hệ thống áp dụng cơ chế kiểm soát truy cập dựa trên vai trò (**Role-Based Access Control - RBAC**). Có 4 vai trò người dùng với các quyền thao tác khác nhau:

### 2.1. Ma Trận Quyền Hạn (Permissions Matrix)

| Vai Trò | Quyền Hạn Trên Hệ Thống | Phạm Vi Giao Diện Dashboard |
| :--- | :--- | :--- |
| **admin** | * Quyền CRUD tài khoản nhân viên và tài xế.<br>* Quyền CRUD danh mục phương tiện (xe). | [AdminDashboard.jsx](file:///d:/TTCS-Nhom12-DISPATCHING/frontend/src/components/AdminDashboard.jsx) |
| **dispatcher**| * Quyền xem và CRUD thông tin đơn hàng.<br>* Quyền chỉ định xe và tài xế (Tạo phân công điều phối).<br>* Quyền xem vị trí xe thời gian thực và quản lý, cập nhật xử lý sự cố. | [DispatcherDashboard.jsx](file:///d:/TTCS-Nhom12-DISPATCHING/frontend/src/components/DispatcherDashboard.jsx) |
| **driver** | * Xem danh sách công việc được giao riêng cho bản thân.<br>* Quyền chấp nhận/từ chối chuyến xe được phân công.<br>* Quyền cập nhật trạng thái đơn hàng (đã nhận hàng, đang di chuyển, hoàn thành).<br>* Gửi tọa độ GPS mô phỏng và báo cáo sự cố phát sinh. | [DriverDashboard.jsx](file:///d:/TTCS-Nhom12-DISPATCHING/frontend/src/components/DriverDashboard.jsx) |
| **manager** | * Quyền xem các báo cáo phân tích, biểu đồ thống kê đơn hàng.<br>* Quyền xem bảng đánh giá hiệu suất (KPI) hoạt động của các tài xế.<br>* Xem tổng quan danh sách toàn bộ các sự cố phát sinh trên đường. | [ManagerDashboard.jsx](file:///d:/TTCS-Nhom12-DISPATCHING/frontend/src/components/ManagerDashboard.jsx) |

### 2.2. Kiểm Soát Quyền Ở Client
Phía React Frontend thực hiện kiểm tra vai trò người dùng thông qua React State `currentUser.role` tại tệp [App.jsx](file:///d:/TTCS-Nhom12-DISPATCHING/frontend/src/App.jsx). Trình duyệt sẽ chỉ render duy nhất component Dashboard tương ứng với vai trò đó. Nếu người dùng cố tình thay đổi thông tin role trong LocalStorage, API Backend vẫn sẽ từ chối xử lý do các truy vấn dữ liệu luôn được lọc/so khớp theo tài khoản đăng nhập được xác thực từ database.

---

## 3. Bảo Vệ Dữ Liệu (Data Protection)

Hệ thống bảo vệ dữ liệu nhạy cảm theo 2 trạng thái:

### 3.1. Dữ Liệu Đang Truyền (Data in Transit)
* Toàn bộ các API gọi từ client đến backend cần được định cấu hình chạy trên giao thức an toàn **HTTPS** khi đưa lên môi trường sản xuất (production) để mã hóa đường truyền tránh các cuộc tấn công nghe lén (Man-in-the-Middle).
* Sử dụng middleware `cors` nhằm hạn chế các yêu cầu API chéo nguồn từ những domain lạ, không nằm trong danh sách tin cậy (whitelist) của hệ thống.

### 3.2. Dữ Liệu Lưu Trữ (Data at Rest)
* Mật khẩu người dùng được băm vĩnh viễn trong DB.
* Các tệp tin cấu hình nhạy cảm như biến môi trường chứa chuỗi kết nối cơ sở dữ liệu (`MONGODB_CONNECTION_STRING` nằm trong tệp `.env`) bắt buộc phải được đưa vào danh sách loại trừ `.gitignore` và không bao giờ được phép đẩy lên kho mã nguồn chung (GitHub).
* Dữ liệu nhật ký hệ thống (System logs) tuyệt đối không ghi lại mật khẩu thô của người dùng hay thông tin nhạy cảm của khách hàng để tránh rò rỉ khi xem log file.

---

## 4. Các Điều Khiển Bảo Mật Cơ Bản (Security Controls)

Hệ thống triển khai các lớp phòng vệ chống lại các hình thức tấn công web phổ biến:

### 4.1. Chống Tấn Công Injection (SQL / NoSQL Injection)
* Backend sử dụng thư viện **Mongoose ODM** để truy xuất cơ sở dữ liệu. Mongoose sử dụng Schema để định kiểu rõ ràng cho dữ liệu và tự động phân tách tham số (parameterize queries), ngăn chặn việc chèn các mã query độc hại từ phía client thông qua input form.
* Tất cả các tham số truyền qua URL (như `:id`) đều được lọc và kiểm tra định dạng hợp lệ của `ObjectId` trước khi thực hiện truy vấn cơ sở dữ liệu.

### 4.2. Xác Thực Dữ Liệu Đầu Vào (Input Validation)
* Client kiểm tra sơ bộ định dạng email hợp lệ, độ dài mật khẩu tối thiểu (từ 6 ký tự trở lên) trước khi cho phép người dùng click Đăng ký/Đăng nhập.
* Backend kiểm tra dữ liệu đầu vào thông qua các thuộc tính của Schema (như `required`, `enum`, `min`, `max`). Mọi dữ liệu không đúng cấu trúc khai báo sẽ bị Mongoose từ chối và trả về lỗi `400 Bad Request` lập tức.

### 4.3. Ngăn Chặn XSS (Cross-Site Scripting)
* React tự động mã hóa (escape) tất cả các biến trước khi hiển thị ra màn hình HTML (data binding), điều này giúp loại bỏ nguy cơ thực thi các thẻ `<script>` độc hại do người dùng nhập vào ô tìm kiếm hoặc trường mô tả sự cố.
