import { supabase } from "../config/supabase.js";

export const crearServicio = async (req, res) => {
  const barber_id = req.user.id;
  const { nombre, descripcion, precio, duracion, foto_url } = req.body;

  const { data, error } = await supabase
    .from("servicios")
    .insert([{ barber_id, nombre, descripcion, precio, duracion, foto_url }])
    .select()
    .single();

  if (error) return res.status(400).json(error);

  res.json(data);
};

export const obtenerServiciosBarbero = async (req, res) => {
  const barber_id = req.params.barber_id;

  const { data, error } = await supabase
    .from("servicios")
    .select("*")
    .eq("barber_id", barber_id);

  if (error) return res.status(400).json(error);

  res.json(data);
};

export const eliminarServicio = async (req, res) => {
  const id = req.params.id;

  const { error } = await supabase
    .from("servicios")
    .delete()
    .eq("id", id);

  if (error) return res.status(400).json(error);

  res.json({ message: "Servicio eliminado" });
};
