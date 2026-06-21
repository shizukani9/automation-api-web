// src/tasks/web/SelectCategory.ts
import { Actor } from '../../actors/Actor';
import { BrowseTheWeb } from '../../actors/abilities/BrowseTheWeb';
import { ClickHelper } from '../../utils/ClickHelper';
import { AdManager } from '../../utils/AdManager';

export class SelectCategory {
  private category: string;
  private subcategory: string;

  constructor(category: string, subcategory: string) {
    this.category = category;
    this.subcategory = subcategory;
  }

  static andSubcategory(category: string, subcategory: string): SelectCategory {
    return new SelectCategory(category, subcategory);
  }

  async performAs(actor: Actor): Promise<void> {
    const ability = actor.abilityTo(BrowseTheWeb);
    const page = ability.getPage();

    console.log(`📂 Seleccionando: ${this.category} → ${this.subcategory}`);

    // ✅ Cerrar anuncios antes de comenzar
    await AdManager.ensureNoAds(page, '🔹 ');

    // ✅ Usar ClickHelper con verificación de URL
    await ClickHelper.clickCategory(page, this.category, this.subcategory);

    // ✅ Verificar que los productos estén visibles
    try {
      await page.waitForSelector('.product-image-wrapper', {
        state: 'visible',
        timeout: 10000
      });
      console.log(`✅ Productos cargados correctamente`);
    } catch {
      console.log(`⚠️ Productos no visibles, intentando recuperar...`);
      // Reintentar la navegación si los productos no cargan
      const subcategorySelector = ClickHelper['getSubcategorySelector'](this.category, this.subcategory);
      const locator = page.locator(subcategorySelector);
      await ClickHelper.clickWithRecovery(page, locator, {
        expectedUrl: '/category_products/',
        logPrefix: '🔹 '
      });
    }

    const currentUrl = page.url();
    console.log(`✅ Navegado a: ${currentUrl}`);
  }

  static getRandomCategory(): { category: string; subcategory: string } {
    const categories = [
      { category: 'Women', subcategories: ['Dress', 'Tops', 'Saree'] },
      { category: 'Men', subcategories: ['Tshirts', 'Jeans'] },
      { category: 'Kids', subcategories: ['Dress', 'Tops & Shirts'] },
    ];

    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomSubcategory = randomCategory.subcategories[Math.floor(Math.random() * randomCategory.subcategories.length)];

    return {
      category: randomCategory.category,
      subcategory: randomSubcategory,
    };
  }
}