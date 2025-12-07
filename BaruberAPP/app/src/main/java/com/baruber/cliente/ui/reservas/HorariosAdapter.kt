package com.baruber.cliente.ui.reservas

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.baruber.cliente.R
import com.baruber.cliente.databinding.ItemHorarioBinding
import com.baruber.cliente.models.HorarioDisponible
import com.baruber.cliente.utils.DateTimeUtils

class HorariosAdapter(
    private val horarios: List<HorarioDisponible>,
    private val onItemClick: (HorarioDisponible) -> Unit
) : RecyclerView.Adapter<HorariosAdapter.HorarioViewHolder>() {

    private var selectedPosition = -1

    inner class HorarioViewHolder(
        private val binding: ItemHorarioBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(horario: HorarioDisponible, position: Int) {
            binding.tvHora.text = DateTimeUtils.formatTime(horario.hora)

            // Color según si está seleccionado
            if (position == selectedPosition) {
                binding.root.setCardBackgroundColor(
                    ContextCompat.getColor(binding.root.context, R.color.primary)
                )
                binding.tvHora.setTextColor(
                    ContextCompat.getColor(binding.root.context, R.color.white)
                )
            } else {
                binding.root.setCardBackgroundColor(
                    ContextCompat.getColor(binding.root.context, R.color.surface)
                )
                binding.tvHora.setTextColor(
                    ContextCompat.getColor(binding.root.context, R.color.text_primary)
                )
            }

            binding.root.setOnClickListener {
                val previousPosition = selectedPosition
                selectedPosition = position

                // Notificar cambios
                if (previousPosition != -1) {
                    notifyItemChanged(previousPosition)
                }
                notifyItemChanged(position)

                onItemClick(horario)
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): HorarioViewHolder {
        val binding = ItemHorarioBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return HorarioViewHolder(binding)
    }

    override fun onBindViewHolder(holder: HorarioViewHolder, position: Int) {
        holder.bind(horarios[position], position)
    }

    override fun getItemCount(): Int = horarios.size

    fun getSelectedHorario(): HorarioDisponible? {
        return if (selectedPosition != -1) horarios[selectedPosition] else null
    }

    fun clearSelection() {
        val previous = selectedPosition
        selectedPosition = -1
        if (previous != -1) {
            notifyItemChanged(previous)
        }
    }
}