import express, { Router } from "express";
import {
    regenerateVerificationToken,
  checkAuth,
  forgotPassword,
  google,
  login,
  logout,
  resetPassword,
  signup,
  verifyEmail,
} from "../controllers/auth.controller.js"; 

const router: Router = express.Router();

router.get("/check-auth", checkAuth);

router.post("/signup", signup);
router.post("/logout", logout);
router.post("/login", login);
router.post("/google", google);
router.post("/regenerate-verification-token", regenerateVerificationToken);

router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;  
