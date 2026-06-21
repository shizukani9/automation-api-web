// src/interactions/web/WaitFor.ts - CORREGIDO
import { Actor } from '../../actors/Actor';
import { BrowseTheWeb } from '../../actors/abilities/BrowseTheWeb';

export class WaitFor {
  private selector: string;
  private options?: { timeout?: number; state?: 'visible' | 'hidden' | 'attached' | 'detached' };

  constructor(selector: string, options?: { timeout?: number; state?: 'visible' | 'hidden' | 'attached' | 'detached' }) {
    this.selector = selector;
    this.options = options;
  }

  static selector(selector: string): WaitFor {
    return new WaitFor(selector);
  }

  static visible(selector: string, timeout?: number): WaitFor {
    return new WaitFor(selector, { state: 'visible', timeout });
  }

  static hidden(selector: string, timeout?: number): WaitFor {
    return new WaitFor(selector, { state: 'hidden', timeout });
  }

  async performAs(actor: Actor): Promise<void> {
    const ability = actor.abilityTo(BrowseTheWeb);
    const page = ability.getPage();
    
    console.log(`⏳ Esperando: ${this.selector} (estado: ${this.options?.state || 'visible'})`);
    
    if (this.options?.state) {
      await page.waitForSelector(this.selector, {
        state: this.options.state,
        timeout: this.options.timeout || 30000,
      });
    } else {
      await page.waitForSelector(this.selector, {
        timeout: this.options?.timeout || 30000,
      });
    }
  }
}