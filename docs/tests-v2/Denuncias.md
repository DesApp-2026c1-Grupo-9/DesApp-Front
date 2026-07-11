# Feature: Denuncias y Moderación

> Versión: 1.0 | Última actualización: 2026-06-24 | Responsable: DesApp Grupo 9

---

## DEN-01 — Estudiante denuncia un material

**Perfil:** Estudiante
**Precondiciones / Datos necesarios:**
- Sesión iniciada como estudiante
- Existe al menos un material visible creado por otro usuario
- Existen motivos de denuncia activos en el sistema

| # | El usuario... | El sistema... |
|---|--------------|--------------|
| 1 | Abre el menú **tres puntos** de un material ajeno y selecciona **"Reportar"** | Abre el diálogo **"Denunciar Material"** con el título del material, instrucción "Seleccioná el motivo por el cual considerás que este material debería ser revisado.", dropdown de motivos y campo de detalle opcional |
| 2 | Consulta si ya denunció este material | El sistema verifica automáticamente si ya existe una denuncia pendiente del mismo usuario para este material (`GET /api/denuncias/verificar`) |
| 3 | Selecciona un motivo del dropdown **"Motivo"**, escribe un detalle opcional en **"Detalle (opcional)"** y hace clic en **"Denunciar"** | Valida que el motivo esté seleccionado. Si todo ok, crea la denuncia con estado "pendiente" y notifica al dueño del material |
| 4 | El material alcanza el umbral de denuncias pendientes (N) o confirmadas (M) | El sistema suspende el material automáticamente: oculta URL/archivo/discordInfo para no administradores y notifica al dueño |
| 5 | Vuelve a abrir **"Reportar"** en el mismo material | Muestra alerta **"Ya denunciaste este material anteriormente. Tu denuncia está pendiente de revisión."** y el botón de enviar se deshabilita |
| 6 | Hace clic en **"Cancelar"** en el diálogo | El diálogo se cierra sin crear ninguna denuncia |

**Variantes:**

| Variante | Cambio en el flujo | Resultado esperado |
|----------|-------------------|-------------------|
| Error: sin motivo seleccionado | En paso 3, no selecciona ningún motivo | El botón **"Denunciar"** permanece deshabilitado. Si se fuerza, muestra *"Debes seleccionar un motivo"* |
| Error: motivo inactivo | En paso 3, el motivo fue desactivado por el admin entre la carga del diálogo y el envío | Backend rechaza con *"Motivo de denuncia no válido"* |
| Error: material inexistente | En paso 3, el material fue eliminado entre tanto | Backend responde *"Material no encontrado"* |
| Alternativa: suspensión sin alcanzar umbral | En paso 4, el material tiene menos de N denuncias pendientes y menos de M confirmadas | La denuncia se crea pero el material no se suspende. Mensaje: **"Denuncia creada exitosamente"** |
| Alternativa: suspensión al alcanzar umbral | En paso 4, se alcanza N o M | Mensaje: **"Denuncia creada. El material ha sido suspendido automáticamente."** |
| Error: sin usuario seleccionado | En paso 1, no hay usuario activo en el dropdown | Backend rechaza con *"Se requiere estudianteId"* |

---

## DEN-02 — Admin modera denuncias y gestiona configuración

**Perfil:** Administrador
**Precondiciones / Datos necesarios:**
- Sesión iniciada como administrador
- Existen denuncias en estado "pendiente", "confirmada", "rechazada" y "revocada"
- Existe al menos un material suspendido

| # | El usuario... | El sistema... |
|---|--------------|--------------|
| 1 | Abre el panel de administración y va a **Moderación > Denuncias** | Muestra la tabla de denuncias con filtros (Estado: Pendientes por defecto, Motivo, Búsqueda por material) y paginación de 15 por página |
| 2 | Hace clic en **"Ver detalle"** de una denuncia pendiente | Abre un modal con la información completa: material denunciado (título, tipo, materia, chip "Suspendido" si aplica), denunciante, motivo, detalle y botones de acción |
| 3 | Hace clic en **"Confirmar Denuncia"** | La denuncia pasa a estado "confirmada" con moderador y fecha. Si se alcanza el umbral M, el material se suspende automáticamente |
| 4 | Hace clic en **"Rechazar Denuncia"** | La denuncia pasa a estado "rechazada". El material no se ve afectado |
| 5 | Hace clic en **"Restaurar Material"** (solo visible si el material está suspendido) | Todas las denuncias pendientes y confirmadas del material pasan a "revocadas". El material se restaura: `suspendido: false, revocado: true`. El dueño recibe notificación |

**Variantes:**

| Variante | Cambio en el flujo | Resultado esperado |
|----------|-------------------|-------------------|
| Error: confirmar denuncia ya moderada | En paso 3, la denuncia ya fue confirmada o rechazada | El modal no muestra botones de acción. Backend rechaza con *"La denuncia ya fue confirmada/rechazada anteriormente"* |
| Error: restaurar material no suspendido | En paso 5, el material no está suspendido | Backend rechaza con *"El material no está suspendido"* |
| Alternativa: filtrar denuncias por estado | En paso 1, selecciona "Confirmadas", "Rechazadas" o "Revocadas" en el filtro | La tabla muestra solo las denuncias de ese estado. El chip de estado usa colores: Pendiente (warning), Confirmada (error), Rechazada (default), Revocada (info) |
| Alternativa: crear/editar/desactivar motivos | En paso 1, cambia a la pestaña **"Motivos"** | Puede crear nuevos motivos, editar nombre/descripción, toggle activo/inactivo, o eliminar (destroy si sin denuncias, desactivar si tiene asociadas) |
| Alternativa: configurar umbrales N/M | En paso 1, cambia a la pestaña **"Configuración"** | Muestra tarjetas para **"Denuncias Pendientes (N)"** y **"Denuncias Verificadas (M)"**. Al guardar un valor inválido (≤0), muestra *"El valor debe ser un número entero positivo"* |
| Borde: sin denuncias en el filtro | En paso 1, no hay denuncias que coincidan | Muestra mensaje **"No hay denuncias"** con descripción según el filtro activo |

---

## Notas

- La denuncia se inicia desde el menú **"Reportar"** en la card de un material (componente `MaterialCard`). No existe una ruta independiente para denunciar.
- Los umbrales de suspensión automática se configuran en **Moderación > Configuración**: `N_DENUNCIAS_PENDIENTES` (default 10) y `M_DENUNCIAS_VERIFICADAS` (default 3).
- Al restaurar un material, **todas** las denuncias pendientes y confirmadas de ese material se revocan, no solo la que se estaba viendo.
- Los estudiantes no pueden editar ni eliminar un material que tenga denuncias activas (pendientes o confirmadas). El backend responde 409.
- Los 6 motivos semilla son: *Contenido pornográfico*, *Lenguaje ofensivo*, *Material protegido por derechos de autor*, *Spam o publicidad engañosa*, *Información incorrecta o engañosa*, *Otro*.
- No existe notificación por email al confirmar o rechazar una denuncia; solo notificaciones in-app para `denuncia_recibida`, `material_suspendido` y `material_revocado`.
