// models/Barbero.kt
package com.baruber.cliente.models

import com.google.gson.annotations.SerializedName
import java.io.Serializable

data class Barbero(
    val id: String,
    val nombre: String?,
    val email: String,

    @SerializedName("foto_url")
    val fotoUrl: String?,

    val telefono: String?,

    // ✅ NUEVO: Campo para horarios
    val horarios: List<HorarioBarbero>? = null
) : Serializable

// ✅ NUEVO: Modelo para horarios del barbero
data class HorarioBarbero(
    @SerializedName("dia_semana")
    val diaSemana: String,

    val trabaja: Boolean,

    @SerializedName("hora_inicio")
    val horaInicio: String?,

    @SerializedName("hora_fin")
    val horaFin: String?
) : Serializable