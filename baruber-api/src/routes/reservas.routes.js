import express from "express";
import { verificarToken, soloBarbero } from "../middlewares/auth.js";
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

const router = express.Router();

/* ============================================================
   RUTAS PARA CLIENTES
   ============================================================ */

/**
 * Obtener horarios disponibles (cliente)
 * GET /reservas/disponibles?barber_id=xxx&servicio_id=xxx&fecha=2025-12-15
 */
router.get("/disponibles", verificarToken, obtenerHorariosDisponibles);

/**
 * Crear reserva (cliente)
 * POST /reservas/
 */
router.post("/", verificarToken, crearReserva);

/**
 * Obtener reservas del cliente autenticado
 * GET /reservas/cliente
 */
router.get("/cliente", verificarToken, obtenerReservasCliente);
router.put("/cancelar", authMiddleware, cancelarReservaCliente);

/* ============================================================
   RUTAS PARA BARBEROS
   ============================================================ */

/**
 * Cambiar estado de reserva (barbero)
 * PUT /reservas/estado
 */
router.put("/estado", verificarToken, soloBarbero, cambiarEstado);

/**
 * Reagendar reserva (barbero)
 * PUT /reservas/reagendar
 */
router.put("/reagendar", verificarToken, soloBarbero, reagendarReserva);

/**
 * Obtener reservas del barbero autenticado
 * GET /reservas/barbero
 */
router.get("/barbero", verificarToken, soloBarbero, obtenerReservasBarbero);

/**
 * Obtener una reserva por ID (solo barbero dueño)
 * GET /reservas/:id
 */
router.get("/:id", verificarToken, soloBarbero, obtenerReservaPorId);

export default router;