# Feature: Materias

> Versión: 1.0 | Última actualización: 2026-06-24 | Responsable: DesApp Grupo 9

---

## MTR-01 — Admin gestiona materias del sistema

**Perfil:** Administrador
**Precondiciones / Datos necesarios:**
- Sesión iniciada como administrador
- Existe al menos una materia que es prerrequisito de otra (para probar eliminación bloqueada)

| # | El usuario... | El sistema... |
|---|--------------|--------------|
| 1 | Abre el panel de administración, va a la pestaña **"Académico"** y hace clic en **"Materias"** | Muestra **"Gestión de Materias"** con la tabla de materias ordenable por Nombre y Tipo |
| 2 | Hace clic en **"Nueva Materia"**, completa nombre="Álgebra", tipo="Cuatrimestral", cargaHoraria=6 y hace clic en **"Crear"** | Valida los campos. Si todo está completo, crea la materia, la agrega a la tabla con resaltado por 4 segundos y muestra snackbar **"Materia creada"** |
| 3 | Hace clic en el icono **lápiz** (Editar) de una materia, cambia el nombre y hace clic en **"Guardar"** | Muestra snackbar **"Materia actualizada"**. La tabla se refresca |
| 4 | Hace clic en el icono **papelera** (Eliminar) de una materia que **NO** es prerrequisito de otra | Muestra un diálogo **"Confirmar Eliminación"** con el mensaje "¿Estás seguro de que deseas eliminar la materia {nombre}?" |
| 5 | Hace clic en **"Eliminar"** en el diálogo | Elimina la materia y la quita de la tabla. Muestra snackbar **"Materia eliminada"** |
| 6 | Hace clic en el icono **papelera** de una materia que **SÍ** es prerrequisito de otra | Muestra snackbar con el error: *"No se puede eliminar la materia porque es prerrequisito de otras materias"* |

**Variantes:**

| Variante | Cambio en el flujo | Resultado esperado |
|----------|-------------------|-------------------|
| Error: campos obligatorios | En paso 2, deja Nombre vacío o carga horaria ≤ 0 | El backend rechaza con *"El nombre y tipo son obligatorios"* o *"La carga horaria debe ser mayor a 0"* |
| Borde: sin resultados de búsqueda | En paso 1, escribe un texto en el campo **"Buscar materia por nombre..."** que no coincide | La tabla muestra **"No hay materias registradas"** |
| Alternativa: cancelar creación | En paso 2, hace clic en **"Cancelar"** en el modal | El modal se cierra sin crear nada |
| Alternativa: cancelar eliminación | En paso 4, hace clic en **"Cancelar"** en el diálogo | El diálogo se cierra sin eliminar |
| Error: eliminar materia inexistente | En paso 4, intenta eliminar una materia que otro admin ya borró | El backend responde *"No se encontró una materia con id {id}"* |

---

## Notas

- La gestión de materias está en la pestaña **"Académico"** del panel de administración, junto a Carreras y Planes.
- El formulario de crear/editar **no incluye campo para asignar a un plan** ni para gestionar correlatividades — esas funciones no existen actualmente en el frontend.
- El backend soporta la creación de una materia asociada a un plan (`planId`), pero el frontend no expone ese campo. La asociación materia–plan se hace desde la gestión de Planes.
- No existe vista de detalle de una materia individual ni interfaz para gestionar correlatividades (prerrequisitos) desde el frontend.
- El ordenamiento por columna **"Carreras"** no funciona: el frontend envía `sort: "carreras"` pero el backend solo acepta `"nombre"` y `"tipo"`.
- La advertencia en el diálogo de eliminación dice *"Si la materia está asignada a algún plan, no podrá eliminarse"*, pero el backend bloquea solo si la materia es **prerrequisito de otra** (no por estar en un plan).
