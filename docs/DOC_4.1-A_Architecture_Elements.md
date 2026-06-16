# DOC 4.1-A: TÀI LIỆU CÁC YẾU TỐ KIẾN TRÚC

Tài liệu này xác định các yêu cầu phi chức năng (Non-Functional Requirements - NFRs) quan trọng và các ràng buộc có ảnh hưởng lớn nhất đến thiết kế kiến trúc của hệ thống quản lý điều phối vận tải (Dispatching Management System).

---

## 1. Các Thuộc Tính Chất Lượng Quan Trọng

Sau khi xem xét các yêu cầu của dự án, 4 thuộc tính chất lượng dưới đây được xác định là then chốt và định hình trực tiếp cấu trúc của hệ thống:

### 1.1. Hiệu năng và Tốc độ Phản hồi (Performance & Responsiveness)
* **NFR tương ứng:** Hệ thống phải xử lý việc cập nhật vị trí và thay đổi trạng thái đơn hàng một cách nhanh chóng. Giao diện điều phối viên phải hiển thị thông tin trực quan gần như tức thì khi có cập nhật từ tài xế.
* **Tại sao nó định hình kiến trúc:** Việc phân công điều phối xe và cập nhật hành trình yêu cầu luồng dữ liệu trôi chảy. Nếu API bị trễ hoặc giao diện React bị gián đoạn, điều phối viên không thể theo dõi chính xác vị trí xe, dẫn đến quyết định phân bổ sai lệch.
* **Ý nghĩa đối với thiết kế:** 
  * Sử dụng API RESTful nhẹ bằng JSON qua giao thức HTTP/HTTPS.
  * Tận dụng khả năng non-blocking I/O của Node.js/Express để xử lý nhiều yêu cầu đồng thời từ tài xế (cập nhật GPS) và điều phối viên (lấy danh sách xe).
  * Phía Client sử dụng React state để render lại các thành phần giao diện một cách cục bộ (partial re-rendering) thay vì tải lại toàn bộ trang.

### 1.2. Tính Sẵn Sàng và Độ Tin Cậy (Availability & Reliability)
* **NFR tương ứng:** Hệ thống cần duy trì hoạt động ổn định trong suốt thời gian làm việc của tài xế và điều phối viên (tối thiểu 99.5% thời gian hoạt động trong giờ hành chính). Dữ liệu phân công không được thất thoát.
* **Tại sao nó định hình kiến trúc:** Nếu hệ thống ngưng hoạt động dù chỉ vài phút, tài xế sẽ không biết đơn hàng tiếp theo ở đâu, không cập nhật được trạng thái hoàn thành, và điều phối viên sẽ mất dấu toàn bộ đội xe.
* **Ý nghĩa đối với thiết kế:**
  * Cơ sở dữ liệu được triển khai trên nền tảng đám mây **MongoDB Atlas** với cấu hình Replica Set tự động chuyển vùng dự phòng (automatic failover) để tránh điểm lỗi đơn lẻ (Single Point of Failure - SPOF) ở tầng lưu trữ.
  * Backend được thiết kế theo dạng không trạng thái (stateless) giúp dễ dàng khởi động lại hoặc nhân bản khi cần thiết mà không mất mát dữ liệu phiên của người dùng.

### 1.3. Bảo Mật và Phân Quyền (Security & Authorization)
* **NFR tương ứng:** Hệ thống có 4 vai trò người dùng rõ ràng (`admin`, `manager`, `dispatcher`, `driver`). Thông tin cá nhân, định vị xe, và mật khẩu tài khoản phải được bảo vệ nghiêm ngặt.
* **Tại sao nó định hình kiến trúc:** Tài xế không được phép xem màn hình quản lý doanh thu hoặc tự ý thay đổi quyền của tài khoản khác; điều phối viên chỉ được phép điều phối đơn hàng; quản lý chỉ được xem báo cáo tổng quan. Việc truy cập API tương ứng phải được kiểm soát chặt chẽ.
* **Ý nghĩa đối với thiết kế:**
  * Sử dụng thư viện `bcrypt` để băm (hash) mật khẩu một chiều trước khi lưu xuống cơ sở dữ liệu.
  * Hệ thống triển khai cơ chế xác thực người dùng dựa trên thông tin phiên lưu trữ. Phía frontend kiểm soát điều hướng dựa trên thuộc tính `role` của `currentUser` lấy từ `localStorage`.
  * Tách biệt các bộ điều khiển (Controllers) và tuyến đường (Routes) theo từng phân hệ chức năng trên Backend.

