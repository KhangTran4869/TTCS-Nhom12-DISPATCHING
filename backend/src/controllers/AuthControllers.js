import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Driver from "../models/Driver.js";

const createToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || "fallback_secret_123",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.password_hash;
  return obj;
};

export const register = async (req, res) => {
  try {
    const { full_name, email, phone, password, role } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ họ tên, email và mật khẩu",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email đã tồn tại",
      });
    }

    const allowedRoles = ["admin", "dispatcher", "driver", "manager"];
    const userRole = allowedRoles.includes(role) ? role : "dispatcher";
    const password_hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      full_name: full_name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || "",
      password_hash,
      role: userRole,
      status: "active",
    });

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
      data: sanitizeUser(user),
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
        message: "Vui lòng nhập email và mật khẩu",
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản đã bị vô hiệu hóa",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    const safeUser = sanitizeUser(user);

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      token: createToken(user._id),
      data: safeUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi đăng nhập",
      error: error.message,
    });
  }
};
