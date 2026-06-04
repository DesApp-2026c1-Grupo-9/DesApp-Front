# Feature: Materias y Correlatividades

> **Versión:** 1.0
> **Última actualización:** 2026-06-02
> **Responsable:** Equipo de Desarrollo

---

## Tabla de casos de prueba

### Creación de materias

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| MAT-01 | Admin crea materia exitosamente | Usuario logueado como administrador. | el admin completa el formulario de nueva materia | ingresa nombre, selecciona tipo (anual/cuatrimestral), carga horaria y hace clic en "Crear" | la materia aparece en el listado | Backend responde 201 POST /api/materias. | nombre: "Álgebra Lineal", tipo: "cuatrimestral", cargaHoraria: 120 | Administrador | Feliz | — |
| MAT-02 | Admin crea materia y la asigna a un plan | Existe un plan de estudio. | el admin completa el formulario | además ingresa un planId | la materia se crea y se asocia al plan | Backend crea la materia y luego PlanMateria.create. Si el plan no existe, hace rollback (destroy materia) y responde 404. | nombre: "Cálculo I", planId: 1 | Administrador | Feliz | CAR-13 |
| MAT-03 | Admin crea materia sin nombre o tipo | — | el admin intenta crear una materia | deja nombre o tipo vacío | el sistema muestra "El nombre y tipo son obligatorios" | Backend responde 400. | nombre: "" | Administrador | Error | — |
| MAT-04 | Admin crea materia con tipo inválido | — | el admin envía un tipo no válido | envía POST con tipo "trimestral" | el sistema muestra "El tipo debe ser anual o cuatrimestral" | Backend responde 400. | tipo: "trimestral" | Administrador | Error | — |
| MAT-05 | Admin crea materia con carga horaria inválida | — | el admin ingresa carga horaria 0 o negativa | envía POST con cargaHoraria: 0 | el sistema muestra "La carga horaria es obligatoria y debe ser mayor a 0" | Backend responde 400. | cargaHoraria: 0 | Administrador | Error | — |

### Listado y búsqueda

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| MAT-06 | Admin ve lista de materias paginada | Existen materias cargadas. | el admin accede al listado | envía GET /api/materias | recibe materias con sus carreras asociadas | Backend devuelve data con id, nombre, tipo, cargaHoraria, carreras. Soporta paginación y ordenamiento. | — | Administrador | Feliz | MAT-01 |
| MAT-07 | Admin busca materias por nombre | — | el admin escribe en la búsqueda | envía GET /api/materias?search=algebra | solo se muestran materias con "algebra" en el nombre | Backend filtra con Op.iLike. | search: "algebra" | Administrador | Feliz | MAT-06 |
| MAT-08 | Admin filtra materias por tipo | — | el admin selecciona un tipo | envía GET /api/materias?tipo=anual | solo se muestran materias anuales | — | tipo: anual | Administrador | Feliz | MAT-06 |
| MAT-09 | Admin filtra materias por carrera | Existe una carrera con materias asignadas. | el admin selecciona una carrera | envía GET /api/materias?carreraId=1 | solo se muestran materias de esa carrera | Backend agrega filtro en el include de Carrera. | carreraId: 1 | Administrador | Feliz | CAR-18, MAT-06 |

### Ver detalle

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| MAT-10 | Admin ve detalle de materia con correlatividades | Existe una materia con prerrequisitos y materias dependientes. | el admin consulta una materia | envía GET /api/materias/:id | recibe la materia con carreras, prerrequisitos y materias dependientes | Backend incluye Carreras, Prerrequisitos (through Correlatividades) y materiasDependientes (las que tienen esta como prerrequisito). | — | Administrador | Feliz | MAT-01 |
| MAT-11 | Admin consulta materia inexistente | — | el admin busca un ID inválido | envía GET /api/materias/99999 | el sistema muestra "No se encontró una materia con id 99999" | Backend responde 404. | id: 99999 | Administrador | Error | — |

### Edición

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| MAT-12 | Admin actualiza una materia | Existe una materia. | el admin modifica nombre y carga horaria | envía PUT /api/materias/:id | la materia se actualiza | Backend responde 200. Solo actualiza campos enviados. | cargaHoraria: 150 | Administrador | Feliz | MAT-01 |
| MAT-13 | Admin actualiza materia con tipo inválido | — | el admin intenta cambiar a tipo inválido | envía PUT con tipo "trimestral" | el sistema muestra "El tipo debe ser anual o cuatrimestral" | Backend responde 400. | tipo: "trimestral" | Administrador | Error | MAT-12 |

### Eliminación

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| MAT-14 | Admin elimina materia sin dependencias | Existe una materia que no es prerrequisito de otras. | el admin elimina la materia | envía DELETE /api/materias/:id | la materia se elimina | — | — | Administrador | Feliz | MAT-01 |
| MAT-15 | Admin intenta eliminar materia que es prerrequisito | Existe una materia que es prerrequisito de otras. | el admin intenta eliminar la materia | envía DELETE | el sistema muestra "No se puede eliminar la materia porque es prerrequisito de otras materias" | Backend responde 409 con dependientesCount. | — | Administrador | Límite | MAT-01, MAT-16 |

### Correlatividades

| ID | Título del caso | Precondiciones | Dado | Cuando | Entonces | Resultado detallado | Datos de ejemplo | Perfil | Variante | Dependencias |
|---|---|---|---|---|---|---|---|---|---|---|
| MAT-16 | Admin consulta correlatividades de una materia | Existe una materia con prerrequisitos y dependientes configurados. | el admin consulta las correlatividades | envía GET /api/materias/:materiaId/correlatividades | recibe la materia con sus prerrequisitos y materias dependientes | Backend devuelve: materia (id, nombre, tipo), prerrequisitos (array), dependientes (array). | — | Administrador | Feliz | MAT-01 |

---

## Resumen de variantes

| Variante | Cantidad | IDs |
|---|---|---|
| Feliz | 10 | MAT-01, MAT-02, MAT-06, MAT-07, MAT-08, MAT-09, MAT-10, MAT-12, MAT-14, MAT-16 |
| Error | 4 | MAT-03, MAT-04, MAT-05, MAT-11, MAT-13 |
| Límite | 1 | MAT-15 |

---

## Notas

- Los IDs con prefijo `MAT-XX` corresponden al módulo Materias (no confundir con el módulo Materiales, que usa `MAT-` como prefijo en su archivo).
- Las correlatividades se gestionan a través de endpoints de administración/configuración adicional (no incluidos en este sprint).
- La eliminación de una materia está bloqueada si existen otras materias que la tienen como prerrequisito.
