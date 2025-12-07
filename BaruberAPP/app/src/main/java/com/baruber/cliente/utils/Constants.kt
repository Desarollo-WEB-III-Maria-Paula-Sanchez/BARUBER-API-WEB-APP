// utils/Constants.kt
package com.baruber.cliente.utils

object Constants {

    // Formatos de fecha y hora
    const val DATE_FORMAT = "yyyy-MM-dd"
    const val TIME_FORMAT = "HH:mm:ss"
    const val DISPLAY_DATE_FORMAT = "EEEE, dd 'de' MMMM 'de' yyyy"
    const val DISPLAY_TIME_FORMAT = "hh:mm a"

    // Estados de reserva
    object EstadoReserva {
        const val PENDIENTE = "pendiente"
        const val ACEPTADA = "aceptada"
        const val RECHAZADA = "rechazada"
        const val COMPLETADA = "completada"
    }

    // Roles de usuario
    object Roles {
        const val CLIENTE = "cliente"
        const val BARBERO = "barbero"
        const val ADMIN = "admin"
    }

    // Códigos de resultado para Activities
    object RequestCodes {
        const val PICK_IMAGE = 1001
        const val CREAR_RESERVA = 1002
        const val EDITAR_PERFIL = 1003
    }

    // Claves para Intent extras
    object IntentKeys {
        const val BARBER_ID = "barber_id"
        const val BARBER_NAME = "barber_name"
        const val BARBER_PHOTO = "barber_photo"
        const val SERVICIO = "servicio"
        const val RESERVA_ID = "reserva_id"
    }

    // Configuración de API
    object Api {
        const val TIMEOUT_SECONDS = 30L
        const val MAX_RETRIES = 3
    }

    // Validaciones
    object Validation {
        const val MIN_PASSWORD_LENGTH = 6
        const val MAX_PASSWORD_LENGTH = 50
        const val MIN_NAME_LENGTH = 2
        const val MAX_NAME_LENGTH = 100
    }
}