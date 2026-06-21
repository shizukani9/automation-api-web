// src/tasks/web/SelectCategory.ts
import { Actor } from '../../actors/Actor';
import { BrowseTheWeb } from '../../actors/abilities/BrowseTheWeb';

const CATEGORY_SELECTORS = {
  Women: 'a[href="#Women"]',
  Men: 'a[href="#Men"]',
  Kids: 'a[href="#Kids"]',
};

const SUBCATEGORY_SELECTORS: Record<string, Record<string, string>> = {
  Women: {
    Dress: 'a[href="/category_products/1"]',
    Tops: 'a[href="/category_products/2"]',
    Saree: 'a[href="/category_products/7"]',
  },
  Men: {
    Tshirts: 'a[href="/category_products/3"]',
    Jeans: 'a[href="/category_products/6"]',
  },
  Kids: {
    Dress: 'a[href="/category_products/4"]',
    'Tops & Shirts': 'a[href="/category_products/5"]',
  },
};

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

    const categorySelector = CATEGORY_SELECTORS[this.category as keyof typeof CATEGORY_SELECTORS];
    if (!categorySelector) {
      throw new Error(`Categoría "${this.category}" no encontrada`);
    }

    const subcategorySelectors = SUBCATEGORY_SELECTORS[this.category];
    const subcategorySelector = subcategorySelectors[this.subcategory];

    if (!subcategorySelector) {
      throw new Error(`Subcategoría "${this.subcategory}" no encontrada en "${this.category}"`);
    }

    console.log(`📂 Categoría: ${this.category} → Subcategoría: ${this.subcategory}`);

    // ✅ 1. Click en la categoría para desplegar
    console.log(`🖱️ Click en categoría: ${categorySelector}`);
    await page.locator(categorySelector).click();
    await page.waitForTimeout(500);

    // ✅ 2. Esperar que la subcategoría sea visible
    console.log(`⏳ Esperando subcategoría: ${subcategorySelector}`);
    await page.waitForSelector(subcategorySelector, { state: 'visible', timeout: 5000 });

    // ✅ 3. Hacer CLICK en la subcategoría
    console.log(`🖱️ Click en subcategoría: ${subcategorySelector}`);
    
    // ⚠️ IMPORTANTE: Usar click con navigation para evitar problemas
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
      page.locator(subcategorySelector).click()
    ]);

    // ✅ 4. Esperar que los productos estén visibles
    await page.waitForSelector('.product-image-wrapper', { state: 'visible', timeout: 10000 });
    await page.waitForTimeout(1000);
    
    // ✅ 5. Verificar que la URL es la correcta
    const currentUrl = page.url();
    console.log(`✅ Navegado a: ${currentUrl}`);
    
    if (!currentUrl.includes('/category_products/')) {
      console.warn(`⚠️ La URL no contiene "/category_products/": ${currentUrl}`);
    }
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