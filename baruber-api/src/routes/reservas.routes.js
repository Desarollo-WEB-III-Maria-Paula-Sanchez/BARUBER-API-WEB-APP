import express from "express";
import { verificarToken, soloBarbero } from "../middlewares/auth.js";

import { 
  crearReserva, 
  cambiarEstado,
  obtenerReservasCliente,
  obtenerReservasBarbero,
  obtenerReservaPorId
} from "../controllers/reservas.controller.js";

const router = express.Router();

/**
 * Crear reserva (cliente)
 * POST /reservas/
 */
router.post("/", verificarToken, crearReserva);

/**
 * Cambiar estado de reserva (barbero)
 * PUT /reservas/estado
 */
router.put("/estado", verificarToken, soloBarbero, cambiarEstado);

/**
 * Obtener reservas del cliente autenticado
 * GET /reservas/cliente
 * (antes era /cliente/:id — inseguro)
 */
router.get("/cliente", verificarToken, obtenerReservasCliente);

/**
 * Obtener reservas del barbero autenticado
 * GET /reservas/barbero
 * (antes era /barbero/:id — inseguro)
 */
router.get("/barbero", verificarToken, soloBarbero, obtenerReservasBarbero);

/**
 * Obtener una reserva por ID (solo barbero dueño)
 * GET /reservas/:id
 */
router.get("/:id", verificarToken, soloBarbero, obtenerReservaPorId);

export default router;
