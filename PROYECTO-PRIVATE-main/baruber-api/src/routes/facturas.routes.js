import express from "express";
import { verificarToken } from "../middlewares/auth.js";
import { generarFactura } from "../controllers/facturas.controller.js";

const router = express.Router();

router.post("/", verificarToken, generarFactura);

export default router;
