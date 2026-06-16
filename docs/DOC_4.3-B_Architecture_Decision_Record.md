# DOC 4.3-B: BẢN GHI QUYẾT ĐỊNH KIẾN TRÚC (ADR)

Tài liệu này ghi lại các quyết định thiết kế kiến trúc quan trọng trong quá trình phát triển hệ thống điều phối vận tải, bối cảnh đưa ra quyết định, các phương án thay thế được xem xét và lý do lựa chọn phương án cuối cùng.

---

## ADR-01: Lựa Chọn Mẫu Kiến Trúc Layered (3-Tier) Kết Hợp REST API

* **Trạng thái:** Đã phê duyệt (Approved)
* **Người thực hiện:** Nhóm Phát Triển 12

### 1. Bối Cảnh (Context)
Dự án cần có sự tách biệt rõ ràng giữa giao diện người dùng và logic nghiệp vụ. Điều phối viên cần tương tác trên một giao diện mượt mà và trực quan, trong khi máy chủ backend cần xử lý các cập nhật vị trí, xử lý trạng thái và tính toán thống kê mà không làm ảnh hưởng đến trải nghiệm người dùng. Chúng ta cần một cấu trúc mã nguồn dễ hiểu, cho phép phân chia công việc cho các thành viên trong nhóm phát triển đồng thời.

### 2. Quyết Định (Decision)
* Frontend được xây dựng dưới dạng ứng dụng đơn trang (Single Page Application - SPA) sử dụng **React**.
* Backend sử dụng **Node.js/Express.js** làm máy chủ REST API độc lập để phục vụ các yêu cầu dữ liệu thông qua định dạng JSON.
* Phía Backend áp dụng mô hình phân lớp rõ rệt: **Route** (Định tuyến API) -> **Controller** (Xử lý logic nghiệp vụ) -> **Model** (Truy cập dữ liệu qua Mongoose).

### 3. Các Lựa Chọn Thay Thế (Alternatives)
* **Server-Side Rendering (SSR) truyền thống (MVC):** Sử dụng Node.js kết hợp template engine (như EJS hoặc Pug) để render giao diện trực tiếp từ server và trả về HTML tĩnh cho client.
* **Kiến trúc Microservices:** Chia tách các chức năng (User, Order, Location) thành các dịch vụ độc lập chạy trên các cổng khác nhau.

### 4. Lý Giải Lựa Chọn (Rationale)
* So với SSR: SSR yêu cầu tải lại trang (reload) khi chuyển đổi trạng thái hoặc gửi biểu mẫu. Đối với màn hình điều phối và theo dõi vị trí xe, việc reload liên tục là không thể chấp nhận được. React SPA giúp giao diện phản hồi cực mượt và cập nhật dữ liệu cục bộ một cách trơn tru.
* So với Microservices: Microservices quá phức tạp đối với quy mô đồ án sinh viên và giới hạn tài nguyên máy phát triển cục bộ. Nó yêu cầu thiết lập API Gateway, xử lý giao tiếp nội bộ dịch vụ và đồng bộ dữ liệu phức tạp. Kiến trúc Layered trong một dự án Monolith là lựa chọn cân bằng tốt nhất giữa độ phức tạp và khả năng triển khai nhanh.

---

## ADR-02: Lựa Chọn Cơ Sở Dữ Liệu Tài Liệu MongoDB Thay Vì Cơ Sở Dữ Liệu Quan Hệ (SQL)

* **Trạng thái:** Đã phê duyệt (Approved)
* **Người thực hiện:** Nhóm Phát Triển 12

### 1. Bối Cảnh (Context)
Dữ liệu của hệ thống điều phối có các cấu trúc lồng nhau phức tạp. Ví dụ: đơn hàng cần lưu tọa độ nhận/giao dạng `{ lat, lng }`, phân công cần lưu mảng động các điểm trung chuyển (`route_points` với `address`, `lat`, `lng`, `sequence_no` thay đổi theo từng đơn hàng), và vị trí tài xế gửi về liên tục dạng danh sách tọa độ lịch sử. Nếu sử dụng cơ sở dữ liệu quan hệ (SQL), việc thiết kế bảng và join dữ liệu sẽ trở nên phức tạp.

