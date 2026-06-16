# DOC 6.2-A: SƠ ĐỒ TRÌNH TỰ (SEQUENCE DIAGRAMS)

Tài liệu này trình bày các sơ đồ trình tự thể hiện sự tương tác từng bước giữa các thành phần giao diện (Client Components), bộ định tuyến (Routers), bộ điều khiển nghiệp vụ (Controllers) và các mô hình dữ liệu (Models) cho 5 kịch bản nghiệp vụ cốt lõi của hệ thống.

---

## 1. Kịch Bản 1: Đăng Nhập Hệ Thống (User Authentication)

Mô tả luồng người dùng nhập tài khoản, gửi thông tin xác thực lên server và nhận phản hồi đăng nhập thành công hoặc lỗi:

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant UI as Login.jsx
    participant Router as authRouters.js
    participant Ctrl as AuthControllers.js
    participant Model as User Model
    participant DB as MongoDB Atlas

    User->>UI: Nhập Email & Mật khẩu
    UI->>UI: Kiểm tra dữ liệu đầu vào thô
    UI->>Router: POST /api/auth/login (email, password)
    Router->>Ctrl: login(req, res)
    Ctrl->>Model: findOne({ email })
    Model->>DB: Truy vấn dữ liệu tài khoản
    DB-->>Model: Trả về bản ghi User (nếu có)
    
    alt Không tìm thấy User
        Ctrl-->>UI: Phản hồi 404 (Tài khoản không tồn tại)
        UI-->>User: Hiển thị lỗi "Email không tồn tại"
    else Tìm thấy User
        Ctrl->>Ctrl: bcrypt.compare(password, password_hash)
        alt Mật khẩu không trùng khớp
            Ctrl-->>UI: Phản hồi 400 (Sai mật khẩu)
            UI-->>User: Hiển thị lỗi "Mật khẩu không chính xác"
        else Mật khẩu trùng khớp
            Ctrl-->>UI: Phản hồi 200 (Thành công + Dữ liệu User)
            UI->>UI: Lưu User vào LocalStorage & Cập nhật State
            UI-->>User: Chuyển hướng tới Dashboard tương ứng với Role
        end
    end
```

---

## 2. Kịch Bản 2: Tạo Đơn Hàng Vận Chuyển Mới (Order Creation)

Mô tả quy trình điều phối viên nhập thông tin đơn hàng mới nhận được từ khách hàng vào hệ thống:

```mermaid
sequenceDiagram
    autonumber
    actor Disp as Điều phối viên
    participant UI as DispatcherDashboard.jsx
    participant Router as orderRouters.js
    participant Ctrl as OrderControllers.js
    participant Model as Order Model
    participant DB as MongoDB Atlas

    Disp->>UI: Điền form Tạo đơn (mã đơn, người gửi, địa chỉ, cân nặng...)
    UI->>Router: POST /api/orders (cargoDetails)
    Router->>Ctrl: createOrder(req, res)
    Ctrl->>Model: new Order(req.body)
    Ctrl->>Model: save()
    Model->>DB: Thực hiện lệnh INSERT
    DB-->>Model: Trả về bản ghi Order đã tạo kèm _id
    Ctrl-->>UI: Phản hồi 201 Created (success: true, data: order)
    UI-->>Disp: Thông báo "Tạo đơn hàng thành công" & Thêm đơn vào danh sách "Chờ xử lý"
```

---

## 3. Kịch Bản 3: Điều Phối Phân Công Xe & Tài Xế (Order Dispatching)

Mô tả sự phối hợp khi điều phối viên giao đơn hàng đang chờ cho một tài xế và phương tiện trống:

```mermaid
sequenceDiagram
    autonumber
    actor Disp as Điều phối viên
    participant UI as DispatcherDashboard.jsx
    participant Router as dispatchAssignmentRouters.js
    participant Ctrl as DispatchAssignmentControllers.js
    participant OrderM as Order Model
    participant DriverM as Driver Model
    participant VehM as Vehicle Model
    participant AssignM as DispatchAssignment Model
    participant DB as MongoDB Atlas

    Disp->>UI: Chọn đơn hàng, chọn tài xế sẵn sàng, chọn xe trống
    UI->>Router: POST /api/dispatch-assignments (ids)
    Router->>Ctrl: createDispatchAssignment(req, res)
    
    %% Kiểm tra tài xế & xe
    Ctrl->>DriverM: findById(driver_id)
    DriverM-->>Ctrl: driver status is "available"
    Ctrl->>VehM: findById(vehicle_id)
    VehM-->>Ctrl: vehicle status is "available"
    
    %% Tạo phân công
    Ctrl->>AssignM: create(req.body)
    AssignM->>DB: Ghi bản ghi phân công mới
    DB-->>AssignM: Trả về thông tin phân công
    
    %% Cập nhật trạng thái đồng bộ
    Ctrl->>OrderM: findByIdAndUpdate(order_id, { status: "assigned" })
    Ctrl->>DriverM: findByIdAndUpdate(driver_id, { current_status: "assigned" })
    Ctrl->>VehM: findByIdAndUpdate(vehicle_id, { status: "in_use" })
    
    Ctrl-->>UI: Phản hồi 201 Created (success: true, data: assignment)
    UI-->>Disp: Thông báo "Phân công xe thành công" & Cập nhật danh sách giám sát
