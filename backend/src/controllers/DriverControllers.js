import Driver from "../models/Driver.js";

export const createDriver = async (req, res) => {
  try {
    const driver = await Driver.create(req.body);

    res.status(201).json({
      success: true,
      message: "Tạo tài xế thành công",
      data: driver,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi tạo tài xế",
      error: error.message,
    });
  }
};

export const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().populate(
      "user_id",
      "full_name email phone role status"
    );

    res.status(200).json({
      success: true,
      message: "Lấy danh sách tài xế thành công",
      data: drivers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách tài xế",
      error: error.message,
    });
  }
};

export const getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id).populate(
      "user_id",
      "full_name email phone role status"
    );

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài xế",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy thông tin tài xế thành công",
      data: driver,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy thông tin tài xế",
      error: error.message,
    });
  }
};

export const updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("user_id", "full_name email phone role status");

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài xế",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật tài xế thành công",
      data: driver,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi cập nhật tài xế",
      error: error.message,
    });
  }
};

export const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài xế",
      });
    }

    res.status(200).json({
      success: true,
      message: "Xóa tài xế thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi xóa tài xế",
      error: error.message,
    });
  }
};