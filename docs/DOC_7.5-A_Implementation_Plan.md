# DOC 7.5-A: KẾ HOẠCH TRIỂN KHAI (IMPLEMENTATION PLAN)

Tài liệu này vạch ra danh sách các tác vụ triển khai cụ thể, lịch trình thực hiện theo từng tuần và bảng quản trị rủi ro kỹ thuật nhằm đưa hệ thống từ giai đoạn thiết kế vào lập trình hoàn thiện thực tế.

---

## 1. Danh Sách Tác Vụ Triển Khai (Task List)

Dưới đây là danh sách các hạng mục công việc cần hoàn thành, ước tính công sức (giờ) và thứ tự phụ thuộc:

| Mã Tác Vụ | Phân Hệ | Nội Dung Công Việc | Ước Tính (Giờ) | Phụ Thuộc Vào |
| :--- | :--- | :--- | :---: | :--- |
| **TSK-01** | Database | Chạy các tệp lệnh DDL tạo bảng và chỉ mục vật lý trên MongoDB Atlas. | 4 | N/A |
| **TSK-02** | Backend | Thiết lập mã nguồn khung Backend Node.js/Express, cài đặt các dependencies. | 4 | N/A |
| **TSK-03** | Backend | Khởi tạo cấu trúc các Model Mongoose (User, Driver, Vehicle...). | 8 | TSK-01, TSK-02 |
| **TSK-04** | Backend | Lập trình API Đăng ký & Đăng nhập (`/api/auth`). | 8 | TSK-03 |
| **TSK-05** | Backend | Lập trình các API CRUD cho phân hệ Users, Drivers và Vehicles. | 12 | TSK-03 |
| **TSK-06** | Backend | Triển khai API CRUD Orders và xử lý logic kiểm tra ràng buộc. | 10 | TSK-03 |
| **TSK-07** | Backend | Xử lý logic nghiệp vụ điều phối phân công xe và đồng bộ trạng thái. | 16 | TSK-05, TSK-06 |
| **TSK-08** | Backend | Viết các API ghi nhận tọa độ GPS lịch sử và tìm kiếm vị trí mới nhất. | 12 | TSK-07 |
| **TSK-09** | Backend | Xây dựng API tiếp nhận sự cố và xử lý sự cố. | 10 | TSK-07 |
| **TSK-10** | Frontend | Cấu hình dự án React + Vite, cài đặt thư viện Lucide Icons và CSS. | 6 | N/A |
| **TSK-11** | Frontend | Thiết kế form giao diện Đăng ký & Đăng nhập, liên kết API xác thực. | 8 | TSK-04, TSK-10 |
| **TSK-12** | Frontend | Xây dựng Admin Dashboard quản lý User và Vehicles. | 12 | TSK-05, TSK-11 |
| **TSK-13** | Frontend | Xây dựng Dispatcher Dashboard (Quản lý đơn, Phân công xe). | 24 | TSK-07, TSK-11 |
| **TSK-14** | Frontend | Thiết kế bản đồ giám sát xe di chuyển thời gian thực (Polling). | 16 | TSK-08, TSK-13 |
| **TSK-15** | Frontend | Xây dựng Driver Dashboard nhận chuyến, giả lập cập nhật GPS. | 20 | TSK-08, TSK-11 |
| **TSK-16** | Frontend | Thiết kế Manager Dashboard (Hiển thị biểu đồ KPI và báo cáo). | 14 | TSK-09, TSK-11 |
| **TSK-17** | Testing | Viết Unit Test và Integration Test kiểm tra hoạt động API. | 16 | TSK-09, TSK-16 |
| **TSK-18** | Integration | Ghép nối toàn hệ thống, kiểm thử thủ công và vá lỗi hiển thị. | 16 | Toàn bộ tác vụ |

---

## 2. Lịch Trình Thực Hiện (8-Week Execution Schedule)

Lịch trình lập trình và hoàn thiện hệ thống được chia nhỏ làm 8 tuần như sau:

* **Tuần 1: Thiết lập hạ tầng và khung dự án (Milestone 1 - Project Setup)**
  * Thực hiện **TSK-01**, **TSK-02** và **TSK-10**.
  * Kết nối thành công backend NodeJS cục bộ với Database MongoDB Atlas trên đám mây.
* **Tuần 2-3: Phát triển tầng dữ liệu và APIs cốt lõi (Milestone 2 - Core APIs)**
  * Thực hiện **TSK-03**, **TSK-04** và **TSK-05**.
  * Hoàn thành toàn bộ APIs CRUD phục vụ quản trị hệ thống và xác thực người dùng.
* **Tuần 4: Nghiệp vụ điều phối và đồng bộ trạng thái (Milestone 3 - Business Logic)**
  * Thực hiện **TSK-06** và **TSK-07**.
  * Hoàn thành logic đồng bộ trạng thái tự động giữa các thực thể khi có phân công mới.
* **Tuần 5: Định vị xe & Tiếp nhận sự cố (Milestone 4 - Tracking & Incidents)**
  * Thực hiện **TSK-08** và **TSK-09**.
  * Xây dựng xong cơ chế ghi tọa độ hành trình và tiếp nhận báo cáo sự cố từ tài xế.
* **Tuần 6: Xây dựng UI & Các trang Dashboard (Milestone 5 - Frontend Layouts)**
  * Thực hiện **TSK-11**, **TSK-12** và **TSK-15**.
  * Hoàn thành giao diện Đăng nhập, Admin Dashboard và Driver Dashboard.
* **Tuần 7: Tích hợp bản đồ trực quan & Giám sát (Milestone 6 - Map Integration)**
  * Thực hiện **TSK-13**, **TSK-14** và **TSK-16**.
  * Hoàn thành Dispatcher Dashboard tích hợp bản đồ xe chạy giả lập và Manager Dashboard.
* **Tuần 8: Kiểm thử, Vá lỗi & Đóng gói sản phẩm (Milestone 7 - Final Delivery)**
  * Thực hiện **TSK-17** và **TSK-18**.
  * Viết tài liệu hướng dẫn cài đặt và vận hành hệ thống, chuẩn bị báo cáo môn học.

---

## 3. Bảng Quản Trị Rủi Ro Kỹ Thuật (Risk Register)

| Tên Rủi Ro | Khả Năng Xảy Ra | Mức Độ Tác Động | Chiến Lược Giảm Thiểu |
| :--- | :---: | :---: | :--- |
| **Lỗi DNS kết nối MongoDB Atlas** | Cao | Nghiêm trọng | Áp dụng cấu hình dns tĩnh `8.8.8.8` vào code kết nối database để vượt qua tường lửa mạng nội bộ. |
| **Độ trễ truyền nhận tọa độ xe** | Trung bình | Thấp | Thiết lập chu kỳ Polling phù hợp (8-10 giây) để giảm tải cho server mà vẫn đảm bảo Marker di chuyển mượt mà trên bản đồ. |
| **Xung đột mã nguồn khi code chung** | Cao | Trung bình | Sử dụng Git phân nhánh rõ ràng. Mỗi thành viên làm việc trên một branch riêng (`feature/auth`, `feature/order`...) và chỉ gộp (Merge) sau khi code đã chạy ổn định ở máy cá nhân. |
| **Trễ hạn lịch trình (Delay)** | Trung bình | Cao | Đặt các cột mốc Milestone rõ ràng theo từng tuần. Kiểm tra chéo tiến độ giữa các thành viên mỗi 2 ngày để kịp thời hỗ trợ code. |
