// src/tasks/web/NavigateTo.ts
import { Actor } from '../../actors/Actor';
import { BrowseTheWeb } from '../../actors/abilities/BrowseTheWeb';

export class NavigateTo {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  static url(url: string): NavigateTo {
    return new NavigateTo(url);
  }

  static homepage(): NavigateTo {
    return new NavigateTo('/');
  }

  static cart(): NavigateTo {
    return new NavigateTo('/view_cart');
  }

  async performAs(actor: Actor): Promise<void> {
    const ability = actor.abilityTo(BrowseTheWeb);
    await ability.navigateTo(this.url);
  }
}