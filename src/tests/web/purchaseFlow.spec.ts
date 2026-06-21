// src/tests/web/purchaseFlow.spec.ts
import { test, expect } from '@playwright/test';
import { Actor } from '../../actors/Actor';
import { BrowseTheWeb } from '../../actors/abilities/BrowseTheWeb';
import { NavigateTo } from '../../tasks/web/NavigateTo';
import { SelectCategory } from '../../tasks/web/SelectCategory';
import { SelectRandomProducts } from '../../tasks/web/SelectRandomProducts';
import { AddProductsToCart } from '../../tasks/web/AddProductsToCart';
import { VerifyCart } from '../../tasks/web/VerifyCart';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.BASE_URL_FRONT || 'https://automationexercise.com';

test.describe.configure({ mode: 'serial' });

test.describe('TC-WEB: Flujo de Compra - Automation Exercise', () => {
  let actor: Actor;

  test.beforeEach(async ({ page }) => {
    actor = Actor.called('Customer');
    actor.can(BrowseTheWeb.as(page, BASE_URL));
    
    // Navegar al homepage
    await actor.attemptsTo(
      NavigateTo.homepage()
    );
  });

  // ============================================================
  // TC-WEB-001: Flujo de compra completo
  // ============================================================
  test('TC-WEB-001: Comprar productos aleatorios con cantidades variables - @smoke @web @positive', async () => {
    // 1. Seleccionar categoría y subcategoría aleatoria
    const { category, subcategory } = SelectCategory.getRandomCategory();
    console.log(`📂 Seleccionando: ${category} → ${subcategory}`);
    
    await actor.attemptsTo(
      SelectCategory.andSubcategory(category, subcategory)
    );

    // 2. Seleccionar 5 productos aleatorios
    console.log('🎲 Seleccionando 5 productos aleatorios...');
    const selectedProducts = await actor.attemptsTo(
      SelectRandomProducts.count(5)
    );

    // 3. Agregar los productos al carrito con sus cantidades
    console.log('🛒 Agregando productos al carrito...');
    await actor.attemptsTo(
      AddProductsToCart.all(selectedProducts)
    );

    // 4. Verificar el carrito
    /*console.log('✅ Verificando carrito...');
    await actor.attemptsTo(
      VerifyCart.withData(selectedProducts)
    );*/
  });

  // ============================================================
  // TC-WEB-002: Carrito vacío
  // ============================================================
  test('TC-WEB-002: Verificar carrito vacío - @web @regression', async () => {
    await actor.attemptsTo(
      NavigateTo.cart()
    );

    const page = actor.abilityTo(BrowseTheWeb).getPage();
    
    // Verificar que el carrito está vacío
    const emptyMessage = await page.locator('#cart_info tbody tr').count();
    expect(emptyMessage).toBe(0);
    
    console.log('✅ Carrito vacío correctamente');
  });
});