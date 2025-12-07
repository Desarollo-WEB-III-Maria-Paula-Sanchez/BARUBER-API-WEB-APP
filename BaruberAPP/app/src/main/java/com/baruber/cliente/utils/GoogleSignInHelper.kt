package com.baruber.cliente.utils

import android.content.Context
import android.util.Log
import com.baruber.cliente.models.LoginResponse
import com.baruber.cliente.network.ApiClient
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.tasks.Task
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

object GoogleSignInHelper {
    private const val TAG = "GoogleSignInHelper"

    // ✅ REEMPLAZA CON TU WEB CLIENT ID de Google Cloud Console
    // Lo obtienes en: https://console.cloud.google.com/apis/credentials
    private const val WEB_CLIENT_ID = "TU_WEB_CLIENT_ID.apps.googleusercontent.com"

    /**
     * Crea el cliente de Google Sign-In
     */
    fun getGoogleSignInClient(context: Context): GoogleSignInClient {
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(WEB_CLIENT_ID) // ✅ IMPORTANTE: Necesitamos el ID Token
            .requestEmail()
            .requestProfile()
            .build()

        return GoogleSignIn.getClient(context, gso)
    }

    /**
     * Inicia el flujo de Google Sign-In
     * @return Intent para startActivityForResult
     */
    fun getSignInIntent(context: Context) = getGoogleSignInClient(context).signInIntent

    /**
     * Procesa el resultado del Intent de Google Sign-In
     * @param data Intent recibido en onActivityResult
     * @return GoogleSignInAccount con los datos del usuario
     */
    suspend fun handleSignInResult(data: android.content.Intent?): GoogleSignInAccount {
        return suspendCancellableCoroutine { continuation ->
            try {
                val task: Task<GoogleSignInAccount> = GoogleSignIn.getSignedInAccountFromIntent(data)
                val account = task.getResult(ApiException::class.java)

                if (account != null) {
                    Log.d(TAG, "✅ Google Sign-In exitoso: ${account.email}")
                    continuation.resume(account)
                } else {
                    Log.e(TAG, "❌ Cuenta de Google es null")
                    continuation.resumeWithException(Exception("Cuenta de Google es null"))
                }
            } catch (e: ApiException) {
                Log.e(TAG, "❌ Error en Google Sign-In: ${e.statusCode}", e)
                continuation.resumeWithException(e)
            }
        }
    }

    /**
     * Cierra sesión de Google
     */
    fun signOut(context: Context, onComplete: () -> Unit) {
        getGoogleSignInClient(context).signOut().addOnCompleteListener {
            Log.d(TAG, "✅ Google Sign-Out completado")
            onComplete()
        }
    }

    /**
     * Revoca el acceso de Google (desvincula cuenta completamente)
     */
    fun revokeAccess(context: Context, onComplete: () -> Unit) {
        getGoogleSignInClient(context).revokeAccess().addOnCompleteListener {
            Log.d(TAG, "✅ Google acceso revocado")
            onComplete()
        }
    }
}