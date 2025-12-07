package com.baruber.cliente.ui.reservas

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.baruber.cliente.databinding.FragmentReservasBinding
import com.baruber.cliente.models.Reserva
import com.baruber.cliente.network.ApiClient
import com.baruber.cliente.utils.Constants
import com.baruber.cliente.utils.SessionManager
import kotlinx.coroutines.launch

class ReservasFragment : Fragment() {

    private var _binding: FragmentReservasBinding? = null
    private val binding get() = _binding!!

    private lateinit var sessionManager: SessionManager
    private lateinit var adapter: ReservasAdapter
    private val reservas = mutableListOf<Reserva>()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentReservasBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        sessionManager = SessionManager(requireContext())
        setupRecyclerView()
        setupSwipeRefresh()
        loadReservas()
    }

    private fun setupRecyclerView() {
        adapter = ReservasAdapter(reservas) { reserva ->
            // Click en una reserva
            val intent = Intent(requireContext(), DetalleReservaActivity::class.java)
            intent.putExtra("reserva_id", reserva.id)
            startActivity(intent)
        }

        binding.rvReservas.layoutManager = LinearLayoutManager(requireContext())
        binding.rvReservas.adapter = adapter
    }

    private fun setupSwipeRefresh() {
        binding.swipeRefresh.setOnRefreshListener {
            loadReservas()
        }
    }

    private fun loadReservas() {
        if (!isAdded || _binding == null) return

        showLoading(true)

        viewLifecycleOwner.lifecycleScope.launch {
            try {
                if (!isAdded || _binding == null) return@launch

                val apiService = ApiClient.create(sessionManager)
                val response = apiService.getReservasCliente()

                if (!isAdded || _binding == null) return@launch

                if (response.isSuccessful) {
                    reservas.clear()

                    // ✅ ORDENAR por prioridad de estado
                    val reservasOrdenadas = (response.body() ?: emptyList()).sortedWith(
                        compareBy { getEstadoPrioridad(it.estado) }
                    )

                    reservas.addAll(reservasOrdenadas)

                    if (reservas.isEmpty()) {
                        showEmpty(true)
                    } else {
                        showEmpty(false)
                        adapter.notifyDataSetChanged()
                    }
                } else {
                    Toast.makeText(
                        requireContext(),
                        "Error al cargar reservas",
                        Toast.LENGTH_SHORT
                    ).show()
                }

            } catch (e: Exception) {
                if (isAdded) {
                    Toast.makeText(
                        requireContext(),
                        "Error: ${e.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            } finally {
                if (isAdded && _binding != null) {
                    showLoading(false)
                    binding.swipeRefresh.isRefreshing = false
                }
            }
        }
    }

    // ✅ NUEVA FUNCIÓN: Asignar prioridad a cada estado
    private fun getEstadoPrioridad(estado: String): Int {
        return when (estado) {
            Constants.EstadoReserva.PENDIENTE -> 1   // Primero
            Constants.EstadoReserva.ACEPTADA -> 2    // Segundo
            Constants.EstadoReserva.COMPLETADA -> 3  // Tercero
            Constants.EstadoReserva.RECHAZADA -> 4   // Último
            else -> 5
        }
    }

    private fun showLoading(show: Boolean) {
        if (_binding == null) return

        binding.progressBar.visibility = if (show) View.VISIBLE else View.GONE
        binding.rvReservas.visibility = if (show) View.GONE else View.VISIBLE
    }

    private fun showEmpty(show: Boolean) {
        if (_binding == null) return

        binding.tvEmpty.visibility = if (show) View.VISIBLE else View.GONE
        binding.rvReservas.visibility = if (show) View.GONE else View.VISIBLE
    }

    override fun onResume() {
        super.onResume()
        loadReservas()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}