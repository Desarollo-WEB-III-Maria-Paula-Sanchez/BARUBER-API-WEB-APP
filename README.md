# BARUBER — Sistema de Gestión para Barberías

BARUBER es una plataforma completa de reservas para barberías que conecta **clientes** y **barberos** en un solo sistema. Incluye una **app Android** para clientes, un **panel web** para barberos y una **API REST** robusta para manejar autenticación, reservas, servicios, archivos y facturación.

---

## Estructura del proyecto
BaruberAPP/ # App Android (Kotlin)
barber-web/ # Panel web (React + TypeScript)
baruber-api/ # API REST (Node.js + Express)

---

## Stack tecnológico

### Backend (API)
- Node.js + Express  
- Supabase (PostgreSQL + Auth + Storage)  
- PDFKit (generación de facturas PDF)  
- Multer (subida de archivos)

### Panel Web (barberos)
- React 18 + TypeScript + Vite  
- Tailwind CSS  
- Zustand (estado global)  
- React Router DOM

### App móvil (clientes)
- Kotlin + Android SDK (minSdk 24 / targetSdk 34)  
- Retrofit (consumo de API)  
- Glide (carga y caché de imágenes)  
- Material Design 3

---

## Funcionalidades

### Para clientes (App Android)
- Registro e inicio de sesión con email/password
- Explorar barberos y ver perfiles completos
- Consultar servicios (precio y duración)
- Ver horarios disponibles en tiempo real
- Crear, ver y cancelar reservas
- Editar perfil y foto
- Acceso a facturas en PDF cuando el servicio se completa

### Para barberos (Panel Web)
- Dashboard con próximas citas y estadísticas
- Gestión de servicios (CRUD + imágenes)
- Configuración de horarios por día o por semana
- Administración de reservas: aceptar, rechazar, completar
- Reagendar citas
- Generación automática de facturas en PDF
- Autenticación con email/password o Google OAuth

---

## Base de datos y storage (Supabase)

### Tablas principales
- `usuarios`: perfiles (clientes y barberos)
- `servicios`: servicios ofrecidos por barberos
- `reservas`: citas agendadas
- `horarios_barbero`: disponibilidad por día
- `facturas`: registro de facturas generadas

### Buckets (Storage)
- `avatars`: fotos de perfil
- `servicios`: imágenes de servicios
- `facturas`: PDFs generados

---

## 🔗 Endpoints principales (API)

### Autenticación
- `POST /auth/login`
- `POST /auth/registro`
- `POST /auth/registro-barbero`
- `GET  /auth/google-barbero`
- `GET  /auth/me`

### Barberos
- `GET /barberos`
- `GET /barberos/:id`

### Servicios
- `GET    /servicios/barbero/:id`
- `POST   /servicios`
- `PUT    /servicios/:id`
- `DELETE /servicios/:id`
- `POST   /servicios/:id/imagen`

### Reservas
- `POST /reservas`
- `GET  /reservas/cliente`
- `GET  /reservas/barbero`
- `GET  /reservas/:id`
- `PUT  /reservas/estado`
- `PUT  /reservas/reagendar`
- `PUT  /reservas/cancelar`
- `GET  /reservas/disponibles`

### Horarios
- `GET /horarios`
- `PUT /horarios`
- `PUT /horarios/semana`

### Usuario
- `GET  /usuarios/perfil`
- `PUT  /usuarios/perfil`
- `POST /usuarios/perfil/foto`

### Facturas
- `POST /facturas`

---

## Flujo de uso

### Cliente (App)
1. Se registra / inicia sesión
2. Explora barberos
3. Selecciona servicio + fecha
4. Elige un horario disponible
5. Confirma la reserva
6. Consulta el estado en “Mis Reservas”
7. Descarga factura cuando el servicio se marca como completado

### Barbero (Web)
1. Inicia sesión (email o Google)
2. Configura servicios y precios
3. Define horarios de atención
4. Revisa reservas entrantes
5. Acepta o rechaza solicitudes
6. Completa la cita y genera factura PDF

---

##  Seguridad (resumen)
- Autenticación con JWT (Supabase Auth)
- Middleware de verificación de token en rutas protegidas
- Row Level Security (RLS) en Supabase
- Control de permisos por rol (cliente / barbero)
- Validación y sanitización de entradas
- CORS configurado para el consumo desde app y web

---

##  Detalles técnicos destacados
- Reservas solo dentro del horario configurado
- Prevención de citas superpuestas
- Validación para evitar fechas pasadas
- Al aceptar una cita, se rechazan automáticamente reservas en conflicto
