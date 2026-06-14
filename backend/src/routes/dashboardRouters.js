import express from "express";
import { getDashboardStats } from "../controllers/DashboardControllers.js";

const routes = express.Router();

routes.get("/stats", getDashboardStats);

export default routes;
