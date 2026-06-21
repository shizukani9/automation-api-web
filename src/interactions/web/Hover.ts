// src/interactions/web/Hover.ts
import { Actor } from '../../actors/Actor';
import { BrowseTheWeb } from '../../actors/abilities/BrowseTheWeb';

export class Hover {
  private selector: string;

  constructor(selector: string) {
    this.selector = selector;
  }

  static over(selector: string): Hover {
    return new Hover(selector);
  }

  async performAs(actor: Actor): Promise<void> {
    const ability = actor.abilityTo(BrowseTheWeb);
    const page = ability.getPage();
    await page.hover(this.selector);
  }
}