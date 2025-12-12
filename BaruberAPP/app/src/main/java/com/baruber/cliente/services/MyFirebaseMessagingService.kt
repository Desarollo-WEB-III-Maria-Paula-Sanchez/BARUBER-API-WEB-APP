package com.baruber.cliente.services

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.baruber.cliente.R
import com.baruber.cliente.network.ApiClient
import com.baruber.cliente.ui.main.MainActivity
import com.baruber.cliente.ui.reservas.DetalleReservaActivity
import com.baruber.cliente.utils.SessionManager
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class MyFirebaseMessagingService : FirebaseMessagingService() {

    companion object {
        private const val TAG = "FCMService"
        private const val CHANNEL_ID = "reservas_channel"
        private const val CHANNEL_NAME = "Reservas"
        private const val CHANNEL_DESCRIPTION = "Notificaciones sobre tus reservas"
    }

    /**
     * Se llama cuando se recibe un nuevo token FCM
     * Esto ocurre cuando:
     * - La app se instala por primera vez
     * - El usuario reinstala la app
     * - El usuario limpia los datos de la app
     * - El token expira
     */
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "🔑 Nuevo token FCM: $token")

        // Enviar el token al servidor
        enviarTokenAlServidor(token)
    }

    /**
     * Se llama cuando llega un mensaje de FCM
     */
    override fun onMessageReceived(message: RemoteMessage) {
        super.onMessageReceived(message)

        Log.d(TAG, "📨 Mensaje recibido de: ${message.from}")

        // Verificar si el mensaje tiene notificación
        message.notification?.let { notification ->
            Log.d(TAG, "📬 Título: ${notification.title}")
            Log.d(TAG, "📝 Mensaje: ${notification.body}")

            val titulo = notification.title ?: "Baruber"
            val cuerpo = notification.body ?: "Tienes una nueva notificación"

            // Obtener datos adicionales
            val reservaId = message.data["reserva_id"]
            val estado = message.data["estado"]
            val type = message.data["type"]

            Log.d(TAG, "📊 Datos: reservaId=$reservaId, estado=$estado, type=$type")

            // Mostrar notificación
            mostrarNotificacion(titulo, cuerpo, reservaId)
        }

        // También verificar si hay datos sin notificación
        if (message.data.isNotEmpty()) {
            Log.d(TAG, "📦 Datos recibidos: ${message.data}")

            // Si no hay notificación pero sí datos, crear notificación manual
            if (message.notification == null) {
                val titulo = message.data["title"] ?: "Baruber"
                val cuerpo = message.data["body"] ?: "Tienes una nueva notificación"
                val reservaId = message.data["reserva_id"]

                mostrarNotificacion(titulo, cuerpo, reservaId)
            }
        }
    }

    /**
     * Muestra una notificación local
     */
    private fun mostrarNotificacion(titulo: String, mensaje: String, reservaId: String?) {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Crear canal de notificaciones (requerido para Android 8.0+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = CHANNEL_DESCRIPTION
                enableVibration(true)
                enableLights(true)
            }
            notificationManager.createNotificationChannel(channel)
        }

        // Intent para abrir la app cuando se toca la notificación
        val intent = if (reservaId != null) {
            // Abrir directamente el detalle de la reserva
            Intent(this, DetalleReservaActivity::class.java).apply {
                putExtra("reserva_id", reservaId)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
        } else {
            // Abrir la app en la pantalla principal
            Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
        }

        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_ONE_SHOT or PendingIntent.FLAG_IMMUTABLE
        )

        // Sonido de notificación
        val defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)

        // Construir la notificación
        val notificationBuilder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(titulo)
            .setContentText(mensaje)
            .setAutoCancel(true)
            .setSound(defaultSoundUri)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setVibrate(longArrayOf(0, 500, 250, 500))
            .setStyle(
                NotificationCompat.BigTextStyle()
                    .bigText(mensaje)
            )

        // Mostrar la notificación
        val notificationId = System.currentTimeMillis().toInt()
        notificationManager.notify(notificationId, notificationBuilder.build())

        Log.d(TAG, "✅ Notificación mostrada con ID: $notificationId")
    }

    /**
     * Envía el token al servidor backend
     */
    private fun enviarTokenAlServidor(token: String) {
        val sessionManager = SessionManager(applicationContext)

        // Solo enviar si el usuario está logueado
        if (!sessionManager.isLoggedIn()) {
            Log.d(TAG, "⚠️ Usuario no logueado, token no enviado")
            return
        }

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val apiService = ApiClient.create(sessionManager)
                val request = mapOf(
                    "token" to token,
                    "platform" to "android"
                )

                val response = apiService.registerDeviceToken(request)

                if (response.isSuccessful) {
                    Log.d(TAG, "✅ Token enviado al servidor exitosamente")
                } else {
                    Log.e(TAG, "❌ Error enviando token: ${response.code()}")
                }
            } catch (e: Exception) {
                Log.e(TAG, "❌ Error enviando token al servidor", e)
            }
        }
    }
}