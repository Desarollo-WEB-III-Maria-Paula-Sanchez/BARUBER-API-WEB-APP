import express from "express";
import {
  loginEmail,
  loginGoogle,
  registrar,
  refrescarToken,
  obtenerSesion,
  registrarBarbero,
  loginGoogleBarbero,
  googleCallbackBarbero,
} from "../controllers/auth.controller.js";
import { verificarToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/login", loginEmail);
router.get("/google", loginGoogle);
router.post("/registro", registrar);
router.post("/refresh", refrescarToken);
router.get("/me", verificarToken, obtenerSesion);
router.post("/registro-barbero", registrarBarbero);
router.get("/google-barbero", loginGoogleBarbero);
router.get("/google-barbero/callback", googleCallbackBarbero);

export default router;
