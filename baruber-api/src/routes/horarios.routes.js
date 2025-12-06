import express from "express";
import { verificarToken, soloBarbero } from "../middlewares/auth.js";
import {
  actualizarHorario,
  obtenerHorarios,
  actualizarSemanaCompleta,
} from "../controllers/horarios.controller.js";

const router = express.Router();

// Obtener TODOS los horarios del barbero autenticado
router.get("/", verificarToken, soloBarbero, obtenerHorarios);

// Actualizar UN día
router.put("/", verificarToken, soloBarbero, actualizarHorario);

// Actualizar TODOS los días (más eficiente para React)
router.put("/semana", verificarToken, soloBarbero, actualizarSemanaCompleta);

export default router;
