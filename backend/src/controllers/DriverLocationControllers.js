import DriverLocation from "../models/DriverLocation.js";

export const createDriverLocation = async (req, res) => {
  try {
    const location = await DriverLocation.create(req.body);

    res.status(201).json({
      success: true,
      message: "Cập nhật vị trí tài xế thành công",
      data: location,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi cập nhật vị trí tài xế",
      error: error.message,
    });
  }
};

export const getAllDriverLocations = async (req, res) => {
  try {
    const locations = await DriverLocation.find()
      .populate("assignment_id")
      .populate("driver_id")
      .sort({ recorded_at: -1 });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách vị trí tài xế thành công",
      data: locations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách vị trí tài xế",
      error: error.message,
    });
  }
};

export const getLocationsByAssignment = async (req, res) => {
  try {
    const locations = await DriverLocation.find({
      assignment_id: req.params.assignmentId,
    }).sort({ recorded_at: -1 });

    res.status(200).json({
      success: true,
      message: "Lấy vị trí theo phân công thành công",
      data: locations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy vị trí theo phân công",
      error: error.message,
    });
  }
};

export const getLatestDriverLocation = async (req, res) => {
  try {
    const location = await DriverLocation.findOne({
      driver_id: req.params.driverId,
    }).sort({ recorded_at: -1 });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy vị trí tài xế",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy vị trí mới nhất của tài xế thành công",
      data: location,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy vị trí mới nhất của tài xế",
      error: error.message,
    });
  }
};

export const deleteDriverLocation = async (req, res) => {
  try {
    const location = await DriverLocation.findByIdAndDelete(req.params.id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy vị trí tài xế",
      });
    }

    res.status(200).json({
      success: true,
      message: "Xóa vị trí tài xế thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi xóa vị trí tài xế",
      error: error.message,
    });
  }
};