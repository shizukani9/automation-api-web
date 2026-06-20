// src/interactions/api/SendRequest.ts
import { Actor } from '../../actors/Actor';
import { CallAnApi } from '../../actors/abilities/CallAnApi';

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  data?: any;
  params?: Record<string, string>;
}

export class SendRequest {
  constructor(
    private url: string,
    private options: RequestOptions
  ) {}

  static to(url: string, options: RequestOptions): SendRequest {
    return new SendRequest(url, options);
  }

  async performAs(actor: Actor): Promise<any> {
    const ability = actor.abilityTo(CallAnApi);
    const request = ability.getRequest();

    const response = await request.fetch(this.url, {
      method: this.options.method,
      headers: this.options.headers || {},
      data: this.options.data,
      params: this.options.params,
    });

    return response;
  }
}