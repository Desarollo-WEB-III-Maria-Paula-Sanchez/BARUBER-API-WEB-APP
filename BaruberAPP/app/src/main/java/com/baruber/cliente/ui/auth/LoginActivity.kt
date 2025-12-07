package com.baruber.cliente.ui.auth

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.util.Patterns
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.baruber.cliente.databinding.ActivityLoginBinding
import com.baruber.cliente.models.LoginRequest
import com.baruber.cliente.network.ApiClient
import com.baruber.cliente.ui.main.MainActivity
import com.baruber.cliente.utils.FCMHelper
import com.baruber.cliente.utils.GoogleSignInHelper
import com.baruber.cliente.utils.SessionManager
import com.google.android.gms.common.api.ApiException
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding
    private lateinit var sessionManager: SessionManager
    private val TAG = "LoginActivity"

    // ✅ Launcher para Google Sign-In
    private val googleSignInLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        Log.d(TAG, "🔵 Resultado de Google Sign-In recibido. ResultCode: ${result.resultCode}")

        if (result.resultCode == RESULT_OK) {
            handleGoogleSignInResult(result.data)
        } else {
            Log.w(TAG, "⚠️ Google Sign-In cancelado o falló. ResultCode: ${result.resultCode}")
            binding.btnGoogleSignIn.isEnabled = true
            binding.btnGoogleSignIn.text = "Continuar con Google"
            Toast.makeText(this, "Inicio de sesión cancelado", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)

        FCMHelper.requestNotificationPermission(this)

        setupListeners()
    }

    private fun setupListeners() {
        // Login con email/password
        binding.btnLogin.setOnClickListener {
            val email = binding.etEmail.text.toString().trim()
            val password = binding.etPassword.text.toString().trim()

            if (validateInputs(email, password)) {
                login(email, password)
            }
        }

        // ✅ Login con Google
        binding.btnGoogleSignIn.setOnClickListener {
            iniciarGoogleSignIn()
        }

        // Ir a registro
        binding.tvRegister.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }
    }

    private fun validateInputs(email: String, password: String): Boolean {
        if (email.isEmpty()) {
            binding.tilEmail.error = "Email requerido"
            return false
        }

        if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            binding.tilEmail.error = "Email inválido"
            return false
        }

        if (password.isEmpty()) {
            binding.tilPassword.error = "Contraseña requerida"
            return false
        }

        if (password.length < 6) {
            binding.tilPassword.error = "La contraseña debe tener al menos 6 caracteres"
            return false
        }

        return true
    }

    private fun login(email: String, password: String) {
        binding.btnLogin.isEnabled = false
        binding.btnLogin.text = "Iniciando..."

        lifecycleScope.launch {
            try {
                val apiService = ApiClient.create(sessionManager)
                val response = apiService.login(LoginRequest(email, password))

                if (response.isSuccessful) {
                    val loginResponse = response.body()!!

                    sessionManager.saveAuthToken(loginResponse.accessToken)
                    sessionManager.saveRefreshToken(loginResponse.refreshToken)
                    sessionManager.saveUserData(loginResponse.user)

                    FCMHelper.obtenerYEnviarToken(sessionManager)

                    Toast.makeText(this@LoginActivity, "¡Bienvenido!", Toast.LENGTH_SHORT).show()

                    startActivity(Intent(this@LoginActivity, MainActivity::class.java))
                    finish()
                } else {
                    Toast.makeText(
                        this@LoginActivity,
                        "Email o contraseña incorrectos",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            } catch (e: Exception) {
                Log.e(TAG, "❌ Error en login", e)
                Toast.makeText(
                    this@LoginActivity,
                    "Error: ${e.message}",
                    Toast.LENGTH_SHORT
                ).show()
            } finally {
                binding.btnLogin.isEnabled = true
                binding.btnLogin.text = "Iniciar Sesión"
            }
        }
    }

    // ✅ Inicia el flujo de Google Sign-In
    private fun iniciarGoogleSignIn() {
        try {
            Log.d(TAG, "🔵 Iniciando Google Sign-In...")

            binding.btnGoogleSignIn.isEnabled = false
            binding.btnGoogleSignIn.text = "Conectando..."

            // ✅ forceAccountPicker = true para mostrar siempre el selector de cuentas
            val signInIntent = GoogleSignInHelper.getSignInIntent(this, forceAccountPicker = true)
            googleSignInLauncher.launch(signInIntent)

        } catch (e: Exception) {
            Log.e(TAG, "❌ Error iniciando Google Sign-In", e)
            Toast.makeText(this, "Error al iniciar Google Sign-In: ${e.message}", Toast.LENGTH_LONG).show()

            binding.btnGoogleSignIn.isEnabled = true
            binding.btnGoogleSignIn.text = "Continuar con Google"
        }
    }

    // ✅ Procesa el resultado de Google Sign-In
    private fun handleGoogleSignInResult(data: Intent?) {
        lifecycleScope.launch {
            try {
                Log.d(TAG, "🔵 Procesando resultado de Google Sign-In...")

                // Obtener cuenta de Google
                val account = GoogleSignInHelper.handleSignInResult(data)
                Log.d(TAG, "✅ Cuenta obtenida: ${account.email}")
                Log.d(TAG, "Nombre: ${account.displayName}")

                val idToken = account.idToken

                if (idToken.isNullOrEmpty()) {
                    Log.e(TAG, "❌ ID Token es null o vacío")
                    Toast.makeText(
                        this@LoginActivity,
                        "Error: No se pudo obtener el token de autenticación",
                        Toast.LENGTH_LONG
                    ).show()
                    return@launch
                }

                Log.d(TAG, "✅ ID Token obtenido (primeros 30 caracteres): ${idToken.take(30)}...")

                // ✅ El backend espera "idToken" (sin guion bajo, camelCase)
                val apiService = ApiClient.create(sessionManager)
                val requestBody = mapOf(
                    "idToken" to idToken
                )

                Log.d(TAG, "🔵 Enviando request al backend...")
                Log.d(TAG, "Email: ${account.email}")
                Log.d(TAG, "Nombre: ${account.displayName}")

                val response = apiService.loginWithGoogle(requestBody)

                if (response.isSuccessful && response.body() != null) {
                    val loginResponse = response.body()!!

                    Log.d(TAG, "✅ Login con Google exitoso")
                    Log.d(TAG, "Usuario: ${loginResponse.user.email}")

                    sessionManager.saveAuthToken(loginResponse.accessToken)
                    sessionManager.saveRefreshToken(loginResponse.refreshToken)
                    sessionManager.saveUserData(loginResponse.user)

                    FCMHelper.obtenerYEnviarToken(sessionManager)

                    Toast.makeText(
                        this@LoginActivity,
                        "¡Bienvenido ${account.displayName}!",
                        Toast.LENGTH_SHORT
                    ).show()

                    startActivity(Intent(this@LoginActivity, MainActivity::class.java))
                    finish()

                } else {
                    val errorBody = response.errorBody()?.string()
                    Log.e(TAG, "❌ Error del servidor: Código ${response.code()}")
                    Log.e(TAG, "Error body: $errorBody")

                    Toast.makeText(
                        this@LoginActivity,
                        "Error del servidor: ${response.code()}",
                        Toast.LENGTH_LONG
                    ).show()
                }

            } catch (e: ApiException) {
                Log.e(TAG, "❌ ApiException en Google Sign-In: ${e.statusCode}", e)

                val mensaje = when (e.statusCode) {
                    12501 -> "Inicio de sesión cancelado"
                    12500 -> "Error interno de Google Sign-In"
                    7 -> "Error de red. Verifica tu conexión a Internet"
                    10 -> "Error de configuración. Verifica tu Web Client ID"
                    else -> "Error de Google: ${e.statusCode}"
                }

                Toast.makeText(this@LoginActivity, mensaje, Toast.LENGTH_LONG).show()

            } catch (e: Exception) {
                Log.e(TAG, "❌ Error inesperado en Google Sign-In", e)
                e.printStackTrace()

                Toast.makeText(
                    this@LoginActivity,
                    "Error inesperado: ${e.message}",
                    Toast.LENGTH_LONG
                ).show()

            } finally {
                binding.btnGoogleSignIn.isEnabled = true
                binding.btnGoogleSignIn.text = "Continuar con Google"
            }
        }
    }
}