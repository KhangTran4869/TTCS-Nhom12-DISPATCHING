import express from "express";
import {
  createDriverLocation,
  deleteDriverLocation,
  getAllDriverLocations,
  getLatestDriverLocation,
  getLocationsByAssignment,
} from "../controllers/DriverLocationControllers.js";

const routes = express.Router();

routes.post("/", createDriverLocation);
routes.get("/", getAllDriverLocations);
routes.get("/assignment/:assignment_id", getLatestDriverLocation);
routes.get("/driver/:driver_id/latest", getLocationsByAssignment);
routes.delete("/:id", deleteDriverLocation);

export default routes;
