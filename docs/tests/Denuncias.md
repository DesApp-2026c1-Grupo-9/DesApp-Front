# Feature: Denuncias y Moderación

> **Versión:** 1.0
> **Última actualización:** 2026-06-02
> **Responsable:** Equipo de Desarrollo

---

## Tabla de casos de prueba

### Creación de denuncia (estudiante)

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| DEN-01 | Estudiante denuncia un material exitosamente | Usuario logueado. Existe un material visible. Existen motivos de denuncia activos. | el estudiante está viendo un material que considera inapropiado | hace clic en "Denunciar", selecciona un motivo, agrega detalle opcional y hace clic en "Denunciar" | el sistema muestra mensaje "Denuncia creada exitosamente" y el modal se cierra | Backend responde 201 POST /api/denuncias. Se persiste denuncia con estado "pendiente". El material permanece visible. | motivo: "Contenido inapropiado", detalle: "El material contiene información ofensiva" | Estudiante | Feliz | MAT-01 |
| DEN-02 | Estudiante denuncia un material sin seleccionar motivo | Usuario logueado. Existe material visible. | el estudiante abre el diálogo de denuncia | hace clic en "Denunciar" sin seleccionar ningún motivo | el sistema muestra "Debes seleccionar un motivo" y no envía la denuncia | Validación frontend. El botón "Denunciar" está deshabilitado hasta seleccionar un motivo. | motivoId: "" | Estudiante | Error | — |
| DEN-03 | Estudiante denuncia material con motivo inactivo | Usuario logueado. Existe material. El motivo seleccionado fue desactivado por el admin. | el estudiante selecciona un motivo que ya no está activo | envía la denuncia | el sistema muestra "Motivo de denuncia no válido" | Backend responde 400 validando que el motivo exista y esté activo. | motivoId: id de motivo desactivado | Estudiante | Error | — |
| DEN-04 | Estudiante denuncia material inexistente | Usuario logueado | el estudiante intenta denunciar un material que fue eliminado entre tanto | la solicitud llega al backend | el sistema muestra "Material no encontrado" | Backend responde 404. | materialId: 99999 | Estudiante | Error | — |
| DEN-05 | Estudiante denuncia el mismo material dos veces (pendiente) | Usuario logueado. El estudiante ya denunció este material y la denuncia sigue pendiente. | el estudiante intenta denunciar el mismo material nuevamente | abre el diálogo de denuncia | el sistema muestra "Ya denunciaste este material anteriormente" y deshabilita el botón de denunciar | Backend responde 409 "Ya has denunciado este material con una denuncia pendiente". Frontend muestra Alert warning y botón deshabilitado. | — | Estudiante | Límite | DEN-01 |
| DEN-06 | Estudiante denuncia material sin proporcionar usuarioId | No hay usuario seleccionado en el dropdown. | el estudiante intenta denunciar un material | la solicitud llega al backend | el sistema responde "Se requiere usuarioId" | Backend responde 400. | — | No logueado | Seguridad | — |
| DEN-07 | Estudiante cancela la denuncia | Usuario logueado. Existe material. | el estudiante abre el diálogo de denuncia | hace clic en "Cancelar" en el modal | el modal se cierra sin crear ninguna denuncia | No se llama a la API. No se persiste nada. | — | Estudiante | Borde | — |
| DEN-08 | Estudiante denuncia material y se supera umbral de suspensión automática | Usuario logueado. El material tiene N-1 denuncias pendientes (N configurado en 3). | el estudiante denuncia el material | la denuncia se crea | el sistema muestra "Denuncia creada. El material ha sido suspendido automáticamente." y el material se marca como suspendido | Backend al crear la denuncia ejecuta verificarSuspensionAutomatica. Al llegar a N denuncias pendientes, el material se suspende. Los demás estudiantes ven el material con datos ocultos. | Config N_DENUNCIAS_PENDIENTES: 3 | Estudiante | Feliz | DEN-01, MAT-01 |
| DEN-09 | Estudiante verifica si ya denunció un material | Usuario logueado. Existe material. El estudiante no lo ha denunciado. | el estudiante abre el diálogo de denuncia | el diálogo se abre | no se muestra ninguna advertencia de denuncia previa | Frontend llama a GET /api/denuncias/verificar?materialId=X&usuarioId=Y. Al recibir yaDenuncio: false, habilita el flujo normal. | — | Estudiante | Feliz | — |
| DEN-10 | Estudiante ve advertencia de denuncia previa al abrir diálogo | Usuario logueado. El estudiante ya denunció este material (pendiente). | el estudiante abre el diálogo de denuncia para ese material | el diálogo se abre | se muestra Alert "Ya denunciaste este material anteriormente" | Frontend verifica con GET /api/denuncias/verificar y recibe yaDenuncio: true. Muestra alerta y deshabilita botón. | — | Estudiante | Feliz | DEN-05 |

