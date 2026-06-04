# Feature: Materiales de Estudio

> **Versión:** 1.0
> **Última actualización:** 2026-06-02
> **Responsable:** Equipo de Desarrollo

---

## Tabla de casos de prueba

### Creación de materiales

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| MAT-01 | Estudiante crea material tipo link exitosamente | Usuario logueado. Existe al menos una materia cargada. | el estudiante está en la pantalla Materiales y hace clic en "Agregar Material" | completa título, selecciona tipo Link, ingresa URL, elige materia, agrega tags y hace clic en "Guardar" | el material aparece en la lista con título, materia, tags y rating visible | Backend responde 201. Se persiste en BD con creadorId correcto. El tipoLink se detecta automáticamente ("web"). Los tags nuevos se crean y asocian. | titulo: "Resumen Álgebra", tipo: link, url: "https://ejemplo.com/resumen.pdf", materia: "Álgebra", tags: ["ejercicios", "parcial"] | Estudiante | Feliz | — |
| MAT-02 | Estudiante crea material tipo file exitosamente | Usuario logueado. Existe al menos una materia cargada. | el estudiante está en el diálogo de nuevo material | selecciona tipo Archivo, adjunta un archivo válido (<25MB), completa título, materia y hace clic en "Guardar" | el material aparece en la lista con nombre de archivo y tamaño visible | Backend responde 201. El archivo se sube a Cloudinary. Se guarda url, nombreArchivo y tamanho. | titulo: "Apunte Cálculo", tipo: file, archivo: "apunte.pdf" (2MB), materia: "Cálculo" | Estudiante | Feliz | — |
| MAT-03 | Estudiante crea material sin título | Usuario logueado | el estudiante está en el diálogo de nuevo material | completa tipo, URL y materia, deja título vacío y hace clic en "Guardar" | el sistema muestra mensaje "El título, tipo y materiaId son obligatorios" | Backend responde 400. No se crea el material. | titulo: "", tipo: link, url: "https://...", materia: "Álgebra" | Estudiante | Error | — |
| MAT-04 | Estudiante crea material tipo link sin URL | Usuario logueado | el estudiante está en el diálogo con tipo Link | completa título y materia, deja URL vacía y hace clic en "Guardar" | el sistema muestra mensaje "Se requiere una URL para tipo link" | Backend responde 400. | titulo: "Mi material", tipo: link, url: "" | Estudiante | Error | — |
| MAT-05 | Estudiante crea material tipo file sin archivo | Usuario logueado | el estudiante está en el diálogo con tipo Archivo | completa título y materia, no adjunta archivo y hace clic en "Guardar" | el sistema muestra mensaje "Se requiere un archivo para tipo file" | Backend responde 400. | titulo: "Mi archivo", tipo: file, sin archivo adjunto | Estudiante | Error | — |
| MAT-06 | Estudiante crea material con materia inexistente | Usuario logueado | el estudiante completa el formulario de nuevo material | selecciona un materiaId que no existe en BD y hace clic en "Guardar" | el sistema muestra mensaje "No se encontró una materia con id X" | Backend responde 404. | materiaId: 99999 | Estudiante | Error | — |
| MAT-07 | Estudiante crea material con enlace de Discord | Usuario logueado. Existe materia cargada. | el estudiante está en el diálogo de nuevo material | ingresa una URL de invitación de Discord y completa los demás campos | el material se crea con tipoLink "discord" y discordInfo visible | Backend detecta que la URL contiene "discord" y "/invite", asigna tipoLink: "discord" y agrega discordInfo con servidor y canal por defecto. | url: "https://discord.com/invite/abcdef" | Estudiante | Feliz | — |
| MAT-08 | Estudiante crea material con tags existentes y nuevos | Usuario logueado. Existen tags creados previamente ("ejercicios"). | el estudiante está en el diálogo de nuevo material | ingresa tags, algunos ya existentes y otros nuevos, y guarda | el material se crea con todos los tags asociados | Los tags existentes se reusan. Los nuevos se crean automáticamente. | tags: ["ejercicios", "nuevo-tag"] | Estudiante | Feliz | — |
| MAT-09 | Usuario no autenticado intenta crear material | No hay usuario seleccionado en el dropdown. | el usuario está en la pantalla Materiales | completa el formulario y hace clic en "Guardar" | el sistema muestra "Debe seleccionar un usuario" o bloquea | Backend responde 400 "Se requiere usuarioId". | — | No logueado | Seguridad | — |
| MAT-10 | Usuario crea material con URL de YouTube | Usuario logueado | el estudiante ingresa una URL de YouTube en el campo link | completa los demás campos y guarda | el material se crea con tipoLink "youtube" | — | url: "https://youtube.com/watch?v=abc123" | Estudiante | Feliz | — |
| MAT-11 | Usuario crea material con URL de Google Drive | Usuario logueado | el estudiante ingresa una URL de Google Drive | completa los demás campos y guarda | el material se crea con tipoLink "drive" | — | url: "https://drive.google.com/file/d/..." | Estudiante | Feliz | — |

