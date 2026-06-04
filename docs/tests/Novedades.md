# Feature: Novedades / Feed

> **Versión:** 1.0
> **Última actualización:** 2026-06-02
> **Responsable:** Equipo de Desarrollo

---

## Tabla de casos de prueba

### Creación de posteos manuales

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| NOV-01 | Estudiante crea un posteo manual exitosamente | Usuario logueado con rol distinto a administrador. | el estudiante está en la pantalla Novedades, ve el formulario "¿Qué estás pensando?" | escribe un mensaje y hace clic en "Publicar" | el posteo aparece al inicio del feed con el nombre del autor, contenido, y fecha | Backend responde 201 POST /api/novedades. El posteo se crea con tipo "posteo", visible: true, esAutomatica: false. El feed se refresca y el nuevo posteo aparece primero. | contenido: "¡Hoy rendí el parcial de Álgebra!" | Estudiante | Feliz | — |
| NOV-02 | Estudiante intenta publicar con contenido vacío | Usuario logueado. | el estudiante ve el formulario de creación | no escribe nada y hace clic en "Publicar" | nada sucede, el botón "Publicar" está deshabilitado | Validación frontend: botón disabled cuando !contenido.trim(). No se llama a la API. | contenido: "" | Estudiante | Error | — |
| NOV-03 | Usuario no autenticado intenta crear posteo | No hay usuario seleccionado. | el usuario accede a la pantalla Novedades | el formulario de creación NO se muestra | no ve el campo para escribir ni el botón "Publicar" | El frontend condiciona la renderización de CreatePostForm a user?.id. | — | No logueado | Seguridad | — |
| NOV-04 | Administrador intenta crear posteo manual | Usuario logueado con rol administrador. | el administrador intenta crear un posteo | la solicitud llega al backend | el sistema responde "Los administradores no pueden crear publicaciones en el feed" | Backend responde 403. El frontend oculta el formulario si el rol es administrador. | — | Administrador | Seguridad | — |

### Feed / Listado

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| NOV-05 | Estudiante ve feed general de novedades | Usuario logueado. Existen novedades de tipo posteo, inscripcion, regularizacion y aprobacion creadas por otros estudiantes. | el estudiante navega a la pantalla Novedades | la página carga | se muestran todas las novedades visibles ordenadas por fecha descendente, cada una con autor, contenido, likes y comentarios | Backend GET /api/novedades con paginación. Cada post muestra avatar, nombre, fecha, contenido (o materia si es evento), contador de likes y comentarios. | — | Estudiante | Feliz | NOV-01, NOV-25 |
| NOV-06 | Estudiante ve feed filtrado por tipo de novedad | Usuario logueado. Existen novedades de distintos tipos. | el estudiante accede a la API con filtro tipo | envía GET /api/novedades?tipo=posteo | solo se muestran las novedades de tipo "posteo" | El backend filtra por el campo tipo en el where. | tipo: posteo | Estudiante | Feliz | NOV-05 |
| NOV-07 | Estudiante ve feed de novedades de sus contactos | Usuario logueado. Existen conexiones aceptadas con otros estudiantes que tienen novedades. | el estudiante accede a la API con feed=contactos | envía GET /api/novedades?feed=contactos&usuarioId=X | solo se muestran novedades de sus contactos más las propias | Backend busca conexiones aceptadas del usuario, arma array de IDs (contactos + propio) y filtra por autorId. | feed: contactos | Estudiante | Feliz | NOV-05 |
| NOV-08 | Estudiante ve feed de un autor específico | Usuario logueado. Existen novedades de distintos autores. | el estudiante accede a la API | envía GET /api/novedades?autorId=X | solo se muestran las novedades de ese autor | Backend filtra por autorId. | autorId: 5 | Estudiante | Feliz | NOV-05 |
| NOV-09 | Feed vacío cuando no hay novedades | Usuario logueado. No existen novedades visibles. | el estudiante navega a Novedades | la página carga | se muestra una lista vacía (sin posteos) | El array posts está vacío. No se muestra ningún PostCard. | — | Estudiante | Borde | — |
| NOV-10 | Error al cargar feed | Usuario logueado. El backend está caído o responde con error. | el estudiante navega a Novedades | la página intenta cargar pero falla | el feed no se carga; se muestra el estado de error (según implementación de manejo de errores global) | Depende de la implementación del manejo de errores global de la app. | — | Estudiante | Error | — |

