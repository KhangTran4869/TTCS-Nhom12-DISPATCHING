# DOC 6.4-A: TẬP LỆNH DDL CƠ SỞ DỮ LIỆU (DATABASE DDL SCRIPTS)

Tài liệu này giới thiệu tổng quan về tập lệnh định nghĩa dữ liệu (DDL SQL) được sử dụng để xây dựng và chuẩn bị cấu trúc cơ sở dữ liệu quan hệ cho hệ thống quản lý điều phối vận tải.

---

## 1. Cấu Trúc Thư Mục Tập Lệnh

Các tập lệnh thực tế được lưu trữ tập trung tại thư mục [docs/db_scripts/](file:///d:/TTCS-Nhom12-DISPATCHING/docs/db_scripts) bao gồm:

1. [01_create_tables.sql](file:///d:/TTCS-Nhom12-DISPATCHING/docs/db_scripts/01_create_tables.sql): Chứa toàn bộ câu lệnh khởi tạo bảng, định nghĩa kiểu dữ liệu và ràng buộc.
2. [02_create_indexes.sql](file:///d:/TTCS-Nhom12-DISPATCHING/docs/db_scripts/02_create_indexes.sql): Tạo các chỉ mục tối ưu hóa tốc độ tìm kiếm và sắp xếp.
3. [03_insert_reference_data.sql](file:///d:/TTCS-Nhom12-DISPATCHING/docs/db_scripts/03_insert_reference_data.sql): Nhập dữ liệu mẫu ban đầu để chạy thử nghiệm các tính năng.
4. [README.md](file:///d:/TTCS-Nhom12-DISPATCHING/docs/db_scripts/README.md): Hướng dẫn kết nối và chạy các tệp lệnh trên.

---

## 2. Thiết Kế Ràng Buộc & Tính Toàn Vẹn Dữ Liệu (Integrity Constraints)

Tập lệnh DDL được xây dựng chặt chẽ nhằm bảo vệ tính toàn vẹn của dữ liệu dưới các quy tắc sau:

### 2.1. Khóa Chính và Khóa Ngoại (Primary & Foreign Keys)
* Các khóa ngoại được cấu hình tùy chọn hành động thích hợp:
  * `ON DELETE CASCADE`: Khi một tài khoản bị xóa trong bảng `users`, bản ghi tương ứng trong bảng `drivers` sẽ tự động bị xóa theo. Khi một phân công bị hủy trong bảng `dispatch_assignments`, lịch sử vị trí `driver_locations` liên quan cũng sẽ được giải phóng lập tức để tiết kiệm bộ nhớ.
  * `ON DELETE RESTRICT`: Không cho phép xóa một điều phối viên (`users`) nếu tài khoản đó đang liên kết với các đơn phân công xe đang hoạt động trong bảng `dispatch_assignments`.

### 2.2. Kiểm Tra Miền Giá Trị (CHECK Constraints)
* **Quyền hạn người dùng:** `role` bắt buộc phải thuộc danh sách: `admin`, `dispatcher`, `driver`, `manager`.
* **Trạng thái tài xế:** `current_status` chỉ được phép nhận: `available`, `assigned`, `on_trip`, `off`.
* **Thông số vật lý:** Khối lượng hàng hóa (`cargo_weight`), vận tốc di chuyển (`speed`), và sức tải của xe (`capacity`) phải luôn $\ge 0$.
* **Đánh giá chất lượng:** `rating` của tài xế nằm trong đoạn từ `0.0` đến `5.0`.

---

## 3. Quy Trình Chạy Lệnh Khởi Tạo
Để tạo cơ sở dữ liệu thành công, vui lòng truy cập thư mục [docs/db_scripts/](file:///d:/TTCS-Nhom12-DISPATCHING/docs/db_scripts) và chạy các lệnh theo đúng trình tự. Việc chạy sai thứ tự sẽ làm phát sinh lỗi hệ thống do vi phạm các ràng buộc khóa ngoại chưa được khởi tạo.
