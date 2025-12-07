// network/AuthInterceptor.kt
package com.baruber.cliente.network

import com.baruber.cliente.utils.SessionManager
import okhttp3.Interceptor
import okhttp3.Response

/**
 * Interceptor para agregar el token de autenticación a todas las peticiones
 */
class AuthInterceptor(private val sessionManager: SessionManager) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()

        // Obtener el token de sesión
        val token = sessionManager.getAuthToken()

        // Si no hay token, continuar sin modificar
        if (token.isNullOrEmpty()) {
            return chain.proceed(originalRequest)
        }

        // Agregar el token al header Authorization
        val modifiedRequest = originalRequest.newBuilder()
            .addHeader("Authorization", "Bearer $token")
            .build()

        return chain.proceed(modifiedRequest)
    }
}