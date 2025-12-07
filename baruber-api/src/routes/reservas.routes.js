import express from "express";
import {
  crearReserva,
  cambiarEstado,
  obtenerReservasCliente,
  obtenerReservasBarbero,
  obtenerReservaPorId,
  obtenerHorariosDisponibles,
  reagendarReserva,
  cancelarReservaCliente
} from "../controllers/reservas.controller.js";

import { verificarToken, soloBarbero } from "../middlewares/auth.js";

const router = express.Router();

// ===== RUTAS PARA CLIENTES =====

// Crear reserva
router.post("/", verificarToken, crearReserva);

// Obtener reservas del cliente autenticado
router.get("/cliente", verificarToken, obtenerReservasCliente);

// Obtener horarios disponibles (PÚBLICA)
router.get("/disponibles", obtenerHorariosDisponibles);

// Cancelar reserva (cliente autenticado)
router.put("/cancelar", verificarToken, cancelarReservaCliente);

// ===== RUTAS PARA BARBEROS =====

// Obtener reservas del barbero autenticado
router.get("/barbero", verificarToken, soloBarbero, obtenerReservasBarbero);

// Obtener reserva por ID
router.get("/:id", verificarToken, obtenerReservaPorId);

// Cambiar estado de una reserva
router.put("/estado", verificarToken, soloBarbero, cambiarEstado);

// Reagendar reserva
router.put("/reagendar", verificarToken, soloBarbero, reagendarReserva);

export default router;
