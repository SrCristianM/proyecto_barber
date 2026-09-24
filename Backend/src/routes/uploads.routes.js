import { Router } from "express";
import { UploadsController } from "../controllers/uploads.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { uploadImage, uploadDocument } from "../middlewares/upload.middleware.js";

const router = Router();

router.post("/barbers", authenticate, uploadImage("barbers"), UploadsController.uploadImage);
router.post("/products", authenticate, uploadImage("products"), UploadsController.uploadImage);
router.post("/services", authenticate, uploadImage("services"), UploadsController.uploadImage);
router.post("/documents", authenticate, uploadDocument(), UploadsController.uploadDocument);

router.post("/users", authenticate, uploadImage("users"), UploadsController.uploadImage);
router.post("/clients", authenticate, uploadImage("clients"), UploadsController.uploadImage);

export default router;
