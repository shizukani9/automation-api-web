## Casos de Prueba - Automatización Web

### TC-WEB-001: Flujo de compra completo

| **Funcionalidad** | Flujo de compra en Automation Exercise |
|:---|:---|
| **Escenario** | Seleccionar categoría, elegir 5 productos aleatorios con cantidades aleatorias y agregar al carrito |
| **Condición de entrada** | Navegar a https://automationexercise.com y seleccionar una categoría (Women, Men o Kids) y una subcategoría |
| **Resultado esperado** | 1. Se seleccionan 5 productos aleatorios<br>2. Cada producto tiene cantidad aleatoria entre 1 y 10<br>3. Los productos se agregan al carrito<br>4. El carrito muestra los productos con las cantidades correctas<br>5. El total de precios coincide con la suma de (precio × cantidad)<br>6. El número total de items coincide con la suma de todas las cantidades |
| **Técnica ISTQB** | **EP (Partición de Equivalencia):** Categoría válida, selección de 5 productos<br>**BVA (Análisis de Valores Límite):** Cantidades entre 1 (límite inferior) y 10 (límite superior) |

### Validaciones en el carrito

| # | Validación | Descripción |
|:---|:---|:---|
| **V1** | Nombres de productos | El nombre de cada producto agregado debe coincidir con el mostrado en el carrito |
| **V2** | Cantidades | Las cantidades asignadas deben coincidir con las mostradas en el carrito |
| **V3** | Total de precios | La suma de (precio × cantidad) debe coincidir con el total mostrado |
| **V4** | Número total de items | La suma de todas las cantidades debe coincidir con el total mostrado |