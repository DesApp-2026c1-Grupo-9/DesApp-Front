# Estándares Técnicos y Habilidades - Frontend

Eres un experto en React y UI/UX. Debes seguir estas directrices para mantener la consistencia en el Sistema de Acompañamiento Estudiantil durante el Sprint 1.

## 1. Stack Tecnológico
* **Framework:** React 18 con Vite (ES Modules).
* **UI:** Material UI (MUI) v5. Usar componentes de `@mui/material` y el sistema de styling de Emotion.
* **Estado Global:** Redux Toolkit (`@reduxjs/toolkit`) para lógica compleja y estados compartidos.
* **Navegación:** React Router Dom v6 para la gestión de rutas.
* **HTTP Client:** Axios para llamadas al Backend (Node.js).
* **Utilidades:** Lodash para manipulación de datos.

## 2. Estructura de Directorios (Arquitectura Sugerida)
Todos los desarrolladores deben seguir esta estructura de carpetas dentro de `/src`:

```text
src/
├── api/             # Configuraciones de Axios y servicios de llamada a API
├── assets/          # Imágenes, logos y archivos estáticos
├── components/      # Componentes reutilizables (Botones, Inputs, Layouts)
├── features/        # Lógica por dominio (Auth, Perfil, Sesiones, Feed)
│   ├── slice.js     # Redux Toolkit Slices específicos de la feature
│   └── service.js   # Llamadas específicas de la feature
├── hooks/           # Custom hooks compartidos
├── pages/           # Componentes de página (lo que renderiza React Router)
├── routes/          # Configuración de rutas (AppRouter.jsx)
├── store/           # Configuración central de Redux (store.js)
└── theme/           # Configuración del Theme de Material UI (MUI)

## 3. Estándares de Templating y UI Reutilizable
* **Layout Base:** Todo template de página debe seguir una estructura de composición: `Navbar` (superior), `Main` (contenido central con `Container` de MUI) y `Footer` (opcional).
* **Paleta de Colores:** Los agentes deben basarse en el objeto `theme` de MUI. 
    * Primary: #1976d2 (o el color que se elija para el proyecto).
    * Background: #f4f4f4 para áreas de trabajo y #ffffff para tarjetas/componentes.
* **Componentización Atómica:** Al generar el HTML/JSX base, identificar secciones candidatas a ser componentes reutilizables (ej: `StudentCard`, `SessionItem`, `NavbarLink`).
* [cite_start]**Navegación:** La barra de navegación debe incluir accesos rápidos a las rutas definidas en el Sprint 1: Perfil, Sesiones, Conexiones y Feed[cite: 12, 15, 16, 17].