### Listado, búsqueda y filtros

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| MAT-12 | Estudiante ve lista de materiales disponibles | Usuario logueado. Existen materiales creados por distintos usuarios. | el estudiante ingresa a la pantalla Materiales | la página carga | se muestran todos los materiales ordenados por defecto (más recientes primero) | Backend responde GET /api/materiales con data. Cada material muestra título, materia, creador, tags, rating, tipo. | — | Estudiante | Feliz | MAT-01 |
| MAT-13 | Estudiante filtra materiales por materia | Usuario logueado. Existen materiales de distintas materias. | el estudiante está en la pantalla Materiales | selecciona una materia en el filtro desplegable | solo se muestran los materiales de esa materia | El backend recibe materiaId y filtra en la query. | filtro materia: "Álgebra" | Estudiante | Feliz | MAT-12 |
| MAT-14 | Estudiante busca materiales por texto | Usuario logueado. Existen materiales con títulos, tags y materias variados. | el estudiante está en la pantalla Materiales | escribe en el campo de búsqueda "álgebra" | se muestran solo los materiales cuyo título, descripción, tags o materia contienen "álgebra" | La búsqueda es case-insensitive. Filtra del lado del backend. | búsqueda: "álgebra" | Estudiante | Feliz | MAT-12 |
| MAT-15 | Estudiante ordena materiales por más recientes | Usuario logueado | el estudiante está en la pantalla Materiales | selecciona "Más recientes" en el ordenamiento | los materiales se ordenan del más nuevo al más antiguo | Es el orden por defecto (fecha DESC). | sortBy: fecha_desc | Estudiante | Feliz | MAT-12 |
| MAT-16 | Estudiante ordena materiales por mejor valorados | Usuario logueado. Existen materiales con diferentes ratings. | el estudiante está en la pantalla Materiales | selecciona "Mejor valorados" en el ordenamiento | los materiales se ordenan por upvotes descendente, y los no valorados quedan al final | El backend calcula _upvotes, _ratio, _totalRatings y ordena. | sortBy: rating_desc | Estudiante | Feliz | MAT-12 |
| MAT-17 | Estudiante busca y no encuentra materiales | Usuario logueado | el estudiante está en la pantalla Materiales | ingresa un texto de búsqueda que no coincide con ningún material | se muestra "No se encontraron materiales" con botón "Limpiar filtros" | EmptyState con icono de búsqueda. | búsqueda: "zzzzzztextoinexistente" | Estudiante | Borde | — |
| MAT-18 | Error al cargar materiales | Usuario logueado. El backend está caído o responde con error. | el estudiante ingresa a la pantalla Materiales | la página intenta cargar pero falla | se muestra mensaje de error con botón "Reintentar" | EmptyState con icono de error. Al hacer clic en Reintentar, se dispara nuevamente fetchMateriales. | — | Estudiante | Error | — |

