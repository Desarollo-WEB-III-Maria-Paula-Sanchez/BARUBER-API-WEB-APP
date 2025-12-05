import express from "express";
import { verificarToken, soloBarbero } from "../middlewares/auth.js";
import { actualizarHorario, obtenerHorarios } from "../controllers/horarios.controller.js";

const router = express.Router();

router.put("/", verificarToken, soloBarbero, actualizarHorario);
router.get("/:barber_id", obtenerHorarios);

export default router;
