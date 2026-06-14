import Driver from "../models/Driver.js";
import Vehicle from "../models/Vehicle.js";
import Incident from "../models/Incident.js";
import Order from "../models/Order.js";

export const getDashboardStats = async (req, res) => {
  try {
    // 1. Total Drivers
    const totalDrivers = await Driver.countDocuments();
    
    // 2. Active Vehicles (available, in_use)
    const activeVehicles = await Vehicle.countDocuments({
      status: { $in: ["available", "in_use"] }
    });
    const maintenanceVehicles = await Vehicle.countDocuments({ status: "maintenance" });

    // 3. Pending Alerts (Incidents)
    const pendingIncidents = await Incident.countDocuments({
      status: { $in: ["reported", "processing"] }
    });

    // 4. Deliveries Today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const deliveriesToday = await Order.countDocuments({
      status: "delivered",
      updatedAt: { $gte: startOfDay }
    });

    res.status(200).json({
      success: true,
      data: {
        totalDrivers,
        activeVehicles,
        maintenanceVehicles,
        pendingIncidents,
        deliveriesToday,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy số liệu dashboard",
      error: error.message,
    });
  }
};
