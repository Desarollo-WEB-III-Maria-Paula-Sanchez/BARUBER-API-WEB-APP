// network/ApiService.kt
package com.baruber.cliente.network

import com.baruber.cliente.models.*
import okhttp3.MultipartBody
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    // ===== AUTENTICACIÓN =====
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @POST("auth/registro")
    suspend fun register(@Body request: RegisterRequest): Response<LoginResponse>

    // ✅ NUEVO: Login con Google (envía ID Token)
    @POST("auth/google-token")
    suspend fun loginWithGoogle(@Body request: Map<String, String>): Response<LoginResponse>

    @GET("auth/me")
    suspend fun getSession(): Response<SessionResponse>

    // ===== USUARIO / PERFIL =====
    @GET("usuarios/perfil")
    suspend fun getPerfil(): Response<Usuario>

    @PUT("usuarios/perfil")
    suspend fun updatePerfil(@Body usuario: Usuario): Response<Usuario>

    @Multipart
    @POST("usuarios/perfil/foto")
    suspend fun uploadFotoPerfil(@Part file: MultipartBody.Part): Response<MessageResponse>

    // ===== TOKENS FCM =====
    @POST("usuarios/device-token")
    suspend fun registerDeviceToken(@Body request: Map<String, String>): Response<MessageResponse>

    @HTTP(method = "DELETE", path = "usuarios/device-token", hasBody = true)
    suspend fun unregisterDeviceToken(@Body request: Map<String, String>): Response<MessageResponse>

    // ===== BARBEROS =====
    @GET("barberos")
    suspend fun getBarberos(): Response<List<Barbero>>

    @GET("barberos/{id}")
    suspend fun getBarberoById(@Path("id") barberoId: String): Response<Barbero>

    // ===== SERVICIOS =====
    @GET("servicios/barbero/{barber_id}")
    suspend fun getServiciosBarbero(@Path("barber_id") barberId: String): Response<List<Servicio>>

    // ===== RESERVAS =====
    @POST("reservas/")
    suspend fun crearReserva(@Body request: CrearReservaRequest): Response<Reserva>

    @GET("reservas/cliente")
    suspend fun getReservasCliente(): Response<List<Reserva>>

    @GET("reservas/disponibles")
    suspend fun getHorariosDisponibles(
        @Query("barber_id") barberId: String,
        @Query("servicio_id") servicioId: String,
        @Query("fecha") fecha: String
    ): Response<HorariosResponse>

    @PUT("reservas/cancelar")
    suspend fun cancelarReserva(@Body request: Map<String, String>): Response<MessageResponse>

    @PUT("reservas/estado")
    suspend fun cambiarEstadoReserva(@Body request: Map<String, String>): Response<Reserva>
}