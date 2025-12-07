package com.baruber.cliente.utils

import android.content.Context
import android.util.Log
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.common.api.CommonStatusCodes
import com.google.android.gms.tasks.Task
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

object GoogleSignInHelper {
    private const val TAG = "GoogleSignInHelper"

    private const val WEB_CLIENT_ID = "925501836568-lvp02lsm81quhdrstvnoni4a6lo1mmp2.apps.googleusercontent.com"

    /**
     * Verifica si hay una cuenta de Google ya guardada
     * @return La última cuenta usada o null si no hay ninguna
     */
    fun getLastSignedInAccount(context: Context): GoogleSignInAccount? {
        return GoogleSignIn.getLastSignedInAccount(context)
    }

    /**
     * Crea el cliente de Google Sign-In
     */
    fun getGoogleSignInClient(context: Context): GoogleSignInClient {
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(WEB_CLIENT_ID)
            .requestEmail()
            .requestProfile()
            .build()

        return GoogleSignIn.getClient(context, gso)
    }

    /**
     * Obtiene el Intent para iniciar Google Sign-In
     * @param forceAccountPicker Si es true, fuerza mostrar el selector de cuentas
     */
    fun getSignInIntent(context: Context, forceAccountPicker: Boolean = false): android.content.Intent {
        val client = getGoogleSignInClient(context)

        if (forceAccountPicker) {
            // ✅ Forzar selector: primero cierra sesión silenciosamente
            client.signOut().addOnCompleteListener {
                Log.d(TAG, "🔄 Sesión cerrada para mostrar selector de cuentas")
            }
        }

        return client.signInIntent
    }

    suspend fun handleSignInResult(data: android.content.Intent?): GoogleSignInAccount {
        return suspendCancellableCoroutine { continuation ->
            try {
                val task: Task<GoogleSignInAccount> = GoogleSignIn.getSignedInAccountFromIntent(data)
                val account = task.getResult(ApiException::class.java)

                if (account?.idToken != null) {
                    Log.d(TAG, "✅ Google Sign-In exitoso")
                    Log.d(TAG, "   Email: ${account.email}")
                    Log.d(TAG, "   Nombre: ${account.displayName}")
                    Log.d(TAG, "   ID Token: ${account.idToken?.take(30)}...")
                    continuation.resume(account)
                } else {
                    val error = "No se obtuvo ID Token de Google"
                    Log.e(TAG, "❌ $error")
                    continuation.resumeWithException(Exception(error))
                }
            } catch (e: ApiException) {
                val errorMessage = when (e.statusCode) {
                    CommonStatusCodes.SIGN_IN_REQUIRED -> "Se requiere iniciar sesión"
                    CommonStatusCodes.INVALID_ACCOUNT -> "Cuenta de Google inválida"
                    CommonStatusCodes.NETWORK_ERROR -> "Error de red. Verifica tu conexión"
                    CommonStatusCodes.DEVELOPER_ERROR ->
                        "Error de configuración del desarrollador"
                    10 -> "Error de configuración (código 10)"
                    12501 -> "Inicio de sesión cancelado por el usuario"
                    else -> "Error desconocido (código: ${e.statusCode})"
                }

                Log.e(TAG, "❌ Error en Google Sign-In (${e.statusCode}): $errorMessage")
                continuation.resumeWithException(Exception(errorMessage, e))
            }
        }
    }

    /**
     * Cierra sesión de Google
     * @param revokeAccess Si es true, también revoca el acceso (desvincula completamente)
     */
    fun signOut(context: Context, revokeAccess: Boolean = false, onComplete: () -> Unit) {
        val client = getGoogleSignInClient(context)

        if (revokeAccess) {
            // Revoca acceso completamente (borra todo)
            client.revokeAccess().addOnCompleteListener {
                Log.d(TAG, "✅ Google acceso revocado")
                onComplete()
            }
        } else {
            // Solo cierra sesión (mantiene cuenta guardada)
            client.signOut().addOnCompleteListener {
                Log.d(TAG, "✅ Google Sign-Out completado")
                onComplete()
            }
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