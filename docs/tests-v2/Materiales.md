# Feature: Materiales de Estudio

> Versión: 1.0 | Última actualización: 2026-06-24 | Responsable: DesApp Grupo 9

---

## MAT-01 — Estudiante crea y gestiona su material

**Perfil:** Estudiante
**Precondiciones / Datos necesarios:**
- Sesión iniciada como estudiante
- Existe al menos una materia cargada en sus carreras

| # | El usuario... | El sistema... |
|---|--------------|--------------|
| 1 | Abre **"Materiales de Estudio"** | Muestra la lista de materiales existentes y el botón **"Agregar Material"** |
| 2 | Hace clic en **"Agregar Material"**, selecciona **"Archivo"**, completa título y materia, elige un archivo válido (<25MB), agrega tags y hace clic en **"Guardar"** | Valida los campos en frontend. Si todo ok, sube el archivo a Cloudinary, crea el material y lo agrega al inicio de la lista |
| 3 | Encuentra su material en la lista | Muestra la card con icono según extensión, título, tags, materia, nombre del archivo y chip **"Tu material"** con borde azul |
| 4 | Abre el menú del material y hace clic en **"Editar"**, modifica el título y hace clic en **"Actualizar"** | Muestra snackbar de éxito. La card se actualiza en la lista |
| 5 | Abre el menú y hace clic en **"Eliminar"** | Muestra diálogo **"Confirmar eliminación"** con el mensaje "¿Estás seguro de que deseas eliminar este material?" |
| 6 | Hace clic en **"Eliminar"** en el diálogo | Elimina el material y su archivo de Cloudinary. La card desaparece de la lista |

**Variantes:**

| Variante | Cambio en el flujo | Resultado esperado |
|----------|-------------------|-------------------|
| Error: título vacío | En paso 2, deja el título sin completar | El frontend muestra **"El título es obligatorio"** |
| Error: sin archivo o URL | En paso 2, selecciona "Archivo" sin adjuntar nada | El frontend muestra **"Selecciona un archivo"** (o **"Ingresa una URL"** si es tipo Enlace) |
| Error: archivo inválido | En paso 2, sube un archivo >25MB o de tipo no permitido | El frontend muestra **"El archivo supera el límite de 25 MB"** o **"Tipo de archivo no permitido"** |
| Alternativa: crear tipo Enlace | En paso 2, selecciona **"Enlace"** e ingresa una URL de Discord | La card muestra botón **"Unirse"** con estilo Discord (#5865F2) y la info del servidor |
| Alternativa: cancelar creación o eliminación | En paso 2 o 5, hace clic en **"Cancelar"** | El diálogo se cierra sin realizar cambios |
| Error: editar/eliminar con denuncias activas | En paso 4 o 5, el material tiene denuncias pendientes | Backend rechaza con *"No puedes editar/eliminar un material con denuncias pendientes o confirmadas."* |

---

## MAT-02 — Estudiante explora, califica y denuncia materiales

**Perfil:** Estudiante
**Precondiciones / Datos necesarios:**
- Sesión iniciada como estudiante
- Existen materiales creados por varios usuarios

| # | El usuario... | El sistema... |
|---|--------------|--------------|
| 1 | Escribe en el campo **"Buscar por título, tags o materia..."** | Filtra los materiales en tiempo real (debounce 300ms) por título, descripción, tags o materia |
| 2 | Selecciona una materia en el filtro desplegable | Muestra solo los materiales de esa materia |
| 3 | Selecciona **"Mejor valorados"** en el ordenamiento | Reordena la lista por upvotes descendente |
| 4 | Hace clic en el icono **upvote** de un material | Aumenta el contador de upvotes y el icono se destaca en color primario |
| 5 | Vuelve a hacer clic en el mismo **upvote** | El voto se elimina (toggle off), el contador disminuye y el icono vuelve a su estado normal |
| 6 | Hace clic en un material | Navega a `/materiales/:id` con detalle completo: título, descripción, materia, creador, tags, rating, fecha, tipo, y alertas de suspensión/denuncias |

**Variantes:**

| Variante | Cambio en el flujo | Resultado esperado |
|----------|-------------------|-------------------|
| Borde: sin resultados | En paso 1 o 2, no hay materiales que coincidan | Muestra **"No se encontraron materiales"** con el mensaje "No hay materiales disponibles con los filtros seleccionados." y botón **"Limpiar filtros"** |
| Error: fallo de red | Al cargar la página, el backend no responde | Muestra **"Error al cargar materiales"** con botón **"Reintentar"** |
| Permisos: material ajeno | En paso 4, abre el menú de un material que no le pertenece | El menú muestra **"Reportar"** (icono Flag). No aparecen opciones "Editar" ni "Eliminar" |
| Permisos: material suspendido | En paso 4, el material fue suspendido por denuncias | La card oculta URL, nombreArchivo y discordInfo. Muestra chip **"Suspendido"** (color error). El dueño ve "Ver detalle" en lugar de "Editar"/"Eliminar" |
| Alternativa: descargar/abrir | En paso 4, hace clic en **"Descargar"** (tipo file) o **"Abrir"** (tipo enlace) | Redirige a la URL de Cloudinary o al enlace externo |

---

## Notas

- Los IDs usan prefijo **MAT-** (Materiales), distinto de **MTR-** (Materias) para evitar conflictos.
- Los materiales se eliminan físicamente (hard delete), incluyendo archivos en Cloudinary. No hay baja lógica ni versionado.
- El formulario de creación permite tipo **Archivo** (PDF, DOC, PPT, XLS, JPG, PNG, ZIP) o **Enlace** (detección automática de YouTube, Drive, Dropbox, Discord, GitHub, Web).
- La suspensión de materiales es **automática** al superar los umbrales de denuncias configurados (N pendientes / M confirmadas). La moderación se documenta en el módulo Admin.
- La denuncia de materiales (opción **"Reportar"**) abre un diálogo que verifica si el usuario ya denunció antes, selecciona motivo y detalle opcional. Las denuncias se documentan en el módulo Denuncias.
- No existe filtro por tipo (Archivo/Enlace), por tags individuales, ni por carrera. Los tags solo son buscables mediante el campo de búsqueda textual.
- Los mensajes de error del backend (*cursiva*) se muestran cuando la validación de frontend no alcanza (ej: materia fuera del alcance del estudiante, edición con denuncias activas).
