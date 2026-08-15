import { useState } from "react";

const mockAppointments = [
  { id: 1, time: "09:00", client: "Juan Pérez", barber: "Carlos Rodríguez", service: "Corte Clásico", duration: 30, status: "Confirmada", date: "2026-06-02" },
  { id: 2, time: "09:30", client: "María García", barber: "Miguel Ángel", service: "Corte + Barba", duration: 45, status: "En Proceso", date: "2026-06-02" },
  { id: 3, time: "10:00", client: "Pedro López", barber: "Javier Torres", service: "Afeitado Premium", duration: 35, status: "Pendiente", date: "2026-06-02" },
  { id: 4, time: "11:00", client: "Ana Torres", barber: "Luis Martínez", service: "Diseño y Color", duration: 60, status: "Pendiente", date: "2026-06-02" },
  { id: 5, time: "14:00", client: "Carlos Ruiz", barber: "Carlos Rodríguez", service: "Corte Clásico", duration: 30, status: "Confirmada", date: "2026-06-02" }
];

const timeSlots = Array.from({ length: 11 }, (_, i) => `${(i + 9).toString().padStart(2, "0")}:00`);
const barbers = ["Carlos Rodríguez", "Miguel Ángel", "Javier Torres", "Luis Martínez"];

export function useAppointments() {
  const [appointments, setAppointments] = useState(mockAppointments);
  const [view, setView] = useState("calendar");
  const [selectedDate, setSelectedDate] = useState("2026-06-02");

  const getAppointmentForSlot = (barber, time) => {
    return appointments.find((apt) => apt.barber === barber && apt.time === time);
  };

  return {
    appointments,
    view,
    setView,
    selectedDate,
    setSelectedDate,
    timeSlots,
    barbers,
    getAppointmentForSlot
  };
}
