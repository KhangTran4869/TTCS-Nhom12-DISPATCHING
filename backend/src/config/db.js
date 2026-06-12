import mongoose from "mongoose";
import dns from "dns";

// Thiết lập DNS để tránh lỗi querySrv ECONNREFUSED khi phân giải SRV record của MongoDB Atlas
dns.setServers(["8.8.8.8", "8.8.4.4"]);

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Lỗi kết nối database:", error);
    process.exit(1);
  }
};