### Listado y detalle de denuncias (admin)

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| DEN-11 | Admin ve lista de denuncias pendientes | Usuario logueado como administrador. Existen denuncias creadas. | el admin ingresa al panel de moderación, pestaña "Denuncias" | la página carga | se muestra una tabla con las denuncias (ID, material, denunciante, motivo, estado, fecha) con paginación | Backend responde GET /api/admin/denuncias con paginación. Por defecto filtra por estado "pendiente". | — | Administrador | Feliz | DEN-01 |
| DEN-12 | Admin filtra denuncias por estado | Usuario logueado como admin. Existen denuncias en varios estados. | el admin está en la tabla de denuncias | selecciona un estado en el filtro (Confirmadas, Rechazadas, Revocadas, Todas) | la tabla se actualiza mostrando solo las denuncias de ese estado | El backend recibe query param estado y filtra. La paginación se resetea a página 0. | filtro estado: "confirmada" | Administrador | Feliz | DEN-11 |
| DEN-13 | Admin ve lista vacía de denuncias | Usuario logueado como admin. No existen denuncias en el estado seleccionado. | el admin filtra por un estado sin resultados | el filtro se aplica | se muestra "No hay denuncias [estado]" en la tabla | Fila única con colspan indicando que no hay datos. | filtro estado: "revocada" (sin denuncias revocadas) | Administrador | Borde | — |
| DEN-14 | Admin no administrador intenta ver denuncias | Usuario logueado con rol distinto a administrador. | el estudiante intenta acceder a /api/admin/denuncias | la solicitud llega al backend | el sistema responde "Solo los administradores pueden realizar esta operación" | Backend responde 403. Frontend redirige o muestra "Acceso Denegado". | — | Estudiante | Seguridad | — |
| DEN-15 | Admin ve detalle de una denuncia | Usuario logueado como admin. Existe una denuncia. | el admin está en la tabla de denuncias | hace clic en el ícono de "Ver detalle" de una denuncia | se abre un modal con toda la información: material, denunciante, motivo, detalle, estado, historial de moderación | Backend responde GET /api/admin/denuncias/:id con todos los includes. | — | Administrador | Feliz | DEN-11 |
| DEN-16 | Admin ve detalle de denuncia inexistente | Usuario logueado como admin. | el admin intenta ver el detalle de una denuncia con ID inválido | la solicitud llega al backend | el sistema responde "No se encontró la denuncia con id X" | Backend responde 404. | id: 99999 | Administrador | Error | — |

### Moderación de denuncias (admin)

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| DEN-17 | Admin confirma una denuncia pendiente | Usuario logueado como admin. Existe una denuncia en estado "pendiente". | el admin está en el detalle de la denuncia | hace clic en "Confirmar Denuncia" | la denuncia cambia a estado "confirmada" y se registra el moderador y fecha | Backend PUT /api/admin/denuncias/:id/confirmar responde 200. DenunciaActualizada muestra estado: "confirmada", moderadorId: admin.id, fechaModeracion: fecha actual. El modal se cierra y la tabla se refresca. | — | Administrador | Feliz | DEN-15 |
| DEN-18 | Admin confirma denuncia y se supera umbral M de suspensión | Usuario logueado como admin. El material tiene M-1 denuncias confirmadas (M configurado en 1). | el admin confirma una denuncia pendiente | hace clic en "Confirmar Denuncia" | la denuncia se confirma y el sistema muestra "Denuncia confirmada. El material ha sido suspendido." | Backend ejecuta verificarSuspensionAutomatica luego de confirmar. Al alcanzar M denuncias confirmadas, el material se suspende. El material aparece como "Suspendido" en el detalle. | Config M_DENUNCIAS_VERIFICADAS: 1 | Administrador | Feliz | DEN-17 |
| DEN-19 | Admin rechaza una denuncia pendiente | Usuario logueado como admin. Existe denuncia en estado "pendiente". | el admin está en el detalle de la denuncia | hace clic en "Rechazar Denuncia" | la denuncia cambia a estado "rechazada" y se registra el moderador y fecha | Backend PUT /api/admin/denuncias/:id/rechazar responde 200. El material no se ve afectado. | — | Administrador | Feliz | DEN-15 |
| DEN-20 | Admin intenta confirmar una denuncia ya moderada | Usuario logueado como admin. Existe denuncia en estado "confirmada" o "rechazada". | el admin ve el detalle de una denuncia ya moderada | busca los botones "Confirmar" y "Rechazar" | los botones NO aparecen en el modal de detalle | El frontend solo muestra botones de moderación si estado === "pendiente". Si se fuerza por API, backend responde 400 "La denuncia ya fue confirmada/rechazada anteriormente". | — | Administrador | Permisos | DEN-17 |
| DEN-21 | Admin confirma denuncia de material ya suspendido | Usuario logueado como admin. Existe denuncia pendiente de un material ya suspendido. | el admin confirma la denuncia | hace clic en "Confirmar Denuncia" | la denuncia se confirma. El material sigue suspendido. | Backend ejecuta verificarSuspensionAutomatica, el material ya estaba suspendido, no cambia. Mensaje: "Denuncia confirmada exitosamente" (sin mensaje de suspensión). | — | Administrador | Feliz | DEN-08, DEN-17 |

