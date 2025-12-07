import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

let firebaseApp = null;

/**
 * Inicializa Firebase Admin SDK usando variable de entorno
 */
export const initializeFirebase = () => {
  try {
    if (firebaseApp) {
      console.log("✅ Firebase ya está inicializado");
      return firebaseApp;
    }

    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (!serviceAccountJson) {
      throw new Error("❌ La variable FIREBASE_SERVICE_ACCOUNT no está configurada");
    }

    const serviceAccount = JSON.parse(serviceAccountJson);

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    console.log("🔥 Firebase Admin SDK inicializado correctamente desde env");
    return firebaseApp;

  } catch (error) {
    console.error("❌ Error inicializando Firebase:", error.message);
    console.error("⚠️ Las notificaciones push NO funcionarán");
  }
};

/**
 * Retorna instancia de Firebase Messaging
 */
export const getMessaging = () => {
  if (!firebaseApp) {
    initializeFirebase();
  }
  return admin.messaging();
};

export default admin;
