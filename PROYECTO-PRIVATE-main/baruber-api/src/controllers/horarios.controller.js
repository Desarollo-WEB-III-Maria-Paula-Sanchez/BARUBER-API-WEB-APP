import { supabase } from "../config/supabase.js";

export const actualizarHorario = async (req, res) => {
  const barber_id = req.user.id;
  const { dia_semana, trabaja, hora_inicio, hora_fin } = req.body;

  const { data, error } = await supabase
    .from("horarios_barbero")
    .upsert([{ barber_id, dia_semana, trabaja, hora_inicio, hora_fin }])
    .select();

  if (error) return res.status(400).json(error);

  res.json(data);
};

export const obtenerHorarios = async (req, res) => {
  const barber_id = req.params.barber_id;

  const { data, error } = await supabase
    .from("horarios_barbero")
    .select("*")
    .eq("barber_id", barber_id);

  if (error) return res.status(400).json(error);

  res.json(data);
};
