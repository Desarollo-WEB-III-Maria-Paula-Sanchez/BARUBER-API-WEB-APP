// ui/barberos/BarberosFragment.kt
package com.baruber.cliente.ui.barberos

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.baruber.cliente.databinding.FragmentBarberosBinding
import com.baruber.cliente.models.Barbero
import com.baruber.cliente.network.ApiClient
import com.baruber.cliente.utils.SessionManager
import kotlinx.coroutines.launch

class BarberosFragment : Fragment() {

    private var _binding: FragmentBarberosBinding? = null
    private val binding get() = _binding!!

    private lateinit var sessionManager: SessionManager
    private lateinit var adapter: BarberosAdapter
    private val barberos = mutableListOf<Barbero>()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentBarberosBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        sessionManager = SessionManager(requireContext())
        setupRecyclerView()
        setupSwipeRefresh()
        loadBarberos()
    }

    private fun setupRecyclerView() {
        adapter = BarberosAdapter(barberos) { barbero ->
            // Click en un barbero
            val intent = Intent(requireContext(), BarberoDetailActivity::class.java)
            intent.putExtra("barber_id", barbero.id)
            intent.putExtra("barber_name", barbero.nombre)
            intent.putExtra("barber_photo", barbero.fotoUrl)
            startActivity(intent)
        }

        binding.rvBarberos.layoutManager = LinearLayoutManager(requireContext())
        binding.rvBarberos.adapter = adapter
    }

    private fun setupSwipeRefresh() {
        binding.swipeRefresh.setOnRefreshListener {
            loadBarberos()
        }
    }

    private fun loadBarberos() {
        // ✅ Verificar antes de actualizar UI
        if (!isAdded || _binding == null) return

        showLoading(true)

        // ✅ CAMBIO CRÍTICO: Usar viewLifecycleOwner.lifecycleScope
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                // ✅ Verificar que el Fragment aún está activo
                if (!isAdded || _binding == null) return@launch

                val apiService = ApiClient.create(sessionManager)
                val response = apiService.getBarberos()

                // ✅ Verificar después de la llamada de red
                if (!isAdded || _binding == null) return@launch

                if (response.isSuccessful) {
                    barberos.clear()
                    barberos.addAll(response.body() ?: emptyList())

                    if (barberos.isEmpty()) {
                        showEmpty(true)
                    } else {
                        showEmpty(false)
                        adapter.notifyDataSetChanged()
                    }
                } else {
                    Toast.makeText(
                        requireContext(),
                        "Error al cargar barberos",
                        Toast.LENGTH_SHORT
                    ).show()
                }

            } catch (e: Exception) {
                // ✅ Verificar antes de mostrar Toast
                if (isAdded) {
                    Toast.makeText(
                        requireContext(),
                        "Error: ${e.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            } finally {
                // ✅ Verificar antes de ocultar loading
                if (isAdded && _binding != null) {
                    showLoading(false)
                    binding.swipeRefresh.isRefreshing = false
                }
            }
        }
    }

    private fun showLoading(show: Boolean) {
        // ✅ Verificar que binding no sea null
        if (_binding == null) return

        binding.progressBar.visibility = if (show) View.VISIBLE else View.GONE
        binding.rvBarberos.visibility = if (show) View.GONE else View.VISIBLE
    }

    private fun showEmpty(show: Boolean) {
        // ✅ Verificar que binding no sea null
        if (_binding == null) return

        binding.tvEmpty.visibility = if (show) View.VISIBLE else View.GONE
        binding.rvBarberos.visibility = if (show) View.GONE else View.VISIBLE
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}