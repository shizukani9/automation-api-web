// src/tests/web/purchaseFlow.spec.ts - Versión simplificada
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

    // Setup simple
    await page.waitForTimeout(1000);
    await actor.attemptsTo(NavigateTo.homepage());
    await AdManager.ensureNoAds(page, '🔹 ');
    await page.waitForSelector('header', { state: 'visible', timeout: 10000 });
  });

  test('TC-WEB-001: Comprar productos aleatorios con cantidades variables - @smoke @web @positive', async ({ page }) => {
    const { category, subcategory } = SelectCategory.getRandomCategory();
    console.log(`📂 Seleccionando: ${category} → ${subcategory}`);

    await actor.attemptsTo(SelectCategory.andSubcategory(category, subcategory));
    await AdManager.ensureNoAds(page, '🔹 ');

    const selectedProducts = await actor.attemptsTo(SelectRandomProducts.count(5));
    await AdManager.ensureNoAds(page, '🔹 ');

    await actor.attemptsTo(AddProductsToCart.all(selectedProducts));
    await AdManager.ensureNoAds(page, '🔹 ');

    await actor.attemptsTo(VerifyCart.withData(selectedProducts));
  });

  test.afterEach(async ({ page }) => {
    await AdManager.closeAds(page, '🔹 ');
  });
});