### Ver detalle

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| MAT-19 | Estudiante ve detalle de material existente | Usuario logueado. Existe un material visible. | el estudiante ve el material en la lista | hace clic en el material o en "Ver detalle" | se muestra toda la información: título, descripción, materia, creador, tags, rating, tipo, fecha | Backend responde GET /api/materiales/:id con todos los includes. | — | Estudiante | Feliz | MAT-01 |
| MAT-20 | Estudiante ve detalle de material inexistente | Usuario logueado | el estudiante intenta acceder a un material con ID inválido | ingresa directamente a la URL de un material que no existe | el sistema muestra mensaje "No se encontró un material con id X" | Backend responde 404. | id: 99999 | Estudiante | Error | — |

### Edición

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| MAT-21 | Dueño edita título y descripción de su material | Usuario logueado. Existe un material creado por él. | el dueño está viendo su material | hace clic en "Editar", modifica título y descripción, y guarda | el material se actualiza con los nuevos datos en la lista | Backend responde 200 PUT /api/materiales/:id. Se persiste en BD. El frontend refresca la lista. | nuevo titulo: "Resumen Álgebra - Actualizado", nueva descripción: "Versión corregida" | Estudiante | Feliz | MAT-01 |
| MAT-22 | Dueño edita tags de su material | Usuario logueado. Existe material creado por él con tags. | el dueño edita su material | cambia los tags (agrega nuevos, elimina existentes) y guarda | los tags del material se actualizan | Backend elimina los tags antiguos (MaterialMaterialTag.destroy) y crea los nuevos. | tags nuevos: ["ejercicios", "final", "nuevo"] | Estudiante | Feliz | MAT-01, MAT-08 |
| MAT-23 | Otro usuario intenta editar material ajeno | Usuario logueado. Existe material creado por otro usuario. | el estudiante ve un material ajeno | busca el botón "Editar" | NO encuentra el botón "Editar" en pantalla | Backend responde 403 "No tienes permiso para actualizar este material". Frontend oculta el botón. | — | Estudiante | Permisos | MAT-01 |
| MAT-24 | Usuario no autenticado intenta editar material | No hay usuario seleccionado. | el usuario intenta editar un material | modifica campos y guarda | el sistema rechaza la operación | Backend responde 400 "Se requiere usuarioId". | — | No logueado | Seguridad | — |
| MAT-25 | Dueño edita material inexistente | Usuario logueado | el dueño intenta editar un material que fue eliminado entre tanto | la solicitud llega al backend | el sistema responde "No se encontró un material con id X" | Backend responde 404. | — | Estudiante | Error | — |

### Eliminación

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| MAT-26 | Dueño elimina su material tipo link | Usuario logueado. Existe un material tipo link creado por él. | el dueño está viendo su material | hace clic en "Eliminar" (icono de papelera) | el material desaparece de la lista | Backend responde 200 DELETE /api/materiales/:id. Se elimina de BD junto con sus tags y ratings asociados. No hay archivo en Cloudinary que eliminar. | — | Estudiante | Feliz | MAT-01 |
| MAT-27 | Dueño elimina su material tipo file | Usuario logueado. Existe un material tipo file creado por él con archivo en Cloudinary. | el dueño está viendo su material tipo file | hace clic en "Eliminar" | el material desaparece de la lista y el archivo se elimina de Cloudinary | Backend elimina de BD y también llama a cloudinary.uploader.destroy. | — | Estudiante | Feliz | MAT-02 |
| MAT-28 | Otro usuario intenta eliminar material ajeno | Usuario logueado. Existe material creado por otro. | el estudiante ve un material ajeno | busca el botón "Eliminar" | NO encuentra el botón "Eliminar" | Backend responde 403 "No tienes permiso para eliminar este material". Frontend oculta el botón. | — | Estudiante | Permisos | MAT-01 |

