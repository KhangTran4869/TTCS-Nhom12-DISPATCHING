import DispatchAssignment from "../models/DispatchAssignment.js";
import Order from "../models/Order.js";
import Driver from "../models/Driver.js";
import Vehicle from "../models/Vehicle.js";

export const createDispatchAssignment = async (req, res) => {
  try {
    const {
      order_id,
      driver_id,
      vehicle_id,
    } = req.body;

    const order = await Order.findById(order_id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn vận chuyển",
      });
    }

    const driver = await Driver.findById(driver_id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài xế",
      });
    }

    if (driver.current_status !== "available") {
      return res.status(400).json({
        success: false,
        message: "Tài xế hiện không sẵn sàng",
      });
    }

    const vehicle = await Vehicle.findById(vehicle_id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phương tiện",
      });
    }

    if (vehicle.status !== "available") {
      return res.status(400).json({
        success: false,
        message: "Phương tiện hiện không sẵn sàng",
      });
    }

    const assignment = await DispatchAssignment.create(req.body);

    order.status = "assigned";
    await order.save();

    driver.current_status = "assigned";
    await driver.save();

    vehicle.status = "in_use";
    await vehicle.save();

    res.status(201).json({
      success: true,
      message: "Phân công vận chuyển thành công",
      data: assignment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi phân công vận chuyển",
      error: error.message,
    });
  }
};

export const getAllDispatchAssignments = async (req, res) => {
  try {
    const assignments = await DispatchAssignment.find()
      .populate("order_id")
      .populate({
        path: "driver_id",
        populate: {
          path: "user_id",
          select: "full_name email phone",
        },
      })
      .populate("vehicle_id")
      .populate("dispatcher_id", "full_name email phone role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách phân công thành công",
      data: assignments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách phân công",
      error: error.message,
    });
  }
};

export const getDispatchAssignmentById = async (req, res) => {
  try {
    const assignment = await DispatchAssignment.findById(req.params.id)
      .populate("order_id")
      .populate({
        path: "driver_id",
        populate: {
          path: "user_id",
          select: "full_name email phone",
        },
      })
      .populate("vehicle_id")
      .populate("dispatcher_id", "full_name email phone role");

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phân công",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy thông tin phân công thành công",
      data: assignment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy thông tin phân công",
      error: error.message,
    });
  }
};

export const updateDispatchAssignment = async (req, res) => {
  try {
    const assignment = await DispatchAssignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("order_id")
      .populate("driver_id")
      .populate("vehicle_id")
      .populate("dispatcher_id", "full_name email phone role");

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phân công",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật phân công thành công",
      data: assignment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi cập nhật phân công",
      error: error.message,
    });
  }
};

export const updateAssignmentStatus = async (req, res) => {
  try {
    const { assignment_status } = req.body;

    const assignment = await DispatchAssignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phân công",
      });
    }

    assignment.assignment_status = assignment_status;

    if (assignment_status === "in_progress") {
      assignment.start_time = new Date();

      await Order.findByIdAndUpdate(assignment.order_id, {
        status: "in_transit",
      });

      await Driver.findByIdAndUpdate(assignment.driver_id, {
        current_status: "on_trip",
      });
    }

    if (assignment_status === "completed") {
      assignment.end_time = new Date();

      await Order.findByIdAndUpdate(assignment.order_id, {
        status: "delivered",
      });

      await Driver.findByIdAndUpdate(assignment.driver_id, {
        current_status: "available",
      });

      await Vehicle.findByIdAndUpdate(assignment.vehicle_id, {
        status: "available",
      });
    }

    if (assignment_status === "cancelled") {
      await Order.findByIdAndUpdate(assignment.order_id, {
        status: "cancelled",
      });

      await Driver.findByIdAndUpdate(assignment.driver_id, {
        current_status: "available",
      });

      await Vehicle.findByIdAndUpdate(assignment.vehicle_id, {
        status: "available",
      });
    }

    await assignment.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái phân công thành công",
      data: assignment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi cập nhật trạng thái phân công",
      error: error.message,
    });
  }
};

export const deleteDispatchAssignment = async (req, res) => {
  try {
    const assignment = await DispatchAssignment.findByIdAndDelete(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phân công",
      });
    }

    res.status(200).json({
      success: true,
      message: "Xóa phân công thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi xóa phân công",
      error: error.message,
    });
  }
};