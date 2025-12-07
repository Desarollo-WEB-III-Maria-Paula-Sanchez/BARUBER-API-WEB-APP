import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeFirebase } from "./utils/firebase.js"; // ✅ IMPORTAR

dotenv.config();

// Rutas
import authRoutes from "./routes/auth.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import serviciosRoutes from "./routes/servicios.routes.js";
import reservasRoutes from "./routes/reservas.routes.js";
import horariosRoutes from "./routes/horarios.routes.js";
import facturasRoutes from "./routes/facturas.routes.js";
import barberosRoutes from "./routes/barberos.routes.js";

import { errorHandler } from "./middlewares/error.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ INICIALIZAR FIREBASE APENAS ARRANCA EL SERVIDOR
try {
  initializeFirebase();
  console.log("🔥 Firebase inicializado correctamente");
} catch (error) {
  console.error("❌ Error inicializando Firebase:", error.message);
  console.error("⚠️ Las notificaciones push NO funcionarán");
}

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta test
app.get("/", (req, res) => {
  res.json({ message: "BARUBER API ✔ Activa" });
});

// Registrar rutas
app.use("/auth", authRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/servicios", serviciosRoutes);
app.use("/reservas", reservasRoutes);
app.use("/horarios", horariosRoutes);
app.use("/facturas", facturasRoutes);
app.use("/barberos", barberosRoutes);

// Manejo de errores
app.use(errorHandler);

// Levantar servidor
app.listen(PORT, () => {
  console.log(`🚀 BARUBER API corriendo en puerto ${PORT}`);
});
