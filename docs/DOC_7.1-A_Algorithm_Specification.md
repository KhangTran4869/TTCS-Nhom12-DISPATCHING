# DOC 7.1-A: ĐẶC TẢ THUẬT TOÁN (ALGORITHM SPECIFICATION)

Tài liệu này đặc tả chi tiết 2 thuật toán cốt lõi xử lý các logic nghiệp vụ quan trọng trong hệ thống quản lý điều phối vận tải, bao gồm mã giả (pseudo-code) và giải thích luồng thực thi.

---

## 1. Thuật Toán 1: Đồng Bộ Trạng Thái Hệ Thống Khi Cập Nhật Phân Công (Status Syncing State Machine)

* **Vị trí triển khai:** Hàm `updateAssignmentStatus` trong tệp [DispatchAssignmentControllers.js](file:///d:/TTCS-Nhom12-DISPATCHING/backend/src/controllers/DispatchAssignmentControllers.js).
* **Mục đích:** Đảm bảo khi trạng thái phân công xe thay đổi (chấp nhận chuyến, đang đi, hoàn thành, hủy...), trạng thái của Đơn hàng (Order), Tài xế (Driver), và Xe (Vehicle) tương ứng sẽ tự động chuyển đổi đồng bộ, duy trì tính nhất quán của cơ sở dữ liệu.
* **Đầu vào:**
  * `assignment_id` (Mã phân công cần cập nhật).
  * `new_status` (Trạng thái phân công mới nhận từ Client: `"accepted"`, `"rejected"`, `"in_progress"`, `"arrived"`, `"completed"`, `"cancelled"`).
* **Đầu ra:** Bản ghi phân công đã cập nhật trạng thái mới hoặc thông báo lỗi nếu thất bại.

### Mã Giả Thuật Toán (Pseudo-code)

```text
THUẬT TOÁN: CapNhatTrangThaiPhanCong(assignment_id, new_status)
    // 1. Tìm bản ghi phân công trong Database
    assignment = TimPhanCongTheoId(assignment_id)
    NẾU assignment KHÔNG TỒN TẠI THÌ
        TRẢ VỀ LỖI "Không tìm thấy phân công (404)"
    KẾT THÚC NẾU

    // 2. Cập nhật trạng thái phân công
    assignment.assignment_status = new_status

    // 3. Thực hiện chuyển đổi trạng thái đồng bộ
    LỰA CHỌN THEO new_status:
        TRƯỜNG HỢP "in_progress":
            assignment.start_time = ThoiGianHienTai()
            CapNhatDonHang(assignment.order_id, status = "in_transit")
            CapNhatTaiXe(assignment.driver_id, current_status = "on_trip")
            
        TRƯỜNG HỢP "arrived":
            CapNhatDonHang(assignment.order_id, status = "arrived")
            
        TRƯỜNG HỢP "completed":
            assignment.end_time = ThoiGianHienTai()
            CapNhatDonHang(assignment.order_id, status = "delivered")
            CapNhatTaiXe(assignment.driver_id, current_status = "available")
            CapNhatPhuongTien(assignment.vehicle_id, status = "available")
            
        TRƯỜNG HỢP "cancelled":
            CapNhatDonHang(assignment.order_id, status = "cancelled")
            CapNhatTaiXe(assignment.driver_id, current_status = "available")
            CapNhatPhuongTien(assignment.vehicle_id, status = "available")
            
        TRƯỜNG HỢP "rejected":
            CapNhatDonHang(assignment.order_id, status = "pending")
            CapNhatTaiXe(assignment.driver_id, current_status = "available")
            CapNhatPhuongTien(assignment.vehicle_id, status = "available")
    KẾT THÚC LỰA CHỌN

    // 4. Lưu tất cả thay đổi xuống Database
    LuuBanGhi(assignment)
    TRẢ VỀ "Cập nhật thành công" kèm theo assignment
KẾT THÚC THUẬT TOÁN
```

---

## 2. Thuật Toán 2: Giả Lập Định Vị GPS Trên Tuyến Đi (GPS Location Simulation)

* **Vị trí triển khai:** Hàm `simulateGPSMovement` trong tệp [DriverDashboard.jsx](file:///d:/TTCS-Nhom12-DISPATCHING/frontend/src/components/DriverDashboard.jsx).
* **Mục đích:** Giả lập hành trình của tài xế di chuyển từ Điểm nhận (Pickup) tới Điểm giao (Delivery) bằng cách tự động sinh các tọa độ lat/lng trung gian trên đường thẳng và gửi API cập nhật vị trí lên server định kỳ.
* **Đầu vào:**
  * `start_loc` (Tọa độ bắt đầu: `{ lat, lng }`).
  * `end_loc` (Tọa độ kết thúc: `{ lat, lng }`).
  * `total_steps` (Tổng số bước giả lập di chuyển, mặc định 20 bước).
* **Đầu ra:** Gửi thành công tọa độ GPS cập nhật lên API `/api/driver-locations`.

### Mã Giả Thuật Toán (Pseudo-code)

```text
THUẬT TOÁN: GiaLapDiChuyenGPS(start_loc, end_loc, total_steps)
    Dat step_index = 0
    Dat current_lat = start_loc.lat
    Dat current_lng = start_loc.lng

    // Tính toán độ lệch tọa độ cho mỗi bước di chuyển
    Dat delta_lat = (end_loc.lat - start_loc.lat) / total_steps
    Dat delta_lng = (end_loc.lng - start_loc.lng) / total_steps

    // Khởi động bộ định thời tự động chạy mỗi 10 giây
    KHI step_index <= total_steps CHẠY ĐỊNH KỲ (Mỗi 10 giây):
        NẾU step_index == total_steps THÌ
            // Đã đến điểm đích
            current_lat = end_loc.lat
            current_lng = end_loc.lng
            HuyBoBoDinhThoi() // Dừng giả lập
        KHÁC:
            // Tính toán tọa độ trung gian
            current_lat = start_loc.lat + (delta_lat * step_index)
            current_lng = start_loc.lng + (delta_lng * step_index)
        KẾT THÚC NẾU

        // Tạo gói dữ liệu tọa độ
        Dat payload = {
            assignment_id: current_assignment_id,
            driver_id: current_driver_id,
            lat: current_lat,
            lng: current_lng,
            speed: SinhVanTocNgauNhien(30, 60) // Tốc độ ngẫu nhiên từ 30-60 km/h
        }

        // Gọi API gửi lên Server lưu trữ
        GoiApiPost("/api/driver-locations", payload)
        
        step_index = step_index + 1
    KẾT THÚC CHẠY ĐỊNH KỲ
KẾT THÚC THUẬT TOÁN
```
