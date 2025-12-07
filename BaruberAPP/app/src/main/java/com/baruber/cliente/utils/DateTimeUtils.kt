// utils/DateTimeUtils.kt
package com.baruber.cliente.utils

import java.text.SimpleDateFormat
import java.util.*

object DateTimeUtils {

    /**
     * Formatea una fecha de un formato a otro
     * @param date Fecha en formato string
     * @param fromFormat Formato original
     * @param toFormat Formato deseado
     * @return Fecha formateada o la fecha original si hay error
     */
    fun formatDate(date: String, fromFormat: String, toFormat: String): String {
        return try {
            val inputFormat = SimpleDateFormat(fromFormat, Locale.getDefault())
            val outputFormat = SimpleDateFormat(toFormat, Locale("es", "ES"))
            val parsedDate = inputFormat.parse(date)
            if (parsedDate != null) {
                outputFormat.format(parsedDate)
            } else {
                date
            }
        } catch (e: Exception) {
            date
        }
    }

    /**
     * Formatea una hora de formato 24h a formato 12h con AM/PM
     * @param time Hora en formato HH:mm:ss o HH:mm
     * @return Hora formateada (ej: "02:30 PM")
     */
    fun formatTime(time: String): String {
        return try {
            // Manejar tanto HH:mm:ss como HH:mm
            val inputFormat = if (time.count { it == ':' } == 2) {
                SimpleDateFormat("HH:mm:ss", Locale.getDefault())
            } else {
                SimpleDateFormat("HH:mm", Locale.getDefault())
            }

            val outputFormat = SimpleDateFormat("hh:mm a", Locale("es", "ES"))
            val parsedTime = inputFormat.parse(time)

            if (parsedTime != null) {
                outputFormat.format(parsedTime).uppercase()
            } else {
                time
            }
        } catch (e: Exception) {
            time
        }
    }

    /**
     * Obtiene la fecha actual en formato específico
     * @param format Formato deseado
     * @return Fecha actual formateada
     */
    fun getCurrentDate(format: String = Constants.DATE_FORMAT): String {
        val dateFormat = SimpleDateFormat(format, Locale.getDefault())
        return dateFormat.format(Date())
    }

    /**
     * Obtiene la hora actual en formato específico
     * @param format Formato deseado
     * @return Hora actual formateada
     */
    fun getCurrentTime(format: String = Constants.TIME_FORMAT): String {
        val timeFormat = SimpleDateFormat(format, Locale.getDefault())
        return timeFormat.format(Date())
    }

    /**
     * Convierte una fecha string a objeto Date
     * @param dateString Fecha en formato string
     * @param format Formato de la fecha
     * @return Objeto Date o null si hay error
     */
    fun parseDate(dateString: String, format: String = Constants.DATE_FORMAT): Date? {
        return try {
            val dateFormat = SimpleDateFormat(format, Locale.getDefault())
            dateFormat.parse(dateString)
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Verifica si una fecha es hoy
     * @param date Fecha a verificar en formato string
     * @param format Formato de la fecha
     * @return true si es hoy, false en caso contrario
     */
    fun isToday(date: String, format: String = Constants.DATE_FORMAT): Boolean {
        val parsedDate = parseDate(date, format) ?: return false
        val today = Calendar.getInstance()
        val dateCalendar = Calendar.getInstance().apply { time = parsedDate }

        return today.get(Calendar.YEAR) == dateCalendar.get(Calendar.YEAR) &&
                today.get(Calendar.DAY_OF_YEAR) == dateCalendar.get(Calendar.DAY_OF_YEAR)
    }

    /**
     * Verifica si una fecha está en el pasado
     * @param date Fecha a verificar en formato string
     * @param format Formato de la fecha
     * @return true si está en el pasado, false en caso contrario
     */
    fun isPast(date: String, format: String = Constants.DATE_FORMAT): Boolean {
        val parsedDate = parseDate(date, format) ?: return false
        return parsedDate.before(Date())
    }

    /**
     * Obtiene el día de la semana en español
     * @param date Fecha en formato string
     * @param format Formato de la fecha
     * @return Día de la semana en español
     */
    fun getDayOfWeek(date: String, format: String = Constants.DATE_FORMAT): String {
        return try {
            val dateFormat = SimpleDateFormat(format, Locale.getDefault())
            val parsedDate = dateFormat.parse(date)
            if (parsedDate != null) {
                val dayFormat = SimpleDateFormat("EEEE", Locale("es", "ES"))
                dayFormat.format(parsedDate).capitalize()
            } else {
                ""
            }
        } catch (e: Exception) {
            ""
        }
    }

    /**
     * Calcula la diferencia en días entre dos fechas
     * @param date1 Primera fecha
     * @param date2 Segunda fecha
     * @param format Formato de las fechas
     * @return Diferencia en días
     */
    fun daysBetween(date1: String, date2: String, format: String = Constants.DATE_FORMAT): Long {
        val parsedDate1 = parseDate(date1, format) ?: return 0
        val parsedDate2 = parseDate(date2, format) ?: return 0

        val diffInMillis = parsedDate2.time - parsedDate1.time
        return diffInMillis / (1000 * 60 * 60 * 24)
    }
}