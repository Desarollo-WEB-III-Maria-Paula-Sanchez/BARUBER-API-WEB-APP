import { supabaseAdmin } from "../utils/supabaseAdmin.js";

/* ============================================================
   Obtener todos los horarios del barbero autenticado
   ============================================================ */
export const obtenerHorarios = async (req, res) => {
  const barber_id = req.user.id;

  const { data, error } = await supabaseAdmin
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

  // Validar que si trabaja, tiene horarios
  if (trabaja && (!hora_inicio || !hora_fin)) {
    return res.status(400).json({ 
      error: "Si trabaja, debe especificar hora_inicio y hora_fin" 
    });
  }

  // Validar que hora_fin sea mayor que hora_inicio
  if (trabaja && hora_inicio >= hora_fin) {
    return res.status(400).json({ 
      error: "La hora de fin debe ser mayor que la hora de inicio" 
    });
  }

  const { data, error } = await supabaseAdmin
    .from("horarios_barbero")
    .upsert([{ barber_id, dia_semana, trabaja, hora_inicio, hora_fin }], {
      onConflict: 'barber_id,dia_semana'
    })
    .select();

  if (error) {
    console.error("Error actualizando horario:", error);
    return res.status(400).json(error);
  }

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

  // Validar cada día
  for (const dia of semana) {
    if (dia.trabaja && (!dia.hora_inicio || !dia.hora_fin)) {
      return res.status(400).json({ 
        error: `El día ${dia.dia_semana} requiere hora_inicio y hora_fin` 
      });
    }
    if (dia.trabaja && dia.hora_inicio >= dia.hora_fin) {
      return res.status(400).json({ 
        error: `En ${dia.dia_semana}, la hora de fin debe ser mayor que la de inicio` 
      });
    }
  }

  // Agregamos barber_id a cada elemento
  const datos = semana.map((dia) => ({
    ...dia,
    barber_id,
  }));

  const { data, error } = await supabaseAdmin
    .from("horarios_barbero")
    .upsert(datos, {
      onConflict: 'barber_id,dia_semana'
    })
    .select();

  if (error) {
    console.error("Error actualizando semana:", error);
    return res.status(400).json(error);
  }

  res.json({
    message: "Semana completa actualizada",
    data,
  });
};