# DOC 4.2-A: TÀI LIỆU QUYẾT ĐỊNH STACK CÔNG NGHỆ

Tài liệu này trình bày chi tiết về các công nghệ được lựa chọn để triển khai hệ thống quản lý điều phối vận tải, lý do đằng sau các quyết định này, cùng các rủi ro kỹ thuật liên quan và cách giảm thiểu.

---

## 1. Tổng Quan Stack Công Nghệ

Dưới đây là bảng tổng hợp chi tiết về stack công nghệ được sử dụng trong dự án, dựa trên phân tích thực tế từ mã nguồn backend và frontend:

| Phân Lớp | Công Nghệ | Phiên Bản | Ghi Chú & Vai Trò |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | `^19.2.6` | Thư viện xây dựng giao diện người dùng SPA động và cập nhật trạng thái nhanh chóng. |
| **Build & Dev Tool** | Vite | `^8.0.12` | Công cụ đóng gói (bundler) hiện đại, hỗ trợ Hot Module Replacement (HMR) cực nhanh. |
| **Icons Library** | Lucide React | `^1.17.0` | Cung cấp hệ thống icons dạng vector gọn nhẹ, hiện đại cho các Dashboard. |
| **Backend Framework** | Express.js | `^5.2.1` | Framework tối giản của Node.js để xây dựng REST API phân tuyến rõ ràng. |
| **Runtime Environment** | Node.js | v18.x / v20.x | Môi trường thực thi JavaScript phía Server (ES Modules: `"type": "module"`). |
| **Database** | MongoDB Atlas | Cloud Cluster | Cơ sở dữ liệu NoSQL dạng tài liệu, lưu trữ dữ liệu không định hình cứng nhắc. |
| **Object Data Modeling (ODM)**| Mongoose | `^9.6.2` | Thư viện thiết lập Schema và quản lý truy vấn dữ liệu từ Node.js đến MongoDB. |
| **Cryptography** | bcrypt | `^6.0.0` | Thư viện mã hóa mật khẩu người dùng (băm mật khẩu một chiều có salt). |
| **Environment Config** | dotenv | `^17.4.2` | Quản lý biến môi trường bảo mật (Connection string, Port). |
| **CORS Middleware** | cors | `^2.8.6` | Cho phép frontend gọi API chéo nguồn từ cổng/domain khác. |
| **Development Monitor** | nodemon | `^3.1.14` | Công cụ tự động khởi động lại server khi thay đổi mã nguồn backend. |
| **CSS Styling** | Vanilla CSS | N/A | Thiết kế giao diện tùy biến (CSS thuần nằm trong file `index.css`). |
| **Version Control** | Git / GitHub | N/A | Công cụ quản lý mã nguồn và làm việc nhóm trực tuyến. |

---

## 2. Lý Giải Lựa Chọn Công Nghệ

### 2.1. Tại sao chọn React (v19) & Vite (v8) cho Frontend?
* **Lý do lựa chọn:** React cung cấp cơ chế Virtual DOM giúp giao diện cập nhật trạng thái cực nhanh mà không cần tải lại trang, điều này cực kỳ quan trọng đối với màn hình Dispatcher Dashboard cần hiển thị biến động của các đơn hàng và vị trí tài xế. Vite được chọn thay vì Create React App truyền thống do tốc độ khởi động server phát triển và đóng gói (build) tối ưu vượt trội nhờ sử dụng esbuild.
* **Thay thế cân nhắc:** Vue.js hoặc HTML/JS thuần. Tuy nhiên, React có cộng đồng lập trình viên cực kỳ lớn, lượng thư viện hỗ trợ (như Lucide Icons) phong phú và các thành viên trong nhóm đã có kiến thức nền tảng tốt hơn.

### 2.2. Tại sao chọn Node.js & Express (v5) cho Backend?
* **Lý do lựa chọn:** Giúp toàn bộ dự án đồng bộ hóa trên một ngôn ngữ lập trình duy nhất là **JavaScript**. Điều này giúp tối giản hóa tư duy của lập trình viên khi chuyển đổi giữa frontend và backend. Express là framework cực kỳ nhẹ nhàng, không áp đặt cấu trúc thư mục, cho phép nhóm tự do thiết lập kiến trúc Layered phù hợp với đồ án môn học.
* **Thay thế cân nhắc:** Java Spring Boot hoặc Python FastAPI. Spring Boot quá nặng nề và yêu cầu viết code boilerplate nhiều, trong khi nhóm cần phát triển nhanh các API CRUD đơn giản trong thời gian ngắn.

