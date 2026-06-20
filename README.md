# 📦 Instalación
npm install
npm run setup

# 🚀 Iniciar servidor API (en otra terminal)
git clone https://github.com/qaboxletstest/demo-api-testing.git
cd demo-api-testing
npm install
npm start

# 🧪 Ejecutar Tests
npm run test:api                    # Ejecutar todos los tests de API
npm run test:positive               # Ejecutar solo tests positivos
npm run test:negative               # Ejecutar solo tests negativos
npm run test:smoke                  # Ejecutar solo smoke tests
npx playwright test -g "TC-API-001" # Ejecutar un test específico

# 📊 Reportes
npm run report                      # Ver reporte HTML
npm run report:open                 # Abrir reporte en navegador
npm run report:json                 # Ver reporte JSON

# 🧹 Limpieza
npm run clean                       # Limpiar reportes
npm run clean:all                   # Limpiar todo (incluye node_modules)