### Ver detalle

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| NOV-11 | Estudiante ve detalle de una novedad existente | Usuario logueado. Existe una novedad visible. | el estudiante consulta una novedad específica | envía GET /api/novedades/:id | recibe todos los datos de la novedad incluyendo autor, materia, likes, likesCount y liked | Backend responde 200 con todos los includes. | id: 1 | Estudiante | Feliz | NOV-01 |
| NOV-12 | Estudiante consulta novedad inexistente | Usuario logueado. | el estudiante consulta un ID inválido | envía GET /api/novedades/99999 | recibe mensaje "No se encontró una novedad con id 99999" | Backend responde 404. | id: 99999 | Estudiante | Error | — |

### Edición de posteos

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| NOV-13 | Dueño edita su posteo manual exitosamente | Usuario logueado. Existe un posteo manual (esAutomatica: false) creado por él. | el dueño ve su posteo en el feed | hace clic en el menú de tres puntos, selecciona "Editar", modifica el contenido y hace clic en "Guardar" | el posteo se actualiza con el nuevo contenido y se muestra el indicador "editado" | Backend PUT /api/novedades/:id responde 200. El campo editedAt se actualiza. Frontend muestra "(editado)" junto a la fecha. | nuevo contenido: "Actualización: ya terminé el parcial!" | Estudiante | Feliz | NOV-01 |
| NOV-14 | Dueño intenta editar su posteo automático | Usuario logueado. Existe un posteo automático (esAutomatica: true) creado para él (ej: inscripcion). | el dueño ve su posteo automático en el feed | busca la opción "Editar" en el menú | la opción "Editar" NO aparece en el menú de tres puntos | Frontend condiciona la visibilidad del menú Editar a !post.esAutomatica. Backend responde 403 "No se pueden editar novedades automáticas". | — | Estudiante | Permisos | NOV-25 |
| NOV-15 | Otro usuario intenta editar posteo ajeno | Usuario logueado. Existe un posteo creado por otro estudiante. | el estudiante ve un posteo que no es suyo | busca el menú de tres puntos | el menú de tres puntos NO aparece en el PostCard | Frontend solo muestra el icono MoreVert si isOwner (post.autor?.id === currentUserId). Backend responde 403. | — | Estudiante | Permisos | NOV-01 |
| NOV-16 | Usuario edita posteo inexistente | Usuario logueado. | el usuario intenta editar un posteo que fue eliminado entre tanto | la solicitud llega al backend | el sistema responde "No se encontró una novedad con id X" | Backend responde 404. | — | Estudiante | Error | — |
| NOV-17 | Usuario edita posteo con tipo inválido | Usuario logueado y dueño del posteo. | el dueño intenta modificar el tipo a un valor no válido | envía PUT con tipo: "tipo-invalido" | el sistema responde "El tipo debe ser uno de: posteo, inscripcion, regularizacion, aprobacion" | Backend responde 400. | tipo: "tipo-invalido" | Estudiante | Error | NOV-13 |

### Eliminación de posteos

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| NOV-18 | Dueño elimina su posteo (soft delete) | Usuario logueado. Existe un posteo creado por él. | el dueño ve su posteo | hace clic en menú de tres puntos, selecciona "Eliminar" | el posteo desaparece del feed | Backend DELETE /api/novedades/:id hace soft delete: actualiza visible: false. El posteo ya no se muestra en el feed. | — | Estudiante | Feliz | NOV-01 |
| NOV-19 | Otro usuario intenta eliminar posteo ajeno | Usuario logueado. Existe un posteo creado por otro estudiante. | el estudiante ve un posteo ajeno | busca la opción "Eliminar" en el menú | la opción "Eliminar" NO aparece | Frontend oculta el menú si no es owner. Backend responde 403. | — | Estudiante | Permisos | NOV-01 |

