import express from "express";
import multer from "multer";
import { verificarToken, soloBarbero } from "../middlewares/auth.js";
import { crearServicio, obtenerServiciosBarbero, eliminarServicio } from "../controllers/servicios.controller.js";

const upload = multer();
const router = express.Router();

router.post("/", verificarToken, soloBarbero, crearServicio);
router.get("/:barber_id", obtenerServiciosBarbero);
router.delete("/:id", verificarToken, soloBarbero, eliminarServicio);

export default router;
