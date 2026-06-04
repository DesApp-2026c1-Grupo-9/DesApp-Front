# Feature: Sesiones de Estudio

> **Versión:** 1.0
> **Última actualización:** 2026-06-02
> **Responsable:** Equipo de Desarrollo

---

## Tabla de casos de prueba

### Creación de sesiones

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| SES-01 | Estudiante crea sesión virtual exitosamente | Usuario logueado. Existe al menos una materia cargada. | el estudiante está en la pantalla Sesiones y hace clic en "Nueva Sesión" | completa materia, tema, tipo Virtual, link de videollamada, fecha/hora, duración, descripción y hace clic en "Crear" | la sesión aparece en la lista con todos sus datos | El backend responde 201. Se persiste en BD con creadorId correcto y estado "activa". Las sesiones futuras aparecen en la lista. | materia: "Álgebra", tema: "Consulta de parcial", tipo: virtual, link: "https://meet.google.com/abc", fechaHora: próxima semana, duración: 60, descripción: "Repaso general" | Estudiante | Feliz | — |
| SES-02 | Estudiante crea sesión presencial exitosamente | Usuario logueado. Existe al menos una materia cargada. | el estudiante está en el modal de nueva sesión | selecciona tipo Presencial, completa ubicación y el resto de campos, hace clic en "Crear" | la sesión aparece en la lista con ubicación visible | Ídem SES-01 pero con tipo "presencial" y campo ubicación poblado. | materia: "Cálculo", tema: "Grupo de estudio", tipo: presencial, ubicación: "Aula 305", duración: 90 | Estudiante | Feliz | — |
| SES-03 | Estudiante crea sesión virtual sin link | Usuario logueado | el estudiante está en el modal de nueva sesión con tipo Virtual | completa todos los campos excepto el link y hace clic en "Crear" | el sistema muestra "Link requerido para sesiones virtuales" | El backend responde 400. No se crea la sesión. El modal se mantiene abierto con los datos ingresados. | tipo: virtual, link: "" | Estudiante | Error | — |
| SES-04 | Estudiante crea sesión presencial sin ubicación | Usuario logueado | el estudiante está en el modal de nueva sesión con tipo Presencial | completa todos los campos excepto ubicación y hace clic en "Crear" | el sistema muestra "Ubicación requerida para sesiones presenciales" | El backend responde 400. No se crea la sesión. | tipo: presencial, ubicación: "" | Estudiante | Error | — |
| SES-05 | Estudiante crea sesión con materia inexistente | Usuario logueado | el estudiante completa el formulario | selecciona un materiaId que no existe en BD y hace clic en "Crear" | el sistema muestra "Materia no encontrada" | El backend responde 404. | materiaId: 99999 | Estudiante | Error | — |
| SES-06 | Estudiante crea sesión con necesidad de aprobación | Usuario logueado. Existen materias cargadas. | el estudiante está en el modal de nueva sesión | activa el checkbox "Requiere aprobación para participar", completa los campos y hace clic en "Crear" | la sesión se crea con el indicador de "requiere aprobación" visible | El backend crea la sesión con necesidadAprobacion: true. Los estudiantes que se inscriban quedan en estado "pendiente". | necesidadAprobacion: true | Estudiante | Feliz | SES-25 |
| SES-07 | Usuario no autenticado intenta crear sesión | No hay usuario seleccionado en el dropdown. | el usuario está en la pantalla Sesiones | hace clic en "Nueva Sesión", completa datos e intenta guardar | el sistema muestra "Debe seleccionar un usuario" o bloquea la acción | El backend responde 400 "Se requiere usuarioId". | — | No logueado | Seguridad | — |

