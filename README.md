# 🚚 Hệ thống Điều phối Xe và Tài xế (Dispatching System)

Hệ thống điều phối xe, tài xế và quản lý đơn hàng chuyên nghiệp. Dự án là giải pháp toàn diện giúp tự động hóa quá trình điều phối, theo dõi tiến độ giao hàng và quản lý rủi ro trong lĩnh vực vận tải (Logistics).

## 🌟 Các Tính Năng Nổi Bật

Hệ thống được thiết kế với mô hình Phân quyền người dùng (Role-Based Access Control) gồm 4 vai trò chính:

1. **👑 Quản Trị Viên (Admin):**
   - Quản lý tất cả tài khoản người dùng trong hệ thống.
   - Giám sát toàn bộ hoạt động của hệ thống.

2. **🏢 Quản Lý (Manager):**
   - Xem tổng quan các chỉ số (Dashboard).
   - Quản lý danh sách phương tiện (Vehicles) và tài xế (Drivers).
   - Quản lý tất cả các đơn hàng (Orders) từ khách hàng.

3. **🎯 Điều Phối Viên (Dispatcher):**
   - Theo dõi các đơn hàng đang chờ xử lý.
   - Xem trạng thái xe (Rảnh/Bận/Đang sửa chữa).
   - Xem trạng thái tài xế (Sẵn sàng/Nghỉ phép).
   - **Thực hiện phân công (Dispatch):** Giao đơn hàng cụ thể cho tài xế và xe phù hợp.
   - Theo dõi tiến độ chuyến đi và xử lý sự cố.

4. **🧑‍✈️ Tài Xế (Driver):**
   - Quản lý trạng thái cá nhân (Sẵn sàng làm việc/Nghỉ).
   - Nhận thông báo và xem chi tiết chuyến đi được phân công (Điểm lấy, Điểm giao, Ghi chú).
   - Chấp nhận/Từ chối lệnh điều phối.
   - Cập nhật trạng thái chuyến đi (Đang giao, Đã đến nơi, Hoàn thành).
   - Gửi báo cáo sự cố ngay trên đường đi.

## 💻 Công Nghệ Sử Dụng (Tech Stack)

Dự án được xây dựng theo kiến trúc Client-Server tách biệt hoàn toàn (Monorepo):

**Backend (RESTful API):**
* [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
* **Database:** [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/)
* **Bảo mật:** JWT (JSON Web Tokens) & Bcrypt

**Frontend (SPA):**
* [React.js](https://reactjs.org/) (Sử dụng [Vite](https://vitejs.dev/) giúp build và HMR siêu tốc)
* Giao diện thuần CSS, hiện đại và thân thiện.
* Biểu tượng (Icons) sử dụng `lucide-react`.

## 🚀 Hướng Dẫn Cài Đặt Và Chạy Cục Bộ (Local)

Làm theo các bước sau để chạy dự án trên máy tính của bạn:

### 1. Chuẩn Bị Môi Trường
Chắc chắn rằng bạn đã cài đặt sẵn **Node.js** và **Git** trên máy.

Clone dự án về:
```bash
git clone https://github.com/KhangTran4869/TTCS-Nhom12-DISPATCHING.git
cd TTCS-Nhom12-DISPATCHING
```

### 2. Thiết lập Biến môi trường (Backend)
Vào thư mục `backend`, tạo một file tên là `.env` và nhập các cấu hình sau:
```env
PORT=5000
MONGODB_CONNECTION_STRING=mongodb+srv://<username>:<password>@cluster.mongodb.net/?appName=Cluster0
JWT_SECRET=your_jwt_secret_key_here
```
*(Thay thế `<username>` và `<password>` bằng thông tin Database MongoDB của bạn, hoặc dùng chuỗi Local nếu cài sẵn MongoDB `mongodb://127.0.0.1:27017/dispatching`)*

### 3. Cài Đặt Thư Viện (Dependencies)
Mở terminal ở thư mục gốc và chạy:
```bash
# Cài đặt thư viện cho Backend
cd backend
npm install

# Quay lại và cài đặt thư viện cho Frontend
cd ../frontend
npm install
```

### 4. Khởi Động Hệ Thống

Bạn cần mở 2 cửa sổ Terminal để chạy song song:

**Khởi chạy Backend:**
```bash
cd backend
npm run dev
# Mặc định server sẽ chạy ở http://localhost:5000
```

**Khởi chạy Frontend:**
```bash
cd frontend
npm run dev
# Mặc định web sẽ chạy ở http://localhost:5173
```

Mở trình duyệt và truy cập `http://localhost:5173`. Đăng ký một tài khoản mới để bắt đầu trải nghiệm!

## 📁 Cấu Trúc Thư Mục Chính

```
TTCS-Nhom12-DISPATCHING/
├── backend/                  # Mã nguồn Server (Node.js)
│   ├── src/
│   │   ├── config/           # Cấu hình kết nối Database
│   │   ├── controllers/      # Logic xử lý API
│   │   ├── middleware/       # Lớp kiểm tra Request (Xác thực JWT, Phân quyền)
│   │   ├── models/           # Định nghĩa cấu trúc Schema MongoDB (Mongoose)
│   │   ├── routes/           # Định tuyến API (Endpoints)
│   │   └── server.js         # Entry point của Backend
│   └── package.json
└── frontend/                 # Mã nguồn Giao diện (React)
    ├── src/
    │   ├── assets/           # Hình ảnh, icon tĩnh
    │   ├── components/       # Các màn hình và Component UI
    │   ├── App.jsx           # Entry point Component của React
    │   ├── App.css           # Style toàn cục
    │   └── main.jsx          # File render gốc
    └── package.json
```
