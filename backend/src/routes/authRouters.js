import express from "express";
import { login, register, forgotPassword, resetPassword } from "../controllers/AuthControllers.js";

const routes = express.Router();

routes.post("/login", login);
routes.post("/register", register);
routes.post("/forgot-password", forgotPassword);
routes.post("/reset-password", resetPassword);

export default routes;
