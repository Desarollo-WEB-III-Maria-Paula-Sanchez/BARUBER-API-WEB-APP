import express from "express";
import { verificarToken } from "../middlewares/auth.js";
import { obtenerPerfil, actualizarPerfil } from "../controllers/usuarios.controller.js";

const router = express.Router();

router.get("/perfil", verificarToken, obtenerPerfil);
router.put("/perfil", verificarToken, actualizarPerfil);

export default router;
