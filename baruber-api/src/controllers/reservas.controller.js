import { supabase } from "../config/supabase.js";
import { supabaseAdmin } from "../utils/supabaseAdmin.js";
import { enviarNotificacion } from "../utils/notificaciones.js";

/* ============================================================
  FUNCIONES AUXILIARES DE VALIDACIÓN
  ============================================================ */

// Validar que la fecha/hora no sea en el pasado
const validarFechaFutura = (fecha, hora) => {
  const ahora = new Date();
  const fechaReserva = new Date(`${fecha}T${hora}`);
  return fechaReserva > ahora;
};

// Validar que el horario esté dentro del horario laboral del barbero
const validarHorarioLaboral = async (barber_id, fecha, hora, duracion) => {
  // Obtener día de la semana en español
  const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const fechaObj = new Date(fecha + 'T00:00:00');
  const diaSemana = diasSemana[fechaObj.getDay()];

  // Consultar horario del barbero para ese día
  const { data: horario, error } = await supabaseAdmin
    .from("horarios_barbero")
    .select("*")
    .eq("barber_id", barber_id)
    .eq("dia_semana", diaSemana)
    .maybeSingle();

  if (error) throw error;

  // Si no trabaja ese día
  if (!horario || !horario.trabaja) {
    return { valido: false, mensaje: `El barbero no trabaja los ${diaSemana}s` };
  }

  // Validar que la hora esté dentro del rango
  const horaReserva = hora.substring(0, 5); // "14:30:00" -> "14:30"
  const horaInicio = horario.hora_inicio.substring(0, 5);
  const horaFin = horario.hora_fin.substring(0, 5);

  // Calcular hora final de la reserva
  const [h, m] = horaReserva.split(':').map(Number);
  const minutosReserva = h * 60 + m;
  const minutosFinReserva = minutosReserva + duracion;
  const horaFinReserva = `${String(Math.floor(minutosFinReserva / 60)).padStart(2, '0')}:${String(minutosFinReserva % 60).padStart(2, '0')}`;

  if (horaReserva < horaInicio || horaFinReserva > horaFin) {
    return { 
      valido: false, 
      mensaje: `El horario de atención es de ${horaInicio} a ${horaFin}` 
    };
  }

  return { valido: true };
};

// Validar que no haya conflicto con otras reservas aceptadas
const validarDisponibilidad = async (barber_id, fecha, hora, duracion, reservaIdExcluir = null) => {
  // Obtener todas las reservas aceptadas del barbero para esa fecha
  const { data: reservas, error } = await supabaseAdmin
    .from("reservas")
    .select("hora, servicios(duracion)")
    .eq("barber_id", barber_id)
    .eq("fecha", fecha)
    .eq("estado", "aceptada");

  if (error) throw error;

  // Calcular rango de tiempo de la nueva reserva
  const [h, m] = hora.split(':').map(Number);
  const minutosInicio = h * 60 + m;
  const minutosFin = minutosInicio + duracion;

  // Verificar conflictos
  for (const reserva of reservas) {
    const [hR, mR] = reserva.hora.split(':').map(Number);
    const minutosInicioReserva = hR * 60 + mR;
    const minutosFinReserva = minutosInicioReserva + reserva.servicios.duracion;

    // Hay conflicto si los rangos se solapan
    const hayConflicto = (
      (minutosInicio >= minutosInicioReserva && minutosInicio < minutosFinReserva) ||
      (minutosFin > minutosInicioReserva && minutosFin <= minutosFinReserva) ||
      (minutosInicio <= minutosInicioReserva && minutosFin >= minutosFinReserva)
    );

    if (hayConflicto) {
      return { 
        valido: false, 
        mensaje: `Ya existe una reserva aceptada a las ${reserva.hora}` 
      };
    }
  }

  return { valido: true };
};

/* ============================================================
  Crear reserva – Cliente
  ============================================================ */
