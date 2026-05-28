import express from "express";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
} from "../controllers/UserControllers.js";

const routes = express.Router();

routes.get("/", getAllUsers);
routes.get("/:id", getUserById);
routes.post("/", createUser);
routes.put("/:id", updateUser);
routes.delete("/:id", deleteUser);

export default routes;
