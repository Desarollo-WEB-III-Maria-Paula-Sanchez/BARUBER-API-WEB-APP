// ui/perfil/EditarPerfilActivity.kt
package com.baruber.cliente.ui.perfil

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.baruber.cliente.databinding.ActivityEditarPerfilBinding
import com.baruber.cliente.models.Usuario
import com.baruber.cliente.network.ApiClient
import com.baruber.cliente.utils.SessionManager
import com.bumptech.glide.Glide
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody

class EditarPerfilActivity : AppCompatActivity() {

    private lateinit var binding: ActivityEditarPerfilBinding
    private lateinit var sessionManager: SessionManager
    private var selectedImageUri: Uri? = null

    private val pickImage = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            selectedImageUri = result.data?.data
            binding.ivProfile.setImageURI(selectedImageUri)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityEditarPerfilBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)

        setupToolbar()
        loadUserData()
        setupListeners()
    }

    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = "Editar Perfil"

        binding.toolbar.setNavigationOnClickListener {
            finish()
        }
    }

    private fun loadUserData() {
        lifecycleScope.launch {
            try {
                val apiService = ApiClient.create(sessionManager)
                val response = apiService.getPerfil()

                if (response.isSuccessful) {
                    val usuario = response.body()!!

                    binding.etName.setText(usuario.nombre)
                    binding.etPhone.setText(usuario.telefono)

                    if (!usuario.fotoUrl.isNullOrEmpty()) {
                        Glide.with(this@EditarPerfilActivity)
                            .load(usuario.fotoUrl)
                            .into(binding.ivProfile)
                    }
                }
            } catch (e: Exception) {
                binding.etName.setText(sessionManager.getUserName())
            }
        }
    }

    private fun setupListeners() {
        binding.ivProfile.setOnClickListener {
            val intent = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI)
            pickImage.launch(intent)
        }

        binding.btnSave.setOnClickListener {
            saveChanges()
        }
    }

    private fun saveChanges() {
        val nombre = binding.etName.text.toString().trim()
        val telefono = binding.etPhone.text.toString().trim()

        if (nombre.isEmpty()) {
            binding.tilName.error = "El nombre es requerido"
            return
        }

        binding.btnSave.isEnabled = false
        binding.btnSave.text = "Guardando..."

        lifecycleScope.launch {
            try {
                val apiService = ApiClient.create(sessionManager)

                val usuario = Usuario(
                    id = sessionManager.getUserId() ?: "",
                    nombre = nombre,
                    email = sessionManager.getUserEmail() ?: "",
                    rol = "cliente",
                    fotoUrl = null,
                    telefono = telefono.ifEmpty { null },
                    createdAt = null
                )

                val response = apiService.updatePerfil(usuario)

                if (response.isSuccessful) {
                    if (selectedImageUri != null) {
                        uploadPhoto()
                    } else {
                        Toast.makeText(
                            this@EditarPerfilActivity,
                            "Perfil actualizado",
                            Toast.LENGTH_SHORT
                        ).show()
                        finish()
                    }
                } else {
                    Toast.makeText(
                        this@EditarPerfilActivity,
                        "Error al actualizar perfil",
                        Toast.LENGTH_SHORT
                    ).show()
                }

            } catch (e: Exception) {
                Toast.makeText(
                    this@EditarPerfilActivity,
                    "Error: ${e.message}",
                    Toast.LENGTH_SHORT
                ).show()
            } finally {
                binding.btnSave.isEnabled = true
                binding.btnSave.text = "Guardar Cambios"
            }
        }
    }

    // ✅ SOLUCIÓN: Leer bytes directamente del ContentResolver
    private fun uploadPhoto() {
        lifecycleScope.launch {
            try {
                selectedImageUri?.let { uri ->
                    // ✅ Leer bytes de la imagen usando ContentResolver
                    val inputStream = contentResolver.openInputStream(uri)
                    val bytes = inputStream?.readBytes()
                    inputStream?.close()

                    if (bytes == null) {
                        Toast.makeText(
                            this@EditarPerfilActivity,
                            "Error al leer la imagen",
                            Toast.LENGTH_SHORT
                        ).show()
                        return@launch
                    }

                    // ✅ Crear RequestBody desde los bytes
                    val requestBody = bytes.toRequestBody("image/jpeg".toMediaTypeOrNull())

                    // ✅ Crear MultipartBody.Part
                    val body = MultipartBody.Part.createFormData(
                        "file",
                        "profile.jpg",
                        requestBody
                    )

                    val apiService = ApiClient.create(sessionManager)
                    val response = apiService.uploadFotoPerfil(body)

                    if (response.isSuccessful) {
                        Toast.makeText(
                            this@EditarPerfilActivity,
                            "Perfil actualizado con foto",
                            Toast.LENGTH_SHORT
                        ).show()
                        finish()
                    } else {
                        val errorBody = response.errorBody()?.string()
                        Toast.makeText(
                            this@EditarPerfilActivity,
                            "Error al subir foto: $errorBody",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            } catch (e: Exception) {
                Toast.makeText(
                    this@EditarPerfilActivity,
                    "Error al subir foto: ${e.message}",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }
}