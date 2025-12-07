// ui/main/MainActivity.kt
package com.baruber.cliente.ui.main

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import com.baruber.cliente.R
import com.baruber.cliente.databinding.ActivityMainBinding
import com.baruber.cliente.ui.barberos.BarberosFragment
import com.baruber.cliente.ui.perfil.PerfilFragment
import com.baruber.cliente.ui.reservas.ReservasFragment

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)

        // Fragment inicial
        if (savedInstanceState == null) {
            loadFragment(BarberosFragment())
        }

        setupBottomNavigation()
    }

    private fun setupBottomNavigation() {
        binding.bottomNavigation.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_barberos -> {
                    loadFragment(BarberosFragment())
                    binding.toolbar.title = "Barberos"
                    true
                }
                R.id.nav_reservas -> {
                    loadFragment(ReservasFragment())
                    binding.toolbar.title = "Mis Reservas"
                    true
                }
                R.id.nav_perfil -> {
                    loadFragment(PerfilFragment())
                    binding.toolbar.title = "Mi Perfil"
                    true
                }
                else -> false
            }
        }
    }

    private fun loadFragment(fragment: Fragment) {
        supportFragmentManager.beginTransaction()
            .replace(R.id.fragmentContainer, fragment)
            .commit()
    }
}