### Calificación (ratings)

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| MAT-29 | Usuario da upvote a material | Usuario logueado. Existe un material visible. El usuario NO ha votado antes. | el estudiante ve un material en la lista | hace clic en el ícono de "Me gusta" / upvote | el contador de upvotes aumenta en 1 y el ícono queda destacado | Backend crea un MaterialRating con valor 1. Responde con ratings actualizados. | value: 1 | Estudiante | Feliz | MAT-01 |
| MAT-30 | Usuario da downvote a material | Usuario logueado. Existe un material visible. El usuario NO ha votado antes. | el estudiante ve un material en la lista | hace clic en el ícono de "No me gusta" / downvote | el contador de downvotes aumenta en 1 y el ícono queda destacado | Backend crea un MaterialRating con valor -1. | value: -1 | Estudiante | Feliz | MAT-01 |
| MAT-31 | Usuario cambia su voto (upvote → downvote) | Usuario logueado. El usuario ya votó con upvote previamente. | el estudiante ve un material que ya upvoteó | hace clic en downvote | el upvote desaparece, el downvote se activa, los contadores se ajustan | Backend actualiza el registro existente cambiando valor de 1 a -1. | value: -1 (había votado 1 antes) | Estudiante | Feliz | MAT-29 |
| MAT-32 | Usuario togglea su voto (mismo valor) | Usuario logueado. El usuario ya votó con upvote. | el estudiante ve un material que ya upvoteó | hace clic en upvote nuevamente (mismo valor) | el voto se elimina, el contador disminuye y el ícono ya no está destacado | Backend destruye el registro de rating existente (toggle off). | value: 1 (ya había votado 1) | Estudiante | Feliz | MAT-29 |
| MAT-33 | Usuario califica material con valor inválido | Usuario logueado. Existe material. | el estudiante intenta votar | envía un valor distinto de 1 o -1 | el sistema muestra "El valor debe ser 1 (upvote) o -1 (downvote)" | Backend responde 400. | value: 2 | Estudiante | Error | — |
| MAT-34 | Usuario califica material inexistente | Usuario logueado | el estudiante intenta calificar un material con ID inválido | la solicitud llega al backend | el sistema responde "No se encontró un material con id X" | Backend responde 404. | id: 99999, value: 1 | Estudiante | Error | — |
| MAT-35 | Usuario no autenticado intenta calificar | No hay usuario seleccionado | el usuario intenta calificar un material | hace clic en upvote o downvote | el sistema muestra "Se requiere usuarioId" | Backend responde 400. | — | No logueado | Seguridad | — |

### Descarga de archivos

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| MAT-36 | Usuario descarga archivo de material tipo file | Usuario logueado. Existe un material tipo file con url válida. | el estudiante ve un material tipo file | hace clic en "Descargar" | se inicia la descarga del archivo o se redirige a la URL del archivo | Backend responde con redirect (302) a la URL de Cloudinary. | — | Estudiante | Feliz | MAT-02 |
| MAT-37 | Usuario intenta descargar material tipo link | Usuario logueado. Existe un material tipo link. | el estudiante ve un material tipo link | hace clic en "Descargar" | el sistema muestra "Este material no es un archivo" | Backend responde 400. El frontend no debería mostrar botón descargar para tipo link. | — | Estudiante | Error | MAT-01 |
| MAT-38 | Usuario intenta descargar material suspendido (no admin) | Usuario logueado (rol: estudiante). Existe un material tipo file suspendido. | el estudiante ve un material suspendido | hace clic en "Descargar" | el sistema muestra "Este material está suspendido" | Backend responde 403. El frontend muestra el material pero con url: null. | — | Estudiante | Permisos | MAT-02 |
| MAT-39 | Admin descarga material suspendido | Usuario logueado con rol administrador. Existe material tipo file suspendido. | el admin ve el material suspendido | hace clic en "Descargar" | la descarga se realiza con éxito | Backend permite la descarga si el usuario es admin, ignorando el estado suspendido. | — | Administrador | Permisos | MAT-38 |
| MAT-40 | Usuario descarga material sin archivo (url null) | Usuario logueado. Existe material tipo file con url null. | el estudiante intenta descargar | hace clic en "Descargar" | el sistema muestra "Archivo no encontrado" | Backend responde 404. | url: null | Estudiante | Error | — |

