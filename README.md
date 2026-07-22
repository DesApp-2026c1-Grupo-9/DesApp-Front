# DesApp-Front — Frontend del Sistema de Acompañamiento de Alumnos

Frontend del proyecto **Sistema de Acompañamiento de Alumnos Universitarios** para la materia Desarrollo de Aplicaciones (UNahur).

## Stack

- React 18 + Vite
- Material UI (MUI 5)
- Redux Toolkit
- React Router v6
- Axios

## Estructura

- `src/pages/` — Vistas de la aplicación
- `src/components/` — Componentes reutilizables
- `src/features/` — Módulos por funcionalidad
- `src/api/` — Llamadas al backend
- `src/store/` — Estado global (Redux)
- `src/context/` — Contextos de React
- `src/layouts/` — Layouts compartidos
- `src/theme/` — Configuración de tema MUI
- `src/routes/` — Definición de rutas

## Tests funcionales

En `docs/tests-v2/` están documentados los tests funcionales del sistema organizados por módulo (Admin, Carreras, Conexiones, Denuncias, Estudiantes, Materiales, Materias, Novedades, Sesiones, Usuarios).

## Comandos principales

```bash
npm install
npm run dev    # levanta en modo desarrollo
npm run build  # build para producción
```
