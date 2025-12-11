import express from "express";
import { Role } from "@prisma/client";
import auth from "../../middlewares/auth";
import { AuthController } from "./auth.controller";
const router = express.Router();

router.get("/me", AuthController.getMe);

router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);

router.post("/refresh-token", AuthController.refreshToken);

router.post(
  "/change-password",
  auth(Role.ADMIN, Role.USER, Role.HOST),
  AuthController.changePassword
);

router.post("/forgot-password", AuthController.forgotPassword);

router.post("/reset-password", AuthController.resetPassword);

export const authRoutes = router;