### Listado y filtros

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| SES-08 | Estudiante ve sesiones disponibles | Usuario logueado. Existen sesiones activas creadas por otros estudiantes con perfil público. | el estudiante ingresa a la pantalla Sesiones con pestaña "TODAS LAS SESIONES" | la página carga | se muestran todas las sesiones activas futuras ordenadas por fecha ascendente | La petición GET /api/sesiones devuelve data con las sesiones visibles. Se excluyen sesiones canceladas, finalizadas y pasadas (por defecto). | — | Estudiante | Feliz | SES-01, SES-02 |
| SES-09 | Estudiante filtra sesiones por materia | Usuario logueado. Existen sesiones de distintas materias. | el estudiante está en la pantalla Sesiones | selecciona una materia en el filtro desplegable | solo se muestran las sesiones de esa materia | El filtro se aplica del lado del frontend. El indicador "Filtros activos" se muestra. | filtro materia: "Álgebra" | Estudiante | Feliz | SES-08 |
| SES-10 | Estudiante filtra sesiones por fecha | Usuario logueado. Existen sesiones en distintas fechas. | el estudiante está en la pantalla Sesiones | ingresa una fecha en el campo de filtro de fecha | solo se muestran las sesiones de esa fecha | El backend recibe el parámetro fecha y filtra. | filtro fecha: 2026-06-10 | Estudiante | Feliz | SES-08 |
| SES-11 | Estudiante filtra sesiones por tipo | Usuario logueado. Existen sesiones virtuales y presenciales. | el estudiante está en la pantalla Sesiones | selecciona "Virtual" o "Presencial" en el filtro de tipo | solo se muestran las sesiones del tipo seleccionado | — | filtro tipo: virtual | Estudiante | Feliz | SES-08 |
| SES-12 | Estudiante ve sesiones de "Mis Materias" | Usuario logueado. El estudiante está inscripto en una carrera con materias. Existen sesiones de esas materias. | el estudiante cambia a la pestaña "MIS MATERIAS" | hace clic en la pestaña | se muestran solo las sesiones de las materias en las que está inscripto | El frontend filtra por materiaId contra el listado de materias-ids del estudiante. | — | Estudiante | Feliz | SES-08 |
| SES-13 | Estudiante ve solo "Mis Sesiones" (las que creó) | Usuario logueado. Existen sesiones creadas por él y por otros. | el estudiante cambia a la pestaña "MIS SESIONES" | hace clic en la pestaña | se muestran solo las sesiones donde él es el creador | Filtro frontend por creadorId === user.id. | — | Estudiante | Feliz | SES-01, SES-08 |
| SES-14 | Estudiante muestra eventos pasados | Usuario logueado. Existen sesiones pasadas y futuras. | el estudiante está en la pantalla Sesiones | activa el checkbox "Mostrar eventos pasados" | aparecen también las sesiones con fecha anterior a hoy | Por defecto las sesiones pasadas están ocultas. Al tildar el checkbox, se incluyen. | — | Estudiante | Feliz | SES-08 |
| SES-15 | Estudiante NO ve sesiones de perfil privado sin conexión | Usuario logueado. Existe un estudiante con perfil privado que creó sesiones. El usuario actual NO es contacto. | el estudiante está en la pantalla Sesiones | busca sesiones de ese estudiante de perfil privado | las sesiones no aparecen en la lista | El backend verifica puedeVerSesion: perfil no público, sin conexión aceptada → 403/oculto. | creador con perfilPublico: false, sin conexión aceptada | Estudiante | Permisos | SES-01 |
| SES-16 | Estudiante VE sesiones de perfil privado si es contacto | Usuario logueado. Existe un estudiante con perfil privado. Ambos tienen una conexión aceptada. | el estudiante está en la pantalla Sesiones | navega normalmente | las sesiones de su contacto con perfil privado son visibles | El backend verifica que existe conexión aceptada entre ambos y permite ver la sesión. | creador con perfilPublico: false, conexión aceptada entre ambos | Estudiante | Permisos | SES-15 |
| SES-17 | Estudiante ve lista vacía cuando no hay sesiones | Usuario logueado. No existen sesiones activas. | el estudiante ingresa a la pantalla Sesiones | la página carga | se muestra el mensaje "No hay sesiones disponibles" con un botón para limpiar filtros | El componente EmptyState se renderiza con icono de búsqueda. | — | Estudiante | Borde | — |
| SES-18 | Estudiante sin carreras inscriptas entra a "Mis Materias" | Usuario logueado. El estudiante no está inscripto en ninguna carrera. | el estudiante cambia a la pestaña "MIS MATERIAS" | hace clic en la pestaña | se muestra "Sin carreras inscriptas" con mensaje explicativo | EmptyState con icono "inbox". | — | Estudiante | Borde | — |

### Ver detalle

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| SES-19 | Estudiante ve detalle de sesión existente | Usuario logueado. Existe una sesión activa visible para él. | el estudiante ve la lista de sesiones | hace clic en una sesión o en "Ver detalle" | se muestra la información completa de la sesión: materia, tema, creador, fecha, duración, tipo, participantes | El backend responde 200 con todos los includes (creador, materia, participantes). | — | Estudiante | Feliz | SES-01 |
| SES-20 | Estudiante ve detalle de sesión inexistente | Usuario logueado | el estudiante intenta acceder a una sesión con ID inválido | ingresa directamente a la URL de una sesión que no existe | el sistema muestra "Sesión no encontrada" | El backend responde 404. | id: 99999 | Estudiante | Error | — |
| SES-21 | Estudiante NO puede ver detalle de sesión privada sin conexión | Usuario logueado. Existe sesión de perfil privado. | el estudiante intenta acceder a esa sesión | ingresa directamente a la URL de la sesión | el sistema muestra "No tienes permiso para ver esta sesión" | El backend responde 403. | — | Estudiante | Permisos | SES-15 |

