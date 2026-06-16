# DATABASE INITIALIZATION SCRIPTS

Thư mục này chứa các tệp lệnh SQL dùng để khởi tạo và cấu hình cơ sở dữ liệu cho hệ thống điều phối vận tải.

## Thứ Tự Thực Thi

Để tránh các lỗi ràng buộc khóa ngoại (Foreign Key Constraints), bạn bắt buộc phải thực thi các tệp lệnh theo đúng thứ tự sau:

1. **`01_create_tables.sql`**: Tạo cấu trúc các bảng và thiết lập các khóa chính, khóa ngoại.
2. **`02_create_indexes.sql`**: Tạo các chỉ mục tối ưu hóa tìm kiếm và truy vấn phức hợp.
3. **`03_insert_reference_data.sql`**: Thêm dữ liệu cấu hình mẫu (Seed Data) để hệ thống chạy thử nghiệm.

## Hướng Dẫn Thực Thi (PostgreSQL CLI)

Sử dụng terminal hoặc công cụ pgAdmin để chạy các tập lệnh:

```bash
# 1. Khởi tạo bảng
psql -U postgres -d dispatching_db -f 01_create_tables.sql

# 2. Khởi tạo chỉ mục
psql -U postgres -d dispatching_db -f 02_create_indexes.sql

# 3. Nhập dữ liệu mẫu
psql -U postgres -d dispatching_db -f 03_insert_reference_data.sql
```
