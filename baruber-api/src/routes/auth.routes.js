import express from "express";
import {
  loginEmail,
  loginGoogle,
  registrar,
  refrescarToken,
  obtenerSesion,
  registrarBarbero,
  loginGoogleBarbero,
  loginConGoogleToken,  // ✅ NUEVO: Para app móvil Android
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
    LOGIN GOOGLE CLIENTE (Web - ya existente)
============================================================ */
router.get("/google", loginGoogle);

/* ============================================================
    ✅ NUEVO: LOGIN GOOGLE DESDE APP MÓVIL
    La app Android envía el ID Token de Google aquí
    Este endpoint valida el token y retorna access_token/refresh_token
============================================================ */
router.post("/google-token", loginConGoogleToken);

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