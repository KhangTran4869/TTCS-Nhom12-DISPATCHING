-- ===============================================================================
-- DỰ ÁN HỆ THỐNG ĐIỀU PHỐI VẬN TẢI (DISPATCHING SYSTEM)
-- FILE: 01_create_tables.sql
-- MÔ TẢ: Khởi tạo cấu trúc các bảng dữ liệu vật lý và ràng buộc toàn vẹn
-- ===============================================================================

-- 1. Bảng người dùng (users)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'dispatcher', 'driver', 'manager')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng tài xế (drivers)
CREATE TABLE drivers (
    driver_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    license_type VARCHAR(10) NOT NULL CHECK (license_type IN ('A1', 'A2', 'B1', 'B2', 'C', 'D', 'E')),
    experience_years INT NOT NULL DEFAULT 0 CHECK (experience_years >= 0),
    current_status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (current_status IN ('available', 'assigned', 'on_trip', 'off')),
    rating DECIMAL(3, 2) NOT NULL DEFAULT 5.0 CHECK (rating >= 0.0 AND rating <= 5.0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_driver_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. Bảng phương tiện (vehicles)
CREATE TABLE vehicles (
    vehicle_id SERIAL PRIMARY KEY,
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type VARCHAR(20) NOT NULL DEFAULT 'truck' CHECK (vehicle_type IN ('motorbike', 'van', 'truck', 'container')),
    capacity DECIMAL(10, 2) NOT NULL CHECK (capacity >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance')),
    current_location VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng đơn hàng (orders)
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    order_code VARCHAR(50) UNIQUE NOT NULL,
    sender_name VARCHAR(100) NOT NULL,
    sender_phone VARCHAR(20) NOT NULL,
    pickup_address VARCHAR(255) NOT NULL,
    pickup_lat DECIMAL(9, 6) NOT NULL,
    pickup_lng DECIMAL(9, 6) NOT NULL,
    receiver_name VARCHAR(100) NOT NULL,
    receiver_phone VARCHAR(20) NOT NULL,
    delivery_address VARCHAR(255) NOT NULL,
    delivery_lat DECIMAL(9, 6) NOT NULL,
    delivery_lng DECIMAL(9, 6) NOT NULL,
    cargo_description TEXT,
    cargo_weight DECIMAL(10, 2) NOT NULL DEFAULT 0.0 CHECK (cargo_weight >= 0),
    requested_pickup_time TIMESTAMP,
    requested_delivery_time TIMESTAMP,
    priority VARCHAR(15) NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'picked_up', 'in_transit', 'arrived', 'delivered', 'cancelled')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bảng phân công điều phối (dispatch_assignments)
CREATE TABLE dispatch_assignments (
    assignment_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    driver_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    dispatcher_id INT NOT NULL,
    assignment_status VARCHAR(20) NOT NULL DEFAULT 'assigned' CHECK (assignment_status IN ('assigned', 'accepted', 'rejected', 'in_progress', 'arrived', 'completed', 'cancelled')),
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    estimated_distance DECIMAL(10, 2),
    actual_distance DECIMAL(10, 2),
    estimated_duration INT, -- tính theo phút
    actual_duration INT,
    note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assign_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    CONSTRAINT fk_assign_driver FOREIGN KEY (driver_id) REFERENCES drivers(driver_id) ON DELETE CASCADE,
    CONSTRAINT fk_assign_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    CONSTRAINT fk_assign_dispatcher FOREIGN KEY (dispatcher_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- 6. Bảng danh sách các điểm dừng chi tiết của tuyến đường (route_points)
CREATE TABLE route_points (
    route_point_id SERIAL PRIMARY KEY,
    assignment_id INT NOT NULL,
    sequence_no INT NOT NULL,
    address VARCHAR(255) NOT NULL,
    lat DECIMAL(9, 6) NOT NULL,
    lng DECIMAL(9, 6) NOT NULL,
    point_type VARCHAR(20) NOT NULL CHECK (point_type IN ('pickup', 'waypoint', 'delivery')),
    CONSTRAINT fk_route_assignment FOREIGN KEY (assignment_id) REFERENCES dispatch_assignments(assignment_id) ON DELETE CASCADE,
    CONSTRAINT uq_route_sequence UNIQUE (assignment_id, sequence_no)
);

-- 7. Bảng lịch sử tọa độ GPS của xe (driver_locations)
CREATE TABLE driver_locations (
    location_id SERIAL PRIMARY KEY,
    assignment_id INT NOT NULL,
    driver_id INT NOT NULL,
    lat DECIMAL(9, 6) NOT NULL,
    lng DECIMAL(9, 6) NOT NULL,
    speed DECIMAL(5, 2) NOT NULL DEFAULT 0.0 CHECK (speed >= 0),
    recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_loc_assignment FOREIGN KEY (assignment_id) REFERENCES dispatch_assignments(assignment_id) ON DELETE CASCADE,
    CONSTRAINT fk_loc_driver FOREIGN KEY (driver_id) REFERENCES drivers(driver_id) ON DELETE CASCADE
);

-- 8. Bảng báo cáo sự cố (incidents)
CREATE TABLE incidents (
    incident_id SERIAL PRIMARY KEY,
    assignment_id INT NOT NULL,
    reported_by INT NOT NULL,
    incident_type VARCHAR(30) NOT NULL DEFAULT 'other' CHECK (incident_type IN ('traffic', 'accident', 'vehicle_breakdown', 'customer_issue', 'other')),
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'processing', 'resolved')),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inc_assignment FOREIGN KEY (assignment_id) REFERENCES dispatch_assignments(assignment_id) ON DELETE CASCADE,
    CONSTRAINT fk_inc_reporter FOREIGN KEY (reported_by) REFERENCES users(user_id) ON DELETE RESTRICT
);
