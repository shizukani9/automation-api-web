// src/tests/web/purchaseFlow.spec.ts
import { test, expect } from '@playwright/test';
import { Actor } from '../../actors/Actor';
import { BrowseTheWeb } from '../../actors/abilities/BrowseTheWeb';
import { NavigateTo } from '../../tasks/web/NavigateTo';
import { SelectCategory } from '../../tasks/web/SelectCategory';
import { SelectRandomProducts } from '../../tasks/web/SelectRandomProducts';
import { AddProductsToCart } from '../../tasks/web/AddProductsToCart';
import { VerifyCart } from '../../tasks/web/VerifyCart';
import { AdManager } from '../../utils/AdManager';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.BASE_URL_FRONT || 'https://automationexercise.com';

test.describe.configure({ mode: 'serial' });

test.describe('TC-WEB: Flujo de Compra - Automation Exercise', () => {
  let actor: Actor;

  test.beforeEach(async ({ page }) => {
    actor = Actor.called('Customer');
    actor.can(BrowseTheWeb.as(page, BASE_URL));

    console.log('🔧 Iniciando setup...');

    // ✅ Esperar un poco antes de navegar
    await page.waitForTimeout(1000);

    // ✅ Navegar al homepage (NavigateTo ya maneja redirecciones)
    await actor.attemptsTo(NavigateTo.homepage());

    // ✅ Verificar y cerrar anuncios
    await AdManager.ensureNoAds(page, '🔹 ');

    // ✅ Verificar que estamos en la URL correcta
    const currentUrl = page.url();
    if (currentUrl.includes('hbomax') || currentUrl.includes('doubleclick')) {
      console.log(`⚠️ URL incorrecta: ${currentUrl}, forzando navegación...`);
      await page.goto('https://automationexercise.com', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      await AdManager.closeAds(page, '🔹 ');
    }

    // ✅ Intentar esperar el header, pero si no aparece, continuar de todas formas
    try {
      await page.waitForSelector('header', { state: 'visible', timeout: 10000 });
      console.log('✅ Header visible');
    } catch {
      console.log('⚠️ Header no visible, intentando cerrar anuncios y recargar...');
      await AdManager.closeAds(page, '🔹 ');
      await page.reload();
      await page.waitForTimeout(1000);
      await AdManager.closeAds(page, '🔹 ');

      // Verificar nuevamente
      try {
        await page.waitForSelector('header', { state: 'visible', timeout: 5000 });
        console.log('✅ Header visible después de recargar');
      } catch {
        console.log('⚠️ Header aún no visible, pero continuamos...');
      }
    }

    console.log('✅ Setup completado');
  });

  test('TC-WEB-001: Comprar productos aleatorios con cantidades variables - @smoke @web @positive', async ({ page }) => {
    console.log('\n🚀 Iniciando TC-WEB-001...');

    // ✅ Verificar URL antes de comenzar
    const currentUrl = page.url();
    if (!currentUrl.includes('automationexercise.com') || currentUrl.includes('hbomax')) {
      console.log(`⚠️ URL incorrecta: ${currentUrl}, navegando a la página principal...`);
      await page.goto('https://automationexercise.com', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      await AdManager.closeAds(page, '🔹 ');
    }

    // 1. Seleccionar categoría y subcategoría aleatoria
    const { category, subcategory } = SelectCategory.getRandomCategory();
    console.log(`📂 Seleccionando: ${category} → ${subcategory}`);

    await actor.attemptsTo(SelectCategory.andSubcategory(category, subcategory));
    await AdManager.ensureNoAds(page, '🔹 ');

    // 2. Seleccionar 5 productos aleatorios
    console.log('🎲 Seleccionando 5 productos aleatorios...');
    const selectedProducts = await actor.attemptsTo(SelectRandomProducts.count(5));
    await AdManager.ensureNoAds(page, '🔹 ');

    // 3. Agregar los productos al carrito
    console.log('🛒 Agregando productos al carrito...');
    await actor.attemptsTo(AddProductsToCart.all(selectedProducts));
    await AdManager.ensureNoAds(page, '🔹 ');

    // 4. Verificar el carrito
    console.log('✅ Verificando carrito...');
    await actor.attemptsTo(VerifyCart.withData(selectedProducts));

    console.log('✅ TC-WEB-001 completado exitosamente\n');
  });

  test.afterEach(async ({ page }) => {
    try {
      console.log('🧹 Realizando limpieza...');
      await AdManager.closeAds(page, '🔹 ');
      await actor.attemptsTo(NavigateTo.homepage());
      console.log('✅ Limpieza completada');
    } catch {
      console.log('⚠️ Limpieza completada con advertencias');
    }
  });
});