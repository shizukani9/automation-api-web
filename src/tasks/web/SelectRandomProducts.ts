// src/tasks/web/SelectRandomProducts.ts
import { Actor } from '../../actors/Actor';
import { BrowseTheWeb } from '../../actors/abilities/BrowseTheWeb';
import { AdManager } from '../../utils/AdManager';

export interface ProductInfo {
  id: string;
  name: string;
  price: number;
  quantity: number;
  element: any;
}

export class SelectRandomProducts {
  private count: number;
  private selectedProducts: ProductInfo[] = [];

  constructor(count: number = 5) {
    this.count = count;
  }

  static count(count: number): SelectRandomProducts {
    return new SelectRandomProducts(count);
  }

  async performAs(actor: Actor): Promise<ProductInfo[]> {
    const ability = actor.abilityTo(BrowseTheWeb);
    const page = ability.getPage();

    // ✅ Verificar y cerrar anuncios antes de seleccionar productos
    await AdManager.ensureNoAds(page, '🔹 ');

    // ✅ Esperar que los productos estén visibles
    await page.waitForSelector('.product-image-wrapper', { state: 'visible', timeout: 10000 });

    // Obtener todos los productos visibles
    const productElements = await page.locator('.product-image-wrapper').all();

    console.log(`📦 ${productElements.length} productos encontrados en la página`);

    if (productElements.length === 0) {
      throw new Error('No se encontraron productos en la página');
    }

    // ✅ Seleccionar productos aleatorios
    const countToSelect = Math.min(this.count, productElements.length);
    const shuffled = productElements.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, countToSelect);

    this.selectedProducts = [];

    for (const element of selected) {
      // ✅ Obtener nombre del producto
      const nameElement = element.locator('.productinfo p');
      const name = await nameElement.textContent() || '';

      // ✅ Obtener precio
      const priceElement = element.locator('.productinfo h2');
      const priceText = await priceElement.textContent() || '0';
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));

      // ✅ Obtener ID del producto
      const addToCartBtn = element.locator('.productinfo .add-to-cart').first();
      const productId = await addToCartBtn.getAttribute('data-product-id') || '';

      // ✅ Generar cantidad aleatoria entre 1 y 10
      const quantity = Math.floor(Math.random() * 10) + 1;

      console.log(`  📦 Producto encontrado: ID ${productId}, Nombre: "${name}", Precio: Rs. ${price}`);

      this.selectedProducts.push({
        id: productId,
        name: name.trim(),
        price: price,
        quantity: quantity,
        element: element,
      });
    }

    // Guardar en memoria del actor
    actor.remember('selectedProducts', this.selectedProducts);

    console.log(`📦 ${this.selectedProducts.length} productos seleccionados:`);
    this.selectedProducts.forEach(p => {
      console.log(`  - ${p.name} (ID: ${p.id}) (${p.quantity}x) - Rs. ${p.price}`);
    });

    return this.selectedProducts;
  }

  getSelectedProducts(): ProductInfo[] {
    return this.selectedProducts;
  }
}