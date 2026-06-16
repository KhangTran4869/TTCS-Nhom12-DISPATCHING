# TÓM TẮT GIAI ĐOẠN 1: PHÂN TÍCH YÊU CẦU (TUẦN 1 - TUẦN 3)
*Dự án: Hệ thống Quản lý Điều phối Vận tải (Dispatching Management System)*

---

## 1. Tầm Nhìn & Phạm Vi Dự Án (DOC 1.1-A)
* **Vấn đề cốt lõi:** Quy trình điều phối vận tải thủ công cũ gây chậm trễ, khó kiểm soát hành trình xe, mất dấu vết sự cố trên đường và thiếu dữ liệu thống kê KPI của tài xế.
* **Mục tiêu chính:** Tự động hóa kết nối xe - tài xế - đơn hàng; giám sát hành trình thời gian thực; ghi nhận và xử lý sự cố tức thời; thống kê tự động hiệu suất vận tải.
* **Ranh giới phạm vi:**
  * **Trong phạm vi:** Xác thực người dùng; CRUD Đơn hàng, Phương tiện, Tài khoản; Tạo phân công xe; Giả lập định vị GPS; Báo cáo & Xử lý sự cố; Dashboard KPI cho Quản lý.
  * **Ngoài phạm vi:** Thanh toán trực tuyến; Tự động tối ưu lộ trình bằng AI; Định vị qua GPS phần cứng độc lập (sử dụng giả lập phần mềm từ Driver Dashboard).

## 2. Người Dùng & Bên Liên Quan (DOC 1.2-A, DOC 1.2-B)
* **Bên liên quan chính:** Giảng viên (Phê duyệt yêu cầu), Nhóm phát triển 12 (Thực hiện thiết kế & lập trình).
* **Persona người dùng (4 Vai trò chính):**
  1. **Admin (Quản trị viên):** Quản lý tài khoản nhân viên và danh mục đội xe.
  2. **Dispatcher (Điều phối viên):** Tiếp nhận đơn hàng, gán xe/tài xế, theo dõi lộ trình và xử lý sự cố.
  3. **Driver (Tài xế):** Xem nhiệm vụ, cập nhật trạng thái đơn hàng, mô phỏng vị trí GPS và báo cáo sự cố.
  4. **Manager (Quản lý):** Theo dõi KPIs, biểu đồ hoàn thành đơn hàng và báo cáo hiệu suất tài xế.

## 3. Bối Cảnh & Trường Hợp Sử Dụng (DOC 1.3-A, DOC 2.1-A, DOC 2.1-B)
* **Bối cảnh hệ thống:** Hệ thống nhận dữ liệu đơn hàng và định vị từ Tài xế/Khách hàng, xử lý trung tâm và hiển thị bản đồ trực quan cho Điều phối viên, đồng thời xuất báo cáo cho Quản lý.
* **Danh mục 6 Trường hợp sử dụng (Use Cases) cốt lõi:**
  * **UC-001 (Đăng nhập):** Xác thực người dùng đăng nhập hệ thống.
  * **UC-002 (Quản lý Đơn hàng):** Tạo, sửa, xóa thông tin vận chuyển.
  * **UC-003 (Điều phối Phương tiện):** Phân công tài xế và xe trống cho đơn hàng chờ xử lý.
  * **UC-004 (Cập nhật Hành trình & GPS):** Tài xế gửi vị trí và tiến độ giao hàng về server.
  * **UC-005 (Báo cáo Sự cố):** Tài xế gửi thông tin tai nạn/hỏng xe; Điều phối viên duyệt xử lý.
  * **UC-006 (Thống kê Hiệu suất):** Xuất báo cáo đơn hàng và chấm điểm đánh giá tài xế.

## 4. Quy Trình & Mô Hình Dữ Liệu Khái Niệm (DOC 2.2-A, DOC 2.3-A)
* **Quy trình nghiệp vụ chính:** Đơn hàng được tạo (`pending`) $\rightarrow$ Phân công xe (`assigned`) $\rightarrow$ Tài xế chấp nhận, bắt đầu đi (`in_transit`, cập nhật GPS liên tục) $\rightarrow$ Hoàn thành giao hàng (`delivered`). Sự cố có thể phát sinh khi đang di chuyển và được giải quyết độc lập.
* **Mô hình ERD khái niệm (7 Thực thể chính):**
  * `User` (Thông tin tài khoản) $\leftrightarrow$ `Driver` (Thông tin tài xế chuyên môn).
  * `Vehicle` (Phương tiện vận tải) $\leftrightarrow$ `Order` (Đơn hàng cần giao).
  * `DispatchAssignment` (Bảng trung tâm gán đơn - xe - tài xế - điều phối viên).
  * `DriverLocation` (Nhật ký tọa độ xe) $\leftrightarrow$ `Incident` (Nhật ký báo cáo sự cố).

## 5. Yêu Cầu Chức Năng & Phi Chức Năng (DOC 3.1-A, DOC 3.2-A, DOC 3.3-A/B)
* **Yêu cầu chức năng:** Hệ thống phải hỗ trợ phân quyền truy cập Dashboard theo Role; tính toán tự động khoảng cách lộ trình; tự động giải phóng tài xế/xe khi hoàn thành đơn; ghi nhận tọa độ GPS mỗi 10 giây.
* **Yêu cầu phi chức năng:** Thời gian phản hồi API dưới 2 giây; mật khẩu được mã hóa an toàn qua bcrypt; hệ thống hoạt động ổn định 24/7; hỗ trợ hiển thị responsive trên các thiết bị di động của tài xế.
* **Wireframes & Điều hướng:** 6 màn hình chính kết nối tuyến tính (Login/Register $\rightarrow$ Bảng điều khiển riêng biệt tương ứng cho từng vai trò người dùng).