### 1.4. Khả Năng Bảo Trì và Mở Rộng (Maintainability & Extensibility)
* **NFR tương ứng:** Hệ thống phải dễ dàng nâng cấp, thêm mới loại phương tiện, tích hợp bản đồ số thực tế (như Google Maps hoặc OpenStreetMap) và các dịch vụ bên ngoài trong tương lai.
* **Tại sao nó định hình kiến trúc:** Đây là đồ án môn học được phát triển theo từng giai đoạn tuần. Cấu trúc mã nguồn phải đủ rõ ràng để các thành viên trong nhóm có thể viết mã song song mà không gây xung đột lớn.
* **Ý nghĩa đối với thiết kế:**
  * Áp dụng mẫu kiến trúc phân lớp (Layered Architecture) phân định rõ ràng giữa tầng hiển thị (React Components), tầng định tuyến (Express Routers), tầng xử lý nghiệp vụ (Express Controllers) và tầng truy cập dữ liệu (Mongoose Models).
  * Định nghĩa cấu trúc Schema chặt chẽ cho MongoDB thông qua Mongoose giúp chuẩn hóa dữ liệu đầu vào.

---

## 2. Các Ràng Buộc Chính

Các ràng buộc công nghệ, kinh doanh và nguồn lực dưới đây giới hạn phạm vi lựa chọn thiết kế của dự án:

### 2.1. Ràng Buộc Công Nghệ (Technical Constraint)
* **Mô tả:** Hệ thống bắt buộc phải xây dựng dựa trên stack JavaScript/Node.js, sử dụng **MongoDB Atlas** làm cơ sở dữ liệu lưu trữ (chuỗi kết nối đã được cung cấp trong [databaseinfo.txt](file:///d:/TTCS-Nhom12-DISPATCHING/databaseinfo.txt)).
* **Tại sao nó tồn tại:** Đây là yêu cầu kỹ thuật tiên quyết của đồ án môn học và hạ tầng cơ sở dữ liệu đã được cấu hình sẵn cho nhóm.
* **Hạn chế lựa chọn:** Loại bỏ hoàn toàn khả năng sử dụng các cơ sở dữ liệu quan hệ (như PostgreSQL, SQL Server) và các ngôn ngữ backend phổ biến khác (như Java Spring Boot, Python Django, C# .NET). Kiến trúc bắt buộc phải thiết kế tương thích với mô hình dữ liệu dạng tài liệu (Document-based NoSQL).

### 2.2. Ràng Buộc Triển Khai và Tài Nguyên (Deployment & Resource Constraint)
* **Mô tả:** Hệ thống được chạy thử nghiệm trực tiếp tại môi trường cục bộ (localhost) trên hệ điều hành Windows phục vụ quá trình chấm điểm.
* **Tại sao nó tồn tại:** Dự án chưa có ngân sách cho việc thuê máy chủ đám mây riêng (VPS) để chạy production và cấu hình tên miền chính thức.
* **Hạn chế lựa chọn:** Hạn chế sử dụng các giải pháp hạ tầng phức tạp như Kubernetes, Docker Containerization, hoặc kiến trúc Microservices phân tán (vì sẽ tiêu tốn quá nhiều tài nguyên máy phát triển và tăng độ trễ khi kết nối cơ sở dữ liệu đám mây MongoDB Atlas từ máy cá nhân).

### 2.3. Ràng Buộc Kỹ Năng Nhóm (Team Skills Constraint)
* **Mô tả:** Các thành viên trong nhóm có mức độ làm quen tốt nhất với JavaScript căn bản, HTML, Vanilla CSS và các khái niệm React cơ bản.
* **Tại sao nó tồn tại:** Thời gian thực hiện đồ án có hạn và các thành viên cần tập trung vào việc hoàn thành đầy đủ các chức năng nghiệp vụ điều phối thay vì học các công nghệ quá mới.
* **Hạn chế lựa chọn:** 
  * Sử dụng **Vanilla CSS** (trong file `index.css`) để thiết kế giao diện thay vì áp dụng TailwindCSS hoặc các thư viện component cồng kềnh (Material UI, Ant Design) nhằm tránh mất thời gian cấu hình và xung đột phiên bản.
  * Sử dụng React State kết hợp LocalStorage để quản lý trạng thái đăng nhập đơn giản thay vì triển khai Redux Toolkit hoặc các thư viện quản lý state phức tạp.
  * Sử dụng cơ chế Polling (gọi API định kỳ) từ client để cập nhật tọa độ xe thay vì cài đặt hệ thống WebSockets (Socket.io) phức tạp.