### Edición

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| SES-22 | Creador edita su propia sesión exitosamente | Usuario logueado. Existe una sesión activa creada por él. | el creador está viendo sus sesiones | hace clic en "Editar", modifica tema y duración, y guarda | la sesión se actualiza con los nuevos datos | El backend responde 200. Se actualiza solo la sesión correcta en BD. El frontend refresca la lista. | nuevo tema: "Consulta de parcial - reprogramada", nueva duración: 90 | Estudiante | Feliz | SES-01 |
| SES-23 | Estudiante intenta editar sesión de otro usuario | Usuario logueado. Existe una sesión activa creada por otro estudiante. | el estudiante está viendo el detalle de la sesión ajena | busca el botón "Editar" | NO encuentra el botón "Editar" en pantalla | El backend responde 403 si se intenta llamar a la API directamente. El frontend oculta el botón para quien no es creador. | — | Estudiante | Permisos | SES-01 |
| SES-24 | Creador edita sesión cancelada | Usuario logueado. Existe una sesión cancelada creada por él. | el creador intenta editar la sesión cancelada | hace clic en "Editar" y modifica algún campo | el sistema muestra "No se puede editar una sesión cancelada" | El backend responde 400. | — | Estudiante | Error | SES-26 |

### Cancelación

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| SES-25 | Creador cancela su propia sesión | Usuario logueado. Existe una sesión activa creada por él. | el creador está viendo la sesión | hace clic en "Eliminar", confirma en el diálogo "¿Estás seguro de que deseas cancelar esta sesión?" | la sesión desaparece de la lista activa y pasa a estado "cancelada" | El backend cambia el estado a "cancelada" (soft delete). El diálogo de confirmación tiene botón "Cancelar" y "Eliminar" (rojo). | — | Estudiante | Feliz | SES-01 |
| SES-26 | Estudiante intenta cancelar sesión de otro | Usuario logueado. Existe una sesión activa creada por otro. | el estudiante está viendo la sesión ajena | busca el botón "Eliminar" | NO encuentra el botón "Eliminar" | El backend responde 403. El frontend oculta el botón. | — | Estudiante | Permisos | SES-01 |

### Inscripción

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| SES-27 | Estudiante se inscribe a sesión sin necesidad de aprobación | Usuario logueado. Existe una sesión activa con necesidadAprobacion: false y cupos disponibles. | el estudiante está en la lista de sesiones | hace clic en "Inscribirse" en la sesión deseada | el botón cambia a "Inscripto" y el contador de participantes aumenta | El backend responde 201. El participante se crea con estado "aprobado" directamente. | — | Estudiante | Feliz | SES-01 |
| SES-28 | Estudiante se inscribe a sesión que requiere aprobación | Usuario logueado. Existe una sesión activa con necesidadAprobacion: true. | el estudiante está en la lista de sesiones | hace clic en "Inscribirse" | el botón cambia a "Pendiente de aprobación" | El backend responde 201. El participante se crea con estado "pendiente". El creador debe aprobarlo manualmente. | — | Estudiante | Feliz | SES-06 |
| SES-29 | Estudiante se inscribe a sesión en la que ya está inscripto | Usuario logueado. El estudiante ya está inscripto en una sesión. | el estudiante ve la sesión en la que ya está inscripto | hace clic en "Inscribirse" nuevamente | el sistema muestra "Ya estás inscrito en esta sesión" | El backend responde 400. El frontend ya muestra el botón como "Inscripto" (no debería permitir reinscripción). | — | Estudiante | Error | SES-27 |
| SES-30 | Estudiante se inscribe a sesión sin cupos disponibles | Usuario logueado. Existe una sesión activa con cupos definidos y ya completos. | el estudiante ve la sesión con cupo completo | hace clic en "Inscribirse" | el sistema muestra "No hay cupos disponibles" | El backend verifica cupos antes de inscribir. El frontend debería mostrar la sesión como completa (deshabilitar botón). | cupos: 5, ya hay 5 participantes aprobados | Estudiante | Límite | SES-01 |
| SES-31 | Estudiante se inscribe a sesión cancelada | Usuario logueado. Existe una sesión cancelada. | el estudiante intenta inscribirse a una sesión cancelada | hace clic en "Inscribirse" | el sistema muestra "Sesión no activa" | El backend verifica estado !== 'activa' y responde 400. El frontend debería ocultar u deshabilitar el botón. | — | Estudiante | Error | SES-25 |
| SES-32 | Estudiante se inscribe a sesión de perfil privado sin conexión | Usuario logueado. Existe sesión de perfil privado. | el estudiante intenta inscribirse a esa sesión | hace clic en "Inscribirse" | el sistema muestra "No tienes permiso para inscribirte a esta sesión" | El backend responde 403 evaluando puedeVerSesion. | — | Estudiante | Permisos | SES-15 |

