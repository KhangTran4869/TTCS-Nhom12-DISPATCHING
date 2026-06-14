import express from "express";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  registerUser,
  loginUser,
} from "../controllers/UserControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const routes = express.Router();

// Authentication
routes.post("/register", registerUser);
routes.post("/login", loginUser);

// CRUD (Protected)
routes.get("/", protect, getAllUsers);
routes.get("/:id", protect, getUserById);
routes.post("/", protect, createUser);
routes.put("/:id", protect, updateUser);
routes.delete("/:id", protect, deleteUser);

export default routes;
