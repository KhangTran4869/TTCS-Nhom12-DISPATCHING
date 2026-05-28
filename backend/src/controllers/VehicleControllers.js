import Vehicle from "../models/Vehicle.js";

export const createVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);

    res.status(201).json({
      success: true,
      message: "Tạo phương tiện thành công",
      data: vehicle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi tạo phương tiện",
      error: error.message,
    });
  }
};

export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();

    res.status(200).json({
      success: true,
      message: "Lấy danh sách phương tiện thành công",
      data: vehicles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách phương tiện",
      error: error.message,
    });
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phương tiện",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy thông tin phương tiện thành công",
      data: vehicle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy thông tin phương tiện",
      error: error.message,
    });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phương tiện",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật phương tiện thành công",
      data: vehicle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi cập nhật phương tiện",
      error: error.message,
    });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phương tiện",
      });
    }

    res.status(200).json({
      success: true,
      message: "Xóa phương tiện thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi xóa phương tiện",
      error: error.message,
    });
  }
};