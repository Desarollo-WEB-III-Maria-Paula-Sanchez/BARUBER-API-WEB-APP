// ui/barberos/BarberoDetailActivity.kt
package com.baruber.cliente.ui.barberos

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.baruber.cliente.databinding.ActivityBarberoDetailBinding
import com.baruber.cliente.models.Barbero
import com.baruber.cliente.models.HorarioBarbero
import com.baruber.cliente.models.Servicio
import com.baruber.cliente.network.ApiClient
import com.baruber.cliente.ui.reservas.CrearReservaActivity
import com.baruber.cliente.utils.SessionManager
import com.bumptech.glide.Glide
import kotlinx.coroutines.launch

class BarberoDetailActivity : AppCompatActivity() {

    private lateinit var binding: ActivityBarberoDetailBinding
    private lateinit var sessionManager: SessionManager
    private lateinit var adapter: ServiciosAdapter

    private val servicios = mutableListOf<Servicio>()

    private var barberId: String = ""
    private var barberName: String = ""
    private var barberPhoto: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityBarberoDetailBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)

        barberId = intent.getStringExtra("barber_id") ?: ""
        barberName = intent.getStringExtra("barber_name") ?: "Barbero"
        barberPhoto = intent.getStringExtra("barber_photo")

        setupToolbar()
        setupHeader()
        setupRecyclerView()

        // ✅ Cargar información completa del barbero (con horarios)
        loadBarberoInfo()

        loadServicios()
    }

    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = barberName

        binding.toolbar.setNavigationOnClickListener {
            finish()
        }
    }

    private fun setupHeader() {
        binding.tvBarberoName.text = barberName

        if (!barberPhoto.isNullOrEmpty()) {
            Glide.with(this)
                .load(barberPhoto)
                .circleCrop()
                .into(binding.ivBarbero)
        }
    }

    private fun setupRecyclerView() {
        adapter = ServiciosAdapter(servicios) { servicio ->
            val intent = Intent(this, CrearReservaActivity::class.java)
            intent.putExtra("barber_id", barberId)
            intent.putExtra("barber_name", barberName)
            intent.putExtra("servicio", servicio)
            startActivity(intent)
        }

        binding.rvServicios.layoutManager = LinearLayoutManager(this)
        binding.rvServicios.adapter = adapter
    }

    // ✅ NUEVA FUNCIÓN: Cargar información completa del barbero
    private fun loadBarberoInfo() {
        lifecycleScope.launch {
            try {
                val apiService = ApiClient.create(sessionManager)
                val response = apiService.getBarberoById(barberId)

                if (response.isSuccessful) {
                    val barbero = response.body()
                    if (barbero != null) {
                        displayBarberoInfo(barbero)
                    }
                }
            } catch (e: Exception) {
                // Silencioso, no es crítico si falla
                e.printStackTrace()
            }
        }
    }

    // ✅ NUEVA FUNCIÓN: Mostrar información del barbero
    private fun displayBarberoInfo(barbero: Barbero) {
        // ✅ Mostrar email si existe
        if (!barbero.email.isNullOrEmpty()) {
            binding.layoutEmail.visibility = View.VISIBLE
            binding.tvEmail.text = barbero.email
        }

        // Mostrar teléfono si existe
        if (!barbero.telefono.isNullOrEmpty()) {
            binding.layoutTelefono.visibility = View.VISIBLE
            binding.tvTelefono.text = barbero.telefono
        }

        // Formatear y mostrar horarios
        if (!barbero.horarios.isNullOrEmpty()) {
            binding.layoutHorarios.visibility = View.VISIBLE
            val horariosTexto = formatearHorarios(barbero.horarios)
            binding.tvHorarios.text = horariosTexto
        }
    }

    // ✅ NUEVA FUNCIÓN: Formatear horarios de forma legible
    private fun formatearHorarios(horarios: List<HorarioBarbero>): String {
        val diasMap = mapOf(
            "lunes" to "Lun",
            "martes" to "Mar",
            "miercoles" to "Mié",
            "jueves" to "Jue",
            "viernes" to "Vie",
            "sabado" to "Sáb",
            "domingo" to "Dom"
        )

        // Filtrar solo días que trabaja
        val diasTrabajando = horarios.filter { it.trabaja }

        if (diasTrabajando.isEmpty()) {
            return "Horarios no disponibles"
        }

        // Agrupar por horario similar
        val grupos = diasTrabajando.groupBy { "${it.horaInicio}-${it.horaFin}" }

        return grupos.map { (horario, dias) ->
            val diasAbrev = dias.mapNotNull { diasMap[it.diaSemana] }

            val rango = when {
                diasAbrev.isEmpty() -> ""
                diasAbrev.size == 1 -> diasAbrev.first()
                diasAbrev.size >= 5 -> "Lun-Vie"
                else -> diasAbrev.joinToString(", ")
            }

            val (inicio, fin) = horario.split("-")
            val inicioFormat = formatHora(inicio)
            val finFormat = formatHora(fin)

            "$rango: $inicioFormat - $finFormat"
        }.joinToString("\n")
    }

    // ✅ NUEVA FUNCIÓN: Formatear hora de 24h a 12h con AM/PM
    private fun formatHora(hora: String): String {
        return try {
            val partes = hora.split(":")
            val h = partes[0].toInt()
            val m = partes[1]
            val ampm = if (h < 12) "AM" else "PM"
            val hora12 = when {
                h == 0 -> 12
                h > 12 -> h - 12
                else -> h
            }
            "$hora12:$m $ampm"
        } catch (e: Exception) {
            hora
        }
    }

    private fun loadServicios() {
        showLoading(true)

        lifecycleScope.launch {
            try {
                val apiService = ApiClient.create(sessionManager)
                val response = apiService.getServiciosBarbero(barberId)

                if (response.isSuccessful) {
                    servicios.clear()
                    servicios.addAll(response.body() ?: emptyList())

                    if (servicios.isEmpty()) {
                        showEmpty(true)
                    } else {
                        showEmpty(false)
                        adapter.notifyDataSetChanged()
                    }
                } else {
                    Toast.makeText(
                        this@BarberoDetailActivity,
                        "Error al cargar servicios",
                        Toast.LENGTH_SHORT
                    ).show()
                }

            } catch (e: Exception) {
                Toast.makeText(
                    this@BarberoDetailActivity,
                    "Error: ${e.message}",
                    Toast.LENGTH_SHORT
                ).show()
            } finally {
                showLoading(false)
            }
        }
    }

    private fun showLoading(show: Boolean) {
        binding.progressBar.visibility = if (show) View.VISIBLE else View.GONE
        binding.rvServicios.visibility = if (show) View.GONE else View.VISIBLE
    }

    private fun showEmpty(show: Boolean) {
        binding.tvEmpty.visibility = if (show) View.VISIBLE else View.GONE
        binding.rvServicios.visibility = if (show) View.GONE else View.VISIBLE
    }
}
