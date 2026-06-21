// src/interactions/web/Type.ts
import { Actor } from '../../actors/Actor';
import { BrowseTheWeb } from '../../actors/abilities/BrowseTheWeb';

export class Type {
  private selector: string;
  private text: string;

  constructor(selector: string, text: string) {
    this.selector = selector;
    this.text = text;
  }

  static into(selector: string, text: string): Type {
    return new Type(selector, text);
  }

  async performAs(actor: Actor): Promise<void> {
    const ability = actor.abilityTo(BrowseTheWeb);
    const page = ability.getPage();
    await page.fill(this.selector, this.text);
  }
}