export const crearReserva = async (req, res) => {
  const cliente_id = req.user.id;
  const { barber_id, servicio_id, fecha, hora } = req.body;

  try {
    // 1. Obtener información del servicio (necesitamos la duración)
    const { data: servicio, error: servicioError } = await supabaseAdmin
      .from("servicios")
      .select("duracion, barber_id")
      .eq("id", servicio_id)
      .single();

    if (servicioError || !servicio) {
      return res.status(400).json({ error: "Servicio no encontrado" });
    }

    // Validar que el servicio pertenece al barbero
    if (servicio.barber_id !== barber_id) {
      return res.status(400).json({ error: "El servicio no pertenece a este barbero" });
    }

    // 2. Validar fecha futura
    if (!validarFechaFutura(fecha, hora)) {
      return res.status(400).json({ 
        error: "No se pueden hacer reservas en el pasado" 
      });
    }

    // 3. Validar horario laboral
    const validacionHorario = await validarHorarioLaboral(
      barber_id, 
      fecha, 
      hora, 
      servicio.duracion
    );
    if (!validacionHorario.valido) {
      return res.status(400).json({ error: validacionHorario.mensaje });
    }

    // 4. Validar disponibilidad
    const validacionDisponibilidad = await validarDisponibilidad(
      barber_id, 
      fecha, 
      hora, 
      servicio.duracion
    );
    if (!validacionDisponibilidad.valido) {
      return res.status(400).json({ error: validacionDisponibilidad.mensaje });
    }

    // 5. Crear la reserva
    const { data, error } = await supabaseAdmin
      .from("reservas")
      .insert([{ cliente_id, barber_id, servicio_id, fecha, hora }])
      .select()
      .single();

    if (error) return res.status(400).json(error);

    return res.json(data);

  } catch (err) {
    console.error("Error creando reserva:", err);
    return res.status(500).json({ error: "Error interno al crear reserva" });
  }
};

/* ============================================================
  Cambiar estado – Barbero
  ============================================================ */
