package com.baruber.cliente.utils

import android.Manifest
import android.app.Activity
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.baruber.cliente.network.ApiClient
import com.google.firebase.messaging.FirebaseMessaging
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

object FCMHelper {
    private const val TAG = "FCMHelper"
    const val NOTIFICATION_PERMISSION_REQUEST_CODE = 1001

    /**
     * Solicita permisos de notificación (Android 13+)
     */
    fun requestNotificationPermission(activity: Activity) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(
                    activity,
                    Manifest.permission.POST_NOTIFICATIONS
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                ActivityCompat.requestPermissions(
                    activity,
                    arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                    NOTIFICATION_PERMISSION_REQUEST_CODE
                )
            }
        }
    }

    /**
     * Obtiene el token FCM y lo envía al servidor
     */
    fun obtenerYEnviarToken(sessionManager: SessionManager) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                // Obtener token de Firebase
                val token = FirebaseMessaging.getInstance().token.await()
                Log.d(TAG, "🔑 Token FCM obtenido: $token")

                // Enviar al servidor
                enviarTokenAlServidor(token, sessionManager)
            } catch (e: Exception) {
                Log.e(TAG, "❌ Error obteniendo token FCM", e)
            }
        }
    }

    /**
     * Envía el token al servidor backend
     */
    private suspend fun enviarTokenAlServidor(token: String, sessionManager: SessionManager) {
        try {
            val apiService = ApiClient.create(sessionManager)
            val request = mapOf(
                "token" to token,
                "platform" to "android"
            )

            val response = apiService.registerDeviceToken(request)

            if (response.isSuccessful) {
                Log.d(TAG, "✅ Token registrado en el servidor")
            } else {
                Log.e(TAG, "❌ Error registrando token: ${response.code()}")
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error enviando token al servidor", e)
        }
    }

    /**
     * Desactiva el token cuando el usuario cierra sesión
     */
    fun desactivarToken(sessionManager: SessionManager) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val token = FirebaseMessaging.getInstance().token.await()
                val apiService = ApiClient.create(sessionManager)
                val request = mapOf("token" to token)

                val response = apiService.unregisterDeviceToken(request)

                if (response.isSuccessful) {
                    Log.d(TAG, "✅ Token desactivado en el servidor")
                } else {
                    Log.e(TAG, "❌ Error desactivando token: ${response.code()}")
                }
            } catch (e: Exception) {
                Log.e(TAG, "❌ Error desactivando token", e)
            }
        }
    }
}