### Restauración de materiales (admin)

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| DEN-22 | Admin restaura un material suspendido | Usuario logueado como admin. Existe un material suspendido (motivado por denuncias confirmadas). | el admin está en el detalle de una denuncia de un material suspendido | hace clic en "Restaurar Material" | el material se restaura, las denuncias pendientes y confirmadas pasan a "revocada" | Backend PUT /api/admin/materiales/:id/restaurar. Actualiza todas las denuncias del material a estado "revocada". El material queda con suspendido: false y revocado: true. Mensaje: "Material restaurado. Denuncias revocadas." | — | Administrador | Feliz | DEN-18, DEN-17 |
| DEN-23 | Admin intenta restaurar material no suspendido | Usuario logueado como admin. Existe un material activo (no suspendido). | el admin intenta restaurar un material que no está suspendido | la solicitud llega al backend | el sistema muestra "El material no está suspendido" | Backend responde 400. | — | Administrador | Error | — |
| DEN-24 | Admin ve botón "Restaurar" solo en materiales suspendidos | Usuario logueado como admin. | el admin ve el detalle de una denuncia | el modal se abre | el botón "Restaurar Material" solo aparece si selectedDenuncia.material?.suspendido es true | Frontend valida la propiedad suspendido del material para mostrar el botón. | — | Administrador | Permisos | DEN-15, DEN-18 |

### Gestión de motivos de denuncia (admin)

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| DEN-25 | Admin crea un nuevo motivo de denuncia | Usuario logueado como admin. | el admin está en la pestaña "Motivos" del panel de moderación | hace clic en "Nuevo Motivo", completa nombre y descripción, y hace clic en "Crear" | el motivo aparece en la tabla con estado "Activo" | Backend responde 201 POST /api/admin/motivos-denuncia. El motivo se persiste con activo: true. | nombre: "Spam", descripción: "Contenido publicitario no deseado" | Administrador | Feliz | — |
| DEN-26 | Admin crea motivo sin nombre | Usuario logueado como admin. | el admin completa el formulario de nuevo motivo | deja el nombre vacío y hace clic en "Crear" | el sistema muestra "El nombre del motivo es obligatorio" | Backend responde 400. Validación frontend también muestra error en el campo. | nombre: "" | Administrador | Error | — |
| DEN-27 | Admin crea motivo con nombre duplicado | Usuario logueado como admin. Ya existe un motivo con el mismo nombre. | el admin intenta crear un motivo con nombre existente | completa el formulario y guarda | el sistema muestra "Ya existe un motivo con el nombre X" | Backend responde 409. | nombre: "Spam" (existente) | Administrador | Error | DEN-25 |
| DEN-28 | Admin edita un motivo existente | Usuario logueado como admin. Existe un motivo creado. | el admin está en la tabla de motivos | hace clic en "Editar", modifica nombre y/o descripción, y guarda | el motivo se actualiza en la tabla | Backend PUT /api/admin/motivos-denuncia/:id responde 200. | nuevo nombre: "Spam y publicidad" | Administrador | Feliz | DEN-25 |
| DEN-29 | Admin desactiva un motivo (toggle activo) | Usuario logueado como admin. Existe un motivo activo. | el admin está en la tabla de motivos | hace clic en el chip "Activo" del motivo | el motivo cambia a "Inactivo" (opacidad reducida) | Backend PUT /api/admin/motivos-denuncia/:id con activo: false. El frontend actualiza la fila con opacidad 0.5. | — | Administrador | Feliz | DEN-25 |
| DEN-30 | Admin elimina un motivo sin denuncias asociadas | Usuario logueado como admin. Existe un motivo que nunca fue usado en denuncias. | el admin está en la tabla de motivos | hace clic en el ícono de "Eliminar" y confirma | el motivo desaparece de la tabla (destroy físico) | Backend DELETE /api/admin/motivos-denuncia/:id. Como count denunciasAsociadas === 0, ejecuta destroy(). | — | Administrador | Feliz | DEN-25 |
| DEN-31 | Admin elimina un motivo con denuncias asociadas | Usuario logueado como admin. Existe un motivo que ya fue usado en denuncias. | el admin intenta eliminar ese motivo | hace clic en "Eliminar" y confirma | el motivo no se elimina físicamente sino que se desactiva (activo: false) | Backend detecta denunciasAsociadas > 0, en vez de destroy() hace update activo: false. Mensaje: "Motivo desactivado porque tiene denuncias asociadas". | — | Administrador | Límite | DEN-25, DEN-01 |
| DEN-32 | Admin ve lista vacía de motivos | Usuario logueado como admin. No hay motivos configurados. | el admin cambia a la pestaña "Motivos" | la tabla se carga | se muestra "No hay motivos de denuncia configurados" | Fila única con colspan. | — | Administrador | Borde | — |

