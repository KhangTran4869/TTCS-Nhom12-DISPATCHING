import Incident from "../models/Incident.js";

export const createIncident = async (req, res) => {
  try {
    const incident = await Incident.create(req.body);

    res.status(201).json({
      success: true,
      message: "Tạo báo cáo sự cố thành công",
      data: incident,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi tạo báo cáo sự cố",
      error: error.message,
    });
  }
};

export const getAllIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find()
      .populate("assignment_id")
      .populate("reported_by", "full_name email phone role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách sự cố thành công",
      data: incidents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách sự cố",
      error: error.message,
    });
  }
};

export const getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate("assignment_id")
      .populate("reported_by", "full_name email phone role");

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sự cố",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy thông tin sự cố thành công",
      data: incident,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy thông tin sự cố",
      error: error.message,
    });
  }
};

export const updateIncident = async (req, res) => {
  try {
    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("assignment_id")
      .populate("reported_by", "full_name email phone role");

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sự cố",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật sự cố thành công",
      data: incident,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi cập nhật sự cố",
      error: error.message,
    });
  }
};

export const resolveIncident = async (req, res) => {
  try {
    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      {
        status: "resolved",
        resolved_at: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sự cố",
      });
    }

    res.status(200).json({
      success: true,
      message: "Xử lý sự cố thành công",
      data: incident,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi xử lý sự cố",
      error: error.message,
    });
  }
};

export const deleteIncident = async (req, res) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sự cố",
      });
    }

    res.status(200).json({
      success: true,
      message: "Xóa sự cố thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi xóa sự cố",
      error: error.message,
    });
  }
};