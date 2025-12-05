export const errorHandler = (err, req, res, next) => {
  console.error("🔥 ERROR:", err);

  return res.status(err.status || 500).json({
    error: err.message || "Error interno del servidor"
  });
};
