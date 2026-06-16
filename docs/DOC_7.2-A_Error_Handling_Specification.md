# DOC 7.2-A: ĐẶC TẢ XỬ LÝ LỖI (ERROR HANDLING SPECIFICATION)

Tài liệu này định nghĩa chiến lược xử lý lỗi đồng bộ trong toàn hệ thống, bao gồm cấu trúc phản hồi lỗi tiêu chuẩn của API, danh mục các lỗi phổ biến và hướng dẫn gỡ lỗi.

---

## 1. Định Dạng Phản Hồi Lỗi Tiêu Chuẩn (Error JSON Format)

Khi xảy ra lỗi trong quá trình xử lý yêu cầu API, Backend bắt buộc phải phản hồi về Client một đối tượng JSON có cấu trúc thống nhất như sau:

```json
{
  "success": false,
  "message": "Thông báo lỗi thân thiện hiển thị cho người dùng biết chuyện gì xảy ra.",
  "error": "Chi tiết kỹ thuật hoặc nội dung của Exception phục vụ lập trình viên gỡ lỗi (chỉ trả về trong môi trường dev)."
}
```

---

## 2. Danh Mục Các Lỗi Phổ Biến (Error Matrix)

Dưới đây là bảng thống kê các tình huống lỗi thường gặp, mã trạng thái HTTP tương ứng và thông điệp dữ liệu trả về:

| Tình Huống Lỗi | Mã HTTP | Thông Điệp `message` | Trường Hợp Kích Hoạt |
| :--- | :---: | :--- | :--- |
| **Sai thông tin đăng nhập** | `400` | "Email hoặc mật khẩu không chính xác" | Người dùng nhập sai mật khẩu hoặc tài khoản chưa đăng ký. |
| **Tài khoản bị khóa** | `403` | "Tài khoản hiện đang bị tạm khóa" | Người dùng cố gắng đăng nhập vào tài khoản có trạng thái `status: "inactive"`. |
| **Không tìm thấy bản ghi** | `404` | "Không tìm thấy thông tin đơn vận chuyển" / "Không tìm thấy tài xế" | Gọi API với mã ID (`:id`) không tồn tại trong Database. |
| **Tài xế/Xe bận** | `400` | "Tài xế/Phương tiện hiện không sẵn sàng" | Dispatcher cố tình phân công một tài xế đang đi chuyến (`assigned` / `on_trip`) cho đơn hàng mới. |
| **Lỗi định dạng ID** | `400` | "Định dạng mã ID không hợp lệ" | Gửi tham số ID lên URL sai cấu trúc 24 ký tự hex của MongoDB ObjectId. |
| **Lỗi hệ thống database** | `500` | "Lỗi kết nối cơ sở dữ liệu" | MongoDB Atlas gặp sự cố mất mạng hoặc quá tải kết nối. |
| **Trùng lặp dữ liệu** | `400` | "Mã đơn hàng / Biển số xe đã tồn tại" | Tạo mới bản ghi có trường đánh dấu `unique: true` trùng với dữ liệu cũ trong DB. |

---

## 3. Hướng Dẫn Xử Lý Lỗi Ở Cả Hai Phía

### 3.1. Phía Backend (Node.js/Express)
* **Khối Try/Catch bắt buộc:** Tất cả các hàm xử lý trong Controller bắt buộc phải được bọc trong khối `try { ... } catch (error) { ... }` để ngăn chặn việc sập server (crash process) khi gặp lỗi bất ngờ.
* **Ghi nhật ký (Logging):** Trong khối `catch (error)`, lập trình viên phải ghi log chi tiết ra console bằng `console.error("Lỗi tại [Hàm X]:", error.message)` trước khi gửi phản hồi HTTP về cho Client.
* **Ví dụ mẫu code xử lý lỗi:**
  ```javascript
  export const getVehicleById = async (req, res) => {
    try {
      const vehicle = await Vehicle.findById(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ success: false, message: "Không tìm thấy phương tiện" });
      }
      res.status(200).json({ success: true, data: vehicle });
    } catch (error) {
      console.error("Lỗi lấy thông tin phương tiện:", error);
      res.status(500).json({ success: false, message: "Lỗi lấy thông tin phương tiện", error: error.message });
    }
  };
  ```

### 3.2. Phía Frontend (React)
* **Xử lý phản hồi lỗi từ API:** Khi gọi API bằng `fetch` hoặc `axios`, client phải luôn kiểm tra thuộc tính `response.ok` hoặc `data.success`.
* **Hiển thị thông báo (Toast notifications):** Khi API trả về `success: false`, React component phải bắt lấy `data.message` và gọi hàm hiển thị thông báo nổi (`showToast(message, 'danger')`) để thông báo trực quan cho người dùng thay vì ghi log im lặng trong Console.
