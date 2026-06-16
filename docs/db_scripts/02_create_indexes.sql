-- ===============================================================================
-- DỰ ÁN HỆ THỐNG ĐIỀU PHỐI VẬN TẢI (DISPATCHING SYSTEM)
-- FILE: 02_create_indexes.sql
-- MÔ TẢ: Khởi tạo các chỉ mục vật lý (Indexes) tối ưu hóa hiệu năng truy vấn
-- ===============================================================================

-- 1. Chỉ mục cho bảng drivers (tìm kiếm tài xế nhanh theo user_id)
CREATE INDEX idx_drivers_user ON drivers(user_id);

-- 2. Chỉ mục trạng thái đơn hàng (phục vụ lọc danh sách ở các tab Dashboard)
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_code ON orders(order_code);

-- 3. Chỉ mục khóa ngoại bảng dispatch_assignments (phục vụ JOIN)
CREATE INDEX idx_assign_order ON dispatch_assignments(order_id);
CREATE INDEX idx_assign_driver ON dispatch_assignments(driver_id);
CREATE INDEX idx_assign_vehicle ON dispatch_assignments(vehicle_id);
CREATE INDEX idx_assign_dispatcher ON dispatch_assignments(dispatcher_id);
CREATE INDEX idx_assign_status ON dispatch_assignments(assignment_status);

-- 4. Chỉ mục khóa ngoại bảng route_points
CREATE INDEX idx_route_assign ON route_points(assignment_id);

-- 5. Chỉ mục phức hợp (Compound Index) tối ưu hóa truy vấn lịch sử hành trình
-- Phục vụ truy vấn: Lấy danh sách tọa độ mới nhất của chuyến xe cụ thể theo thứ tự thời gian giảm dần
CREATE INDEX idx_loc_history ON driver_locations(assignment_id, driver_id, recorded_at DESC);

-- 6. Chỉ mục khóa ngoại bảng incidents
CREATE INDEX idx_inc_assignment ON incidents(assignment_id);
CREATE INDEX idx_inc_reporter ON incidents(reported_by);
CREATE INDEX idx_inc_status ON incidents(status);
