# ═══════════════════════════════════════════════════════════
# 📦 INSTALACIÓN Y CONFIGURACIÓN
# ═══════════════════════════════════════════════════════════

# Instalar dependencias y navegadores
npm run setup

# Clonar repositorio API e instalar dependencias (PARTE 2)
npm run setup:api

# Levantar servidor API (en otra terminal)
npm run start:api

# ═══════════════════════════════════════════════════════════
# 🧪 EJECUCIÓN DE TESTS
# ═══════════════════════════════════════════════════════════

# Ejecutar todos los tests
npm test
npm run test:all

# Ejecutar tests WEB (PARTE 1)
npm run test:web

# Ejecutar tests API (PARTE 2)
npm run test:api

# Ejecutar con navegador visible
npm run test:headed

# Ejecutar tests por tags
npm run test:smoke     # Tests críticos
npm run test:positive  # Tests positivos
npm run test:negative  # Tests negativos

# Ejecutar un test específico por nombre
npx playwright test -g "TC-API-001"

# ═══════════════════════════════════════════════════════════
# 📊 REPORTES
# ═══════════════════════════════════════════════════════════

# Ver reporte HTML
npm run report

# Abrir reporte en navegador
npm run report:open

# Ver reporte JSON
npm run report:json

# ═══════════════════════════════════════════════════════════
# 🧹 LIMPIEZA
# ═══════════════════════════════════════════════════════════

# Limpiar reportes y evidencias
npm run clean

# Limpiar todo (incluye node_modules)
npm run clean:all

# Eliminar repositorio API clonado
npm run clean:api