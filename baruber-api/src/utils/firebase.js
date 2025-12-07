// utils/firebase.js
import admin from "firebase-admin";
import { readFileSync } from "fs";
import dotenv from "dotenv";

dotenv.config();

let firebaseApp = null;

/**
 * Inicializa Firebase Admin SDK
 */
export const initializeFirebase = () => {
  try {
    if (firebaseApp) {
      console.log("✅ Firebase ya está inicializado");
      return firebaseApp;
    }

    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

    if (!serviceAccountPath) {
      throw new Error("❌ FIREBASE_SERVICE_ACCOUNT_PATH no está definido en .env");
    }

    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("✅ Firebase Admin SDK inicializado correctamente");
    return firebaseApp;
  } catch (error) {
    console.error("❌ Error inicializando Firebase:", error.message);
    throw error;
  }
};

/**
 * Obtiene la instancia de Firebase Messaging
 */
export const getMessaging = () => {
  if (!firebaseApp) {
    initializeFirebase();
  }
  return admin.messaging();
};

export default admin;