### Gestión de participantes (creador)

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| SES-33 | Creador ve lista de participantes de su sesión | Usuario logueado como creador de una sesión con inscripciones. | el creador abre la sesión | hace clic en "Ver participantes" | se abre el modal con la lista de participantes, su estado (pendiente/aprobado/rechazado) y sus datos | El modal AprobacionModal se abre. Cada participante muestra nombre, email, estado, y botones Aprobar/Rechazar si está pendiente. | — | Estudiante (creador) | Feliz | SES-01, SES-27 |
| SES-34 | Creador intenta ver participantes de sesión ajena | Usuario logueado. Existe sesión de otro usuario. | el estudiante intenta ver participantes de una sesión que no creó | busca el botón "Ver participantes" | NO encuentra el botón | El backend responde 403. El frontend oculta el botón para no creadores. | — | Estudiante | Permisos | SES-01 |
| SES-35 | Creador aprueba participante pendiente | Usuario logueado como creador. Existe un participante con estado "pendiente". | el creador está en el modal de participantes | hace clic en "Aprobar" en el participante pendiente | el estado del participante cambia a "aprobado" visible en el modal | El backend responde 200 con el participante actualizado. El modal se actualiza sin cerrarse. | — | Estudiante (creador) | Feliz | SES-28, SES-33 |
| SES-36 | Creador rechaza participante pendiente | Usuario logueado como creador. Existe un participante con estado "pendiente". | el creador está en el modal de participantes | hace clic en "Rechazar" en el participante pendiente | el estado del participante cambia a "rechazado" visible en el modal | El backend responde 200 con el participante actualizado. El modal se actualiza sin cerrarse. | — | Estudiante (creador) | Feliz | SES-28, SES-33 |
| SES-37 | Creador aprueba/rechaza participante de sesión que no le pertenece | Usuario logueado. Existe un participante pendiente en sesión de otro. | el estudiante intenta aprobar/rechazar un participante de una sesión ajena | llama a la API directamente con ids válidos | el sistema responde "No autorizado" | El backend responde 403 verificando creadorId. | — | Estudiante | Permisos | SES-28, SES-33 |

### Abandonar sesión

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| SES-38 | Estudiante abandona sesión (se da de baja) | Usuario logueado. El estudiante está inscripto en una sesión (estado aprobado o pendiente). | el estudiante ve la sesión a la que está inscripto | hace clic en "Abandonar" / "Dejar sesión" | el estudiante desaparece de la lista de participantes y el botón vuelve a "Inscribirse" | El backend elimina el registro de SesionParticipante (destroy). El frontend actualiza la UI. | — | Estudiante | Feliz | SES-27 |
| SES-39 | Estudiante abandona sesión en la que NO está inscripto | Usuario logueado. El estudiante NO es participante de la sesión. | el estudiante ve una sesión a la que no se inscribió | busca el botón "Abandonar" | NO encuentra el botón "Abandonar" (solo ve "Inscribirse") | El backend responde 404 si se intenta forzar. El frontend no muestra la opción. | — | Estudiante | Error | SES-01 |
| SES-40 | Estudiante abandona sesión que no le pertenece (otro participante) | Usuario logueado. Existe un participante que no es él. | el estudiante intenta eliminar la inscripción de otro participante | llama a la API con el participanteId de otro usuario | el sistema responde "No autorizado para abandonar esta inscripción" | El backend verifica estudianteId coincide con el usuario logueado. | — | Estudiante | Permisos | SES-27 |

---

## Resumen de variantes

| Variante | Cantidad | IDs |
|---|---|---|
| Feliz | 14 | SES-01, SES-02, SES-06, SES-08, SES-09, SES-10, SES-11, SES-12, SES-13, SES-14, SES-19, SES-22, SES-25, SES-27, SES-28, SES-33, SES-35, SES-36, SES-38 |
| Error | 7 | SES-03, SES-04, SES-05, SES-20, SES-24, SES-29, SES-31, SES-39 |
| Permisos | 9 | SES-15, SES-16, SES-21, SES-23, SES-26, SES-32, SES-34, SES-37, SES-40 |
| Límite | 1 | SES-30 |
| Seguridad | 1 | SES-07 |
| Borde | 2 | SES-17, SES-18 |

---

## Notas

- Los IDs con prefijo `SES-XX` corresponden al módulo Sesiones.
- Las precondiciones asumen que el usuario está autenticado a través del dropdown de selección global (header `x-user-id`).
- La visibilidad de sesiones está sujeta a la configuración de perfil público/privado del creador y al estado de conexión entre usuarios.
- Los casos pendientes (requiere aprobación) pueden combinarse con pruebas del módulo Conexiones y PreferenciasEstudiante.
