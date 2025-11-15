# ⚽ Toluca Altas Montañas – Landing Page

Landing page oficial del club **Toluca Altas Montañas**, diseñada para gestionar registros de jugadores mediante un formulario moderno y una interfaz rápida construida con **Astro**.

🌐 **Demo en producción:** https://tolucaaltasmontanas.vercel.app

---

## 🏆 Características principales

- Página web ligera y ultra-rápida gracias a Astro  
- Secciones: Hero, Sobre el club, Galería, Entrenamientos, Registro  
- Formulario de inscripción completamente funcional  
- Optimización SEO  
- Diseño responsive  
- Desplegada en Vercel  

---

## 🚀 Estructura del Proyecto

```text
/
├── public/
│   ├── img/
│   │   ├── descarga.jpeg
│   │   ├── training.jpg
│   │   └── wallpaper-toluca.jpg
│   └── favicon.svg
│
├── src/
│   ├── assets/
│   │   └── astro.svg
│   │
│   ├── components/
│   │   ├── AboutSection.astro
│   │   ├── Button.astro
│   │   ├── ContactForm.jsx
│   │   ├── Footer.astro
│   │   ├── Gallery.astro
│   │   ├── Header.astro
│   │   ├── Hero.astro
│   │   ├── Logo.astro
│   │   ├── RegisterSection.astro
│   │   └── TrainingSection.astro
│   │
│   ├── data/
│   │   ├── about.js
│   │   ├── gallery.js
│   │   ├── hero.js
│   │   └── TrainingData.js
│   │
│   ├── layouts/
│   │   └── MainLayout.astro
│   │
│   ├── pages/
│   │   └── index.astro
│   │
│   └── styles/
│       ├── ContactSection.css
│       ├── global.css
│       └── hero.css
│
├── astro.config.mjs
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── README.md


```

## 🧞 Commands

Todos los comandos se ejecutan desde la raíz del proyecto:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`             | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |

📌 Roadmap

 Integrar base de datos para almacenar registros

 Panel administrativo para ver solicitudes

 Mejoras de accesibilidad

 Modo oscuro

 Optimización de imágenes