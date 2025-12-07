package com.baruber.cliente.ui.perfil

import android.app.AlertDialog
import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.baruber.cliente.databinding.FragmentPerfilBinding
import com.baruber.cliente.network.ApiClient
import com.baruber.cliente.ui.auth.LoginActivity
import com.baruber.cliente.utils.SessionManager
import com.bumptech.glide.Glide
import kotlinx.coroutines.launch

class PerfilFragment : Fragment() {

    private var _binding: FragmentPerfilBinding? = null
    private val binding get() = _binding!!

    private lateinit var sessionManager: SessionManager

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentPerfilBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        sessionManager = SessionManager(requireContext())
        loadUserData()
        setupListeners()
    }

    private fun loadUserData() {
        // ✅ CAMBIO CRÍTICO: Usar viewLifecycleOwner.lifecycleScope en lugar de lifecycleScope
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                // ✅ Verificar que el Fragment aún está activo
                if (!isAdded || _binding == null) return@launch

                val apiService = ApiClient.create(sessionManager)
                val response = apiService.getPerfil()

                // ✅ Verificar nuevamente después de la llamada de red
                if (!isAdded || _binding == null) return@launch

                if (response.isSuccessful) {
                    val usuario = response.body()!!

                    binding.tvName.text = usuario.nombre ?: "Sin nombre"
                    binding.tvEmail.text = usuario.email
                    binding.tvPhone.text = usuario.telefono ?: "Sin teléfono"

                    // Cargar foto
                    if (!usuario.fotoUrl.isNullOrEmpty()) {
                        Glide.with(requireContext())
                            .load(usuario.fotoUrl)
                            .into(binding.ivProfile)
                    }

                    // Guardar en sesión
                    sessionManager.saveUserData(usuario)
                }
            } catch (e: Exception) {
                // ✅ Verificar antes de actualizar UI
                if (!isAdded || _binding == null) return@launch

                // Usar datos guardados
                binding.tvName.text = sessionManager.getUserName() ?: "Usuario"
                binding.tvEmail.text = sessionManager.getUserEmail() ?: ""

                val photo = sessionManager.getUserPhoto()
                if (!photo.isNullOrEmpty()) {
                    Glide.with(requireContext())
                        .load(photo)
                        .into(binding.ivProfile)
                }
            }
        }
    }

    private fun setupListeners() {
        binding.tvEditProfile.setOnClickListener {
            val intent = Intent(requireContext(), EditarPerfilActivity::class.java)
            startActivity(intent)
        }

        binding.tvLogout.setOnClickListener {
            showLogoutDialog()
        }
    }

    private fun showLogoutDialog() {
        AlertDialog.Builder(requireContext())
            .setTitle("Cerrar Sesión")
            .setMessage("¿Estás seguro que deseas cerrar sesión?")
            .setPositiveButton("Sí") { _, _ ->
                logout()
            }
            .setNegativeButton("No", null)
            .show()
    }

    private fun logout() {
        sessionManager.clearSession()

        val intent = Intent(requireContext(), LoginActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        requireActivity().finish()
    }

    override fun onResume() {
        super.onResume()
        loadUserData()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}