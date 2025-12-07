// ui/reservas/CrearReservaActivity.kt
package com.baruber.cliente.ui.reservas

import android.app.DatePickerDialog
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.GridLayoutManager
import com.baruber.cliente.databinding.ActivityCrearReservaBinding
import com.baruber.cliente.models.CrearReservaRequest
import com.baruber.cliente.models.HorarioDisponible
import com.baruber.cliente.models.Servicio
import com.baruber.cliente.network.ApiClient
import com.baruber.cliente.utils.Constants
import com.baruber.cliente.utils.DateTimeUtils
import com.baruber.cliente.utils.SessionManager
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.*

class CrearReservaActivity : AppCompatActivity() {

    private lateinit var binding: ActivityCrearReservaBinding
    private lateinit var sessionManager: SessionManager
    private lateinit var horariosAdapter: HorariosAdapter

    private val horarios = mutableListOf<HorarioDisponible>()

    private var barberId: String = ""
    private var barberName: String = ""
    private lateinit var servicio: Servicio
    private var selectedDate: String = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCrearReservaBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)

        barberId = intent.getStringExtra("barber_id") ?: ""
        barberName = intent.getStringExtra("barber_name") ?: ""
        servicio = intent.getSerializableExtra("servicio") as Servicio

        setupToolbar()
        setupServiceInfo()
        setupRecyclerView()
        setupListeners()
    }

    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = "Nueva Reserva"

        binding.toolbar.setNavigationOnClickListener { finish() }
    }

    private fun setupServiceInfo() {
        binding.tvBarberoName.text = barberName
        binding.tvServicioName.text = servicio.nombre
        binding.tvServicioDuracion.text = "${servicio.duracion} minutos"

        val formato = NumberFormat.getCurrencyInstance(Locale("es", "CR"))
        binding.tvServicioPrecio.text = formato.format(servicio.precio)
    }

    private fun setupRecyclerView() {
        horariosAdapter = HorariosAdapter(horarios) { horario ->
            // selección de horario
        }

        binding.rvHorarios.layoutManager = GridLayoutManager(this, 3)
        binding.rvHorarios.adapter = horariosAdapter
    }

    private fun setupListeners() {
        binding.btnSelectDate.setOnClickListener { showDatePicker() }
        binding.btnConfirmar.setOnClickListener { confirmarReserva() }
    }

    private fun showDatePicker() {
        val calendar = Calendar.getInstance()

        val datePicker = DatePickerDialog(
            this,
            { _, year, month, dayOfMonth ->
                calendar.set(year, month, dayOfMonth)

                val format = SimpleDateFormat(Constants.DATE_FORMAT, Locale.getDefault())
                selectedDate = format.format(calendar.time)

                val displayFormat = SimpleDateFormat(Constants.DISPLAY_DATE_FORMAT, Locale("es", "ES"))
                binding.tvSelectedDate.text = displayFormat.format(calendar.time)
                binding.tvSelectedDate.visibility = View.VISIBLE

                loadHorariosDisponibles()
            },
            calendar.get(Calendar.YEAR),
            calendar.get(Calendar.MONTH),
            calendar.get(Calendar.DAY_OF_MONTH)
        )

        datePicker.datePicker.minDate = System.currentTimeMillis()
        datePicker.show()
    }

    private fun loadHorariosDisponibles() {
        showLoadingHorarios(true)

        lifecycleScope.launch {
            try {
                val apiService = ApiClient.create(sessionManager)
                val response = apiService.getHorariosDisponibles(
                    barberId,
                    servicio.id,
                    selectedDate
                )

                if (response.isSuccessful) {
                    val horariosResponse = response.body()!!

                    horarios.clear()
                    horarios.addAll(horariosResponse.disponibles)

                    if (horarios.isEmpty()) {
                        showEmptyHorarios(true, horariosResponse.mensaje)
                    } else {
                        showEmptyHorarios(false, null)
                        horariosAdapter.notifyDataSetChanged()
                        binding.btnConfirmar.isEnabled = true
                    }
                } else {
                    Toast.makeText(this@CrearReservaActivity, "Error al cargar horarios", Toast.LENGTH_SHORT).show()
                }

            } catch (e: Exception) {
                Toast.makeText(this@CrearReservaActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                showLoadingHorarios(false)
            }
        }
    }

    private fun confirmarReserva() {
        val horarioSeleccionado = horariosAdapter.getSelectedHorario()

        if (selectedDate.isEmpty()) {
            Toast.makeText(this, "Selecciona una fecha", Toast.LENGTH_SHORT).show()
            return
        }

        if (horarioSeleccionado == null) {
            Toast.makeText(this, "Selecciona un horario", Toast.LENGTH_SHORT).show()
            return
        }

        binding.btnConfirmar.isEnabled = false
        binding.btnConfirmar.text = "Creando..."

        lifecycleScope.launch {
            try {
                val apiService = ApiClient.create(sessionManager)
                val request = CrearReservaRequest(
                    barberId = barberId,
                    servicioId = servicio.id,
                    fecha = selectedDate,
                    hora = horarioSeleccionado.hora
                )

                val response = apiService.crearReserva(request)

                if (response.isSuccessful) {
                    Toast.makeText(this@CrearReservaActivity, "Reserva creada exitosamente", Toast.LENGTH_SHORT).show()
                    finish()
                } else {
                    Toast.makeText(this@CrearReservaActivity, "Error: ${response.errorBody()?.string()}", Toast.LENGTH_LONG).show()
                }

            } catch (e: Exception) {
                Toast.makeText(this@CrearReservaActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                binding.btnConfirmar.isEnabled = true
                binding.btnConfirmar.text = "Confirmar Reserva"
            }
        }
    }

    private fun showLoadingHorarios(show: Boolean) {
        binding.progressBarHorarios.visibility = if (show) View.VISIBLE else View.GONE
        binding.rvHorarios.visibility = if (show) View.GONE else View.VISIBLE
    }

    private fun showEmptyHorarios(show: Boolean, mensaje: String?) {
        binding.tvEmptyHorarios.visibility = if (show) View.VISIBLE else View.GONE
        binding.rvHorarios.visibility = if (show) View.GONE else View.VISIBLE

        if (show && mensaje != null) binding.tvEmptyHorarios.text = mensaje
    }
}