### Likes en posteos

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| NOV-20 | Usuario da like a un posteo de otro usuario | Usuario logueado. Existe un posteo creado por otro estudiante que NO tiene like de este usuario. | el estudiante ve un posteo de otro compañero | hace clic en el ícono de "Me gusta" / pulgar arriba | el contador de likes aumenta en 1 y el ícono se destaca en color primario | Backend POST /api/novedades/:id/like. El like se persiste. La novedad actualiza likesCount. | — | Estudiante | Feliz | NOV-01 |
| NOV-21 | Usuario da unlike a un posteo | Usuario logueado. Existe un posteo al que el usuario ya le dio like. | el estudiante ve un posteo que ya tiene su like | hace clic en el ícono de like nuevamente | el contador de likes disminuye en 1 y el ícono vuelve a su color por defecto | Backend POST /api/novedades/:id/unlike. Se elimina el registro de Like. La novedad actualiza likesCount. | — | Estudiante | Feliz | NOV-20 |
| NOV-22 | Usuario intenta dar like a su propio posteo | Usuario logueado. Existe un posteo creado por él mismo. | el dueño ve su propio posteo | busca el ícono de like | el ícono de like está deshabilitado con tooltip "No puedes dar like a tu propia publicación" | Frontend: IconButton tiene disabled=true cuando isOwner. Backend responde 403 "No puedes dar like a tu propia publicación". | — | Estudiante | Permisos | NOV-01 |
| NOV-23 | Usuario da like a posteo inexistente | Usuario logueado. | el usuario intenta dar like a un ID inválido | envía POST /api/novedades/99999/like | el sistema responde "No se encontró una novedad con id 99999" | Backend responde 404. | id: 99999 | Estudiante | Error | — |
| NOV-24 | Usuario da like duplicado a posteo | Usuario logueado. El usuario ya tiene un like activo en ese posteo. | el estudiante da like a un posteo que ya likeó | envía POST /api/novedades/:id/like nuevamente | el sistema responde con likesCount actual y liked: true (sin cambios) | Backend detecta existingLike y responde 200 (no 409) con los datos actuales. No se duplica el like. | — | Estudiante | Límite | NOV-20 |

### Novedades automáticas (inscripción, regularización, aprobación)

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| NOV-25 | Sistema crea novedad automática de inscripción | Usuario logueado. El estudiante tiene preferencia publicarInscripciones: true. | un estudiante se inscribe a una materia (evento del sistema) | el sistema envía POST /api/novedades/automatica con tipo "inscripcion" | la novedad aparece en el feed con chip "se inscribió a" y el nombre de la materia | Backend responde 201. La novedad se crea con esAutomatica: true, tipo: "inscripcion". El PostCard la muestra con icono School. | tipo: inscripcion, titulo: "Se inscribió a Álgebra", materiaId: 1 | Sistema | Feliz | — |
| NOV-26 | Sistema crea novedad automática de regularización | Usuario logueado. Preferencia publicarRegularizaciones: true. | un estudiante regulariza una materia | el sistema envía POST /api/novedades/automatica con tipo "regularizacion" | la novedad aparece con chip "regularizó" | Backend responde 201. PostCard muestra icono Edit. | tipo: regularizacion | Sistema | Feliz | — |
| NOV-27 | Sistema crea novedad automática de aprobación | Usuario logueado. Preferencia publicarAprobaciones: true. | un estudiante aprueba una materia | el sistema envía POST /api/novedades/automatica con tipo "aprobacion" | la novedad aparece con chip "aprobó" | Backend responde 201. PostCard muestra icono CheckCircle. | tipo: aprobacion | Sistema | Feliz | — |
| NOV-28 | Sistema intenta crear automática con preferencia desactivada | Usuario logueado. El estudiante tiene publicarInscripciones: false. | el sistema intenta crear una automática de inscripción para ese estudiante | envía POST /api/novedades/automatica | el sistema responde que no se creó la novedad y no se muestra nada en el feed | Backend responde 200 con message: "Novedad no creada: estudiante tiene desactivada la publicación de inscripciones" y data: null. No se persiste nada. | tipo: inscripcion, publicarInscripciones: false | Sistema | Borde | NOV-31 |
| NOV-29 | Sistema crea automática con tipo inválido | — | el sistema (o un atacante) intenta crear una automática con tipo no válido | envía POST con tipo "posteo" en /api/novedades/automatica | el sistema responde "El tipo automático debe ser uno de: inscripcion, regularizacion, aprobacion" | Backend responde 400. El endpoint /automatica solo acepta esos 3 tipos. | tipo: "posteo" | Sistema | Error | — |
| NOV-30 | Administrador intenta crear automática | Usuario logueado como administrador. | el sistema intenta crear una automática para un admin | envía POST /api/novedades/automatica con autorId de un admin | el sistema responde "Los administradores no pueden crear publicaciones en el feed" | Backend responde 403. | autorId: admin.id | Administrador | Seguridad | — |

