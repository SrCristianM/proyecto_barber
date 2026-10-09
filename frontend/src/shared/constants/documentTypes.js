/**
 * Tipos de documento de identidad y tipos de persona estandarizados.
 */
export const DOCUMENT_TYPES = [
  { value: "CC", label: "Cédula de Ciudadanía (CC)" },
  { value: "TI", label: "Tarjeta de Identidad (TI)" },
  { value: "CE", label: "Cédula de Extranjería (CE)" },
  { value: "NIT", label: "NIT (Tributario)" },
  { value: "PAS", label: "Pasaporte" },
  { value: "PEP", label: "Permiso Especial (PEP/PPT)" },
  { value: "DNI", label: "DNI / Otro" }
];

export const SUPPLIER_DOCUMENT_TYPES = [
  { value: "NIT", label: "NIT (Número Tributario)" },
  { value: "CC", label: "Cédula de Ciudadanía (CC)" },
  { value: "CE", label: "Cédula de Extranjería (CE)" },
  { value: "RUT", label: "RUT" },
  { value: "PAS", label: "Pasaporte" },
  { value: "DNI", label: "DNI / Otro" }
];

export const PERSON_TYPES = [
  { value: "Persona Jurídica", label: "Persona Jurídica (Empresa / Sociedad)" },
  { value: "Persona Natural", label: "Persona Natural (Individuo)" }
];
