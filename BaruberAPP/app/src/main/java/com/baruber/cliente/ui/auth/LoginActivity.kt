package com.baruber.cliente.ui.auth

import android.content.Intent
import android.os.Bundle
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
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding
    private lateinit var sessionManager: SessionManager

    // ✅ Launcher para Google Sign-In
    private val googleSignInLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            handleGoogleSignInResult(result.data)
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

    // ✅ NUEVO: Inicia el flujo de Google Sign-In
    private fun iniciarGoogleSignIn() {
        binding.btnGoogleSignIn.isEnabled = false
        binding.btnGoogleSignIn.text = "Conectando..."

        val signInIntent = GoogleSignInHelper.getSignInIntent(this)
        googleSignInLauncher.launch(signInIntent)
    }

    // ✅ NUEVO: Procesa el resultado de Google Sign-In
    private fun handleGoogleSignInResult(data: Intent?) {
        lifecycleScope.launch {
            try {
                // Obtener cuenta de Google
                val account = GoogleSignInHelper.handleSignInResult(data)
                val idToken = account.idToken

                if (idToken == null) {
                    Toast.makeText(this@LoginActivity, "Error obteniendo token de Google", Toast.LENGTH_SHORT).show()
                    return@launch
                }

                // Enviar ID Token al backend
                val apiService = ApiClient.create(sessionManager)
                val response = apiService.loginWithGoogle(mapOf("idToken" to idToken))

                if (response.isSuccessful) {
                    val loginResponse = response.body()!!

                    sessionManager.saveAuthToken(loginResponse.accessToken)
                    sessionManager.saveRefreshToken(loginResponse.refreshToken)
                    sessionManager.saveUserData(loginResponse.user)

                    FCMHelper.obtenerYEnviarToken(sessionManager)

                    Toast.makeText(this@LoginActivity, "¡Bienvenido ${account.displayName}!", Toast.LENGTH_SHORT).show()

                    startActivity(Intent(this@LoginActivity, MainActivity::class.java))
                    finish()
                } else {
                    Toast.makeText(this@LoginActivity, "Error autenticando con Google", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@LoginActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                binding.btnGoogleSignIn.isEnabled = true
                binding.btnGoogleSignIn.text = "Continuar con Google"
            }
        }
    }
}