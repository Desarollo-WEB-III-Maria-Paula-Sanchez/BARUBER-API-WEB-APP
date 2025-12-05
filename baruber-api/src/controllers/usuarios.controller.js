import { supabase } from "../config/supabase.js";

export const obtenerPerfil = async (req, res) => {
  const userId = req.user.id;

  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return res.status(400).json(error);

  res.json(data);
};

export const actualizarPerfil = async (req, res) => {
  const userId = req.user.id;
  const { nombre, telefono, foto_url } = req.body;

  const { data, error } = await supabase
    .from("usuarios")
    .update({ nombre, telefono, foto: foto_url })
    .eq("id", userId)
    .select()
    .single();

  if (error) return res.status(400).json(error);

  res.json(data);
};
