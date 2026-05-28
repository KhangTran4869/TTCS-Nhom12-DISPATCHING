import express from "express";
import {
  createIncident,
  deleteIncident,
  getAllIncidents,
  getIncidentById,
  resolveIncident,
  updateIncident,
} from "../controllers/IncidentControllers.js";

const routes = express.Router();

routes.post("/", createIncident);
routes.get("/", getAllIncidents);
routes.get("/:id", getIncidentById);
routes.put("/:id", updateIncident);
routes.patch("/:id/resolve", resolveIncident);
routes.delete("/:id", deleteIncident);

export default routes;