export const cambiarEstado = async (req, res) => {
  const barber_id = req.user.id;
  const { reserva_id, estado } = req.body;

  try {
    // Si se está aceptando una reserva, validar disponibilidad
    if (estado === "aceptada") {
      // Obtener la reserva con su servicio
      const { data: reserva, error: reservaError } = await supabaseAdmin
        .from("reservas")
        .select(`
          *,
          servicios(duracion)
        `)
        .eq("id", reserva_id)
        .eq("barber_id", barber_id)
        .single();

      if (reservaError || !reserva) {
        return res.status(400).json({ error: "Reserva no encontrada" });
      }

      // Validar que no haya conflicto con otras reservas aceptadas
      const validacionDisponibilidad = await validarDisponibilidad(
        barber_id,
        reserva.fecha,
        reserva.hora,
        reserva.servicios.duracion,
        reserva_id
      );

      if (!validacionDisponibilidad.valido) {
        return res.status(400).json({ error: validacionDisponibilidad.mensaje });
      }

      // Rechazar automáticamente otras reservas pendientes que tengan conflicto
      const [h, m] = reserva.hora.split(':').map(Number);
      const minutosInicio = h * 60 + m;
      const minutosFin = minutosInicio + reserva.servicios.duracion;

      // Obtener reservas pendientes del mismo día
      const { data: reservasPendientes } = await supabaseAdmin
        .from("reservas")
        .select(`
          id,
          hora,
          servicios(duracion)
        `)
        .eq("barber_id", barber_id)
        .eq("fecha", reserva.fecha)
        .eq("estado", "pendiente")
        .neq("id", reserva_id);

      // Rechazar las que tienen conflicto
      if (reservasPendientes && reservasPendientes.length > 0) {
        const idsParaRechazar = [];

        for (const rp of reservasPendientes) {
          const [hR, mR] = rp.hora.split(':').map(Number);
          const minutosInicioRP = hR * 60 + mR;
          const minutosFinRP = minutosInicioRP + rp.servicios.duracion;

          const hayConflicto = (
            (minutosInicio >= minutosInicioRP && minutosInicio < minutosFinRP) ||
            (minutosFin > minutosInicioRP && minutosFin <= minutosFinRP) ||
            (minutosInicio <= minutosInicioRP && minutosFin >= minutosFinRP)
          );

          if (hayConflicto) {
            idsParaRechazar.push(rp.id);
          }
        }

        // Rechazar en batch
        if (idsParaRechazar.length > 0) {
          await supabaseAdmin
            .from("reservas")
            .update({ estado: "rechazada" })
            .in("id", idsParaRechazar);
        }
      }
    }

    // Actualizar el estado de la reserva principal
    const { data, error } = await supabaseAdmin
      .from("reservas")
      .update({ estado })
      .eq("id", reserva_id)
      .eq("barber_id", barber_id)
      .select(`
        *,
        servicios(nombre),
        usuarios!reservas_cliente_id_fkey(nombre)
      `)
      .single();

    if (error) return res.status(400).json(error);

    // ✅ ENVIAR NOTIFICACIÓN AL CLIENTE
    if (estado === "aceptada" || estado === "rechazada") {
      const titulo = estado === "aceptada" 
        ? "✅ Reserva Aceptada" 
        : "❌ Reserva Rechazada";
      
      const mensaje = estado === "aceptada"
        ? `Tu reserva de ${data.servicios?.nombre} ha sido aceptada`
        : `Tu reserva de ${data.servicios?.nombre} ha sido rechazada`;

      // Enviar notificación (no bloqueante)
      enviarNotificacion(
        data.cliente_id,
        titulo,
        mensaje,
        {
          reserva_id: data.id,
          estado: data.estado,
          type: "reserva_update",
        }
      ).catch((err) => {
        console.error("Error enviando notificación:", err);
        // No retornar error, la reserva ya se actualizó correctamente
      });

      console.log(`📨 Notificación enviada al cliente ${data.cliente_id}`);
    }

    return res.json(data);

  } catch (err) {
    console.error("Error cambiando estado:", err);
    return res.status(500).json({ error: "Error interno al cambiar estado" });
  }
};

/* ============================================================
  Obtener reservas del cliente
  ============================================================ */
export const obtenerReservasCliente = async (req, res) => {
  const cliente_id = req.user.id;

  const { data, error } = await supabaseAdmin
    .from("reservas")
    .select(`
      *,
      servicios(nombre, precio, duracion),
      usuarios!reservas_barber_id_fkey(nombre, foto_url)
    `)
    .eq("cliente_id", cliente_id)
    .order("fecha", { ascending: false })
    .order("hora", { ascending: false });

  if (error) return res.status(400).json(error);

  return res.json(data);
};

/* ============================================================
  Obtener reservas del barbero autenticado
  ============================================================ */
