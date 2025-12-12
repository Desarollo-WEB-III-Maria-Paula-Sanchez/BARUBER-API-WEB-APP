package com.baruber.cliente.ui.auth

import android.content.Intent
import android.os.Bundle
import android.util.Patterns
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.baruber.cliente.databinding.ActivityRegisterBinding
import com.baruber.cliente.models.RegisterRequest
import com.baruber.cliente.network.ApiClient
import com.baruber.cliente.ui.main.MainActivity
import com.baruber.cliente.utils.FCMHelper  // ✅ IMPORTAR
import com.baruber.cliente.utils.SessionManager
import kotlinx.coroutines.launch

class RegisterActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRegisterBinding
    private lateinit var sessionManager: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRegisterBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)

        // ✅ SOLICITAR PERMISOS DE NOTIFICACIÓN
        FCMHelper.requestNotificationPermission(this)

        setupListeners()
    }

    private fun setupListeners() {
        binding.btnRegister.setOnClickListener {
            val name = binding.etName.text.toString().trim()
            val email = binding.etEmail.text.toString().trim()
            val password = binding.etPassword.text.toString().trim()

            if (validateInputs(name, email, password)) {
                register(name, email, password)
            }
        }

        binding.tvLogin.setOnClickListener {
            finish()
        }
    }

    private fun validateInputs(name: String, email: String, password: String): Boolean {
        if (name.isEmpty()) {
            binding.tilName.error = "Nombre requerido"
            return false
        }

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

    private fun register(name: String, email: String, password: String) {
        binding.btnRegister.isEnabled = false
        binding.btnRegister.text = "Registrando..."

        lifecycleScope.launch {
            try {
                val apiService = ApiClient.create(sessionManager)
                val response = apiService.register(
                    RegisterRequest(email, password, name)
                )

                if (response.isSuccessful) {
                    val loginResponse = response.body()!!

                    sessionManager.saveAuthToken(loginResponse.accessToken)
                    sessionManager.saveRefreshToken(loginResponse.refreshToken)
                    sessionManager.saveUserData(loginResponse.user)

                    // ✅ OBTENER Y ENVIAR TOKEN FCM
                    FCMHelper.obtenerYEnviarToken(sessionManager)

                    Toast.makeText(
                        this@RegisterActivity,
                        "Cuenta creada exitosamente",
                        Toast.LENGTH_SHORT
                    ).show()

                    startActivity(Intent(this@RegisterActivity, MainActivity::class.java))
                    finish()
                } else {
                    Toast.makeText(
                        this@RegisterActivity,
                        "Error al crear cuenta",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            } catch (e: Exception) {
                Toast.makeText(
                    this@RegisterActivity,
                    "Error: ${e.message}",
                    Toast.LENGTH_SHORT
                ).show()
            } finally {
                binding.btnRegister.isEnabled = true
                binding.btnRegister.text = "Registrarse"
            }
        }
    }
}