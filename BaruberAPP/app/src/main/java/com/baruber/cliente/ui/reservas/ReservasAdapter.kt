package com.baruber.cliente.ui.reservas

import android.graphics.drawable.GradientDrawable
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.baruber.cliente.R
import com.baruber.cliente.databinding.ItemReservaBinding
import com.baruber.cliente.models.Reserva
import com.baruber.cliente.utils.Constants
import com.baruber.cliente.utils.DateTimeUtils
import com.bumptech.glide.Glide
import java.text.NumberFormat
import java.util.*

class ReservasAdapter(
    private val reservas: List<Reserva>,
    private val onItemClick: (Reserva) -> Unit
) : RecyclerView.Adapter<ReservasAdapter.ReservaViewHolder>() {

    inner class ReservaViewHolder(
        private val binding: ItemReservaBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(reserva: Reserva) {
            // Barbero
            binding.tvBarbero.text = reserva.usuarios?.nombre ?: "Barbero"

            // Servicio
            binding.tvServicio.text = reserva.servicios?.nombre ?: "Servicio"

            // Fecha y hora
            binding.tvFecha.text = DateTimeUtils.formatDate(
                reserva.fecha,
                Constants.DATE_FORMAT,
                Constants.DISPLAY_DATE_FORMAT
            )
            binding.tvHora.text = DateTimeUtils.formatTime(reserva.hora)

            // Precio
            val formato = NumberFormat.getCurrencyInstance(Locale("es", "CR"))
            binding.tvPrecio.text = formato.format(reserva.servicios?.precio ?: 0.0)

            // Estado
            val (estadoText, estadoColor, estadoBackground) = when (reserva.estado) {
                Constants.EstadoReserva.PENDIENTE -> Triple(
                    "Pendiente",
                    R.color.white,
                    R.drawable.bg_status_pending
                )
                Constants.EstadoReserva.ACEPTADA -> Triple(
                    "Aceptada",
                    R.color.white,
                    R.drawable.bg_status_accepted
                )
                Constants.EstadoReserva.RECHAZADA -> Triple(
                    "Rechazada",
                    R.color.white,
                    R.drawable.bg_status_rejected
                )
                Constants.EstadoReserva.COMPLETADA -> Triple(
                    "Completada",
                    R.color.white,
                    R.drawable.bg_status_completed
                )
                else -> Triple(
                    reserva.estado,
                    R.color.text_primary,
                    R.drawable.bg_status_pending
                )
            }

            binding.tvEstado.text = estadoText
            binding.tvEstado.setTextColor(
                ContextCompat.getColor(binding.root.context, estadoColor)
            )
            binding.tvEstado.setBackgroundResource(estadoBackground)

            // Imagen del barbero
            if (!reserva.usuarios?.fotoUrl.isNullOrEmpty()) {
                Glide.with(binding.root.context)
                    .load(reserva.usuarios?.fotoUrl)
                    .circleCrop()
                    .into(binding.ivBarbero)
            }

            binding.root.setOnClickListener {
                onItemClick(reserva)
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ReservaViewHolder {
        val binding = ItemReservaBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return ReservaViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ReservaViewHolder, position: Int) {
        holder.bind(reservas[position])
    }

    override fun getItemCount(): Int = reservas.size
}