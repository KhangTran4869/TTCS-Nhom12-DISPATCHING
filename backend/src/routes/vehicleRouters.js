import express from "express";
import {
  createVehicle,
  deleteVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
} from "../controllers/VehicleControllers.js";

const routes = express.Router();

routes.post("/", createVehicle);
routes.get("/", getAllVehicles);
routes.get("/:id", getVehicleById);
routes.put("/:id", updateVehicle);
routes.delete("/:id", deleteVehicle);

export default routes;
