import express from "express";
import {
  createOrder,
  deleteOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
} from "../controllers/OrderControllers.js";

const routes = express.Router();

routes.post("/", createOrder);
routes.get("/", getAllOrders);
routes.get("/:id", getOrderById);
routes.put("/:id", updateOrder);
routes.delete("/:id", deleteOrder);

export default routes;
