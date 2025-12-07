import express from "express";
import {
  loginEmail,
  loginGoogle,
  registrar,
  refrescarToken,
  obtenerSesion,
  registrarBarbero,
  loginGoogleBarbero,
} from "../controllers/auth.controller.js";

import { verificarToken } from "../middlewares/auth.js";

const router = express.Router();

/* ============================================================
    LOGIN Y REGISTRO POR EMAIL
============================================================ */
router.post("/login", loginEmail);
router.post("/registro", registrar);
router.post("/registro-barbero", registrarBarbero);

/* ============================================================
    LOGIN GOOGLE CLIENTE
============================================================ */
router.get("/google", loginGoogle);

/* ============================================================
    LOGIN GOOGLE BARBERO (IMPLICIT FLOW)
    → redirige a Google
    → Google vuelve al frontend con #access_token=...
============================================================ */
router.get("/google-barbero", loginGoogleBarbero);

/* ============================================================
    TOKENS
============================================================ */
router.post("/refresh", refrescarToken);

/* ============================================================
    SESIÓN DEL USUARIO
============================================================ */
router.get("/me", verificarToken, obtenerSesion);

export default router;