### 2. Quyết Định (Decision)
Sử dụng **MongoDB Atlas** (Cloud Database NoSQL) làm cơ sở dữ liệu chính, giao tiếp qua thư viện **Mongoose ODM** ở Backend để áp đặt Schema validation ở tầng ứng dụng.

### 3. Các Lựa Chọn Thay Thế (Alternatives)
* **PostgreSQL / MySQL:** Hệ quản trị cơ sở dữ liệu quan hệ truyền thống.

### 4. Lý Giải Lựa Chọn (Rationale)
* MongoDB lưu trữ dữ liệu dưới dạng JSON (BSON), hoàn toàn khớp với định dạng dữ liệu JavaScript ở cả Frontend lẫn Backend, giúp giảm thiểu tối đa bước chuyển đổi định dạng (mapping).
* Các cấu trúc mảng điểm hành trình (`route_points`) và dữ liệu tọa độ địa lý được lưu trữ trực tiếp dưới dạng đối tượng lồng nhau (Embedded Documents) bên trong bản ghi chính. Điều này giúp loại bỏ nhu cầu thiết kế các bảng trung gian phức tạp và các câu lệnh `JOIN` tốn tài nguyên, tăng tốc độ truy vấn và đơn giản hóa mã nguồn xử lý.
* Khả năng thay đổi Schema linh hoạt của MongoDB rất phù hợp cho quá trình phát triển nhanh (Agile) của đồ án, nơi các yêu cầu thuộc tính của đơn hàng hoặc phương tiện có thể bổ sung trong các tuần tiếp theo.

---

## ADR-03: Sử Dụng Cơ Chế Polling Cho Theo Dõi Vị Trí Và Trạng Thái Thay Vì WebSockets

* **Trạng thái:** Đã phê duyệt (Approved)
* **Người thực hiện:** Nhóm Phát Triển 12

### 1. Bối Cảnh (Context)
Để điều phối viên giám sát được hành trình của tài xế gần với thời gian thực trên bản đồ, hệ thống cần cơ chế cập nhật liên tục vị trí địa lý của xe. Chúng ta cần một phương pháp truyền thông điệp hiệu quả, dễ cài đặt và ổn định cao trên môi trường localhost.

### 2. Quyết Định (Decision)
* Phía Driver Dashboard sẽ sử dụng một bộ định thời (Interval Timer) để tự động gọi API `POST /api/driver-locations` gửi tọa độ mô phỏng lên server mỗi 10 giây khi chuyến đi bắt đầu (`in_progress`).
* Phía Dispatcher Dashboard sẽ sử dụng cơ chế **Short Polling** (gọi API `GET /api/driver-locations/latest/:driverId` mỗi 8-10 giây) để lấy tọa độ mới nhất và cập nhật vị trí marker trên bản đồ hiển thị.

### 3. Các Lựa Chọn Thay Thế (Alternatives)
* **WebSockets (Socket.io):** Kết nối hai chiều liên tục giữa client và server để truyền tọa độ ngay lập tức khi tài xế di chuyển.
* **Server-Sent Events (SSE):** Kết nối một chiều từ server để đẩy tọa độ xuống client.

### 4. Lý Giải Lựa Chọn (Rationale)
* Socket.io đòi hỏi cài đặt máy chủ websocket riêng, quản lý kết nối sống (keep-alive), xử lý lỗi khi mất kết nối mạng và tiêu tốn tài nguyên bộ nhớ lớn trên server cục bộ. Điều này làm tăng đáng kể độ phức tạp của mã nguồn backend.
* Đối với một đồ án quản lý vận tải mô phỏng, độ trễ 8-10 giây của Polling là hoàn toàn chấp nhận được và không ảnh hưởng đến nghiệp vụ. Việc sử dụng API HTTP tiêu chuẩn giúp dễ dàng gỡ lỗi, kiểm tra dữ liệu qua Chrome Network tab, và giúp backend hoạt động ổn định mà không lo rò rỉ bộ nhớ (memory leak) do quản lý socket socket-pool lỗi.
