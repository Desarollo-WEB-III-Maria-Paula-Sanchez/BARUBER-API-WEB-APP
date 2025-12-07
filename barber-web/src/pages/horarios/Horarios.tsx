import { useEffect, useState } from "react";
import api from "../../api/axios";

interface DiaHorario {
  id?: string;
  dia_semana: string;
  trabaja: boolean;
  hora_inicio: string | null;
  hora_fin: string | null;
}

const DIAS_SEMANA = [
  { nombre: "Lunes", valor: "lunes" },
  { nombre: "Martes", valor: "martes" },
  { nombre: "Miércoles", valor: "miercoles" },
  { nombre: "Jueves", valor: "jueves" },
  { nombre: "Viernes", valor: "viernes" },
  { nombre: "Sábado", valor: "sabado" },
  { nombre: "Domingo", valor: "domingo" },
];

export default function Horarios() {
  const [horarios, setHorarios] = useState<DiaHorario[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const cargarHorarios = async () => {
    try {
      const res = await api.get("/horarios");
      const data = res.data;

      const diasCompletos: DiaHorario[] = DIAS_SEMANA.map((dia) => {
        const existente = data.find((d: any) => d.dia_semana === dia.valor);

        return (
          existente || {
            dia_semana: dia.valor,
            trabaja: false,
            hora_inicio: null,
            hora_fin: null,
          }
        );
      });

      setHorarios(diasCompletos);
    } catch (err) {
      console.error("Error cargando horarios:", err);
      setError("No se pudieron cargar los horarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHorarios();
  }, []);

  const cambiarValor = (index: number, campo: keyof DiaHorario, valor: any) => {
    const copiado = [...horarios];

    if (campo === "trabaja" && !valor) {
      copiado[index] = {
        ...copiado[index],
        trabaja: false,
        hora_inicio: null,
        hora_fin: null,
      };
    } else {
      copiado[index] = {
        ...copiado[index],
        [campo]: valor,
      };
    }

    setHorarios(copiado);
  };

  const validarHorarios = () => {
    for (let i = 0; i < horarios.length; i++) {
      const dia = horarios[i];
      if (dia.trabaja) {
        if (!dia.hora_inicio || !dia.hora_fin) {
          setError(`${DIAS_SEMANA[i].nombre}: Debe especificar hora de inicio y fin`);
          return false;
        }
        if (dia.hora_inicio >= dia.hora_fin) {
          setError(`${DIAS_SEMANA[i].nombre}: La hora de fin debe ser mayor que la de inicio`);
          return false;
        }
      }
    }
    return true;
  };

  const guardarSemana = async () => {
    setError("");
    setMensaje("");

    if (!validarHorarios()) return;

    setSaving(true);
    try {
      await api.put("/horarios/semana", horarios);
      setMensaje("✅ Horarios actualizados con éxito");

      setTimeout(() => setMensaje(""), 3000);
    } catch (err: any) {
      console.error("Error guardando horarios:", err);
      setError(err.response?.data?.error || "Error guardando horarios");
    } finally {
      setSaving(false);
    }
  };

  const aplicarATodos = () => {
    const primerDia = horarios[0];
    if (!primerDia.trabaja) {
      setError("Configure el lunes primero para copiarlo a los demás días");
      return;
    }

    const confirmacion = window.confirm(
      `¿Copiar el horario de lunes (${primerDia.hora_inicio} - ${primerDia.hora_fin}) a todos los días?`
    );

    if (confirmacion) {
      const copiado = horarios.map((dia) => ({
        ...dia,
        trabaja: primerDia.trabaja,
        hora_inicio: primerDia.hora_inicio,
        hora_fin: primerDia.hora_fin,
      }));

      setHorarios(copiado);
      setMensaje("Horario copiado a todos los días");
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[300px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando horarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold">Horarios de Atención</h1>

            <button
              onClick={aplicarATodos}
              className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition"
            >
              📋 Copiar lunes a todos
            </button>
          </div>

          {/* Mensajes */}
          {mensaje && (
            <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 border border-green-300">
              {mensaje}
            </div>
          )}

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 border border-red-300">
              {error}
            </div>
          )}

          {/* HEADER ESCRITORIO */}
          <div className="hidden md:grid grid-cols-[140px_100px_1fr_1fr] gap-4 pb-2 border-b-2 font-semibold text-gray-700 text-sm">
            <div>Día</div>
            <div>Abierto</div>
            <div>Hora inicio</div>
            <div>Hora fin</div>
          </div>

          {/* HORARIOS */}
          <div className="space-y-4 mt-4">
            {horarios.map((dia, index) => (
              <div
                key={dia.dia_semana}
                className={`border rounded-lg p-4 md:p-0 md:border-0 md:rounded-none md:grid md:grid-cols-[140px_100px_1fr_1fr] gap-4 items-center ${
                  !dia.trabaja ? "bg-gray-50" : ""
                }`}
              >
                <div className="font-medium text-gray-800 mb-2 md:mb-0">
                  {DIAS_SEMANA[index].nombre}
                </div>

                <div className="flex items-center gap-2 mb-2 md:mb-0">
                  <input
                    type="checkbox"
                    checked={dia.trabaja}
                    onChange={(e) => cambiarValor(index, "trabaja", e.target.checked)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-600">{dia.trabaja ? "Sí" : "No"}</span>
                </div>

                <div>
                  <label className="md:hidden text-xs text-gray-500">Hora inicio</label>
                  <input
                    type="time"
                    disabled={!dia.trabaja}
                    value={dia.hora_inicio || ""}
                    className={`w-full border rounded-lg px-3 py-2 ${
                      !dia.trabaja ? "bg-gray-100 text-gray-400" : ""
                    }`}
                    onChange={(e) => cambiarValor(index, "hora_inicio", e.target.value)}
                  />
                </div>

                <div>
                  <label className="md:hidden text-xs text-gray-500">Hora fin</label>
                  <input
                    type="time"
                    disabled={!dia.trabaja}
                    value={dia.hora_fin || ""}
                    className={`w-full border rounded-lg px-3 py-2 ${
                      !dia.trabaja ? "bg-gray-100 text-gray-400" : ""
                    }`}
                    onChange={(e) => cambiarValor(index, "hora_fin", e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* BOTONES */}
          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={cargarHorarios}
              disabled={saving}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>

            <button
              onClick={guardarSemana}
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving ? "Guardando..." : "💾 Guardar cambios"}
            </button>
          </div>

          {/* CONSEJITOS */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Los clientes solo podrán reservar en los días y horarios marcados como abiertos</li>
              <li>• Usa "Copiar lunes a todos" para aplicar el mismo horario a toda la semana</li>
              <li>• Las reservas existentes no se verán afectadas por cambios de horario</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