### Visibilidad de materiales suspendidos/revocados

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| MAT-41 | Estudiante ve material suspendido en la lista (con datos ocultos) | Usuario logueado (rol: estudiante). Existe un material con suspendido: true. | el estudiante está en la pantalla Materiales | la lista de materiales se carga | el material suspendido aparece pero con url: null, nombreArchivo: null y discordInfo: null | El backend oculta url, nombreArchivo y discordInfo cuando suspendido=true y el usuario no es admin. El resto de metadatos (título, materia, tags) sigue visible. | — | Estudiante | Permisos | MAT-01 |
| MAT-42 | Admin ve material suspendido con todos los datos | Usuario logueado (rol: administrador). Existe un material suspendido. | el admin ve la lista de materiales | la lista se carga | el material suspendido se muestra completo con url, nombreArchivo y discordInfo visibles | Backend salta la ocultación de datos si req.user.rol === 'administrador'. | — | Administrador | Permisos | MAT-41 |
| MAT-43 | Estudiante ve detalle de material suspendido con datos limitados | Usuario logueado (rol: estudiante). Existe material suspendido. | el estudiante ingresa al detalle del material suspendido | la página de detalle carga | el material se muestra pero con url, nombreArchivo y discordInfo en null | Backend show() aplica la misma lógica que index: si suspendido y no admin, oculta ciertos campos. | — | Estudiante | Permisos | MAT-41 |
| MAT-44 | Estudiante ve material revocado | Usuario logueado. Existe material con revocado: true. | el estudiante ve la lista de materiales | la lista se carga | el material aparece con indicador de revocado | El campo revocado: true es visible. El comportamiento de ocultación depende de la lógica de negocio (similar a suspendido). | — | Estudiante | Permisos | MAT-01 |

### Denuncias desde Materiales

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| MAT-45 | Estudiante denuncia un material desde la pantalla de materiales | Usuario logueado. Existe un material visible. | el estudiante ve un material que considera inapropiado | hace clic en "Denunciar", selecciona un motivo y envía | se abre un modal de denuncia, al confirmar se cierra y el material permanece visible | Se abre DenunciaDialog. Al enviar, se llama a POST /api/denuncias. Si se crea exitosamente, la lista de materiales se refresca. | — | Estudiante | Feliz | MAT-01 |
| MAT-46 | Estudiante cancela denuncia | Usuario logueado. Existe material. | el estudiante abre el diálogo de denuncia | hace clic en "Cancelar" en el modal | el modal se cierra sin enviar ninguna denuncia | No se llama a la API. La lista de materiales no se modifica. | — | Estudiante | Borde | MAT-45 |

---

## Resumen de variantes

| Variante | Cantidad | IDs |
|---|---|---|
| Feliz | 18 | MAT-01, MAT-02, MAT-07, MAT-08, MAT-10, MAT-11, MAT-12, MAT-13, MAT-14, MAT-15, MAT-16, MAT-19, MAT-21, MAT-22, MAT-26, MAT-27, MAT-29, MAT-30, MAT-31, MAT-32, MAT-36, MAT-39, MAT-45 |
| Error | 9 | MAT-03, MAT-04, MAT-05, MAT-06, MAT-18, MAT-20, MAT-25, MAT-33, MAT-34, MAT-37, MAT-40 |
| Permisos | 7 | MAT-23, MAT-28, MAT-38, MAT-41, MAT-42, MAT-43, MAT-44 |
| Seguridad | 2 | MAT-09, MAT-24, MAT-35 |
| Borde | 2 | MAT-17, MAT-46 |

---

## Notas

- Los IDs con prefijo `MAT-XX` corresponden al módulo Materiales.
- Las precondiciones asumen que el usuario está autenticado a través del dropdown de selección global (header `x-user-id`).
- Los materiales suspendidos/revocados son gestionados a través del módulo Denuncias y el panel de moderación de Administradores.
- La subida de archivos depende de Cloudinary como proveedor de almacenamiento.
- El límite de tamaño de archivo (25MB) se valida del lado del servidor (multer/Cloudinary).
- Los casos de denuncia desde Materiales (MAT-45, MAT-46) se complementan con el módulo Denuncias.
