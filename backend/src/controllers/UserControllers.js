import User from "../models/User.js";
import Driver from "../models/Driver.js";
import bcrypt from "bcrypt";

export const createUser = async (req, res) => {
  try {
    const { password_hash, role } = req.body;

    // Hash password if provided, otherwise default to 123456
    if (password_hash) {
      const salt = await bcrypt.genSalt(10);
      req.body.password_hash = await bcrypt.hash(password_hash, salt);
    } else {
      const salt = await bcrypt.genSalt(10);
      req.body.password_hash = await bcrypt.hash("123456", salt);
    }

    const user = await User.create(req.body);

    // If role is driver, automatically create a Driver record
    if (user.role === "driver") {
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
    const { password_hash } = req.body;

    // Hash password if updated
    if (password_hash) {
      const salt = await bcrypt.genSalt(10);
      req.body.password_hash = await bcrypt.hash(password_hash, salt);
    }

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

    // If role is updated to driver, make sure a Driver record exists
    if (user.role === "driver") {
      const existingDriver = await Driver.findOne({ user_id: user._id });
      if (!existingDriver) {
        await Driver.create({
          user_id: user._id,
          license_number: `GPLX-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
          license_type: "B2",
          experience_years: 1,
          current_status: "available",
        });
      }
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

    // Delete corresponding driver record if it exists
    if (user.role === "driver") {
      await Driver.findOneAndDelete({ user_id: user._id });
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