import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_123', {
    expiresIn: '30d',
  });
};

export const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);

    res.status(201).json({
      success: true,
      message: "Tạo người dùng thành công",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi tạo người dùng",
      error: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password_hash").sort({ createdAt: 'desc' });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách người dùng thành công",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách người dùng",
      error: error.message,
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password_hash");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy thông tin người dùng thành công",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy thông tin người dùng",
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password_hash");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật người dùng thành công",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi cập nhật người dùng",
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    res.status(200).json({
      success: true,
      message: "Xóa người dùng thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi xóa người dùng",
      error: error.message,
    });
  }
};

// ── Authentication ──

export const registerUser = async (req, res) => {
  try {
    const { full_name, email, phone, password, role } = req.body;

    // Kiểm tra các field bắt buộc
    if (!full_name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin (full_name, email, password, role)",
      });
    }

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email đã được đăng ký",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await User.create({
      full_name,
      email,
      phone,
      password_hash,
      role,
    });

    // Trả về user không kèm password_hash
    const userResponse = user.toObject();
    delete userResponse.password_hash;

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: userResponse,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi đăng ký",
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email và password",
      });
    }

    // Tìm user theo email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // Kiểm tra tài khoản bị khóa
    if (user.status === "inactive") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản đã bị khóa",
      });
    }

    // So sánh password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // Trả về user không kèm password_hash
    const userResponse = user.toObject();
    delete userResponse.password_hash;

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: userResponse,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi đăng nhập",
      error: error.message,
    });
  }
};