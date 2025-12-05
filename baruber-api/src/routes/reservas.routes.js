import express from "express";
import { verificarToken, soloBarbero } from "../middlewares/auth.js";

import { 
  crearReserva, 
  cambiarEstado,
  obtenerReservasCliente,
  obtenerReservasBarbero
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
 * Obtener reservas de un cliente
 * GET /reservas/cliente/:id
 */
router.get("/cliente/:id", verificarToken, obtenerReservasCliente);

/**
 * Obtener reservas de un barbero
 * GET /reservas/barbero/:id
 */
router.get("/barbero/:id", verificarToken, soloBarbero, obtenerReservasBarbero);

export default router;
