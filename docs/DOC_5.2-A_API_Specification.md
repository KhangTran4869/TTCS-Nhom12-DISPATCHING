# DOC 5.2-A: ĐẶC TẢ API

Tài liệu này đặc tả chi tiết giao diện lập trình ứng dụng (REST API) giữa Client (React Frontend) và Server (Node.js/Express Backend) cho hệ thống điều phối vận tải.

---

## 1. Tổng Quan API

* **Base URL:** `http://127.0.0.1:5000/api` (môi trường phát triển local)
* **Định dạng dữ liệu:** Mặc định sử dụng **JSON** cho toàn bộ request body và response body.
* **Đầu header yêu cầu:** `Content-Type: application/json`
* **Xác thực phiên (Authentication):** Hệ thống lưu trữ thông tin tài khoản đăng nhập hiện tại tại LocalStorage ở Frontend. Client gửi thông tin người dùng cùng vai trò của họ trong payload API (hoặc xác thực qua session user_id).

### Các mã lỗi HTTP phổ biến
| Mã Trạng Thái | Mô Tả | Cấu Trúc JSON Lỗi Trả Về |
| :--- | :--- | :--- |
| **200 OK** | Yêu cầu xử lý thành công. | `{ "success": true, "message": "...", "data": ... }` |
| **201 Created** | Tạo mới tài nguyên thành công. | `{ "success": true, "message": "...", "data": ... }` |
| **400 Bad Request** | Dữ liệu gửi lên không hợp lệ hoặc thiếu. | `{ "success": false, "message": "Lỗi dữ liệu đầu vào", "error": "Chi tiết lỗi..." }` |
| **404 Not Found** | Không tìm thấy tài nguyên yêu cầu. | `{ "success": false, "message": "Không tìm thấy tài nguyên" }` |
| **500 Internal Error** | Lỗi xảy ra phía server. | `{ "success": false, "message": "Lỗi hệ thống", "error": "..." }` |

---

## 2. Đặc Tả Chi Tiết Endpoints

### 2.1. Phân Hệ Xác Thực (`/api/auth`)

#### **POST /api/auth/register**
* **Mô tả:** Đăng ký tài khoản người dùng mới.
* **Yêu cầu (Body JSON):**
  ```json
  {
    "full_name": "Nguyen Van A",
    "email": "driver1@example.com",
    "phone": "0987654321",
    "password": "hashedpassword123",
    "role": "driver"
  }
  ```
* **Phản hồi (201 Created):**
  ```json
  {
    "success": true,
    "message": "Đăng ký thành công",
    "data": {
      "_id": "60d5ec49ad7b2c2944b3c401",
      "full_name": "Nguyen Van A",
      "email": "driver1@example.com",
      "phone": "0987654321",
      "role": "driver",
      "status": "active",
      "createdAt": "2026-06-16T07:30:00.000Z"
    }
  }
  ```

#### **POST /api/auth/login**
* **Mô tả:** Đăng nhập vào hệ thống.
* **Yêu cầu (Body JSON):**
  ```json
  {
    "email": "driver1@example.com",
    "password": "hashedpassword123"
  }
  ```
* **Phản hồi (200 OK):**
  ```json
  {
    "success": true,
    "message": "Đăng nhập thành công",
    "data": {
      "_id": "60d5ec49ad7b2c2944b3c401",
      "full_name": "Nguyen Van A",
      "email": "driver1@example.com",
      "phone": "0987654321",
      "role": "driver",
      "status": "active"
    }
  }
  ```

---

### 2.2. Phân Hệ Đơn Hàng (`/api/orders`)

#### **POST /api/orders**
* **Mô tả:** Tạo đơn hàng vận chuyển mới.
* **Yêu cầu (Body JSON):**
  ```json
  {
    "order_code": "ORD1001",
    "sender_name": "Công ty X",
    "sender_phone": "0912345678",
    "pickup_address": "123 Đường Láng, Hà Nội",
    "pickup_location": { "lat": 21.0285, "lng": 105.8048 },
    "receiver_name": "Nguyễn Văn B",
    "receiver_phone": "0987654321",
    "delivery_address": "456 Nguyễn Huệ, TP.HCM",
    "delivery_location": { "lat": 10.7769, "lng": 106.7009 },
    "cargo_description": "Thùng thiết bị điện tử",
    "cargo_weight": 15.5,
    "priority": "normal"
  }
  ```
* **Phản hồi (201 Created):**
  ```json
  {
    "success": true,
    "message": "Tạo đơn hàng thành công",
    "data": {
      "_id": "60d5ec49ad7b2c2944b3c405",
      "order_code": "ORD1001",
      "status": "pending",
      "createdAt": "2026-06-16T07:35:00.000Z"
    }
  }
  ```

#### **GET /api/orders**
* **Mô tả:** Lấy danh sách toàn bộ đơn hàng trong hệ thống.
* **Phản hồi (200 OK):**
  ```json
  {
    "success": true,
    "message": "Lấy danh sách đơn hàng thành công",
    "data": [
      {
        "_id": "60d5ec49ad7b2c2944b3c405",
        "order_code": "ORD1001",
        "sender_name": "Công ty X",
        "pickup_address": "123 Đường Láng, Hà Nội",
        "delivery_address": "456 Nguyễn Huệ, TP.HCM",
        "status": "pending"
      }
    ]
  }
  ```

