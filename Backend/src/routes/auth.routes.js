import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/rateLimiter.middleware.js";
import {
  loginValidation,
  registerValidation,
  changePasswordValidation,
  updateProfileValidation
} from "../validators/auth.validator.js";

const router = Router();

router.post("/login", authLimiter, validate(loginValidation), AuthController.login);
router.post("/register", authLimiter, validate(registerValidation), AuthController.register);
router.get("/me", authenticate, AuthController.getProfile);
router.put("/profile", authenticate, validate(updateProfileValidation), AuthController.updateProfile);
router.put("/change-password", authenticate, validate(changePasswordValidation), AuthController.changePassword);
router.post("/logout", authenticate, AuthController.logout);

export default router;
