// src/interactions/api/WaitForApi.ts
import { Actor } from '../../actors/Actor';

export class WaitForApi {
  private milliseconds: number;

  constructor(milliseconds: number) {
    this.milliseconds = milliseconds;
  }

  static seconds(seconds: number): WaitForApi {
    return new WaitForApi(seconds * 1000);
  }

  static milliseconds(ms: number): WaitForApi {
    return new WaitForApi(ms);
  }

  async performAs(actor: Actor): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, this.milliseconds));
  }
}