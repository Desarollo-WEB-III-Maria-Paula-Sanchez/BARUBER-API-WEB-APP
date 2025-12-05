import { supabase } from "../config/supabase.js";

/**
 * Crear reserva — Cliente
 */
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

/**
 * Cambiar estado — Barbero
 */
export const cambiarEstado = async (req, res) => {
  const barber_id = req.user.id;
  const { reserva_id, estado } = req.body;

  const { data, error } = await supabase
    .from("reservas")
    .update({ estado })
    .eq("id", reserva_id)
    .eq("barber_id", barber_id)
    .select()
    .single();

  if (error) return res.status(400).json(error);

  return res.json(data);
};

/**
 * Obtener reservas del cliente
 */
export const obtenerReservasCliente = async (req, res) => {
  const cliente_id = req.params.id;

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

/**
 * Obtener reservas del barbero
 */
export const obtenerReservasBarbero = async (req, res) => {
  const barber_id = req.params.id;

  const { data, error } = await supabase
    .from("reservas")
    .select(`
      *,
      usuarios!reservas_cliente_id_fkey(nombre),
      servicios(nombre, precio)
    `)
    .eq("barber_id", barber_id);

  if (error) return res.status(400).json(error);

  return res.json(data);
};
