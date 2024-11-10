import express from "express";
import { signIn, signUp } from "../controllers/auth.controller.js";
import { validateUser } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.post("/signin", validateUser, signIn);
router.post("/signup", signUp);

export default router;
