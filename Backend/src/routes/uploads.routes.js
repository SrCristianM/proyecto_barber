import { Router } from "express";
import { UploadsController } from "../controllers/uploads.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { uploadImage, uploadDocument } from "../middlewares/upload.middleware.js";

const router = Router();

router.post("/barbers", authenticate, uploadImage("barbers"), UploadsController.uploadImage);
router.post("/products", authenticate, uploadImage("products"), UploadsController.uploadImage);
router.post("/services", authenticate, uploadImage("services"), UploadsController.uploadImage);
router.post("/documents", authenticate, uploadDocument(), UploadsController.uploadDocument);

export default router;