```

---

## 4. Kịch Bản 4: Giả Lập Định Vị GPS & Theo Dõi Hành Trình (GPS & Real-time Tracking)

Mô tả luồng tài xế di chuyển giả lập tọa độ gửi về server và màn hình điều phối viên tự động polling lấy vị trí mới hiển thị trên bản đồ:

```mermaid
sequenceDiagram
    autonumber
    actor Driver as Tài xế
    participant DriverUI as DriverDashboard.jsx
    actor Disp as Điều phối viên
    participant DispUI as DispatcherDashboard.jsx
    participant LocRouter as driverLocationRouters.js
    participant LocCtrl as DriverLocationControllers.js
    participant LocModel as DriverLocation Model
    participant DB as MongoDB Atlas

    %% Driver gửi tọa độ tự động qua setInterval
    Loop Mỗi 10 giây (khi chuyến đi "in_progress")
        DriverUI->>DriverUI: Tính toán tọa độ lat/lng mới trên tuyến
        DriverUI->>LocRouter: POST /api/driver-locations (assignment_id, lat, lng, speed)
        LocRouter->>LocCtrl: createDriverLocation(req, res)
        LocCtrl->>LocModel: create(req.body)
        LocModel->>DB: Ghi tọa độ GPS hành trình
        DB-->>LocModel: Ghi nhận thành công
        LocCtrl-->>DriverUI: Phản hồi 201 Created
    end

    %% Dispatcher liên tục lấy vị trí hiển thị trên bản đồ
    Loop Mỗi 10 giây (khi hiển thị màn hình giám sát bản đồ)
        DispUI->>LocRouter: GET /api/driver-locations (hoặc /latest)
        LocRouter->>LocCtrl: getAllDriverLocations(req, res)
        LocCtrl->>LocModel: find().sort({ recorded_at: -1 }).populate()
        LocModel->>DB: Truy vấn các tọa độ GPS mới nhất
        DB-->>LocModel: Danh sách vị trí
        LocCtrl-->>DispUI: Phản hồi 200 OK (Mảng vị trí của tài xế)
        DispUI->>DispUI: Render lại vị trí của xe trên bản đồ bằng Google Maps / Custom Map Markers
    end
```

---

## 5. Kịch Bản 5: Báo Cáo Sự Cố & Xử Lý Sự Cố (Incident Reporting & Resolution)

Mô tả luồng tài xế gửi báo cáo sự cố khi di chuyển gặp trục trặc và điều phối viên duyệt giải quyết sự cố:

```mermaid
sequenceDiagram
    autonumber
    actor Driver as Tài xế
    participant DriverUI as DriverDashboard.jsx
    actor Disp as Điều phối viên
    participant DispUI as DispatcherDashboard.jsx
    participant IncRouter as incidentRouters.js
    participant IncCtrl as IncidentControllers.js
    participant IncModel as Incident Model
    participant AssignModel as DispatchAssignment Model
    participant DB as MongoDB Atlas

    %% Driver báo cáo sự cố
    Driver->>DriverUI: Nhấp "Báo cáo sự cố", chọn loại sự cố, nhập mô tả
    DriverUI->>IncRouter: POST /api/incidents (reportedDetails)
    IncRouter->>IncCtrl: createIncident(req, res)
    IncCtrl->>IncModel: create(req.body)
    IncModel->>DB: Ghi bản ghi sự cố mới (status: "reported")
    DB-->>IncModel: OK
    IncCtrl-->>DriverUI: Phản hồi 201 (Báo cáo thành công)
    DriverUI-->>Driver: Hiển thị trạng thái chờ điều phối viên xử lý

    %% Dispatcher tiếp nhận & xử lý
    DispUI->>IncRouter: GET /api/incidents
    IncRouter->>IncCtrl: getAllIncidents(req, res)
    IncCtrl-->>DispUI: Trả về danh sách sự cố (bao gồm sự cố của tài xế)
    DispUI-->>Disp: Hiển thị nhấp nháy đỏ cảnh báo sự cố mới
    Disp->>DispUI: Nhấp "Giải quyết sự cố" (gửi xe cứu hộ, thay lốp...)
    DispUI->>IncRouter: PATCH /api/incidents/:id/resolve
    IncRouter->>IncCtrl: resolveIncident(req, res)
    IncCtrl->>IncModel: findByIdAndUpdate(id, { status: "resolved", resolved_at: Date.now })
    IncModel->>DB: Cập nhật trạng thái sự cố
    DB-->>IncModel: Cập nhật thành công
    IncCtrl-->>DispUI: Phản hồi 200 OK
    DispUI-->>Disp: Sự cố chuyển sang trạng thái xanh (Resolved)
```
