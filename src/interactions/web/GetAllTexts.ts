// src/interactions/web/GetAllTexts.ts
import { Actor } from '../../actors/Actor';
import { BrowseTheWeb } from '../../actors/abilities/BrowseTheWeb';

export class GetAllTexts {
  private selector: string;

  constructor(selector: string) {
    this.selector = selector;
  }

  static from(selector: string): GetAllTexts {
    return new GetAllTexts(selector);
  }

  async performAs(actor: Actor): Promise<string[]> {
    const ability = actor.abilityTo(BrowseTheWeb);
    const page = ability.getPage();
    const elements = await page.locator(this.selector).all();
    const texts: string[] = [];
    for (const element of elements) {
      texts.push(await element.textContent() || '');
    }
    return texts;
  }
}