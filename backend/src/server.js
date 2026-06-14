import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";

import userRoutes from "./routes/userRouters.js";
import driverRoutes from "./routes/driverRouters.js";
import vehicleRoutes from "./routes/vehicleRouters.js";
import orderRoutes from "./routes/orderRouters.js";
import dispatchAssignmentRoutes from "./routes/dispatchAssignmentRouters.js";
import driverLocationRoutes from "./routes/driverLocationRouters.js";
import incidentRoutes from "./routes/incidentRouters.js";
import dashboardRoutes from "./routes/dashboardRouters.js";
import { protect } from "./middleware/authMiddleware.js";

const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/drivers", protect, driverRoutes);
app.use("/api/vehicles", protect, vehicleRoutes);
app.use("/api/orders", protect, orderRoutes);
app.use("/api/dispatch-assignments", protect, dispatchAssignmentRoutes);
app.use("/api/driver-locations", protect, driverLocationRoutes);
app.use("/api/incidents", protect, incidentRoutes);
app.use("/api/dashboard", protect, dashboardRoutes);
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server đang chạy ở cổng ${PORT}`);
  });
});
