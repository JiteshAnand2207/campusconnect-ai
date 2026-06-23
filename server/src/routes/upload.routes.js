import { Router } from "express";
import {
  uploadMultipleFiles,
  uploadSingleFile,
} from "../controllers/upload.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

router.post("/single", protect, upload.single("file"), uploadSingleFile);

router.post("/multiple", protect, upload.array("files", 5), uploadMultipleFiles);

export default router;