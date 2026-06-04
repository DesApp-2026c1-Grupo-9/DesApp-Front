# Feature: Carreras y Planes de Estudio

> **Versión:** 1.0
> **Última actualización:** 2026-06-02
> **Responsable:** Equipo de Desarrollo

---

## Tabla de casos de prueba

### Creación de carreras

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| CAR-01 | Admin crea carrera exitosamente | Usuario logueado como administrador. | el admin está en el panel de gestión académica | completa nombre, título, instituto, duración y hace clic en "Crear" | la carrera aparece en la lista | Backend responde 201 POST /api/carreras. | nombre: "Lic. en Matemática", titulo: "Licenciado en Matemática", instituto: "Ciencias", duración: 5 | Administrador | Feliz | — |
| CAR-02 | Admin crea carrera sin nombre o título | — | el admin intenta crear una carrera | deja nombre o título vacío | el sistema muestra "El nombre y el título son obligatorios" | Backend responde 400. | nombre: "" | Administrador | Error | — |
| CAR-03 | Admin crea carrera con nombre duplicado | Ya existe una carrera con ese nombre. | el admin intenta crear una carrera con nombre existente | completa el formulario y guarda | el sistema muestra "Ya existe una carrera con el nombre X" | Backend responde 409. | nombre: "Lic. en Matemática" (existente) | Administrador | Error | CAR-01 |

### Listado y búsqueda

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| CAR-04 | Admin ve lista de carreras paginada | Existen carreras cargadas. | el admin accede al listado | envía GET /api/carreras | recibe carreras con sus planes de estudio, total de materias y carga horaria | Backend devuelve data con id, nombre, titulo, instituto, duracion, planesEstudio (con id, nombre, estado, totalMaterias, cargaHoraria). | — | Administrador | Feliz | CAR-01 |
| CAR-05 | Admin busca carreras por nombre | Existen carreras con nombres variados. | el admin escribe en el campo de búsqueda | envía GET /api/carreras?search=matem | solo se muestran carreras cuyo nombre contiene "matem" | Backend filtra con Op.iLike. | search: "matem" | Administrador | Feliz | CAR-04 |
| CAR-06 | Admin filtra carreras por instituto | Existen carreras en distintos institutos. | el admin selecciona un instituto | envía GET /api/carreras?instituto=Ciencias | solo se muestran carreras de ese instituto | — | instituto: "Ciencias" | Administrador | Feliz | CAR-04 |
| CAR-07 | Admin filtra carreras por duración | — | el admin selecciona una duración | envía GET /api/carreras?duracion=5 | solo se muestran carreras de 5 años | — | duracion: 5 | Administrador | Feliz | CAR-04 |

### Ver detalle

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| CAR-08 | Admin ve detalle de carrera con plan vigente | Existe una carrera con plan de estudio vigente. | el admin consulta una carrera | envía GET /api/carreras/:id | recibe la carrera con su plan vigente y materias organizadas por año | Backend incluye PlanDeEstudio con estado "vigente" y materias agrupadas por anio. | — | Administrador | Feliz | CAR-01, CAR-11 |
| CAR-09 | Admin consulta carrera inexistente | — | el admin busca un ID inválido | envía GET /api/carreras/99999 | el sistema muestra "No se encontró una carrera con id 99999" | Backend responde 404. | id: 99999 | Administrador | Error | — |

### Edición

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| CAR-10 | Admin actualiza una carrera | Existe una carrera. | el admin modifica los datos | envía PUT /api/carreras/:id | la carrera se actualiza | Backend responde 200. Si cambia nombre, verifica duplicado. | nombre: "Lic. en Matemática (Actualizado)" | Administrador | Feliz | CAR-01 |

### Eliminación

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| CAR-11 | Admin elimina carrera sin planes asociados | Existe una carrera sin planes de estudio. | el admin elimina la carrera | envía DELETE /api/carreras/:id | la carrera se elimina | — | — | Administrador | Feliz | — |
| CAR-12 | Admin intenta eliminar carrera con planes asociados | Existe una carrera que tiene planes de estudio. | el admin intenta eliminar la carrera | envía DELETE | el sistema muestra "No se puede eliminar la carrera porque tiene planes de estudio asociados" | Backend responde 409 con planesCount. | — | Administrador | Límite | CAR-01, CAR-13 |

