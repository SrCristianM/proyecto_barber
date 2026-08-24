import { useState } from "react";
import { ESTADOS_CITA } from "../../../../shared/types/database";

const mockClientsList = [
  { id_cliente: 1, nombre: "Juan Pérez" },
  { id_cliente: 2, nombre: "María García" },
  { id_cliente: 3, nombre: "Pedro López" },
  { id_cliente: 4, nombre: "Ana Torres" },
  { id_cliente: 5, nombre: "Carlos Ruiz" }
];

const mockBarbersList = [
  { id_barbero: 1, nombre: "Carlos Rodríguez" },
  { id_barbero: 2, nombre: "Miguel Ángel" },
  { id_barbero: 3, nombre: "Javier Torres" },
  { id_barbero: 4, nombre: "Luis Martínez" }
];

const mockServicesList = [
  { id_servicio: 1, nombre: "Corte Clásico", duracion_minutos: 30, precio: 15000 },
  { id_servicio: 2, nombre: "Corte + Barba", duracion_minutos: 45, precio: 25000 },
  { id_servicio: 3, nombre: "Afeitado Premium", duracion_minutos: 35, precio: 20000 },
  { id_servicio: 4, nombre: "Diseño y Color", duracion_minutos: 60, precio: 30000 }
];

const mockAppointments = [
  {
    id_cita: 1,
    id_cliente: 1,
    id_barbero: 1,
    id_servicio: 1,
    fecha: "2026-06-02",
    hora: "09:00:00",
    estado: "Programada",
    precio: 15000,
    fecha_registro: "2026-06-01 08:00:00"
  },
  {
    id_cita: 2,
    id_cliente: 2,
    id_barbero: 2,
    id_servicio: 2,
    fecha: "2026-06-02",
    hora: "09:30:00",
    estado: "Completada",
    precio: 25000,
    fecha_registro: "2026-06-01 10:00:00"
  },
  {
    id_cita: 3,
    id_cliente: 3,
    id_barbero: 3,
    id_servicio: 3,
    fecha: "2026-06-02",
    hora: "10:00:00",
    estado: "Programada",
    precio: 20000,
    fecha_registro: "2026-06-01 11:30:00"
  },
  {
    id_cita: 4,
    id_cliente: 4,
    id_barbero: 4,
    id_servicio: 4,
    fecha: "2026-06-02",
    hora: "11:00:00",
    estado: "Reprogramada",
    precio: 30000,
    fecha_registro: "2026-06-01 14:00:00"
  },
  {
    id_cita: 5,
    id_cliente: 5,
    id_barbero: 1,
    id_servicio: 1,
    fecha: "2026-06-02",
    hora: "14:00:00",
    estado: "Programada",
    precio: 15000,
    fecha_registro: "2026-06-01 16:00:00"
  }
];

const timeSlots = Array.from({ length: 11 }, (_, i) => `${(i + 9).toString().padStart(2, "0")}:00`);

export function useAppointments() {
  const [appointments, setAppointments] = useState(mockAppointments);
  const [view, setView] = useState("calendar");
  const [selectedDate, setSelectedDate] = useState("2026-06-02");

  const getClientName = (id_cliente) => {
    return mockClientsList.find((c) => c.id_cliente === Number(id_cliente))?.nombre || "Cliente Desconocido";
  };

  const getBarberName = (id_barbero) => {
    return mockBarbersList.find((b) => b.id_barbero === Number(id_barbero))?.nombre || "Barbero Desconocido";
  };

  const getServiceInfo = (id_servicio) => {
    return (
      mockServicesList.find((s) => s.id_servicio === Number(id_servicio)) || {
        nombre: "Servicio General",
        duracion_minutos: 30,
        precio: 0
      }
    );
  };

  const getAppointmentForSlot = (id_barbero, timeStr) => {
    const timePrefix = timeStr.substring(0, 5);
    return appointments.find(
      (apt) => apt.id_barbero === Number(id_barbero) && apt.hora.substring(0, 5) === timePrefix
    );
  };

  return {
    appointments,
    setAppointments,
    view,
    setView,
    selectedDate,
    setSelectedDate,
    timeSlots,
    barbers: mockBarbersList,
    clients: mockClientsList,
    services: mockServicesList,
    availableStatuses: ESTADOS_CITA,
    getClientName,
    getBarberName,
    getServiceInfo,
    getAppointmentForSlot
  };
}
