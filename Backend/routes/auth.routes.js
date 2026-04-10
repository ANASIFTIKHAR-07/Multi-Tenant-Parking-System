import { Router } from "express";
import {
  login,
  logout,
  getCurrentAdmin,
  accessRefreshToken,
  changePassword,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";
import { loginLimiter, refreshTokenLimiter } from "../middlewares/loginLimiter.js";

const router = Router();

router.route("/login").post(loginLimiter, login);
router.route("/logout").post(verifyJWT, isAdmin, logout);
router.route("/refresh-token").post(refreshTokenLimiter, accessRefreshToken);
router.route("/me").get(verifyJWT, isAdmin, getCurrentAdmin);
router.route("/change-password").patch(verifyJWT, isAdmin, changePassword);

export default router;
