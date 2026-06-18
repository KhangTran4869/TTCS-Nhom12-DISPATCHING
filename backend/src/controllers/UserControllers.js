import User from "../models/User.js";
import bcrypt from "bcrypt";

export const createUser = async (req, res) => {
  try {
    const payload = { ...req.body };
    
    // Xử lý hash mật khẩu (từ Admin hoặc Manager truyền lên)
    const rawPassword = payload.password || payload.password_hash;
    if (!rawPassword) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp mật khẩu",
      });
    }
    
    payload.password_hash = await bcrypt.hash(rawPassword, 10);
    delete payload.password;

    const user = await User.create(payload);

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
    const payload = { ...req.body };

    // Nếu có cập nhật mật khẩu
    const rawPassword = payload.password || payload.password_hash;
    if (rawPassword) {
      payload.password_hash = await bcrypt.hash(rawPassword, 10);
      delete payload.password;
    } else {
      // Đảm bảo không ghi đè thành undefined/null nếu frontend vô tình gửi
      delete payload.password_hash;
      delete payload.password;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      payload,
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