package com.baruber.cliente.ui.barberos

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.baruber.cliente.databinding.ItemServicioBinding
import com.baruber.cliente.models.Servicio
import com.bumptech.glide.Glide
import java.text.NumberFormat
import java.util.*

class ServiciosAdapter(
    private val servicios: List<Servicio>,
    private val onItemClick: (Servicio) -> Unit
) : RecyclerView.Adapter<ServiciosAdapter.ServicioViewHolder>() {

    inner class ServicioViewHolder(
        private val binding: ItemServicioBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(servicio: Servicio) {
            binding.tvNombre.text = servicio.nombre
            binding.tvDescripcion.text = servicio.descripcion ?: "Sin descripción"

            // Formatear precio
            val formato = NumberFormat.getCurrencyInstance(Locale("es", "CR"))
            binding.tvPrecio.text = formato.format(servicio.precio)

            binding.tvDuracion.text = "${servicio.duracion} min"

            // Cargar imagen
            if (!servicio.fotoUrl.isNullOrEmpty()) {
                Glide.with(binding.root.context)
                    .load(servicio.fotoUrl)
                    .into(binding.ivServicio)
            }

            binding.root.setOnClickListener {
                onItemClick(servicio)
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ServicioViewHolder {
        val binding = ItemServicioBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return ServicioViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ServicioViewHolder, position: Int) {
        holder.bind(servicios[position])
    }

    override fun getItemCount(): Int = servicios.size
}