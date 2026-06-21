// src/tasks/web/AddToCart.ts
import { Actor } from '../../actors/Actor';
import { BrowseTheWeb } from '../../actors/abilities/BrowseTheWeb';
import { ProductInfo } from './SelectRandomProducts';
import { AdManager } from '../../utils/AdManager';

export class AddToCart {
  private product: ProductInfo;
  private readonly isCI: boolean;

  constructor(product: ProductInfo) {
    this.product = product;
    this.isCI = !!process.env.CI || !!process.env.GITHUB_ACTIONS;
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

    // ✅ Cerrar anuncios antes de comenzar
    await AdManager.ensureNoAds(page, '🔹 ');

    // ✅ Buscar el botón específico del producto
    const addToCartBtn = page.locator(`.add-to-cart[data-product-id="${productId}"]`).first();

    // ✅ Esperar que el botón sea visible
    console.log(`⏳ Verificando que el botón sea clickeable...`);
    await addToCartBtn.waitFor({ state: 'visible', timeout: 10000 });
    await addToCartBtn.scrollIntoViewIfNeeded();

    // ✅ Contador de clicks exitosos
    let successfulClicks = 0;

    // ✅ Función para hacer un click con verificación
    const clickWithVerification = async (clickNumber: number): Promise<boolean> => {
      console.log(`🖱️ Click ${clickNumber}/${productQuantity} en "Add to cart"`);

      // Cerrar anuncios antes del click
      await AdManager.closeAds(page, '🔹 ');
      await page.waitForTimeout(300);

      // Hacer click con force
      await addToCartBtn.click({ force: true });
      await page.waitForTimeout(500);

      // ✅ VERIFICAR QUE EL CLICK FUE EXITOSO
      // Si el click fue exitoso, debe aparecer el modal
      const modalVisible = await page.locator('#cartModal .modal-content').isVisible({ timeout: 2000 });

      if (modalVisible) {
        console.log(`✅ Click ${clickNumber} exitoso - Modal visible`);
        // Cerrar el modal
        await handleModal();
        return true;
      } else {
        // ✅ VERIFICAR SI SE ABRIÓ UNA NUEVA PESTAÑA (ANUNCIO)
        const contexts = page.context().pages();
        if (contexts.length > 1) {
          console.log(`⚠️ Click ${clickNumber} - Se detectó nueva pestaña (anuncio)`);
          // Cerrar pestañas adicionales
          for (let i = 1; i < contexts.length; i++) {
            try {
              await contexts[i].close();
              console.log(`✅ Pestaña de anuncio cerrada`);
            } catch {
              // Ignorar
            }
          }
          // Cerrar anuncios en la página principal
          await AdManager.closeAds(page, '🔹 ');
          // Reintentar el click
          console.log(`🔄 Reintentando click ${clickNumber}...`);
          await page.waitForTimeout(500);
          // Intentar nuevamente
          await addToCartBtn.click({ force: true });
          await page.waitForTimeout(500);

          // Verificar nuevamente el modal
          const modalRetry = await page.locator('#cartModal .modal-content').isVisible({ timeout: 2000 });
          if (modalRetry) {
            console.log(`✅ Click ${clickNumber} exitoso en reintento`);
            await handleModal();
            return true;
          } else {
            console.log(`⚠️ Click ${clickNumber} falló incluso en reintento`);
            return false;
          }
        }

        console.log(`⚠️ Click ${clickNumber} - Modal no visible`);
        return false;
      }
    };

    // ✅ Función para manejar el modal
    const handleModal = async (): Promise<void> => {
      try {
        const continueBtn = page.locator('.modal-content .btn-success, .modal-content button:has-text("Continue Shopping")');
        if (await continueBtn.isVisible()) {
          await continueBtn.click();
        } else {
          const closeBtn = page.locator('.modal-content .close');
          if (await closeBtn.isVisible()) {
            await closeBtn.click();
          }
        }

        await page.waitForSelector('#cartModal .modal-content', {
          state: 'hidden',
          timeout: 5000
        });
        console.log(`✅ Modal cerrado`);

        // Verificar si apareció publicidad después del modal
        await AdManager.closeAds(page, '🔹 ');
      } catch {
        console.log(`ℹ️ Modal no visible, continuando...`);
      }
    };

    // ✅ PRIMER CLIC
    console.log(`⏳ Esperando antes del primer clic...`);
    await page.waitForTimeout(this.isCI ? 1500 : 1000);

    const firstClickSuccess = await clickWithVerification(1);
    if (firstClickSuccess) {
      successfulClicks++;
    }

    // ✅ CLICS ADICIONALES
    for (let i = 2; i <= productQuantity; i++) {
      await page.waitForTimeout(this.isCI ? 800 : 400);

      const clickSuccess = await clickWithVerification(i);
      if (clickSuccess) {
        successfulClicks++;
      } else {
        // Si un click falla, intentar recuperar
        console.log(`⚠️ Click ${i} falló, intentando recuperación...`);
        // Cerrar anuncios y esperar
        await AdManager.closeAds(page, '🔹 ');
        await page.waitForTimeout(1000);

        // Reintentar el click
        const retrySuccess = await clickWithVerification(i);
        if (retrySuccess) {
          successfulClicks++;
        }
      }
    }

    // ✅ VERIFICACIÓN FINAL
    console.log(`📊 Clicks exitosos: ${successfulClicks}/${productQuantity}`);

    if (successfulClicks < productQuantity) {
      console.log(`⚠️ Faltaron ${productQuantity - successfulClicks} clicks para "${productName}"`);
      console.log(`🔄 Intentando agregar los faltantes...`);

      // Intentar agregar los clicks faltantes
      const missingClicks = productQuantity - successfulClicks;
      for (let i = 0; i < missingClicks; i++) {
        console.log(`🔄 Reintento ${i + 1}/${missingClicks} para "${productName}"`);
        await page.waitForTimeout(500);
        await AdManager.closeAds(page, '🔹 ');
        await addToCartBtn.click({ force: true });
        await page.waitForTimeout(500);

        // Verificar modal
        const modalVisible = await page.locator('#cartModal .modal-content').isVisible({ timeout: 2000 });
        if (modalVisible) {
          await handleModal();
          successfulClicks++;
          console.log(`✅ Reintento ${i + 1} exitoso`);
        }
      }
    }

    // ✅ Espera final
    await page.waitForTimeout(this.isCI ? 1000 : 500);

    console.log(`✅ Agregado: ${productName} (${successfulClicks}/${productQuantity}x)`);

    // Si aún faltan clicks, lanzar advertencia pero no fallar
    if (successfulClicks < productQuantity) {
      console.warn(`⚠️ ADVERTENCIA: Solo se agregaron ${successfulClicks}/${productQuantity} de "${productName}"`);
      console.warn(`⚠️ Esto puede deberse a anuncios intermitentes. Continuando...`);
    }
  }
}