import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { ApiError } from "../errors/apiError.js";
import { env } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadBaseDir = path.resolve(__dirname, "../../uploads");

// Asegurar subdirectorios
["barbers", "products", "services", "documents"].forEach((dir) => {
  const fullPath = path.join(uploadBaseDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subfolder = req.uploadSubfolder || "documents";
    const dest = path.join(uploadBaseDir, subfolder);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
  const mime = file.mimetype;

  if (allowedTypes.test(ext) && (mime.includes("image/") || mime.includes("octet-stream"))) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest("Formato de imagen no permitido. Solo se aceptan JPEG, PNG y WEBP."));
  }
};

const documentFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
  if (ext === "pdf" && file.mimetype.includes("pdf")) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest("Formato de archivo no permitido. Solo se aceptan documentos PDF."));
  }
};

export const uploadImage = (subfolder = "products") => {
  return (req, res, next) => {
    req.uploadSubfolder = subfolder;
    const upload = multer({
      storage,
      fileFilter: imageFilter,
      limits: { fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 }
    }).single("imagen");

    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(ApiError.badRequest(`La imagen supera el tamaño máximo permitido (${env.MAX_FILE_SIZE_MB}MB)`));
        }
        return next(ApiError.badRequest(err.message));
      } else if (err) {
        return next(err);
      }
      next();
    });
  };
};

export const uploadDocument = () => {
  return (req, res, next) => {
    req.uploadSubfolder = "documents";
    const upload = multer({
      storage,
      fileFilter: documentFilter,
      limits: { fileSize: 10 * 1024 * 1024 } // 10MB para documentos
    }).single("documento");

    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return next(ApiError.badRequest(err.message));
      } else if (err) {
        return next(err);
      }
      next();
    });
  };
};
