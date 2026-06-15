import Vehicle from "../models/Vehicle.js";
import Driver from "../models/Driver.js";
import Order from "../models/Order.js";
import DispatchAssignment from "../models/DispatchAssignment.js";

export const syncDatabaseStatuses = async () => {
  try {
    console.log("Đang đồng bộ trạng thái database để tránh kẹt xe/tài xế/đơn hàng...");

    // 1. Tìm tất cả các phân công đang active
    const activeAssignments = await DispatchAssignment.find({
      assignment_status: { $in: ["assigned", "accepted", "in_progress", "arrived"] }
    });

    const activeVehicleIds = activeAssignments.map(a => a.vehicle_id.toString());
    const activeDriverIds = activeAssignments.map(a => a.driver_id.toString());
    const activeOrderIds = activeAssignments.map(a => a.order_id.toString());

    // Map các ID sang trạng thái tương ứng để cập nhật chính xác
    const vehicleStatusMap = {};
    const driverStatusMap = {};
    const orderStatusMap = {};

    activeAssignments.forEach(a => {
      if (!a.vehicle_id || !a.driver_id || !a.order_id) return;
      
      const vId = a.vehicle_id.toString();
      const dId = a.driver_id.toString();
      const oId = a.order_id.toString();

      vehicleStatusMap[vId] = "in_use";

      if (a.assignment_status === "assigned" || a.assignment_status === "accepted") {
        driverStatusMap[dId] = "assigned";
        orderStatusMap[oId] = "assigned";
      } else if (a.assignment_status === "in_progress") {
        driverStatusMap[dId] = "on_trip";
        orderStatusMap[oId] = "in_transit";
      } else if (a.assignment_status === "arrived") {
        driverStatusMap[dId] = "on_trip";
        orderStatusMap[oId] = "arrived";
      }
    });

    // 2. Đồng bộ trạng thái xe
    const allVehicles = await Vehicle.find();
    for (const vehicle of allVehicles) {
      const vId = vehicle._id.toString();
      const expectedStatus = vehicleStatusMap[vId] || "available";
      if (vehicle.status !== expectedStatus && vehicle.status !== "maintenance") {
        vehicle.status = expectedStatus;
        await vehicle.save();
        console.log(`Đồng bộ xe ${vehicle.plate_number}: ${vehicle.status}`);
      }
    }

    // 3. Đồng bộ trạng thái tài xế
    const allDrivers = await Driver.find();
    for (const driver of allDrivers) {
      const dId = driver._id.toString();
      const expectedStatus = driverStatusMap[dId] || "available";
      // Nếu driver đang nghỉ (off) thì giữ nguyên, ngược lại cập nhật theo phân công
      if (driver.current_status !== expectedStatus && driver.current_status !== "off") {
        driver.current_status = expectedStatus;
        await driver.save();
        console.log(`Đồng bộ driver ID ${dId}: ${driver.current_status}`);
      }
    }

    // 4. Đồng bộ trạng thái đơn hàng
    const allOrders = await Order.find();
    for (const order of allOrders) {
      const oId = order._id.toString();
      const expectedStatus = orderStatusMap[oId] || "pending";
      // Chỉ đồng bộ các đơn chưa hoàn thành / chưa huỷ
      if (order.status !== expectedStatus && !["delivered", "cancelled"].includes(order.status)) {
        order.status = expectedStatus;
        await order.save();
        console.log(`Đồng bộ đơn hàng #${order.order_code}: ${order.status}`);
      }
    }

    console.log("Đồng bộ trạng thái database hoàn tất!");
  } catch (error) {
    console.error("Lỗi khi đồng bộ trạng thái database:", error);
  }
};
