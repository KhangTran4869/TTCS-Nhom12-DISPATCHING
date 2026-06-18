# Giải thích Cấu trúc Dự án và Chi tiết Components

Dự án này là một hệ thống quản lý và điều phối vận tải (Dispatching System). Codebase được chia thành hai phần chính: **Backend** (Node.js/Express) và **Frontend** (React/Vite). Dưới đây là giải thích cơ bản về từng thành phần và phân tích chi tiết các file giao diện (Components).

---

## 1. Tổng quan Cấu trúc Thư mục

### Thư mục `backend/`
Đây là máy chủ cung cấp các API cho Frontend giao tiếp và tương tác với cơ sở dữ liệu.
- `server.js`: File khởi chạy máy chủ backend, định nghĩa các thiết lập ban đầu (cors, express.json) và mount các routes.
- `config/`: Thư mục chứa các tệp cấu hình, ví dụ như cấu hình kết nối tới cơ sở dữ liệu.
- `models/`: Định nghĩa cấu trúc dữ liệu (Schema) dùng cho Database (ví dụ như bảng User, Order, Vehicle,...).
- `controllers/`: Chứa logic nghiệp vụ. Khi có 1 request gửi tới API, Controller sẽ xử lý request đó, tương tác với Database và trả về kết quả (JSON).
- `routes/`: Nơi định nghĩa các đường dẫn API (endpoints). Mỗi route sẽ gọi đến một hàm tương ứng trong Controller.
- `middleware/`: Các hàm chạy trung gian giữa request và controller, dùng để kiểm tra bảo mật, xác thực người dùng (verify token) hoặc phân quyền.

### Thư mục `frontend/`
Là giao diện người dùng xây dựng bằng React.
- `src/App.jsx`: Component gốc, điều hướng người dùng tới các giao diện (Dashboard hoặc Login/Register) tùy thuộc vào trạng thái đăng nhập và quyền (role) của họ.
- `src/components/`: Nơi chứa toàn bộ các giao diện chức năng chính của người dùng.

---

## 2. Giải thích Chi tiết code trong `frontend/src/components/`

Trong hệ thống có sự phân quyền rõ rệt. Mỗi vai trò có một màn hình Dashboard riêng. Các component này quản lý state nội bộ bằng `useState` và gọi API lấy dữ liệu bằng `useEffect`.

### 2.1. `Login.jsx` (Màn hình Đăng nhập)
- **Chức năng:** Cung cấp form để người dùng điền Email và Password.
- **State chính:** `email`, `password`, `isSubmitting` (trạng thái chờ gọi API).
- **Hoạt động:** Khi người dùng submit form, hàm `handleSubmit` gửi một request POST đến `/api/auth/login`. Nếu thành công, nó sẽ lưu thông tin user, token và gọi hàm `onLogin` (được truyền từ App.jsx) để chuyển hướng vào màn hình Dashboard tương ứng.

### 2.2. `Register.jsx` (Màn hình Đăng ký)
- **Chức năng:** Cho phép tạo tài khoản mới.
- **State chính:** `formData` chứa các trường (Họ tên, Email, Số điện thoại, Vai trò (mặc định driver), Mật khẩu).
- **Hoạt động:** Có hàm `validateForm` để kiểm tra tính hợp lệ của dữ liệu đầu vào. Sau đó, nó sẽ gửi dữ liệu đăng ký tới backend và hiển thị Toast thông báo kết quả.

### 2.3. `AdminDashboard.jsx` (Giao diện Quản trị viên)
- **Chức năng:** Quản lý toàn bộ thông tin hệ thống. Admin có quyền tối cao tạo/sửa/xóa người dùng, tài xế.
- **State chính:** Lưu trữ danh sách `users`, `drivers`, `vehicles`, `orders` thông qua việc fetch dữ liệu từ API lúc khởi tạo component (`useEffect`). Có các state quản lý form (thêm mới User) và tìm kiếm/lọc (`userSearch`, `userRoleFilter`).
- **Giao diện:** Chia làm nhiều Tab (Tổng quan, Người dùng, v.v.). Dùng các component biểu tượng của `lucide-react`.

### 2.4. `DispatcherDashboard.jsx` (Giao diện Điều phối viên)
- **Chức năng:** Tập trung vào việc điều phối đơn hàng và phương tiện.
- **State chính:** Theo dõi danh sách `orders`, `assignments` (phân công hiện tại), `locations` (vị trí xe), và `incidents` (sự cố trên đường).
- **Hoạt động:** Điều phối viên có thể sử dụng màn hình này để xem danh sách đơn hàng cần giao, sau đó assign (chỉ định) phương tiện và tài xế phù hợp để thực hiện chuyến đi. 

### 2.5. `DriverDashboard.jsx` (Giao diện dành cho Tài xế)
- **Chức năng:** Màn hình làm việc trực tiếp của tài xế khi đang vận hành xe.
- **State chính:** 
  - `activeAssignment`: Chuyến đi/Đơn hàng đang thực hiện.
  - `incidentType` & `incidentDesc`: Để báo cáo sự cố (kẹt xe, tai nạn, hỏng xe).
  - `deliveryHistory`: Lịch sử các đơn hàng đã hoàn thành.
- **Hoạt động:** Khi vào dashboard, nó fetch dữ liệu driver hiện tại và đơn hàng họ đang chịu trách nhiệm. Tài xế dùng màn hình này để cập nhật trạng thái đơn hàng (Đang giao, Hoàn thành) và gửi báo cáo khẩn cấp nếu có sự cố xảy ra.

### 2.6. `ManagerDashboard.jsx` (Giao diện Quản lý)
- **Chức năng:** Tổng hợp báo cáo thống kê và quản lý nguồn lực cơ bản (chủ yếu là quản lý đội xe - Fleet).
- **Hoạt động:** Fetch toàn bộ dữ liệu thống kê từ hệ thống (orders, vehicles, drivers, incidents). Hiển thị giao diện báo cáo, kiểm soát tình trạng các phương tiện (đang rảnh hay đang được sử dụng) và duyệt qua các sự cố đã được báo cáo.

---
*Ghi chú: Đa số các component dashboard đều được thiết kế thành viên độc lập, nhận `user` và `onLogout` qua props từ component mẹ (`App.jsx`).*