### Preferencias de publicación

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| NOV-31 | Estudiante consulta sus preferencias de publicación | Usuario logueado. Existe un registro de PreferenciasEstudiante para él. | el estudiante o el sistema consulta las preferencias | envía GET /api/novedades/preferencias/:estudianteId | recibe las preferencias actuales con todos los campos (publicarInscripciones, publicarRegularizaciones, etc.) | Backend busca y devuelve el registro. Incluye datos del estudiante. | — | Estudiante | Feliz | — |
| NOV-32 | Estudiante actualiza sus preferencias de publicación | Usuario logueado. | el estudiante modifica sus preferencias (ej: desactiva publicación automática de inscripciones) | envía PUT /api/novedades/preferencias/:estudianteId con publicarInscripciones: false | las preferencias se actualizan y el cambio se refleja en futuras novedades automáticas | Backend actualiza solo los campos enviados. Los no enviados se mantienen. | publicarInscripciones: false | Estudiante | Feliz | NOV-31 |
| NOV-33 | Estudiante sin preferencias creadas las consulta | Usuario logueado. No existe registro de PreferenciasEstudiante para él. | el estudiante consulta sus preferencias | envía GET /api/novedades/preferencias/:estudianteId | el sistema crea y devuelve preferencias con valores por defecto (todo true) | Backend detecta que no existe, crea un nuevo registro con defaults y lo devuelve. | — | Estudiante | Feliz | — |
| NOV-34 | Estudiante actualiza preferencias sin usuarioId | Usuario no autenticado. | un request sin usuarioId llega al backend | envía PUT /api/novedades/preferencias/undefined | el sistema responde "Debe proporcionar un usuarioId" | Backend responde 400. | — | No logueado | Seguridad | — |

