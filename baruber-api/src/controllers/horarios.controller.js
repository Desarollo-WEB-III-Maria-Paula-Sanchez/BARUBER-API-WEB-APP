import { supabase } from "../config/supabase.js";

/* ============================================================
   Obtener todos los horarios del barbero autenticado
   ============================================================ */
export const obtenerHorarios = async (req, res) => {
  const barber_id = req.user.id;

  const { data, error } = await supabase
    .from("horarios_barbero")
    .select("*")
    .eq("barber_id", barber_id)
    .order("dia_semana", { ascending: true });

  if (error) return res.status(400).json(error);

  res.json(data);
};

/* ============================================================
   Actualizar UN SOLO día de la semana (PUT /horarios)
   ============================================================ */
export const actualizarHorario = async (req, res) => {
  const barber_id = req.user.id;
  const { dia_semana, trabaja, hora_inicio, hora_fin } = req.body;

  const { data, error } = await supabase
    .from("horarios_barbero")
    .upsert([{ barber_id, dia_semana, trabaja, hora_inicio, hora_fin }])
    .select();

  if (error) return res.status(400).json(error);

  res.json({
    message: "Horario actualizado",
    data,
  });
};

/* ============================================================
   Actualizar TODOS los días de la semana (PUT /horarios/semana)
   ============================================================ */
export const actualizarSemanaCompleta = async (req, res) => {
  const barber_id = req.user.id;

  const semana = req.body; // arreglo de 7 días

  if (!Array.isArray(semana)) {
    return res.status(400).json({ error: "Se requiere un array de horarios" });
  }

  // agregamos barber_id a cada elemento
  const datos = semana.map((dia) => ({
    ...dia,
    barber_id,
  }));

  const { data, error } = await supabase
    .from("horarios_barbero")
    .upsert(datos)
    .select();

  if (error) return res.status(400).json(error);

  res.json({
    message: "Semana completa actualizada",
    data,
  });
};
