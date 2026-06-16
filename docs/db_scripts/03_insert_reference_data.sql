-- ===============================================================================
-- DỰ ÁN HỆ THỐNG ĐIỀU PHỐI VẬN TẢI (DISPATCHING SYSTEM)
-- FILE: 03_insert_reference_data.sql
-- MÔ TẢ: Nhập dữ liệu mẫu kiểm thử hệ thống (Seed Data)
-- ===============================================================================

-- 1. Thêm tài khoản người dùng mẫu (Băm mật khẩu giả định: 'password123')
INSERT INTO users (full_name, email, phone, password_hash, role, status) VALUES
('Quản trị viên Hệ thống', 'admin@dispatching.com', '0911111111', '$2b$10$xyz...', 'admin', 'active'),
('Điều phối viên A', 'dispatcher@dispatching.com', '0922222222', '$2b$10$xyz...', 'dispatcher', 'active'),
('Tài xế Nguyễn Văn Tài', 'driver1@dispatching.com', '0933333333', '$2b$10$xyz...', 'driver', 'active'),
('Tài xế Trần Văn Lái', 'driver2@dispatching.com', '0944444444', '$2b$10$xyz...', 'driver', 'active'),
('Giám đốc Vận hành', 'manager@dispatching.com', '0955555555', '$2b$10$xyz...', 'manager', 'active');

-- 2. Thêm dữ liệu tài xế tương ứng
-- Lấy id giả lập (giả sử user_id tự tăng là 3 và 4)
INSERT INTO drivers (user_id, license_number, license_type, experience_years, current_status, rating) VALUES
(3, 'G12345678', 'B2', 5, 'available', 4.85),
(4, 'G87654321', 'C', 8, 'available', 4.90);

-- 3. Thêm danh mục xe mẫu
INSERT INTO vehicles (plate_number, vehicle_type, capacity, status, current_location) VALUES
('29C-888.88', 'truck', 3500.00, 'available', 'Kho Hà Nội'),
('30F-999.99', 'van', 1500.00, 'available', 'Kho Hà Nội'),
('51D-777.77', 'container', 18000.00, 'available', 'Kho Hải Phòng');

-- 4. Thêm đơn hàng mẫu
INSERT INTO orders (order_code, sender_name, sender_phone, pickup_address, pickup_lat, pickup_lng, receiver_name, receiver_phone, delivery_address, delivery_lat, delivery_lng, cargo_description, cargo_weight, priority, status) VALUES
('ORD001', 'Công ty Phụ tùng Hòa Phát', '0243123456', 'KCN Thăng Long, Hà Nội', 21.1234, 105.7890, 'Đại lý Kim khí Hải Phòng', '0225123456', 'Cảng Đình Vũ, Hải Phòng', 20.8456, 106.7234, 'Thép cuộn và phụ tùng cơ khí', 2500.00, 'high', 'pending'),
('ORD002', 'Siêu thị Điện máy Chợ Lớn', '0283999999', 'Kho Tổng Sóng Thần, Bình Dương', 10.9023, 106.7321, 'Điểm bán Quận 1, TP.HCM', '0901234567', '123 Trần Hưng Đạo, Quận 1', 10.7624, 106.6823, '10 Máy giặt & 15 Tủ lạnh', 850.00, 'normal', 'pending');

-- 5. Tạo phân công mẫu (Đơn hàng 1 giao cho Tài xế 1 lái Xe 1)
-- Giả sử ID tự tăng: order_id=1, driver_id=1, vehicle_id=1, dispatcher_id=2
INSERT INTO dispatch_assignments (order_id, driver_id, vehicle_id, dispatcher_id, assignment_status, estimated_distance, estimated_duration, note) VALUES
(1, 1, 1, 2, 'assigned', 105.50, 120, 'Giao gấp trước 17:00 ngày hôm nay');

-- 6. Tạo điểm dừng chi tiết cho tuyến đường đơn hàng 1
INSERT INTO route_points (assignment_id, sequence_no, address, lat, lng, point_type) VALUES
(1, 1, 'KCN Thăng Long, Hà Nội', 21.1234, 105.7890, 'pickup'),
(1, 2, 'Trạm Dừng chân Hải Dương', 20.9345, 106.3123, 'waypoint'),
(1, 3, 'Cảng Đình Vũ, Hải Phòng', 20.8456, 106.7234, 'delivery');
