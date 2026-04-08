import express from "express";
import fetch from "node-fetch"; // npm i node-fetch
import multer from "multer";
const router = express.Router();
import userAuth from "../middleware/userAuth.js";
import { sendRecipeToTelegram } from "../controllers/userController.js";
const upload = multer({ storage: multer.memoryStorage() });

// multer для multipart/form-data (фото)

// POST /api/recipe-request
router.post("/", userAuth, upload.single("photo"), sendRecipeToTelegram);

export default router;
