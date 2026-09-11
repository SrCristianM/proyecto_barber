import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../errors/apiError.js";

export class UploadsController {
  static async uploadImage(req, res, next) {
    try {
      if (!req.file) {
        throw ApiError.badRequest("No se ha enviado ningún archivo de imagen.");
      }

      const folder = req.uploadSubfolder || "products";
      const publicUrl = `/uploads/${folder}/${req.file.filename}`;

      return ApiResponse.created(
        res,
        {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimeType: req.file.mimetype,
          url: publicUrl
        },
        "Imagen cargada exitosamente"
      );
    } catch (error) {
      next(error);
    }
  }

  static async uploadDocument(req, res, next) {
    try {
      if (!req.file) {
        throw ApiError.badRequest("No se ha enviado ningún documento PDF.");
      }

      const publicUrl = `/uploads/documents/${req.file.filename}`;

      return ApiResponse.created(
        res,
        {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimeType: req.file.mimetype,
          url: publicUrl
        },
        "Documento PDF cargado exitosamente"
      );
    } catch (error) {
      next(error);
    }
  }
}
