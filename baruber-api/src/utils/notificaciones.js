// utils/notificaciones.js
import { getMessaging } from "./firebase.js";
import { supabaseAdmin } from "./supabaseAdmin.js";

/**
 * Envía una notificación push a un usuario específico
 * @param {string} userId - ID del usuario
 * @param {string} titulo - Título de la notificación
 * @param {string} mensaje - Mensaje de la notificación
 * @param {object} data - Datos adicionales (opcional)
 */
export const enviarNotificacion = async (userId, titulo, mensaje, data = {}) => {
  try {
    console.log(`📨 Intentando enviar notificación a usuario: ${userId}`);

    // 1. Obtener tokens del usuario
    const { data: tokens, error } = await supabaseAdmin
      .from("device_tokens")
      .select("*") // ⭐ Cambiado de "token" a "*" para ver todos los campos
      .eq("user_id", userId)
      .eq("is_active", true);

    // ⭐ LOGS DE DIAGNÓSTICO
    console.log(`🔍 Buscando tokens para user_id: ${userId}`);
    console.log(`📊 Resultado de la query:`, JSON.stringify(tokens, null, 2));
    console.log(`❓ ¿Hubo error en la query?:`, error);
    
    if (tokens && tokens.length > 0) {
      console.log(`✅ Tokens encontrados:`, tokens.map(t => ({
        id: t.id,
        user_id: t.user_id,
        platform: t.platform,
        token_preview: t.token?.substring(0, 20) + '...',
        is_active: t.is_active
      })));
    }
    // ⭐ FIN LOGS DE DIAGNÓSTICO

    if (error) {
      console.error("❌ Error obteniendo tokens:", error);
      return { success: false, error: error.message };
    }

    if (!tokens || tokens.length === 0) {
      console.log("⚠️ No se encontraron tokens activos para el usuario");
      
      // ⭐ QUERY ADICIONAL: Buscar TODOS los tokens (incluso inactivos)
      const { data: allTokens } = await supabaseAdmin
        .from("device_tokens")
        .select("user_id, is_active, platform")
        .eq("user_id", userId);
      
      console.log(`🔍 Tokens totales para este usuario (activos e inactivos):`, allTokens);
      // ⭐ FIN QUERY ADICIONAL
      
      return { success: false, error: "No tokens found" };
    }

    console.log(`✅ Encontrados ${tokens.length} token(s) para el usuario`);

    // 2. Preparar el mensaje
    const tokensArray = tokens.map((t) => t.token);
    
    const message = {
      notification: {
        title: titulo,
        body: mensaje,
      },
      data: {
        ...data,
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        sound: "default",
      },
      android: {
        notification: {
          sound: "default",
          channelId: "reservas_channel",
          priority: "high",
        },
      },
      tokens: tokensArray,
    };

    // 3. Enviar notificación
    const messaging = getMessaging();
    const response = await messaging.sendEachForMulticast(message);

    console.log(`✅ Notificación enviada: ${response.successCount} éxitos, ${response.failureCount} fallos`);

    // 4. Limpiar tokens inválidos
    if (response.failureCount > 0) {
      const tokensToDelete = [];
      
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errorCode = resp.error?.code;
          console.log(`❌ Error en token ${idx}:`, errorCode, resp.error?.message);
          
          // Eliminar tokens inválidos o no registrados
          if (
            errorCode === "messaging/invalid-registration-token" ||
            errorCode === "messaging/registration-token-not-registered"
          ) {
            tokensToDelete.push(tokensArray[idx]);
          }
        }
      });

      if (tokensToDelete.length > 0) {
        console.log(`🗑️ Eliminando ${tokensToDelete.length} token(s) inválido(s)`);
        
        await supabaseAdmin
          .from("device_tokens")
          .delete()
          .in("token", tokensToDelete);
      }
    }

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    console.error("❌ Error enviando notificación:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Envía notificación a múltiples usuarios
 * @param {string[]} userIds - Array de IDs de usuarios
 * @param {string} titulo - Título de la notificación
 * @param {string} mensaje - Mensaje de la notificación
 * @param {object} data - Datos adicionales (opcional)
 */
export const enviarNotificacionMultiple = async (userIds, titulo, mensaje, data = {}) => {
  const results = await Promise.allSettled(
    userIds.map((userId) => enviarNotificacion(userId, titulo, mensaje, data))
  );

  const successful = results.filter((r) => r.status === "fulfilled" && r.value.success).length;
  const failed = results.length - successful;

  console.log(`📊 Notificaciones múltiples: ${successful} éxitos, ${failed} fallos`);

  return { successful, failed };
};