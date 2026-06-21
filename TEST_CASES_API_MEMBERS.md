# Casos de Prueba E2E - API Members

## TC-API-001: GET /api/members/:id - Obtener miembro existente

**Funcionalidad:** GET /api/members/:id

**Escenario:** Obtener miembro por ID existente

**Condición de entrada:** 
- ID: 1

**Resultado esperado:** 
- Status: 200 OK
- Body contiene: `{ "id": 1, "name": "Monil", "gender": "Female" }`
- Cumple con el JSON Schema de Member

**Técnica ISTQB:** EP (Partición de Equivalencia)

**Razón de la Técnica:** ID 1 existe en la base de datos (partición válida)

---

## TC-API-002: GET /api/members/:id - Obtener miembro inexistente

**Funcionalidad:** GET /api/members/:id

**Escenario:** Obtener miembro por ID no existente

**Condición de entrada:** 
- ID: 9999

**Resultado esperado:** 
- Status: 404 Not Found
- Mensaje de error controlado indicando que el miembro no existe

**Técnica ISTQB:** BVA / EP

**Razón de la Técnica:** ID fuera del rango de registros existentes (partición inválida). Se aplica BVA porque 9999 está fuera del límite superior de IDs válidos (1-4).

---

## TC-API-003: POST /api/members - Crear miembro con datos válidos

**Funcionalidad:** POST /api/members

**Escenario:** Crear nuevo miembro con datos válidos

**Condición de entrada:** 
```json
{
  "name": "Tatiana M",
  "gender": "Female"
}
```

**Resultado esperado:** 
- Status: 201 Created
- El cuerpo de respuesta coincide con los datos enviados
- Se asigna un ID único (ej: 5)
- La respuesta cumple con el JSON Schema de Member

**Técnica ISTQB:** EP (Partición de Equivalencia)

**Razón de la Técnica:** Todos los campos obligatorios con formatos correctos (partición válida). "Female" es un valor permitido para gender.

---

## TC-API-004: POST /api/members - Intentar crear con datos inválidos

**Funcionalidad:** POST /api/members

**Escenario:** Intentar crear miembro con datos faltantes o inválidos (Negativo)

**Condición de entrada:** 
```json
{
  "name": "",
  "gender": "Invalid"
}
```

**Resultado esperado:** 
- Status: 400 Bad Request
- Mensaje indicando los campos faltantes o inválidos

**Técnica ISTQB:** EP / BVA

**Razón de la Técnica:** 
- **EP:** "Invalid" no es "Male" ni "Female" (partición inválida para género)
- **BVA:** Nombre vacío (longitud 0) es el límite inferior inválido para el campo name

---

## TC-API-005: PUT /api/members/:id - Actualizar miembro existente

**Funcionalidad:** PUT /api/members/:id

**Escenario:** Actualizar un miembro existente con datos válidos

**Condición de entrada:** 
- ID: 1
```json
{
  "name": "Monil Actualizada",
  "gender": "Male"
}
```

**Resultado esperado:** 
- Status: 200 OK
- La respuesta refleja los nuevos valores
- Al consultar posteriormente con GET /api/members/1, retorna los datos actualizados
- Los cambios persisten en la base de datos

**Técnica ISTQB:** EP (Partición de Equivalencia)

**Razón de la Técnica:** ID existente (1) y payload con datos correctos (partición válida). "Male" es un valor permitido para gender.

---

## TC-API-006: PUT /api/members/:id - Intentar actualizar con datos inválidos

**Funcionalidad:** PUT /api/members/:id

**Escenario:** Intentar actualizar con datos vacíos o inválidos (Negativo)

**Condición de entrada:** 
- ID: 1
```json
{
  "name": "",
  "gender": ""
}
```

**Resultado esperado:** 
- Status: 400 Bad Request
- Mensaje de error indicando datos inválidos
- O mantiene los valores previos sin corromper la base de datos

**Técnica ISTQB:** BVA (Análisis de Valores Límite)

**Razón de la Técnica:** Campos con strings vacíos (longitud = 0) representan valores límites inválidos para ambos campos.

---

## TC-API-007: DELETE /api/members/:id - Eliminar miembro y verificar

**Funcionalidad:** DELETE /api/members/:id

**Escenario:** Eliminar un miembro existente y verificar posterior inexistencia

**Condición de entrada:** 
- ID del miembro creado en TC-API-003

**Resultado esperado:** 
- Status: 200 OK
- Al consultar posteriormente el mismo ID mediante GET, retorna 404 Not Found
- El miembro ya no aparece en la lista de GET /api/members

**Técnica ISTQB:** Transición de Estados

**Razón de la Técnica:** Se valida el ciclo de vida completo del recurso:
1. Estado inicial: No existe
2. Evento POST: Creado (TC-API-003)
3. Evento DELETE: Eliminado
4. Verificación: GET confirma inexistencia (404)

---

## TC-API-008: POST /api/upload - Cargar imagen

**Funcionalidad:** POST /api/upload

**Escenario:** Cargar una imagen PNG

**Condición de entrada:** 
- Archivo: `test_image.png`
- mime-type: `image/png`
- Tamaño: < 5MB (asumiendo límite estándar)

**Resultado esperado:** 
- Status: 200 OK o 201 Created
- La respuesta confirma la carga exitosa
- Se retorna el nombre del archivo guardado (ej: `test_image_123456.png`)

**Técnica ISTQB:** EP (Partición de Equivalencia)

**Razón de la Técnica:** Carga de archivo binario con formato soportado (partición válida). PNG es un formato de imagen aceptado.

---

## TC-API-009: GET /api/download/:filename - Descargar imagen

**Funcionalidad:** GET /api/download/:filename

**Escenario:** Descargar imagen previamente cargada

**Condición de entrada:** 
- Filename obtenido de TC-API-008 (ej: `test_image_123456.png`)

**Resultado esperado:** 
- Status: 200 OK
- La respuesta retorna el stream del archivo binario correcto
- Los headers incluyen: `Content-Type: image/png`, `Content-Disposition: attachment`
- El archivo descargado coincide en tamaño y contenido con el original

**Técnica ISTQB:** EP (Partición de Equivalencia)

**Razón de la Técnica:** Descarga de archivo existente en el servidor (partición válida). El filename existe porque fue creado en TC-API-008.

---

## Resumen de Casos de Prueba

| Tipo de Prueba | IDs | Cantidad |
|:---|:---|:---:|
| **Positivos (Happy Path)** | TC-API-001, TC-API-003, TC-API-005, TC-API-007, TC-API-008, TC-API-009 | 6 |
| **Negativos (Validaciones)** | TC-API-002, TC-API-004, TC-API-006 | 3 |
| **Total** | | **9** |

## Datos de Prueba Existentes

La API `GET /api/members` retorna los siguientes miembros:

| ID | Name | Gender |
|:---:|:---|:---:|
| 1 | Monil | Female |
| 2 | Ramona | Female |
| 3 | Lion | Male |
| 4 | Shawn | Male |

## Técnicas ISTQB Aplicadas

| Técnica | Casos Aplicados |
|:---|:---|
| **EP (Partición de Equivalencia)** | TC-API-001, TC-API-002, TC-API-003, TC-API-004, TC-API-005, TC-API-008, TC-API-009 |
| **BVA (Análisis de Valores Límite)** | TC-API-002, TC-API-004, TC-API-006 |
| **Transición de Estados** | TC-API-007 |