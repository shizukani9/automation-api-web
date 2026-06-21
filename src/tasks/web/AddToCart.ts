// src/tasks/web/AddToCart.ts - Con verificaciones adicionales
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
    
    // ✅ Esperar que el botón sea clickeable
    console.log(`⏳ Verificando que el botón sea clickeable...`);
    await addToCartBtn.waitFor({ state: 'visible', timeout: 5000 });
    await addToCartBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // ✅ Verificar que el botón está habilitado
    const isEnabled = await addToCartBtn.isEnabled();
    const isVisible = await addToCartBtn.isVisible();
    console.log(`📊 Botón visible: ${isVisible}, habilitado: ${isEnabled}`);

    if (!isVisible || !isEnabled) {
      console.log(`⚠️ Botón no está listo, esperando 1 segundo...`);
      await page.waitForTimeout(1000);
    }

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

    const clickAddToCart = async (clickNumber: number): Promise<void> => {
      console.log(`🖱️ Click ${clickNumber}/${productQuantity} en "Add to cart"`);
      
      // ✅ Verificar antes de cada clic
      await addToCartBtn.waitFor({ state: 'visible', timeout: 2000 });
      await page.waitForTimeout(300);
      
      // ✅ Usar click con force
      await addToCartBtn.click({ force: true });
      await page.waitForTimeout(600);
    };

    // ✅ PRIMER CLIC - Con más tiempo de espera
    console.log(`⏳ Esperando 1 segundo antes del primer clic...`);
    await page.waitForTimeout(1000);
    
    await clickAddToCart(1);
    await handleModalIfExists();
    await page.waitForTimeout(500);

    // ✅ CLICS ADICIONALES
    for (let i = 2; i <= productQuantity; i++) {
      await clickAddToCart(i);
      await handleModalIfExists();
      await page.waitForTimeout(200);
    }

    console.log(`✅ Agregado: ${productName} (${productQuantity}x)`);
  }
}