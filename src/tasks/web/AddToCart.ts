// src/tasks/web/AddToCart.ts
import { Actor } from '../../actors/Actor';
import { BrowseTheWeb } from '../../actors/abilities/BrowseTheWeb';
import { ProductInfo } from './SelectRandomProducts';

export class AddToCart {
  private product: ProductInfo;

  constructor(product: ProductInfo) {
    this.product = product;
  }

  static product(product: ProductInfo): AddToCart {
    return new AddToCart(product);
  }

  async performAs(actor: Actor): Promise<void> {
    const ability = actor.abilityTo(BrowseTheWeb);
    const page = ability.getPage();

    const productName = this.product.name;
    const productQuantity = this.product.quantity;
    const productId = this.product.id;

    console.log(`🛒 Agregando: ${productName} (${productQuantity}x) - ID: ${productId}`);

    const addToCartBtn = page.locator(`.add-to-cart[data-product-id="${productId}"]`).first();
    
    const btnCount = await addToCartBtn.count();
    if (btnCount === 0) {
      throw new Error(`No se encontró el botón "Add to cart" para: ${productName} (ID: ${productId})`);
    }

    // ✅ Manejo opcional del modal (si aparece, lo cierra; si no, continúa)
    const handleModalIfExists = async (): Promise<void> => {
      try {
        await page.waitForSelector('#cartModal .modal-content', { 
          state: 'visible', 
          timeout: 1000 
        });
        console.log(`✅ Modal visible, cerrando...`);
        await page.locator('.close-modal').click();
        await page.waitForSelector('#cartModal .modal-content', { 
          state: 'hidden', 
          timeout: 5000 
        });
        console.log(`✅ Modal cerrado`);
      } catch {
        console.log(`ℹ️ Modal no visible, continuando...`);
      }
    };

    const clickAddToCart = async (): Promise<void> => {
      await addToCartBtn.click();
      await page.waitForTimeout(300);
    };

    console.log(`🖱️ Click en "Add to cart" para: ${productName}`);
    await clickAddToCart();
    await handleModalIfExists();

    for (let i = 1; i < productQuantity; i++) {
      console.log(`🔄 Agregando ${productName} (${i + 1}/${productQuantity})`);
      await clickAddToCart();
      await handleModalIfExists();
      await page.waitForTimeout(200);
    }

    console.log(`✅ Agregado: ${productName} (${productQuantity}x)`);
  }
}