### Configuración de moderación (admin)

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| DEN-33 | Admin ve configuración de moderación | Usuario logueado como admin. Existen configuraciones en BD (N y M). | el admin cambia a la pestaña "Configuración" del panel de moderación | la página carga | se muestran dos tarjetas: "Denuncias Pendientes (N)" y "Denuncias Verificadas (M)" con sus valores actuales y descripción | Backend GET /api/admin/configuracion-moderacion. Cada config se muestra en un Card con TextField y botón "Guardar". | — | Administrador | Feliz | — |
| DEN-34 | Admin actualiza valor de configuración | Usuario logueado como admin. Existe configuración cargada. | el admin está en la pestaña Configuración | cambia el valor numérico de una configuración y hace clic en "Guardar" | el sistema muestra mensaje "N_DENUNCIAS_PENDIENTES actualizado a X" | Backend PUT /api/admin/configuracion-moderacion. Valida que valor sea entero positivo. | nuevo valor N: 5 | Administrador | Feliz | DEN-33 |
| DEN-35 | Admin ingresa valor inválido en configuración | Usuario logueado como admin. | el admin intenta guardar una configuración con valor 0 o negativo | escribe 0 en el campo y hace clic en "Guardar" | el sistema muestra "El valor debe ser un número entero positivo" | Backend responde 400. Frontend también valida con min=1 en el input. | valor: 0 | Administrador | Error | — |

---

## Resumen de variantes

| Variante | Cantidad | IDs |
|---|---|---|
| Feliz | 17 | DEN-01, DEN-08, DEN-09, DEN-10, DEN-11, DEN-12, DEN-15, DEN-17, DEN-18, DEN-19, DEN-21, DEN-22, DEN-25, DEN-28, DEN-29, DEN-30, DEN-33, DEN-34 |
| Error | 7 | DEN-02, DEN-03, DEN-04, DEN-16, DEN-23, DEN-26, DEN-27, DEN-35 |
| Permisos | 2 | DEN-20, DEN-24 |
| Límite | 2 | DEN-05, DEN-31 |
| Seguridad | 2 | DEN-06, DEN-14 |
| Borde | 2 | DEN-07, DEN-13, DEN-32 |

---

## Notas

- Los IDs con prefijo `DEN-XX` corresponden al módulo Denuncias.
- La creación de denuncias (DEN-01 al DEN-10) se realiza desde la UI de Materiales a través del componente DenunciaDialog.
- La moderación (DEN-11 al DEN-24) se realiza desde el panel de administración (AdminModeracionPage / ModeracionTab).
- La suspensión automática se activa al crear una denuncia (verificarSuspensionAutomatica) o al confirmar/rechazar desde admin.
- Umbrales por defecto: N_DENUNCIAS_PENDIENTES = 10, M_DENUNCIAS_VERIFICADAS = 1.
- Un material suspendido oculta url/nombreArchivo/discordInfo para usuarios no administradores (ver MAT-41).
- La restauración de un material revoca TODAS las denuncias pendientes y confirmadas asociadas a ese material.
