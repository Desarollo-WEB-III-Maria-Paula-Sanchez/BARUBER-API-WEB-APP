// utils/SessionManager.kt
package com.baruber.cliente.utils

import android.content.Context
import android.content.SharedPreferences
import com.baruber.cliente.models.Usuario

class SessionManager(context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences(
        PREFS_NAME,
        Context.MODE_PRIVATE
    )

    companion object {
        private const val PREFS_NAME = "baruber_prefs"
        private const val KEY_AUTH_TOKEN = "auth_token"
        private const val KEY_REFRESH_TOKEN = "refresh_token"
        private const val KEY_USER_ID = "user_id"
        private const val KEY_USER_NAME = "user_name"
        private const val KEY_USER_EMAIL = "user_email"
        private const val KEY_USER_ROLE = "user_role"
        private const val KEY_USER_PHONE = "user_phone"
        private const val KEY_USER_PHOTO = "user_photo"
    }

    /**
     * Guardar token de autenticación
     */
    fun saveAuthToken(token: String) {
        prefs.edit().putString(KEY_AUTH_TOKEN, token).apply()
    }

    /**
     * Obtener token de autenticación
     */
    fun getAuthToken(): String? {
        return prefs.getString(KEY_AUTH_TOKEN, null)
    }

    /**
     * Guardar refresh token
     */
    fun saveRefreshToken(token: String) {
        prefs.edit().putString(KEY_REFRESH_TOKEN, token).apply()
    }

    /**
     * Obtener refresh token
     */
    fun getRefreshToken(): String? {
        return prefs.getString(KEY_REFRESH_TOKEN, null)
    }

    /**
     * Guardar datos del usuario
     */
    fun saveUserData(usuario: Usuario) {
        prefs.edit().apply {
            putString(KEY_USER_ID, usuario.id)
            putString(KEY_USER_NAME, usuario.nombre)
            putString(KEY_USER_EMAIL, usuario.email)
            putString(KEY_USER_ROLE, usuario.rol)
            putString(KEY_USER_PHONE, usuario.telefono)
            putString(KEY_USER_PHOTO, usuario.fotoUrl)
            apply()
        }
    }

    /**
     * Obtener ID del usuario
     */
    fun getUserId(): String? {
        return prefs.getString(KEY_USER_ID, null)
    }

    /**
     * Obtener nombre del usuario
     */
    fun getUserName(): String? {
        return prefs.getString(KEY_USER_NAME, null)
    }

    /**
     * Obtener email del usuario
     */
    fun getUserEmail(): String? {
        return prefs.getString(KEY_USER_EMAIL, null)
    }

    /**
     * Obtener rol del usuario
     */
    fun getUserRole(): String? {
        return prefs.getString(KEY_USER_ROLE, null)
    }

    /**
     * Obtener teléfono del usuario
     */
    fun getUserPhone(): String? {
        return prefs.getString(KEY_USER_PHONE, null)
    }

    /**
     * Obtener foto del usuario
     */
    fun getUserPhoto(): String? {
        return prefs.getString(KEY_USER_PHOTO, null)
    }

    /**
     * Verificar si hay sesión activa
     */
    fun isLoggedIn(): Boolean {
        return !getAuthToken().isNullOrEmpty()
    }

    /**
     * Limpiar sesión (logout)
     */
    fun clearSession() {
        prefs.edit().clear().apply()
    }
}