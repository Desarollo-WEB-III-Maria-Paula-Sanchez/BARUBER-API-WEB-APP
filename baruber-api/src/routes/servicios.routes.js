import express from "express";
import multer from "multer";
import { verificarToken, soloBarbero } from "../middlewares/auth.js";
import {
  crearServicio,
  obtenerServiciosBarbero,
  eliminarServicio,
  obtenerServicioPorId,
  actualizarServicio,
  subirImagenServicio,
  subirFotoPerfil,
  uploadFotoServicio,
} from "../controllers/servicios.controller.js";

const upload = multer();
const router = express.Router();

/* ============================================================
    SERVICIOS - CRUD
============================================================ */

// Crear servicio
router.post("/", verificarToken, soloBarbero, crearServicio);

// Obtener servicios de un barbero específico
router.get("/barbero/:barber_id", obtenerServiciosBarbero);

// Obtener un servicio por ID
router.get("/:id", verificarToken, obtenerServicioPorId);

// Actualizar servicio
router.put("/:id", verificarToken, soloBarbero, actualizarServicio);

// Eliminar servicio
router.delete("/:id", verificarToken, soloBarbero, eliminarServicio);

/* ============================================================
    SUBIR IMÁGENES
============================================================ */

// Subir imagen de servicio (con multer)
router.post(
  "/:id/imagen",
  verificarToken,
  soloBarbero,
  upload.single("foto"),
  subirImagenServicio
);

// Subir foto de perfil del barbero (con multer)
router.post(
  "/perfil/foto",
  verificarToken,
  soloBarbero,
  upload.single("foto"),
  subirFotoPerfil
);

// Obtener URL firmada para subir foto (método alternativo)
router.post("/upload", verificarToken, soloBarbero, uploadFotoServicio);

export default router;