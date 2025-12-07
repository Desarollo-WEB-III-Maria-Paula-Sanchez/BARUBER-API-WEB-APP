// ui/reservas/DetalleReservaActivity.kt
package com.baruber.cliente.ui.reservas

import android.app.AlertDialog
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.baruber.cliente.R
import com.baruber.cliente.databinding.ActivityDetalleReservaBinding
import com.baruber.cliente.models.Reserva
import com.baruber.cliente.network.ApiClient
import com.baruber.cliente.utils.Constants
import com.baruber.cliente.utils.DateTimeUtils
import com.baruber.cliente.utils.SessionManager
import com.bumptech.glide.Glide
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.util.*

class DetalleReservaActivity : AppCompatActivity() {

    private lateinit var binding: ActivityDetalleReservaBinding
    private lateinit var sessionManager: SessionManager

    private var reservaId: String = ""
    private var reserva: Reserva? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityDetalleReservaBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)

        reservaId = intent.getStringExtra("reserva_id") ?: ""

        setupToolbar()
        loadReserva()
        setupListeners()
    }

    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = "Detalle de Reserva"

        binding.toolbar.setNavigationOnClickListener { finish() }
    }

    private fun loadReserva() {
        binding.progressBar.visibility = View.VISIBLE

        lifecycleScope.launch {
            try {
                val apiService = ApiClient.create(sessionManager)
                val response = apiService.getReservasCliente()

                if (response.isSuccessful) {
                    val reservas = response.body() ?: emptyList()
                    reserva = reservas.find { it.id == reservaId }

                    if (reserva != null) {
                        displayReserva(reserva!!)
                    } else {
                        Toast.makeText(this@DetalleReservaActivity, "Reserva no encontrada", Toast.LENGTH_SHORT).show()
                        finish()
                    }
                }

            } catch (e: Exception) {
                Toast.makeText(this@DetalleReservaActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
                finish()
            } finally {
                binding.progressBar.visibility = View.GONE
            }
        }
    }

    private fun displayReserva(reserva: Reserva) {
        binding.tvBarberoName.text = reserva.usuarios?.nombre ?: "Barbero"

        reserva.usuarios?.fotoUrl?.let { url ->
            Glide.with(this).load(url).circleCrop().into(binding.ivBarbero)
        }

        binding.tvServicioName.text = reserva.servicios?.nombre ?: "Servicio"
        binding.tvServicioDescripcion.text = reserva.servicios?.descripcion ?: ""
        binding.tvDuracion.text = "${reserva.servicios?.duracion} min"

        val formato = NumberFormat.getCurrencyInstance(Locale("es", "CR"))
        binding.tvPrecio.text = formato.format(reserva.servicios?.precio ?: 0.0)

        binding.tvFecha.text = DateTimeUtils.formatDate(
            reserva.fecha,
            Constants.DATE_FORMAT,
            Constants.DISPLAY_DATE_FORMAT
        )
        binding.tvHora.text = DateTimeUtils.formatTime(reserva.hora)

        val (estadoText, colorText, bg) = when (reserva.estado) {
            Constants.EstadoReserva.PENDIENTE -> Triple("Pendiente", R.color.white, R.drawable.bg_status_pending)
            Constants.EstadoReserva.ACEPTADA -> Triple("Aceptada", R.color.white, R.drawable.bg_status_accepted)
            Constants.EstadoReserva.RECHAZADA -> Triple("Rechazada", R.color.white, R.drawable.bg_status_rejected)
            Constants.EstadoReserva.COMPLETADA -> Triple("Completada", R.color.white, R.drawable.bg_status_completed)
            else -> Triple(reserva.estado, R.color.text_primary, R.drawable.bg_status_pending)
        }

        binding.tvEstado.text = estadoText
        binding.tvEstado.setTextColor(ContextCompat.getColor(this, colorText))
        binding.tvEstado.setBackgroundResource(bg)

        when (reserva.estado) {
            Constants.EstadoReserva.PENDIENTE,
            Constants.EstadoReserva.ACEPTADA -> {
                binding.btnCancelar.visibility = View.VISIBLE
                binding.btnDescargarFactura.visibility = View.GONE
            }

            Constants.EstadoReserva.COMPLETADA -> {
                binding.btnCancelar.visibility = View.GONE
                if (!reserva.facturaUrl.isNullOrEmpty()) {
                    binding.btnDescargarFactura.visibility = View.VISIBLE
                }
            }

            else -> {
                binding.btnCancelar.visibility = View.GONE
                binding.btnDescargarFactura.visibility = View.GONE
            }
        }
    }

    private fun setupListeners() {
        binding.btnCancelar.setOnClickListener { showCancelDialog() }

        binding.btnDescargarFactura.setOnClickListener {
            reserva?.facturaUrl?.let { url ->
                startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
            }
        }
    }

    private fun showCancelDialog() {
        AlertDialog.Builder(this)
            .setTitle("Cancelar Reserva")
            .setMessage("¿Estás seguro que deseas cancelar esta reserva?")
            .setPositiveButton("Sí") { _, _ -> cancelarReserva() }
            .setNegativeButton("No", null)
            .show()
    }

    private fun cancelarReserva() {
        binding.btnCancelar.isEnabled = false

        lifecycleScope.launch {
            try {
                val apiService = ApiClient.create(sessionManager)
                // ✅ CAMBIO: Solo enviar reserva_id, no estado
                val request = mapOf("reserva_id" to reservaId)

                // ✅ CAMBIO: Usar endpoint correcto para clientes
                val response = apiService.cancelarReserva(request)

                if (response.isSuccessful) {
                    Toast.makeText(
                        this@DetalleReservaActivity,
                        "Reserva cancelada exitosamente",
                        Toast.LENGTH_SHORT
                    ).show()
                    finish()
                } else {
                    val errorBody = response.errorBody()?.string()
                    Toast.makeText(
                        this@DetalleReservaActivity,
                        "Error al cancelar: ${response.code()}",
                        Toast.LENGTH_LONG
                    ).show()
                }

            } catch (e: Exception) {
                Toast.makeText(
                    this@DetalleReservaActivity,
                    "Error: ${e.message}",
                    Toast.LENGTH_SHORT
                ).show()
            } finally {
                binding.btnCancelar.isEnabled = true
            }
        }
    }
}