### Planes de estudio

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| CAR-13 | Admin crea plan de estudio para una carrera | Existe una carrera. Existen materias en el sistema. | el admin selecciona una carrera y hace clic en "Crear plan" | ingresa nombre del plan y lo crea como "vigente" | el plan se crea y se descontinúan los planes anteriores | Backend POST /api/carreras/:carreraId/planes. Si es vigente, los planes previos pasan a discontinuado/transición. Se heredan las materias del plan vigente anterior. | nombre: "Plan 2026" | Administrador | Feliz | CAR-01, MAT-01 |
| CAR-14 | Admin crea plan sin nombre | — | el admin intenta crear un plan | deja nombre vacío | el sistema muestra "El nombre del plan es obligatorio" | Backend responde 400. | nombre: "" | Administrador | Error | — |
| CAR-15 | Admin ve planes de una carrera | Existe una carrera con múltiples planes. | el admin consulta los planes | envía GET /api/carreras/:carreraId/planes | recibe todos los planes con sus materias asociadas | Backend devuelve array de planes con id, nombre, estado, materias, totalMaterias. | — | Administrador | Feliz | CAR-13 |
| CAR-16 | Admin actualiza plan de estudio | Existe un plan. | el admin cambia el estado de un plan | envía PUT /api/carreras/:carreraId/planes/:planId | el plan se actualiza | Si se pasa a "vigente", los planes vigentes/transición previos se reordenan automáticamente. | estado: "discontinuado" | Administrador | Feliz | CAR-13 |
| CAR-17 | Admin elimina un plan de estudio | Existe un plan sin restricciones. | el admin elimina el plan | envía DELETE /api/carreras/:carreraId/planes/:planId | el plan se elimina | — | — | Administrador | Feliz | CAR-13 |

### Asignación de materias a carrera

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| CAR-18 | Admin asigna materias a una carrera | Existe una carrera y existen materias. | el admin selecciona materias y las asigna a la carrera | envía POST /api/carreras/:id/materias con array de materiaIds | las materias quedan asignadas a la carrera | Backend reemplaza todas las asignaciones (destroy + bulkCreate). | materiaIds: [1, 2, 3] | Administrador | Feliz | CAR-01, MAT-01 |
| CAR-19 | Admin ve materias asignadas a una carrera | Existe una carrera con materias asignadas. | el admin consulta las materias de una carrera | envía GET /api/carreras/:id/materias | recibe la lista de materias asignadas | — | — | Administrador | Feliz | CAR-18 |
| CAR-20 | Admin desasigna una materia de una carrera | Existe una carrera con materias asignadas. | el admin remueve una materia específica | envía DELETE /api/carreras/:id/materias/:materiaId | la materia se desasigna | — | — | Administrador | Feliz | CAR-18 |

### Asignación de materias a plan de estudio

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| CAR-21 | Admin agrega materia a un plan de estudio | Existe un plan. La materia está asignada a la carrera del plan. | el admin agrega una materia al plan | envía POST /api/carreras/:carreraId/planes/:planId/materias | la materia se agrega al plan | Backend verifica que la materia esté asignada a la carrera. Responde 201. | materiaId: 1, anio: 2 | Administrador | Feliz | CAR-18, CAR-13 |
| CAR-22 | Admin agrega materia no asignada a la carrera | La materia existe pero no está asignada a la carrera del plan. | el admin intenta agregarla al plan | envía POST | el sistema muestra "La materia no está asignada a esta carrera" | Backend responde 400. | — | Administrador | Error | CAR-21 |
| CAR-23 | Admin agrega materia duplicada al plan | La materia ya está en el plan. | el admin intenta agregarla nuevamente | envía POST | el sistema muestra "La materia ya está en el plan" | Backend responde 409. | — | Administrador | Límite | CAR-21 |
| CAR-24 | Admin remueve materia de un plan | La materia está asignada al plan. | el admin remueve la materia del plan | envía DELETE /api/carreras/:carreraId/planes/:planId/materias/:materiaId | la materia se remueve del plan | Backend responde 200. | — | Administrador | Feliz | CAR-21 |
| CAR-25 | Admin ve materias de un plan (paginado) | El plan tiene materias asignadas. | el admin consulta las materias | envía GET /api/carreras/:carreraId/planes/:planId/materias | recibe las materias paginadas con año, nombre, tipo, carga horaria | Backend soporta sort por nombre, tipo, anio. | sort: "anio", dir: "asc" | Administrador | Feliz | CAR-21 |

---

## Resumen de variantes

| Variante | Cantidad | IDs |
|---|---|---|
| Feliz | 14 | CAR-01, CAR-04, CAR-05, CAR-06, CAR-07, CAR-08, CAR-10, CAR-11, CAR-13, CAR-15, CAR-16, CAR-17, CAR-18, CAR-19, CAR-20, CAR-21, CAR-24, CAR-25 |
| Error | 4 | CAR-02, CAR-03, CAR-09, CAR-14, CAR-22 |
| Límite | 2 | CAR-12, CAR-23 |

---

## Notas

- Los IDs con prefijo `CAR-XX` corresponden al módulo Carreras.
- Este módulo es transversal a Materias, Estudiantes y Planes de Estudio.
- La creación de un plan vigente reordena automáticamente los estados de los planes existentes (vigente → transición, transición → discontinuado).
- Las materias deben estar asignadas a la carrera antes de poder agregarlas a un plan de estudio.
