// ui/barberos/BarberosAdapter.kt
package com.baruber.cliente.ui.barberos

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.baruber.cliente.databinding.ItemBarberoBinding
import com.baruber.cliente.models.Barbero
import com.bumptech.glide.Glide

class BarberosAdapter(
    private val barberos: List<Barbero>,
    private val onItemClick: (Barbero) -> Unit
) : RecyclerView.Adapter<BarberosAdapter.BarberoViewHolder>() {

    inner class BarberoViewHolder(
        private val binding: ItemBarberoBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(barbero: Barbero) {
            binding.tvNombre.text = barbero.nombre ?: "Sin nombre"
            binding.tvEmail.text = barbero.email
            binding.tvPhone.text = barbero.telefono ?: "Sin teléfono"

            // Cargar imagen con Glide
            if (!barbero.fotoUrl.isNullOrEmpty()) {
                Glide.with(binding.root.context)
                    .load(barbero.fotoUrl)
                    .circleCrop()
                    .into(binding.ivBarbero)
            }

            binding.root.setOnClickListener {
                onItemClick(barbero)
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): BarberoViewHolder {
        val binding = ItemBarberoBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return BarberoViewHolder(binding)
    }

    override fun onBindViewHolder(holder: BarberoViewHolder, position: Int) {
        holder.bind(barberos[position])
    }

    override fun getItemCount(): Int = barberos.size
}