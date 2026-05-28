import Order from "../models/Order.js";

export const createOrder = async (req, res) => {
  try {
    const order = await Order.create(req.body);

    res.status(201).json({
      success: true,
      message: "Tạo đơn vận chuyển thành công",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi tạo đơn vận chuyển",
      error: error.message,
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { status, priority } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách đơn vận chuyển thành công",
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách đơn vận chuyển",
      error: error.message,
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn vận chuyển",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy thông tin đơn vận chuyển thành công",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy thông tin đơn vận chuyển",
      error: error.message,
    });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn vận chuyển",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật đơn vận chuyển thành công",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi cập nhật đơn vận chuyển",
      error: error.message,
    });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn vận chuyển",
      });
    }

    res.status(200).json({
      success: true,
      message: "Xóa đơn vận chuyển thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi xóa đơn vận chuyển",
      error: error.message,
    });
  }
};