---

### 2.3. Phân Hệ Phân Công Điều Phối (`/api/dispatch-assignments`)

#### **POST /api/dispatch-assignments**
* **Mô tả:** Giao đơn hàng cho tài xế và phương tiện cụ thể (chỉ Dispatcher được thực hiện).
* **Yêu cầu (Body JSON):**
  ```json
  {
    "order_id": "60d5ec49ad7b2c2944b3c405",
    "driver_id": "60d5ec49ad7b2c2944b3c402",
    "vehicle_id": "60d5ec49ad7b2c2944b3c403",
    "dispatcher_id": "60d5ec49ad7b2c2944b3c404",
    "route_points": [
      { "sequence_no": 1, "address": "123 Đường Láng, Hà Nội", "lat": 21.0285, "lng": 105.8048, "point_type": "pickup" },
      { "sequence_no": 2, "address": "456 Nguyễn Huệ, TP.HCM", "lat": 10.7769, "lng": 106.7009, "point_type": "delivery" }
    ],
    "estimated_distance": 1720,
    "estimated_duration": 1800,
    "note": "Giao hàng giờ hành chính"
  }
  ```
* **Phản hồi (201 Created):**
  ```json
  {
    "success": true,
    "message": "Phân công vận chuyển thành công",
    "data": {
      "_id": "60d5ec49ad7b2c2944b3c410",
      "order_id": "60d5ec49ad7b2c2944b3c405",
      "driver_id": "60d5ec49ad7b2c2944b3c402",
      "assignment_status": "assigned",
      "assigned_at": "2026-06-16T07:40:00.000Z"
    }
  }
  ```

#### **PATCH /api/dispatch-assignments/:id/status**
* **Mô tả:** Cập nhật trạng thái phân công (chấp nhận, từ chối, bắt đầu đi, hoàn thành chuyến).
* **Yêu cầu (Body JSON):**
  ```json
  {
    "assignment_status": "in_progress"
  }
  ```
* **Phản hồi (200 OK):**
  ```json
  {
    "success": true,
    "message": "Cập nhật trạng thái phân công thành công",
    "data": {
      "_id": "60d5ec49ad7b2c2944b3c410",
      "assignment_status": "in_progress",
      "start_time": "2026-06-16T07:42:00.000Z"
    }
  }
  ```

---

### 2.4. Định Vị Xe (`/api/driver-locations`)

#### **POST /api/driver-locations**
* **Mô tả:** Ghi nhận tọa độ GPS do thiết bị tài xế gửi lên.
* **Yêu cầu (Body JSON):**
  ```json
  {
    "assignment_id": "60d5ec49ad7b2c2944b3c410",
    "driver_id": "60d5ec49ad7b2c2944b3c402",
    "lat": 21.0305,
    "lng": 105.8112,
    "speed": 45.5
  }
  ```
* **Phản hồi (201 Created):**
  ```json
  {
    "success": true,
    "message": "Cập nhật vị trí tài xế thành công",
    "data": {
      "_id": "60d5ec49ad7b2c2944b3c420",
      "recorded_at": "2026-06-16T07:45:00.000Z"
    }
  }
  ```

#### **GET /api/driver-locations**
* **Mô tả:** Lấy danh sách toàn bộ lịch sử vị trí của toàn bộ các tài xế (mô phỏng tracking).
* **Phản hồi (200 OK):**
  ```json
  {
    "success": true,
    "message": "Lấy danh sách vị trí tài xế thành công",
    "data": [
      {
        "_id": "60d5ec49ad7b2c2944b3c420",
        "driver_id": "60d5ec49ad7b2c2944b3c402",
        "lat": 21.0305,
        "lng": 105.8112,
        "recorded_at": "2026-06-16T07:45:00.000Z"
      }
    ]
  }
  ```

---

### 2.5. Phân Hệ Sự Cố (`/api/incidents`)

#### **POST /api/incidents**
* **Mô tả:** Tài xế báo cáo sự cố phát sinh trong hành trình giao hàng.
* **Yêu cầu (Body JSON):**
  ```json
  {
    "assignment_id": "60d5ec49ad7b2c2944b3c410",
    "reported_by": "60d5ec49ad7b2c2944b3c401",
    "incident_type": "vehicle_breakdown",
    "description": "Bị nổ lốp sau tại cầu Chương Dương, cần đội cứu hộ thay lốp xe."
  }
  ```
* **Phản hồi (201 Created):**
  ```json
  {
    "success": true,
    "message": "Báo cáo sự cố thành công",
    "data": {
      "_id": "60d5ec49ad7b2c2944b3c430",
      "status": "reported",
      "createdAt": "2026-06-16T07:50:00.000Z"
    }
  }
  ```

#### **PATCH /api/incidents/:id/resolve**
* **Mô tả:** Cập nhật trạng thái giải quyết sự cố (chỉ Dispatcher/Manager thực hiện).
* **Yêu cầu (Body JSON):**
  ```json
  {
    "status": "resolved"
  }
  ```
* **Phản hồi (200 OK):**
  ```json
  {
    "success": true,
    "message": "Giải quyết sự cố thành công",
    "data": {
      "_id": "60d5ec49ad7b2c2944b3c430",
      "status": "resolved",
      "resolved_at": "2026-06-16T08:10:00.000Z"
    }
  }
  ```
