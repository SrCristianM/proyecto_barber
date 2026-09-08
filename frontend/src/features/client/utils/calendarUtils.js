/**
 * Utilidades para exportación de citas a calendarios y compartir vía WhatsApp
 */

export function createGoogleCalendarUrl({
  titulo = "Cita en Barbería",
  descripcion = "Corte de cabello y arreglo en salón de barbería prémium.",
  ubicacion = "Calle 10 # 40-20, El Poblado, Medellín",
  fecha, // YYYY-MM-DD
  hora,  // HH:mm o HH:mm:ss
  duracionMinutos = 45
}) {
  if (!fecha || !hora) return "#";

  // Formato YYYYMMDDTHHmmssZ
  const [year, month, day] = fecha.split("-");
  const cleanHora = hora.substring(0, 5);
  const [hours, minutes] = cleanHora.split(":");

  const startDate = new Date(year, parseInt(month) - 1, day, parseInt(hours), parseInt(minutes));
  const endDate = new Date(startDate.getTime() + duracionMinutos * 60000);

  const formatCalDate = (d) => {
    return d.toISOString().replace(/-|:|\.\d+/g, "");
  };

  const datesParam = `${formatCalDate(startDate)}/${formatCalDate(endDate)}`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `💈 ${titulo}`,
    dates: datesParam,
    details: `${descripcion}\n\n📍 Dirección: ${ubicacion}\n✨ Te esperamos 5 minutos antes de tu turno.`,
    location: ubicacion
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcsFile({
  titulo = "Cita en Barbería",
  descripcion = "Corte y arreglo en salón de barbería prémium.",
  ubicacion = "Calle 10 # 40-20, El Poblado, Medellín",
  fecha,
  hora,
  duracionMinutos = 45
}) {
  if (!fecha || !hora) return;

  const [year, month, day] = fecha.split("-");
  const cleanHora = hora.substring(0, 5);
  const [hours, minutes] = cleanHora.split(":");

  const startDate = new Date(year, parseInt(month) - 1, day, parseInt(hours), parseInt(minutes));
  const endDate = new Date(startDate.getTime() + duracionMinutos * 60000);

  const formatIcsDate = (d) => {
    return d.toISOString().replace(/-|:|\.\d+/g, "");
  };

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tu Turno Barberia//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `SUMMARY:💈 ${titulo}`,
    `DESCRIPTION:${descripcion.replace(/\n/g, "\\n")}\\n📍 Ubicación: ${ubicacion}`,
    `LOCATION:${ubicacion}`,
    `DTSTART:${formatIcsDate(startDate)}`,
    `DTEND:${formatIcsDate(endDate)}`,
    `STATUS:CONFIRMED`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `cita-barberia-${fecha}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function createWhatsAppShareUrl({
  tituloItem = "Corte y Estilo",
  fecha,
  hora,
  barberoNombre = "Barbero Oficial"
}) {
  const cleanHora = (hora || "").substring(0, 5);
  const mensaje = `💈 *¡Recordatorio de mi Cita en la Barbería!*\n\n✂️ *Servicio:* ${tituloItem}\n👤 *Barbero:* ${barberoNombre}\n📅 *Fecha:* ${fecha}\n⏰ *Hora:* ${cleanHora}\n📍 *Lugar:* Calle 10 # 40-20, El Poblado\n\n_Gestionado desde mi portal de cliente Tu Turno._`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`;
}
