import express from "express";
import {
  createDriver,
  getAllDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
} from "../controllers/DriverControllers.js";

const routes = express.Router();

routes.get("/", getAllDrivers);
routes.get("/:id", getDriverById);
routes.post("/", createDriver);
routes.put("/:id", updateDriver);
routes.delete("/:id", deleteDriver);

export default routes;
