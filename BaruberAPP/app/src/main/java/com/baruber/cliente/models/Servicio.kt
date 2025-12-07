// models/Servicio.kt
package com.baruber.cliente.models

import com.google.gson.annotations.SerializedName
import java.io.Serializable

data class Servicio(
    val id: String,

    @SerializedName("barber_id")
    val barberId: String,

    val nombre: String,
    val descripcion: String?,
    val precio: Double,
    val duracion: Int,

    @SerializedName("foto_url")
    val fotoUrl: String?,

    @SerializedName("created_at")
    val createdAt: String?
) : Serializable
