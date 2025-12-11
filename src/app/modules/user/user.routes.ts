import express from "express";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";
import { UserController } from "./user.controller";

const router = express.Router();

router.post("/create-user", UserController.createUser);
router.post("/create-host", UserController.createHost);

router.get("/get-all-host", UserController.getAllHosts);
router.get("/get-all-user", auth(Role.ADMIN), UserController.getAllUsers);

router.get("/:id", UserController.getSingleUser);
router.patch("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);

export const userRoutes = router;
