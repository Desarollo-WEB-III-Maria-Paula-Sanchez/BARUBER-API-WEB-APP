import express from "express";
import {
  crearReserva,
  cambiarEstado,
  obtenerReservasCliente,
  obtenerReservasBarbero,
  obtenerReservaPorId,
  obtenerHorariosDisponibles,
  reagendarReserva,
  cancelarReservaCliente  //
} from "../controllers/reservas.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js"; //

const router = express.Router();

// ===== RUTAS PARA CLIENTES =====
router.post("/", authMiddleware, crearReserva);
router.get("/cliente", authMiddleware, obtenerReservasCliente);
router.get("/disponibles", obtenerHorariosDisponibles); // Pública
router.put("/cancelar", authMiddleware, cancelarReservaCliente); // ✅ Nueva ruta

// ===== RUTAS PARA BARBEROS =====
router.get("/barbero", authMiddleware, obtenerReservasBarbero);
router.get("/:id", authMiddleware, obtenerReservaPorId);
router.put("/estado", authMiddleware, cambiarEstado);
router.put("/reagendar", authMiddleware, reagendarReserva);

export default router;