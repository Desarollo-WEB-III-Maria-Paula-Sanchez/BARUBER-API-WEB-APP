// routes/usuarios.routes.js
import express from "express";
import multer from "multer";
import { verificarToken } from "../middlewares/auth.js";
import {
  obtenerPerfil,
  actualizarPerfil,
  subirFotoPerfil,
  registrarDeviceToken,      // ✅ NUEVO
  desactivarDeviceToken,     // ✅ NUEVO
} from "../controllers/usuarios.controller.js";

const upload = multer();
const router = express.Router();

// Obtener datos del usuario
router.get("/perfil", verificarToken, obtenerPerfil);

// Actualizar datos del usuario
router.put("/perfil", verificarToken, actualizarPerfil);

// Subir foto del usuario
router.post("/perfil/foto", verificarToken, upload.single("file"), subirFotoPerfil);

// ✅ NUEVO: Registrar token de dispositivo para notificaciones
router.post("/device-token", verificarToken, registrarDeviceToken);

// ✅ NUEVO: Desactivar token (cuando el usuario cierra sesión)
router.delete("/device-token", verificarToken, desactivarDeviceToken);

export default router;