// models/HorarioDisponible.kt
package com.baruber.cliente.models

data class HorarioDisponible(
    val hora: String,
    val disponible: Boolean
)

data class HorariosResponse(
    val disponibles: List<HorarioDisponible>,
    val mensaje: String?
)
