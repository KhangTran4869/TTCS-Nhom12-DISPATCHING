# Giải thích chi tiết code Component Login và Register

Tài liệu này giải thích chi tiết từng phần code trong hai component `Login.jsx` và `Register.jsx` thuộc thư mục `frontend/src/components/`.

---

## 1. Chi tiết code `Login.jsx`

Component này xử lý ba luồng chính: **Đăng nhập (Login)**, **Quên mật khẩu (Forgot Password)** và **Đặt lại mật khẩu (Reset Password)**.

### a. Khai báo Component và Props (Dòng 1 - 4)
```jsx
import { useState } from 'react';
import { Shield, Mail, Lock, Loader, Eye, EyeOff, LogIn } from 'lucide-react';

function Login({ onLogin, onSwitchToRegister, showToast }) { ... }
```
- Component nhận vào 3 props từ component cha (`App.jsx`):
  - `onLogin`: Hàm callback được gọi khi đăng nhập thành công để truyền thông tin `user` và `token` lên App.
  - `onSwitchToRegister`: Hàm callback để chuyển đổi giao diện sang màn hình Đăng ký.
  - `showToast`: Hàm hiển thị thông báo (thành công/thất bại) cho người dùng.

### b. Quản lý State (Trạng thái)
```jsx
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState('login'); // 'login', 'forgot', 'reset'
```
- **`email`, `password`**: Lưu trữ giá trị người dùng nhập vào.
- **`showPassword`**: Biến boolean để bật/tắt hiển thị mật khẩu.
- **`isSubmitting`**: Biến boolean báo hiệu giao diện đang trong trạng thái gửi request.
- **`step`**: Quản lý trạng thái form hiện tại, có thể là `'login'`, `'forgot'`, hoặc `'reset'`.
- Ngoài ra còn có state lưu trữ thông tin khôi phục mật khẩu (`forgotEmail`, `resetCode`, `newPassword`, `confirmPassword`).

### c. Xử lý Đăng nhập `handleSubmit`
```jsx
const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn trình duyệt reload lại trang khi submit form
    if (!email || !password) { ... } // Validate cơ bản

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/login', { ... });
      const result = await response.json();

      if (result.success && result.data) {
        onLogin(result.data, result.token); // Báo cho App.jsx biết đăng nhập thành công
      } else { ... }
    } catch (error) { ... }
    finally { setIsSubmitting(false); } // Luôn tắt trạng thái loading sau khi xong
};
```
- Hàm này tạo một `POST request` tới endpoint `/api/auth/login` của Backend.
- Nếu Backend trả về thành công, gọi hàm `onLogin`.

### d. Xử lý Quên mật khẩu `handleForgotPassword` và `handleResetPassword`
- `handleForgotPassword`: Gọi đến API `/api/auth/forgot-password` với body chỉ chứa `email`. Backend sẽ tạo một mã xác nhận 6 số và gửi qua email. Sau đó frontend chuyển `step` sang `'reset'`.
- `handleResetPassword`: Gọi đến API `/api/auth/reset-password` với `email`, `code` (mã 6 số), và `newPassword`. Nếu thành công sẽ cho phép đăng nhập lại.

### e. Cấu trúc Giao diện Render / JSX
- Component sử dụng toán tử ba ngôi để quyết định xem sẽ hiển thị form Quên mật khẩu (`step === 'forgot'`), form Đặt lại mật khẩu (`step === 'reset'`), hay form Đăng nhập bình thường (`step === 'login'`).
- Các ô input là **Controlled Components** trong React. Nghĩa là giá trị của ô input luôn được đồng bộ với biến state thông qua sự kiện `onChange`.

---

## 2. Chi tiết code `Register.jsx` (303 dòng)

Component này quản lý quá trình đăng ký tài khoản mới cho hệ thống.

### a. Khai báo Component và Props (Dòng 1 - 14)
```jsx
import { useState } from "react";
import { UserPlus, Mail, Lock, User, Phone, Loader, Eye, EyeOff, Shield } from "lucide-react";

function Register({ onRegisterSuccess, onSwitchToLogin, showToast }) { ... }
```
- Khai báo các module (dòng 1-12) và định nghĩa hàm (dòng 14).
- `onRegisterSuccess`: Hàm callback chuyển người dùng về lại trang đăng nhập sau khi đăng ký thành công.
- `onSwitchToLogin`: Hàm callback chuyển hướng thủ công khi người dùng click vào "Đã có tài khoản? Đăng nhập".

### b. Quản lý State bằng Object (Dòng 15 - 29)
```jsx
  const [formData, setFormData] = useState({
    full_name: "", email: "", phone: "", role: "driver", password: "", confirmPassword: "",
  });
```
- Thay vì dùng nhiều `useState` rời rạc như ở Login, Register nhóm toàn bộ dữ liệu form vào một object `formData` duy nhất (Từ **dòng 15 - 22**). Việc này giúp code gọn gàng hơn với nhiều trường dữ liệu.
- Các state cờ hiệu phụ `showPassword`, `showConfirm`, `isSubmitting` (Từ **dòng 23 - 25**).
- Hàm `handleChange` (Từ **dòng 27 - 29**) giúp cập nhật dữ liệu linh hoạt:
  ```jsx
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  ```

### c. Validation Form `validateForm` (Dòng 31 - 71)
Trước khi gửi lên Backend, Frontend sẽ kiểm tra tính hợp lệ của dữ liệu:
- Kiểm tra dữ liệu rỗng: Họ tên (Dòng 32 - 35), Email (Dòng 37 - 40), Role (Dòng 48 - 51).
- Dùng **Regex (Biểu thức chính quy)** để kiểm tra định dạng email (Dòng 42 - 46).
- Kiểm tra Role có nằm trong danh sách cho phép không (`dispatcher`, `driver`, `manager`) (Dòng 53 - 58).
- Kiểm tra độ dài mật khẩu >= 6 ký tự (Dòng 60 - 63) và mật khẩu nhập lại (`confirmPassword`) có khớp không (Dòng 65 - 68).

### d. Xử lý Đăng ký `handleSubmit` (Dòng 73 - 109)
```jsx
const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; // Dừng lại nếu form không hợp lệ

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ ... }), // Gửi data lên backend
      });
      // ... xử lý kết quả
      if (result.success) onRegisterSuccess();
    } // ...
};
```
- Chuẩn hóa dữ liệu trước khi gửi đi (Từ **dòng 82 - 88**): Dùng `.trim()` để xóa khoảng trắng thừa, `.toLowerCase()` để đồng nhất email in thường.

### e. Cấu trúc Giao diện Render / JSX (Dòng 111 - 300)
- Phần `return (...)` xây dựng giao diện tổng thể.
- Bổ sung ô `select` (Dropdown) để người dùng chọn Role (Vai trò): Tài xế, Điều phối viên, Quản lý (Từ **dòng 188 - 206**). Mặc định là `driver`.
- Có 2 ô password (nhập mật khẩu và xác nhận mật khẩu), mỗi ô đều có logic hiển thị/ẩn mật khẩu riêng (`showPassword` và `showConfirm`) (Từ **dòng 208 - 262**).
