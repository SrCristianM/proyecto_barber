import { body } from "express-validator";

export const loginValidation = [
  body("correo")
    .trim()
    .isEmail()
    .withMessage("Debes proporcionar un correo electrónico válido."),
  body("contrasena")
    .notEmpty()
    .withMessage("La contraseña es requerida.")
];

export const registerValidation = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre es requerido.")
    .isLength({ max: 80 })
    .withMessage("El nombre no puede superar los 80 caracteres."),
  body("apellido")
    .trim()
    .notEmpty()
    .withMessage("El apellido es requerido.")
    .isLength({ max: 80 })
    .withMessage("El apellido no puede superar los 80 caracteres."),
  body("tipo_documento")
    .optional({ checkFalsy: true })
    .trim()
    .isIn(["CC", "TI", "CE", "NIT", "PAS", "PEP", "DNI"])
    .withMessage("El tipo de documento debe ser válido (CC, TI, CE, NIT, PAS, PEP, DNI)."),
  body("documento")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage("El documento debe tener entre 5 y 20 caracteres."),
  body("correo")
    .trim()
    .isEmail()
    .withMessage("Ingresa un correo electrónico válido.")
    .isLength({ max: 120 }),
  body("contrasena")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres."),
  body("telefono")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage("El teléfono no puede superar los 20 caracteres.")
];

export const forgotPasswordValidation = [
  body("correo")
    .trim()
    .isEmail()
    .withMessage("Debes proporcionar un correo electrónico válido.")
];

export const resetPasswordValidation = [
  body("correo")
    .trim()
    .notEmpty()
    .withMessage("El correo electrónico es requerido.")
    .isEmail()
    .withMessage("Debes proporcionar un correo electrónico válido."),
  body("codigo")
    .trim()
    .notEmpty()
    .withMessage("El código de verificación es requerido."),
  body("nueva_contrasena")
    .notEmpty()
    .withMessage("La nueva contraseña es requerida.")
    .isLength({ min: 6 })
    .withMessage("La nueva contraseña debe tener al menos 6 caracteres.")
];

export const changePasswordValidation = [
  body("actualContrasena")
    .notEmpty()
    .withMessage("Ingresa tu contraseña actual."),
  body("nuevaContrasena")
    .isLength({ min: 8 })
    .withMessage("La nueva contraseña debe tener al menos 8 caracteres.")
];

export const updateProfileValidation = [
  body("nombre").trim().notEmpty().withMessage("El nombre es requerido."),
  body("apellido").trim().notEmpty().withMessage("El apellido es requerido."),
  body("documento")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage("El documento debe tener entre 5 y 20 caracteres."),
  body("telefono").optional().trim(),
  body("avatar_url").optional().trim(),
  body("foto").optional().trim()
];
