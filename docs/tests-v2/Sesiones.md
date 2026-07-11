# Feature: Sesiones de Estudio

> Versión: 1.0 | Última actualización: 2026-06-24 | Responsable: DesApp Grupo 9

---

## SES-01 — Estudiante crea y gestiona su sesión de estudio

**Perfil:** Estudiante
**Precondiciones / Datos necesarios:**
- Sesión iniciada como estudiante
- Existe al menos una materia cargada en sus carreras

| # | El usuario... | El sistema... |
|---|--------------|--------------|
| 1 | Abre **"Sesiones de Estudio"** | Muestra la lista de sesiones activas futuras ordenadas por fecha ascendente y el botón **"Nueva Sesión"** |
| 2 | Hace clic en **"Nueva Sesión"**, selecciona materia y tipo **"Virtual"**, completa tema, link, fecha/hora, duración, descripción y hace clic en **"Crear"** | Valida los campos. Si todo ok, crea la sesión y la agrega a la lista. Genera automáticamente una Novedad y notifica a sus conexiones y compañeros de materia |
| 3 | Encuentra su sesión en la lista | Muestra la card con chips de tipo (Virtual/Presencial), duración, participantes, visibilidad (Público/Contacto/Privado) y datos del creador |
| 4 | Hace clic en **"Editar"** en su sesión, modifica el tema y hace clic en **"Actualizar"** | La sesión se actualiza con los nuevos datos en la lista |
| 5 | Hace clic en **"Cancelar"** en su sesión | Muestra diálogo **"Confirmar Cancelación"** con el mensaje "¿Estás seguro de que deseas cancelar esta sesión? Esta acción no se puede deshacer." |
| 6 | Hace clic en **"Cancelar sesión"** en el diálogo | La sesión pasa a estado cancelada (opacidad reducida en la card). Se genera una Novedad y se notifica a los participantes aprobados |

**Variantes:**

| Variante | Cambio en el flujo | Resultado esperado |
|----------|-------------------|-------------------|
| Error: link requerido | En paso 2, selecciona tipo Virtual sin completar el link | Backend rechaza con *"Link requerido para sesiones virtuales"* |
| Error: ubicación requerida | En paso 2, selecciona tipo **"Presencial"** sin completar ubicación | Backend rechaza con *"Ubicacion requerida para sesiones presenciales"* |
| Alternativa: crear tipo Presencial | En paso 2, selecciona "Presencial" y completa ubicación en lugar de link | La sesión se crea correctamente mostrando la ubicación en la card |
| Alternativa: con aprobación requerida | En paso 2, activa el checkbox **"Requiere aprobación para participar"** | La sesión se crea con el indicador. Los inscritos quedan en estado "pendiente" hasta que el creador los apruebe |
| Error: editar sesión cancelada | En paso 4, la sesión ya fue cancelada previamente | Backend rechaza con *"No se puede editar una sesion cancelada"* |
| Permisos: editar/cancelar sesión ajena | En paso 4 o 5, la sesión pertenece a otro usuario | La card no muestra botones "Editar" ni "Cancelar" |

---

## SES-02 — Estudiante explora, se inscribe y participa en sesiones

**Perfil:** Estudiante
**Precondiciones / Datos necesarios:**
- Sesión iniciada como estudiante
- Existen sesiones creadas por varios usuarios, algunas con necesidadAprobacion: true y otras con cupos limitados

| # | El usuario... | El sistema... |
|---|--------------|--------------|
| 1 | Navega entre las pestañas: **"TODAS LAS SESIONES"**, **"MIS MATERIAS"**, **"MIS INSCRIPCIONES"**, **"MIS SESIONES"** | Filtra las sesiones según el contexto: todas, solo de sus materias, solo donde participa, o solo las que creó |
| 2 | Selecciona **"Virtual"** en el filtro **"Tipo"** y hace clic en el chip **"Esta semana"** | Muestra solo las sesiones virtuales de los próximos 7 días |
| 3 | Hace clic en **"Inscribirse"** en una sesión que **no** requiere aprobación | El botón cambia a **"Abandonar"**. El contador de participantes aumenta |
| 4 | Hace clic en **"Solicitar inscribirse"** en una sesión que **sí** requiere aprobación | El botón cambia a **"Pendiente"** (deshabilitado, con icono HourglassEmpty). El creador recibe notificación |
| 5 | El creador abre **"Ver Participantes (1 pendiente)"** y hace clic en **"Aprobar"** junto al solicitante | El estado del participante cambia a "aprobado". El solicitante ve el botón **"Abandonar"** |
| 6 | Estando inscripto, hace clic en **"Abandonar"** | Abandona la sesión. El botón vuelve a **"Inscribirse"**. El contador de participantes disminuye |

**Variantes:**

| Variante | Cambio en el flujo | Resultado esperado |
|----------|-------------------|-------------------|
| Borde: sin resultados | En paso 1 o 2, no hay sesiones que coincidan | Muestra **"No hay sesiones disponibles"** con el mensaje "No hay sesiones que coincidan con los filtros seleccionados." y botón **"Limpiar filtros"** |
| Borde: sin carreras inscriptas | En paso 1, cambia a **"MIS MATERIAS"** sin estar inscripto en ninguna carrera | Muestra **"Sin carreras inscriptas"** con mensaje "No estás anotado en ninguna carrera para ver sesiones de tus materias." |
| Límite: cupos completos | En paso 3, la sesión alcanzó su cupo máximo | El chip de participantes se muestra en color error. Backend rechaza con *"No hay cupos disponibles"* |
| Error: ya inscripto | En paso 3 o 4, el usuario ya está inscripto en esa sesión | Backend rechaza con *"Ya estas inscrito en esta sesion"* |
| Permisos: perfil privado sin conexión | En paso 1, una sesión pertenece a un usuario con perfil privado sin conexión aceptada | La sesión no aparece en la lista. Si accede por URL directa, backend responde *"No tienes permiso para ver esta sesión"* |
| Alternativa: creador rechaza solicitud | En paso 5, el creador hace clic en **"Rechazar"** en lugar de "Aprobar" | El solicitante ve el botón **"Inscribirse"** nuevamente (puede volver a solicitar) |

---

## Notas

- Los IDs usan prefijo **SES-**.
- Las sesiones canceladas se muestran en la lista con opacidad reducida (0.55) y chip **"Cancelada"** (color error, relleno).
- No existe botón "Ver detalle" en las cards; la navegación a `/sesiones/:id` se hace desde notificaciones o URL directa.
- Al crear una sesión, el sistema genera automáticamente una Novedad y notificaciones por email a conexiones y compañeros de la misma materia. Al cancelarla, notifica a los participantes aprobados.
- Un cron job ejecutado cada hora envía un recordatorio por email a los participantes aprobados de sesiones que comienzan ~24h después.
- El visibilidad de sesiones depende del perfil del creador: **Público** (visible para todos), **Contacto** (solo conexiones aceptadas), **Privado** (solo el creador).
- Los errores del backend (*cursiva*) se registran en consola pero **no se muestran** al usuario en snackbar/toast.
- El filtro "Fecha desde" se inicializa con la fecha actual al cargar la página, ocultando sesiones pasadas por defecto. No existe un checkbox "Mostrar eventos pasados".
