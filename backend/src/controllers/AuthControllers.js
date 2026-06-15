import User from "../models/User.js";
import Driver from "../models/Driver.js";
import bcrypt from "bcrypt";

export const register = async (req, res) => {
  try {
    const { full_name, email, phone, password, role } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ họ tên, email và mật khẩu",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email đã tồn tại trên hệ thống",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const userRole = role || "driver";

    // Create user
    const user = await User.create({
      full_name,
      email: email.toLowerCase(),
      phone,
      password_hash,
      role: userRole,
      status: "active",
    });

    // If role is driver, create a Driver record
    if (userRole === "driver") {
      await Driver.create({
        user_id: user._id,
        license_number: `GPLX-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        license_type: "B2",
        experience_years: 1,
        current_status: "available",
      });
    }

    res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản thành công",
      data: {
        _id: user._id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi đăng ký tài khoản",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ email và mật khẩu",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    if (user.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Tài khoản của bạn đã bị vô hiệu hóa",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        _id: user._id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi đăng nhập",
      error: error.message,
    });
  }
};
