package com.baruber.cliente.ui.auth

import android.content.Intent
import android.os.Bundle
import android.util.Patterns
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.baruber.cliente.databinding.ActivityLoginBinding
import com.baruber.cliente.models.LoginRequest
import com.baruber.cliente.network.ApiClient
import com.baruber.cliente.ui.main.MainActivity
import com.baruber.cliente.utils.FCMHelper  // ✅ IMPORTAR
import com.baruber.cliente.utils.SessionManager
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding
    private lateinit var sessionManager: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)

        // ✅ SOLICITAR PERMISOS DE NOTIFICACIÓN
        FCMHelper.requestNotificationPermission(this)

        setupListeners()
    }

    private fun setupListeners() {
        binding.btnLogin.setOnClickListener {
            val email = binding.etEmail.text.toString().trim()
            val password = binding.etPassword.text.toString().trim()

            if (validateInputs(email, password)) {
                login(email, password)
            }
        }

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

                    // ✅ OBTENER Y ENVIAR TOKEN FCM
                    FCMHelper.obtenerYEnviarToken(sessionManager)

                    Toast.makeText(
                        this@LoginActivity,
                        "¡Bienvenido!",
                        Toast.LENGTH_SHORT
                    ).show()

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
}