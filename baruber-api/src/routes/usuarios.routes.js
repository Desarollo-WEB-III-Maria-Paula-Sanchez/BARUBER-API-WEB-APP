import express from "express";
import multer from "multer";
import { verificarToken } from "../middlewares/auth.js";
import {
  obtenerPerfil,
  actualizarPerfil,
  subirFotoPerfil
} from "../controllers/usuarios.controller.js";

const upload = multer();
const router = express.Router();

// Obtener datos del barbero
router.get("/perfil", verificarToken, obtenerPerfil);

// Actualizar datos del barbero
router.put("/perfil", verificarToken, actualizarPerfil);

// Subir foto del barbero (NUEVO)
router.post("/perfil/foto", verificarToken, upload.single("file"), subirFotoPerfil);

export default router;
