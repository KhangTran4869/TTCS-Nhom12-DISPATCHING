# DOC 6.3-A: MOCKUPS UI ĐỘ TRUNG THỰC CAO (HIGH-FIDELITY UI DESIGN)

Tài liệu này đặc tả hệ thống thiết kế giao diện (Design System) và cấu trúc giao diện trực quan của các màn hình trong hệ thống quản lý điều phối vận tải, dựa trên mã CSS thực tế tại [index.css](file:///d:/TTCS-Nhom12-DISPATCHING/frontend/src/index.css).

---

## 1. Hệ Thống Thiết Kế (Design System)

Hệ thống áp dụng phong cách thiết kế **Premium Dark Mode Tech Theme** kết hợp hiệu ứng kính mờ (Glassmorphism), mang lại cảm giác hiện đại và trực quan cho người dùng quản lý điều hành.

### 1.1. Bảng Màu (Color Palette)

| Loại Màu | Mã Hex | Tên Biến CSS | Ứng Dụng |
| :--- | :--- | :--- | :--- |
| **App Background** | `#090d16` | `--bg-app` | Nền tổng thể ứng dụng (kèm gradient chuyển màu). |
| **Card Surface** | `rgba(17, 24, 39, 0.7)` | `--bg-surface` | Nền các thẻ panel, danh sách (độ mờ 70% Glassmorphism). |
| **Active/Elevated** | `rgba(30, 41, 59, 0.85)` | `--bg-surface-elevated`| Nền của các thành phần nổi bật, dropdown, modal. |
| **Primary (Indigo)** | `#4f46e5` | `--primary` | Nút hành động chính, đường đi hoạt họa, tiêu đề phân hệ. |
| **Success (Green)** | `#10b981` | `--success` | Trạng thái "Đã hoàn thành", tài xế "Sẵn sàng", xe "Trống". |
| **Warning (Amber)** | `#f59e0b` | `--warning` | Trạng thái đơn "Đang giao", cảnh báo, sự cố đang xử lý. |
| **Danger (Red)** | `#ef4444` | `--danger` | Trạng thái đơn "Đã hủy", sự cố nghiêm trọng chưa giải quyết. |
| **Info (Sky Blue)** | `#0ea5e9` | `--info` | Thông tin phụ trợ, hiển thị khoảng cách, thời gian. |
| **Text Main** | `#f1f5f9` | `--text-main` | Văn bản nội dung chính, tiêu đề (độ tương phản cao). |
| **Text Muted** | `#94a3b8` | `--text-muted` | Chú thích, nhãn phụ, thông tin thời gian (màu xám dịu mắt). |

### 1.2. Typography (Phông chữ)
* **Font Family chính:** `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
* **Font Title:** Trọng số `600` đến `800` (Semi-bold, Bold, Extra-bold) cho các thẻ và tiêu đề thống kê.
* **Font Body:** Trọng số `400`, `500` cho nội dung bảng biểu và chi tiết đơn hàng.

### 1.3. Spacing & Border Radius (Khoảng cách & Bo góc)
* **Thang khoảng cách (Padding/Margin):** Thiết kế sử dụng thang khoảng cách tỷ lệ 8px: `8px`, `12px`, `16px`, `24px`, `32px`.
* **Bo góc (Border Radius):** 
  * Các Input, Card, Button nhỏ: `8px` hoặc `12px` (`border-radius: 12px`).
  * Các thẻ Container lớn, Modal panel: `16px` (`border-radius: 16px`).
* **Hiệu ứng nổi bật (Transitions):** Sử dụng hàm cubic-bezier (`--transition-normal: 0.25s cubic-bezier(0.4, 0, 0.2, 1)`) cho hiệu ứng hover nút bấm và chuyển đổi thẻ.

---

## 2. Đặc Tả Giao Diện Các Màn Hình Chính

### 2.1. Màn Hình Đăng Nhập & Đăng Ký ([Login.jsx](file:///d:/TTCS-Nhom12-DISPATCHING/frontend/src/components/Login.jsx) / [Register.jsx](file:///d:/TTCS-Nhom12-DISPATCHING/frontend/src/components/Register.jsx))
* **Bố cục:** Thiết kế căn giữa tuyệt đối (`display: flex; align-items: center; justify-content: center; min-height: 100vh`).
* **Thành phần:**
  * Thẻ container Glassmorphism bo tròn 16px, viền mờ màu trắng (`border: 1px solid rgba(255, 255, 255, 0.08)`).
  * Nhóm nhập liệu (Input Group) dạng nổi bật với icon ở góc trái. Trạng thái focus có viền đổi sang màu tím sáng (`--primary`).
  * Nút "Đăng nhập" dạng gradient tím chuyển màu mượt mà.
  * Liên kết chuyển nhanh sang form Đăng ký dành cho tài xế mới.

### 2.2. Màn Hình Điều Phối Viên ([DispatcherDashboard.jsx](file:///d:/TTCS-Nhom12-DISPATCHING/frontend/src/components/DispatcherDashboard.jsx))
Màn hình trung tâm chia bố cục dạng 3 cột linh hoạt phục vụ làm việc đa nhiệm:
* **Cột 1 (Bên trái): Quản lý Đơn Hàng & Sự Cố**
  * Hiển thị danh sách thẻ đơn hàng phân loại theo tab: "Chờ phân công", "Đang giao", "Đã hoàn thành".
  * Thẻ sự cố nổi bật với hiệu ứng nhấp nháy đỏ (`animation: statusPulse 1s infinite`) ở góc trên để thu hút sự chú ý.
* **Cột 2 (Giữa): Bản Đồ Giám Sát Xe Di Chuyển**
  * Bản đồ không gian hiển thị vị trí các xe hoạt động dưới dạng các Marker (hình tròn màu lục đối với tài xế sẵn sàng, màu vàng đối với tài xế đang thực hiện chuyến đi).
  * Đường vẽ tuyến đi (polyline) kết nối các điểm pickup, waypoint và delivery có màu tím `--primary` phát sáng.
* **Cột 3 (Bên phải): Tạo Phân Công & Danh Sách Đội Xe**
  * Bộ lọc tìm kiếm nhanh các tài xế có trạng thái `available` để thực hiện kéo thả hoặc chọn phân công cho đơn hàng.
  * Form tạo nhanh phân công (chọn Đơn hàng $\rightarrow$ Chọn tài xế $\rightarrow$ Chọn phương tiện $\rightarrow$ Nhập ghi chú $\rightarrow$ Bấm "Xác nhận phân công").

### 2.3. Màn Hình Tài Xế ([DriverDashboard.jsx](file:///d:/TTCS-Nhom12-DISPATCHING/frontend/src/components/DriverDashboard.jsx))
* **Bố cục:** Tối ưu hóa hiển thị dạng danh sách thẻ đơn lớn (Mobile-friendly layout) giúp tài xế dễ dàng quan sát khi đang di chuyển trên xe.
* **Thành phần:**
  * **Thẻ trạng thái công việc hiện tại:** Hiển thị nổi bật mã đơn hàng, địa chỉ nhận hàng (Pickup) màu xanh, địa chỉ giao hàng (Delivery) màu đỏ.
  * **Nhóm nút cập nhật tiến độ (Progress buttons):**
    * Nút "Nhận chuyến" (Accept) màu xanh lá / Nút "Từ chối" (Reject) màu đỏ.
    * Khi chuyến đi bắt đầu, nút chuyển thành "Đã nhận hàng" (Picked up) $\rightarrow$ "Bắt đầu di chuyển" (In Transit) $\rightarrow$ "Hoàn thành giao hàng" (Delivered).
  * **Bảng điều khiển giả lập GPS:** Nút bật/tắt tự động cập nhật GPS hành trình, hiển thị tốc độ di chuyển và vị trí tọa độ hiện tại.
  * **Nút "Báo cáo sự cố":** Mở modal khẩn cấp để tài xế báo cáo ngay tình trạng kẹt xe, tai nạn hoặc hỏng hóc phương tiện.

### 2.4. Màn Hình Quản Lý ([ManagerDashboard.jsx](file:///d:/TTCS-Nhom12-DISPATCHING/frontend/src/components/ManagerDashboard.jsx))
* **Bố cục:** Grid 4 cột thống kê tổng quan ở trên cùng, biểu đồ cột và bảng danh sách ở dưới.
* **Thành phần:**
  * **Thẻ KPI (Metric Cards):**
    1. Tổng đơn hàng (icon Thùng hàng, số lượng lớn).
    2. Đơn hàng thành công (chữ màu lục, icon tích xanh).
    3. Đơn hàng đang giao (chữ màu vàng).
    4. Tổng số sự cố phát sinh (chữ màu đỏ, icon cảnh báo).
  * **Biểu đồ hoạt động:** Trực quan hóa doanh số hoặc số lượng đơn hàng giao hoàn thành qua các ngày trong tuần.
  * **Bảng danh sách xếp hạng tài xế:** Thống kê tên tài xế, số chuyến đã hoàn thành, tổng số km đã chạy, và điểm đánh giá trung bình (Rating) kèm icon ngôi sao phát sáng.