### 2.3. Tại sao chọn MongoDB Atlas & Mongoose (v9)?
* **Lý do lựa chọn:** Hệ thống điều phối vận tải lưu trữ nhiều thông tin dạng mảng động, ví dụ như tọa độ định vị `pickup_location` và `delivery_location` chứa `{ lat, lng }` lồng nhau, hoặc mảng các điểm dừng hành trình `route_points` trong DispatchAssignment. NoSQL Document của MongoDB cho phép lưu trữ cấu trúc dạng này một cách trực nhiên và trôi chảy mà không cần tạo các bảng phụ phức tạp và thực hiện nhiều câu lệnh JOIN. Mongoose giúp định nghĩa các Schema có ràng buộc kiểu dữ liệu vững chắc trên nền tảng cơ sở dữ liệu phi quan hệ.
* **Thay thế cân nhắc:** PostgreSQL. PostgreSQL rất mạnh mẽ, nhưng việc biểu diễn các cấu trúc mảng điểm hành trình thay đổi liên tục sẽ tạo ra độ phức tạp lớn hơn trong thiết kế database ban đầu của sinh viên.

### 2.4. Tại sao sử dụng Vanilla CSS thay vì TailwindCSS hay Component Libraries?
* **Lý do lựa chọn:** File `index.css` chứa hơn 26KB CSS tùy biến được tối ưu hóa riêng cho đồ án. Việc viết CSS thuần giúp các thành viên hiểu sâu sắc về layout, responsive, đồng thời tránh việc phình to kích thước bundle do TailwindCSS hoặc các thư viện ngoài, đảm bảo giao diện hiển thị đồng bộ trên mọi trình duyệt mà không lo lỗi tương thích CSS.
* **Thay thế cân nhắc:** TailwindCSS. Mặc dù Tailwind viết tiện lợi nhưng yêu cầu cài đặt postcss, cấu hình webpack/vite phức tạp hơn và có thể tạo ra các class hỗn loạn trong file JSX đối với người chưa quen.

---

## 3. Rủi Ro Công Nghệ và Cách Giảm Thiểu

### 3.1. Rủi ro 1: Lỗi kết nối DNS MongoDB Atlas (lỗi `querySrv ECONNREFUSED`)
* **Mô tả:** Trong môi trường mạng nội bộ của một số nhà mạng hoặc trường học, các cổng kết nối đến MongoDB Atlas qua giao thức SRV thường bị chặn hoặc phân giải DNS lỗi, dẫn đến việc backend không thể kết nối cơ sở dữ liệu khi khởi động.
* **Cách giảm thiểu:** Trong mã nguồn thực tế tại `backend/src/config/db.js`, đội ngũ phát triển đã tích hợp thư viện `dns` của Node.js để ghi đè DNS tĩnh lên Server trước khi khởi động kết nối:
  ```javascript
  import dns from "dns";
  dns.setServers(["8.8.8.8", "8.8.4.4"]); // Sử dụng DNS của Google
  ```
  Biện pháp này đảm bảo việc phân giải các SRV record của MongoDB Atlas luôn chính xác bất kể cấu hình DNS của mạng nội bộ.

### 3.2. Rủi ro 2: Đồng bộ vị trí thời gian thực (Real-time Simulation)
* **Mô tả:** Nhu cầu giám sát hành trình yêu cầu thông tin tọa độ phải liên tục được cập nhật. Sử dụng WebSockets (Socket.io) có thể gây quá tải bộ nhớ trên server cục bộ và tăng độ phức tạp khi kết nối bị ngắt quãng.
* **Cách giảm thiểu:** Giao diện Driver Dashboard mô phỏng việc di chuyển bằng cách cập nhật tọa độ định kỳ (polling) gửi về API `/api/driver-locations`. Dispatcher Dashboard cũng thực hiện việc fetch thông tin vị trí mới nhất của tài xế thông qua API `/api/driver-locations/latest/:driverId` mỗi 8-10 giây một lần. Giải pháp này giúp hệ thống hoạt động cực kỳ ổn định, dễ dàng gỡ lỗi thông qua tab Network của Chrome DevTools.

### 3.3. Rủi ro 3: Bảo mật thông tin đăng nhập trên môi trường Local
* **Mô tả:** Do chạy trên môi trường localhost và không có giao thức mã hóa HTTPS, thông tin gửi đi từ Client dễ bị rò rỉ nếu truyền dưới dạng text thuần.
* **Cách giảm thiểu:** Phía Backend sử dụng thư viện `bcrypt` để mã hóa băm mật khẩu người dùng với độ phức tạp cao (salt round mặc định là 10) trước khi ghi vào MongoDB. Thông tin đăng nhập chỉ được lưu trữ dạng băm một chiều, ngăn chặn việc đọc trộm mật khẩu trực tiếp từ database.
