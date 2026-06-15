import express from "express";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";

import userRoutes from "./routes/userRouters.js";
import driverRoutes from "./routes/driverRouters.js";
import vehicleRoutes from "./routes/vehicleRouters.js";
import orderRoutes from "./routes/orderRouters.js";
import dispatchAssignmentRoutes from "./routes/dispatchAssignmentRouters.js";
import driverLocationRoutes from "./routes/driverLocationRouters.js";
import incidentRoutes from "./routes/incidentRouters.js";
import authRoutes from "./routes/authRouters.js";

dotenv.config();
const PORT = process.env.PORT || 5000;
const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dispatch-assignments", dispatchAssignmentRoutes);
app.use("/api/driver-locations", driverLocationRoutes);
app.use("/api/incidents", incidentRoutes);
connectDB().then(() => {
  app.listen(PORT, "127.0.0.1", () => {
    console.log(`Server đang chạy ở http://127.0.0.1:${PORT}`);
  });
});
