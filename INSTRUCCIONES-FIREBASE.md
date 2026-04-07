# Cómo conectar con Firebase (paso a paso)

## 1. Crear proyecto en Firebase

1. Entrá a https://console.firebase.google.com
2. Click en **"Agregar proyecto"**
3. Poné un nombre (ej: `inmobiliaria-app`) y crealo

---

## 2. Activar Authentication (login)

1. En el menú izquierdo → **Authentication** → **Comenzar**
2. Click en la pestaña **"Sign-in method"**
3. Habilitá **"Correo electrónico/Contraseña"**
4. Luego andá a la pestaña **"Users"** → **"Agregar usuario"**
5. Creá tu usuario: email y contraseña (ej: `admin@miinmobiliaria.com` / `mi_clave_segura`)

---

## 3. Activar Firestore (base de datos)

1. En el menú → **Firestore Database** → **Crear base de datos**
2. Elegí **"Comenzar en modo producción"**
3. Seleccioná la región más cercana (ej: `us-east1` o `southamerica-east1`)

---

## 4. Obtener las credenciales

1. En la rueda de configuración (arriba a la izquierda) → **"Configuración del proyecto"**
2. Bajá hasta **"Tus apps"** → click en el ícono **`</>`** (Web)
3. Poné un nombre (ej: `inmobiliaria-web`) → **Registrar app**
4. Te va a mostrar un bloque así:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## 5. Crear el archivo .env

En la carpeta del proyecto, creá un archivo llamado `.env` (sin el `.example`) con estos valores:

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

Reemplazá cada valor con los de tu proyecto.

---

## 6. Buildear y deployar en Firebase Hosting

Instalá Firebase CLI (una sola vez):
```bash
npm install -g firebase-tools
```

Luego:
```bash
# Instalar dependencias
npm install

# Build
npm run build

# Login en Firebase
firebase login

# Inicializar (solo la primera vez, elegí "Hosting" y "Firestore")
firebase init

# Deploy
firebase deploy
```

Firebase te va a dar una URL pública como:
```
https://tu-proyecto.web.app
```

Entrás desde cualquier dispositivo con esa URL.

---

## 7. Tiempo real entre dispositivos

El tiempo real funciona automáticamente — Firestore usa listeners que actualizan
la pantalla en tiempo real en todos los dispositivos sin necesidad de recargar.

---

## Resumen de costos Firebase

El plan gratuito **Spark** incluye:
- 50.000 lecturas/día
- 20.000 escrituras/día
- 1 GB de almacenamiento Firestore
- 10 GB de hosting/mes

Para un uso de inmobiliaria personal es más que suficiente y **es gratis**.