export const obtenerReservasBarbero = async (req, res) => {
  const barber_id = req.user.id;

  const { data, error } = await supabaseAdmin
    .from("reservas")
    .select(`
      *,
      usuarios!reservas_cliente_id_fkey(nombre, email, foto_url),
      servicios(nombre, precio, duracion)
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

  const { data, error } = await supabaseAdmin
    .from("reservas")
    .select(`
      *,
      usuarios!reservas_cliente_id_fkey(nombre, email, foto_url),
      servicios(nombre, precio, duracion)
    `)
    .eq("id", id)
    .eq("barber_id", barber_id)
    .maybeSingle();

  if (error) return res.status(400).json(error);

  return res.json(data);
};

/* ============================================================
  Obtener horarios disponibles para un barbero y servicio
  ============================================================ */
export const obtenerHorariosDisponibles = async (req, res) => {
  const { barber_id, servicio_id, fecha } = req.query;

  try {
    // 1. Validar que la fecha no sea en el pasado (usando timezone Costa Rica)
      const fechaObj = new Date(fecha + 'T00:00:00');

// Obtener fecha actual en Costa Rica
    const ahora = new Date();
    const costaRicaTime = new Date(ahora.toLocaleString('en-US', { timeZone: 'America/Costa_Rica' }));
    const hoyCostaRica = new Date(costaRicaTime);
    hoyCostaRica.setHours(0, 0, 0, 0);

    if (fechaObj < hoyCostaRica) {
      return res.status(400).json({ error: "No se puede consultar fechas pasadas" });
    }

    // 2. Obtener el servicio para conocer la duración
    const { data: servicio, error: servicioError } = await supabaseAdmin
      .from("servicios")
      .select("duracion")
      .eq("id", servicio_id)
      .single();

    if (servicioError || !servicio) {
      return res.status(400).json({ error: "Servicio no encontrado" });
    }

    // 3. Obtener día de la semana
    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const diaSemana = diasSemana[fechaObj.getDay()];

    // 4. Obtener horario laboral del barbero
    const { data: horario, error: horarioError } = await supabaseAdmin
      .from("horarios_barbero")
      .select("*")
      .eq("barber_id", barber_id)
      .eq("dia_semana", diaSemana)
      .maybeSingle();

    if (horarioError || !horario || !horario.trabaja) {
      return res.json({ disponibles: [], mensaje: "El barbero no trabaja este día" });
    }

    // 5. Obtener reservas aceptadas para ese día
    const { data: reservasAceptadas } = await supabaseAdmin
      .from("reservas")
      .select("hora, servicios(duracion)")
      .eq("barber_id", barber_id)
      .eq("fecha", fecha)
      .eq("estado", "aceptada");

    // 6. Generar slots de 30 minutos
    const slots = [];
    const [horaInicio, minInicio] = horario.hora_inicio.split(':').map(Number);
    const [horaFin, minFin] = horario.hora_fin.split(':').map(Number);
    
    let minutosActual = horaInicio * 60 + minInicio;
    const minutosFin = horaFin * 60 + minFin;

    while (minutosActual + servicio.duracion <= minutosFin) {
      const h = Math.floor(minutosActual / 60);
      const m = minutosActual % 60;
      const horaSlot = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;

      // Verificar si hay conflicto con reservas existentes
      let disponible = true;
      
      if (reservasAceptadas) {
        for (const reserva of reservasAceptadas) {
          const [hR, mR] = reserva.hora.split(':').map(Number);
          const minutosInicioReserva = hR * 60 + mR;
          const minutosFinReserva = minutosInicioReserva + reserva.servicios.duracion;
          const minutosFinSlot = minutosActual + servicio.duracion;

          const hayConflicto = (
            (minutosActual >= minutosInicioReserva && minutosActual < minutosFinReserva) ||
            (minutosFinSlot > minutosInicioReserva && minutosFinSlot <= minutosFinReserva) ||
            (minutosActual <= minutosInicioReserva && minutosFinSlot >= minutosFinReserva)
          );

          if (hayConflicto) {
            disponible = false;
            break;
          }
        }
      }

      // ⭐ CORREGIDO: Si es hoy, no mostrar horas que ya pasaron (con timezone Costa Rica)
      const hoyStr = new Date().toISOString().split('T')[0];
      if (fecha === hoyStr) {
        // Obtener hora actual en Costa Rica (UTC-6)
        const ahora = new Date();
        const costaRicaTime = new Date(ahora.toLocaleString('en-US', { timeZone: 'America/Costa_Rica' }));
        const horaActualCR = costaRicaTime.getHours() * 60 + costaRicaTime.getMinutes();
        
        if (minutosActual <= horaActualCR) {
          disponible = false;
        }
      }

      if (disponible) {
        slots.push({
          hora: horaSlot,
          disponible: true
        });
      }

      minutosActual += 30; // Intervalos de 30 minutos
    }

    return res.json({ disponibles: slots });

  } catch (err) {
    console.error("Error obteniendo horarios:", err);
    return res.status(500).json({ error: "Error al obtener horarios" });
  }
};

/* ============================================================
  Reagendar reserva – Barbero
  ============================================================ */
export const reagendarReserva = async (req, res) => {
  const barber_id = req.user.id;
  const { reserva_id, nueva_fecha, nueva_hora } = req.body;

  try {
    // 1. Obtener la reserva con su servicio
    const { data: reserva, error: reservaError } = await supabaseAdmin
      .from("reservas")
      .select(`
        *,
        servicios(duracion, barber_id)
      `)
      .eq("id", reserva_id)
      .eq("barber_id", barber_id)
      .single();

    if (reservaError || !reserva) {
      return res.status(400).json({ error: "Reserva no encontrada" });
    }

    // Solo se pueden reagendar reservas aceptadas o pendientes
    if (reserva.estado === "completada" || reserva.estado === "rechazada") {
      return res.status(400).json({ 
        error: "No se puede reagendar una reserva completada o rechazada" 
      });
    }

    // 2. Validar fecha futura
    if (!validarFechaFutura(nueva_fecha, nueva_hora)) {
      return res.status(400).json({ 
        error: "No se pueden hacer reservas en el pasado" 
      });
    }

    // 3. Validar horario laboral
    const validacionHorario = await validarHorarioLaboral(
      barber_id,
      nueva_fecha,
      nueva_hora,
      reserva.servicios.duracion
    );
    if (!validacionHorario.valido) {
      return res.status(400).json({ error: validacionHorario.mensaje });
    }

    // 4. Validar disponibilidad (excluyendo esta reserva)
    const validacionDisponibilidad = await validarDisponibilidad(
      barber_id,
      nueva_fecha,
      nueva_hora,
      reserva.servicios.duracion,
      reserva_id
    );
    if (!validacionDisponibilidad.valido) {
      return res.status(400).json({ error: validacionDisponibilidad.mensaje });
    }

    // 5. Actualizar la reserva
    const { data, error } = await supabaseAdmin
      .from("reservas")
      .update({ 
        fecha: nueva_fecha, 
        hora: nueva_hora 
      })
      .eq("id", reserva_id)
      .eq("barber_id", barber_id)
      .select(`
        *,
        usuarios!reservas_cliente_id_fkey(nombre, email, foto_url),
        servicios(nombre, precio, duracion)
      `)
      .single();

    if (error) return res.status(400).json(error);

    return res.json({
      message: "Reserva reagendada exitosamente",
      reserva: data
    });

  } catch (err) {
    console.error("Error reagendando reserva:", err);
    return res.status(500).json({ error: "Error interno al reagendar reserva" });
  }
};

/* ============================================================
  Cancelar reserva – Cliente
  ============================================================ */
export const cancelarReservaCliente = async (req, res) => {
  const cliente_id = req.user.id;
  const { reserva_id } = req.body;

  try {
    // Verificar que la reserva pertenece al cliente
    const { data: reserva, error: reservaError } = await supabaseAdmin
      .from("reservas")
      .select("*")
      .eq("id", reserva_id)
      .eq("cliente_id", cliente_id)
      .single();

    if (reservaError || !reserva) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    // Solo se pueden cancelar reservas pendientes o aceptadas
    if (reserva.estado === "completada" || reserva.estado === "rechazada") {
      return res.status(400).json({ 
        error: "No se puede cancelar una reserva completada o rechazada" 
      });
    }

    // Cancelar la reserva (cambiar estado a rechazada)
    const { data, error } = await supabaseAdmin
      .from("reservas")
      .update({ estado: "rechazada" })
      .eq("id", reserva_id)
      .eq("cliente_id", cliente_id)
      .select()
      .single();

    if (error) return res.status(400).json(error);

    return res.json({
      message: "Reserva cancelada exitosamente",
      data
    });

  } catch (err) {
    console.error("Error cancelando reserva:", err);
    return res.status(500).json({ error: "Error interno al cancelar reserva" });
  }
};