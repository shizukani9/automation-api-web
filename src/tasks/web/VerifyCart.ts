// src/tasks/web/VerifyCart.ts
import { Actor } from '../../actors/Actor';
import { BrowseTheWeb } from '../../actors/abilities/BrowseTheWeb';
import { NavigateTo } from './NavigateTo';
import { ProductInfo } from './SelectRandomProducts';
import { expect } from '@playwright/test';

export class VerifyCart {
  private expectedProducts: ProductInfo[];
  private actualCartItems: any[] = [];

  constructor(expectedProducts: ProductInfo[]) {
    this.expectedProducts = expectedProducts;
  }

  static withData(products: ProductInfo[]): VerifyCart {
    return new VerifyCart(products);
  }

  async performAs(actor: Actor): Promise<boolean> {
    const ability = actor.abilityTo(BrowseTheWeb);
    const page = ability.getPage();

    // Navegar al carrito
    await actor.attemptsTo(
      NavigateTo.cart()
    );

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Obtener todos los items del carrito
    const cartRows = await page.locator('#cart_info tbody tr').all();
    
    console.log(`📋 ${cartRows.length} productos en el carrito`);

    // Extraer información de cada item
    this.actualCartItems = [];
    let totalItems = 0;
    let totalPrice = 0;

    for (const row of cartRows) {
      const name = await row.locator('.cart_description h4 a').textContent() || '';
      const quantityText = await row.locator('.cart_quantity button').textContent() || '0';
      const quantity = parseInt(quantityText);
      const priceText = await row.locator('.cart_price p').textContent() || '0';
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
      const totalText = await row.locator('.cart_total p').textContent() || '0';
      const total = parseFloat(totalText.replace(/[^0-9.]/g, ''));

      this.actualCartItems.push({
        name: name.trim(),
        quantity: quantity,
        price: price,
        total: total,
      });

      totalItems += quantity;
      totalPrice += total;
    }

    // Obtener el total general del carrito
    let generalTotal = 0;
    try {
      const totalElement = await page.locator('.cart_total_amount .cart_total_price');
      if (await totalElement.isVisible()) {
        const totalText = await totalElement.textContent() || '0';
        generalTotal = parseFloat(totalText.replace(/[^0-9.]/g, ''));
      }
    } catch {
      console.log('⚠️ No se encontró el total general');
    }

    console.log(`💰 Total general: Rs. ${generalTotal}`);

    // ============================================================
    // VALIDACIONES
    // ============================================================

    // ✅ V1: Validar que los nombres coinciden
    const expectedNames = this.expectedProducts.map(p => p.name);
    const actualNames = this.actualCartItems.map(item => item.name);
    
    console.log('\n📝 V1 - Validando nombres:');
    console.log(`  Esperados: ${expectedNames.join(', ')}`);
    console.log(`  Actuales:  ${actualNames.join(', ')}`);
    expect(actualNames.sort()).toEqual(expectedNames.sort());

    // ✅ V2: Validar que las cantidades coinciden
    console.log('\n📝 V2 - Validando cantidades:');
    for (const expected of this.expectedProducts) {
      const actual = this.actualCartItems.find(item => item.name === expected.name);
      console.log(`  ${expected.name}: esperado ${expected.quantity}, actual ${actual?.quantity}`);
      expect(actual?.quantity).toBe(expected.quantity);
    }

    // ✅ V3: Validar que el total de precios coincide
    let expectedTotal = 0;
    for (const product of this.expectedProducts) {
      expectedTotal += product.price * product.quantity;
    }
    
    let actualTotal = 0;
    for (const item of this.actualCartItems) {
      actualTotal += item.price * item.quantity;
    }

    console.log('\n📝 V3 - Validando total:');
    console.log(`  Esperado: Rs. ${expectedTotal}`);
    console.log(`  Actual:   Rs. ${actualTotal}`);
    expect(actualTotal).toBe(expectedTotal);

    // ✅ V4: Validar que el número total de items coincide
    const expectedTotalItems = this.expectedProducts.reduce((sum, p) => sum + p.quantity, 0);
    const actualTotalItems = this.actualCartItems.reduce((sum, item) => sum + item.quantity, 0);

    console.log('\n📝 V4 - Validando total de items:');
    console.log(`  Esperado: ${expectedTotalItems}`);
    console.log(`  Actual:   ${actualTotalItems}`);
    expect(actualTotalItems).toBe(expectedTotalItems);

    console.log('\n✅ Todas las validaciones pasaron correctamente!');
    console.log(`📊 Resumen: ${this.actualCartItems.length} productos, ${actualTotalItems} items, Rs. ${actualTotal}`);

    return true;
  }

  getCartItems(): any[] {
    return this.actualCartItems;
  }
}