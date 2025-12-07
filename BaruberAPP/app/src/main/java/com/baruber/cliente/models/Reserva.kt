// models/Reserva.kt
package com.baruber.cliente.models

import com.google.gson.annotations.SerializedName

data class Reserva(
    val id: String,

    @SerializedName("cliente_id")
    val clienteId: String,

    @SerializedName("barber_id")
    val barberId: String,

    @SerializedName("servicio_id")
    val servicioId: String,

    val fecha: String,
    val hora: String,
    val estado: String,

    @SerializedName("factura_url")
    val facturaUrl: String?,

    @SerializedName("created_at")
    val createdAt: String?,

    val servicios: Servicio?,
    val usuarios: Barbero?
)

data class CrearReservaRequest(
    @SerializedName("barber_id")
    val barberId: String,

    @SerializedName("servicio_id")
    val servicioId: String,

    val fecha: String,
    val hora: String
)
