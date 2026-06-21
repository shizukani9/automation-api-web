// src/interactions/web/GetText.ts
import { Actor } from '../../actors/Actor';
import { BrowseTheWeb } from '../../actors/abilities/BrowseTheWeb';

export class GetText {
  private selector: string;

  constructor(selector: string) {
    this.selector = selector;
  }

  static from(selector: string): GetText {
    return new GetText(selector);
  }

  async performAs(actor: Actor): Promise<string> {
    const ability = actor.abilityTo(BrowseTheWeb);
    const page = ability.getPage();
    return await page.locator(this.selector).textContent() || '';
  }
}