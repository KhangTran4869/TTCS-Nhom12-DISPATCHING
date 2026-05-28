import express from "express";
import {
  createDispatchAssignment,
  getAllDispatchAssignments,
  getDispatchAssignmentById,
  updateDispatchAssignment,
  updateAssignmentStatus,
  deleteDispatchAssignment,
} from "../controllers/DispatchAssignmentControllers.js";

const routes = express.Router();

routes.get("/", getAllDispatchAssignments);
routes.get("/:id", getDispatchAssignmentById);
routes.post("/", createDispatchAssignment);
routes.patch("/:id/status", updateAssignmentStatus);
routes.put("/:id", updateDispatchAssignment);
routes.delete("/:id", deleteDispatchAssignment);

export default routes;
