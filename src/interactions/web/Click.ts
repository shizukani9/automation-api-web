// src/interactions/web/Click.ts
import { Actor } from '../../actors/Actor';
import { BrowseTheWeb } from '../../actors/abilities/BrowseTheWeb';

export class Click {
  private selector: string;
  private options?: { force?: boolean };

  constructor(selector: string, options?: { force?: boolean }) {
    this.selector = selector;
    this.options = options;
  }

  static on(selector: string): Click {
    return new Click(selector);
  }

  static onForce(selector: string): Click {
    return new Click(selector, { force: true });
  }

  async performAs(actor: Actor): Promise<void> {
    const ability = actor.abilityTo(BrowseTheWeb);
    const page = ability.getPage();
    
    console.log(`🖱️ Click en: ${this.selector}`);
    
    // ✅ Esperar que el elemento sea visible antes de hacer click
    await page.waitForSelector(this.selector, { state: 'visible', timeout: 10000 });
    
    if (this.options?.force) {
      await page.click(this.selector, { force: true });
    } else {
      await page.click(this.selector);
    }
  }
}