### Comentarios en novedades

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| NOV-35 | Usuario comenta en una novedad | Usuario logueado. Existe una novedad visible. | el estudiante ve una novedad y expande la sección de comentarios | escribe un comentario y hace clic en "Enviar" o presiona Enter | el comentario aparece en la lista de comentarios y el contador de comentarios aumenta | Backend POST /api/novedades/:id/comentarios responde 201. El comentario se persiste con autorId correcto. El frontend lo agrega a la lista local. | contenido: "¡Muy buen aporte!" | Estudiante | Feliz | NOV-01 |
| NOV-36 | Usuario intenta comentar con contenido vacío | Usuario logueado. Existe novedad. | el estudiante expande comentarios y escribe nada | hace clic en "Enviar" con el campo vacío | nada sucede; el botón "Enviar" está deshabilitado | Validación frontend: disabled={!nuevoComentario.trim()}. No se llama a la API. | contenido: "" | Estudiante | Error | — |
| NOV-37 | Usuario responde a un comentario existente | Usuario logueado. Existe una novedad con al menos un comentario. | el estudiante ve los comentarios de una novedad | hace clic en "Responder" en un comentario, escribe su respuesta y la envía | la respuesta aparece anidada debajo del comentario original | Backend POST /api/novedades/:id/comentarios con comentarioPadreId. La respuesta se muestra con indentación. | contenidoRespuesta: "Coincido con tu punto de vista" | Estudiante | Feliz | NOV-35 |
| NOV-38 | Dueño edita su comentario | Usuario logueado. Existe un comentario creado por él. | el dueño ve su comentario | hace clic en el menú de tres puntos del comentario, selecciona "Editar", modifica el texto y guarda | el comentario se actualiza y se muestra el indicador "editado" | Backend PUT /api/novedades/:id/comentarios/:id. El frontend muestra "(editado)" junto a la fecha. | nuevo contenido: "¡Muy buen aporte! Me sirvió mucho." | Estudiante | Feliz | NOV-35 |
| NOV-39 | Dueño elimina su comentario | Usuario logueado. Existe un comentario creado por él. | el dueño ve su comentario | hace clic en menú de tres puntos, selecciona "Eliminar" | el comentario desaparece de la lista y el contador disminuye | Backend DELETE /api/novedades/:id/comentarios/:id. Se elimina físicamente de BD. | — | Estudiante | Feliz | NOV-35 |
| NOV-40 | Usuario da like a un comentario | Usuario logueado. Existe un comentario de otro usuario. | el estudiante ve un comentario | hace clic en el ícono de like del comentario | el contador de likes del comentario aumenta y el ícono se destaca | Backend POST /api/novedades/:id/comentarios/:id/like. | — | Estudiante | Feliz | NOV-35 |
| NOV-41 | Usuario da unlike a un comentario | Usuario logueado. El usuario ya tiene like en ese comentario. | el estudiante ve un comentario que ya likeó | hace clic en el ícono de like nuevamente | el contador disminuye y el ícono vuelve a su color normal | Backend POST /api/novedades/:id/comentarios/:id/unlike. | — | Estudiante | Feliz | NOV-40 |
| NOV-42 | Usuario ve comentarios de una novedad | Usuario logueado. Existe una novedad con comentarios. | el estudiante ve una novedad | hace clic en el ícono de comentarios | se cargan y muestran los comentarios ordenados, con respuestas anidadas | Backend GET /api/novedades/:id/comentarios. El frontend agrupa comentarios con sus respuestas. | — | Estudiante | Feliz | NOV-35 |
| NOV-43 | Usuario carga más comentarios (paginación local) | Usuario logueado. Existe una novedad con más de 5 comentarios. | el estudiante expande comentarios | hace clic en "Cargar anteriores (X restantes)" | se muestran más comentarios antiguos | El frontend tiene un visibleCount que incrementa de a 5. Se muestran los últimos N comentarios. | — | Estudiante | Feliz | NOV-42 |

---

## Resumen de variantes

| Variante | Cantidad | IDs |
|---|---|---|
| Feliz | 21 | NOV-01, NOV-05, NOV-06, NOV-07, NOV-08, NOV-11, NOV-13, NOV-18, NOV-20, NOV-21, NOV-25, NOV-26, NOV-27, NOV-31, NOV-32, NOV-33, NOV-35, NOV-37, NOV-38, NOV-39, NOV-40, NOV-41, NOV-42, NOV-43 |
| Error | 5 | NOV-02, NOV-10, NOV-12, NOV-16, NOV-17, NOV-23, NOV-29, NOV-36 |
| Permisos | 4 | NOV-14, NOV-15, NOV-19, NOV-22 |
| Límite | 1 | NOV-24 |
| Seguridad | 3 | NOV-03, NOV-04, NOV-30, NOV-34 |
| Borde | 1 | NOV-09, NOV-28 |

---

## Notas

- Los IDs con prefijo `NOV-XX` corresponden al módulo Novedades.
- Los tipos de novedad se dividen en: posteo (manual), inscripcion, regularizacion, aprobacion (automáticas).
- Las novedades automáticas son generadas por el sistema a través del endpoint `/api/novedades/automatica` y no pueden ser editadas por el usuario.
- Los administradores no pueden crear novedades ni dar like a posteos, pero pueden tener novedades automáticas si se inscriben a materias (aunque el backend lo bloquea).
- Las preferencias de publicación se almacenan en PreferenciasEstudiante y controlan qué eventos automáticos se publican en el feed.
- Los comentarios soportan respuestas anidadas (un nivel) y likes tanto en comentarios como en respuestas.
- Los comentarios tienen un mecanismo de carga progresiva (de a 5) en el frontend.
