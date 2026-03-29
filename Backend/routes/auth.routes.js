import { Router } from "express";
import {
  login,
  logout,
  getCurrentAdmin,
  accessRefreshToken,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";
import { loginLimiter } from "../middlewares/loginLimiter.js";


const router = Router();

router.route("/login").post(loginLimiter,login);
router.route("/logout").post(verifyJWT, isAdmin, logout);
router.route("/refresh-token").post(accessRefreshToken);
router.route("/me").get(verifyJWT, isAdmin, getCurrentAdmin);

export default router;
