# ⚖️ LexGPT México — Guía de Despliegue

## Estructura del Proyecto

```
lexgpt-mexico/
├── public/
│   ├── favicon.svg
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
├── src/
│   ├── main.jsx
│   └── App.jsx
├── index.html
├── package.json
└── vite.config.js
```

---

## 🚀 Paso a Paso: Subir a Vercel (GRATIS)

### Paso 1 — Crear cuenta en GitHub
1. Ve a [github.com](https://github.com) → **Sign up**
2. Crea tu cuenta gratuita

### Paso 2 — Subir el proyecto a GitHub
1. En GitHub, clic en **"New repository"**
2. Nombre: `lexgpt-mexico` → **Create repository**
3. En tu computadora, descarga y descomprime este proyecto
4. Abre la carpeta en la terminal y ejecuta:
```bash
git init
git add .
git commit -m "LexGPT México inicial"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/lexgpt-mexico.git
git push -u origin main
```

### Paso 3 — Conectar con Vercel
1. Ve a [vercel.com](https://vercel.com) → **Sign up with GitHub**
2. Clic en **"New Project"**
3. Selecciona tu repositorio `lexgpt-mexico`
4. Vercel detecta automáticamente que es Vite/React
5. Clic en **"Deploy"** ✅

### Paso 4 — Tu app estará en:
```
https://lexgpt-mexico.vercel.app
```

---

## 📱 Instalar como App en el Móvil

### Android (Chrome)
1. Abre la URL en Chrome
2. Toca el menú (⋮) → **"Añadir a pantalla de inicio"**
3. La app aparecerá como icono nativo

### iPhone (Safari)
1. Abre la URL en Safari
2. Toca el botón compartir (□↑) → **"Agregar a inicio"**
3. La app aparecerá como icono nativo

---

## ⚙️ Configuración Avanzada

### Variables de Entorno (Opcional)
Si quieres proteger la API key, crea en Vercel:
- `VITE_ANTHROPIC_API_KEY` = tu_api_key

Y modifica en App.jsx:
```js
headers: {
  "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
  ...
}
```

---

## 🛠️ Desarrollo Local

```bash
npm install
npm run dev
```
Abre http://localhost:5173

---

*LexGPT México — Orientación Legal con IA*
