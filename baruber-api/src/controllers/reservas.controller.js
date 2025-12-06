import { supabase } from "../config/supabase.js";

/* ============================================================
   Crear reserva — Cliente
   ============================================================ */
export const crearReserva = async (req, res) => {
  const cliente_id = req.user.id;
  const { barber_id, servicio_id, fecha, hora } = req.body;

  const { data, error } = await supabase
    .from("reservas")
    .insert([{ cliente_id, barber_id, servicio_id, fecha, hora }])
    .select()
    .single();

  if (error) return res.status(400).json(error);

  return res.json(data);
};

/* ============================================================
   Cambiar estado — Barbero
   ============================================================ */
export const cambiarEstado = async (req, res) => {
  const barber_id = req.user.id;
  const { reserva_id, estado } = req.body;

  const { data, error } = await supabase
    .from("reservas")
    .update({ estado })
    .eq("id", reserva_id)
    .eq("barber_id", barber_id)  // seguridad
    .select()
    .single();

  if (error) return res.status(400).json(error);

  return res.json(data);
};

/* ============================================================
   Obtener reservas del cliente
   ============================================================ */
export const obtenerReservasCliente = async (req, res) => {
  const cliente_id = req.user.id;

  const { data, error } = await supabase
    .from("reservas")
    .select(`
      *,
      servicios(nombre, precio)
    `)
    .eq("cliente_id", cliente_id);

  if (error) return res.status(400).json(error);

  return res.json(data);
};

/* ============================================================
   Obtener reservas del barbero autenticado
   ============================================================ */
export const obtenerReservasBarbero = async (req, res) => {
  const barber_id = req.user.id;

  const { data, error } = await supabase
    .from("reservas")
    .select(`
      *,
      usuarios!reservas_cliente_id_fkey(nombre),
      servicios(nombre, precio)
    `)
    .eq("barber_id", barber_id)
    .order("fecha", { ascending: true })
    .order("hora", { ascending: true });

  if (error) return res.status(400).json(error);

  return res.json(data);
};

/* ============================================================
   Obtener una reserva por ID
   ============================================================ */
export const obtenerReservaPorId = async (req, res) => {
  const barber_id = req.user.id;
  const { id } = req.params;

  const { data, error } = await supabase
    .from("reservas")
    .select(`
      *,
      usuarios!reservas_cliente_id_fkey(nombre, email, foto),
      servicios(nombre, precio, duracion)
    `)
    .eq("id", id)
    .eq("barber_id", barber_id)
    .maybeSingle();

  if (error) return res.status(400).json(error);

  return res.json(data);
};
