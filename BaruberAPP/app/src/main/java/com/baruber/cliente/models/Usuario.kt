// models/Usuario.kt
package com.baruber.cliente.models

import com.google.gson.annotations.SerializedName

data class Usuario(
    val id: String,
    val nombre: String?,
    val email: String,
    val rol: String,
    @SerializedName("foto_url")
    val fotoUrl: String?,
    val telefono: String?,
    @SerializedName("created_at")
    val createdAt: String?
)

data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val email: String,
    val password: String,
    val nombre: String
)

data class LoginResponse(
    @SerializedName("access_token")
    val accessToken: String,

    @SerializedName("refresh_token")
    val refreshToken: String,

    val user: Usuario
)

data class SessionResponse(
    val user: Usuario
)
