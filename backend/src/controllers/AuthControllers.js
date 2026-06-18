import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/User.js";

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

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp email",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản với email này",
      });
    }

    // Tạo mật khẩu mới ngẫu nhiên 6 chữ số
    const newPassword = Math.floor(100000 + Math.random() * 900000).toString();
    const password_hash = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu trong DB
    user.password_hash = password_hash;
    await user.save();

    // Gửi email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Cấp lại mật khẩu - Hệ thống Điều Phối",
      html: `
        <h3>Xin chào ${user.full_name},</h3>
        <p>Bạn đã yêu cầu cấp lại mật khẩu cho hệ thống Điều Phối.</p>
        <p>Mật khẩu mới của bạn là: <strong style="font-size: 18px; color: blue;">${newPassword}</strong></p>
        <p>Vui lòng đăng nhập bằng mật khẩu này và đổi mật khẩu sớm nhất có thể để bảo mật thông tin.</p>
        <br/>
        <p>Trân trọng,</p>
        <p>Ban Quản Trị Hệ Thống</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Mật khẩu mới đã được gửi tới email của bạn",
    });
  } catch (error) {
    console.error("Lỗi quên mật khẩu:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi xử lý quên mật khẩu",
      error: error.message,
    });
  }
};
