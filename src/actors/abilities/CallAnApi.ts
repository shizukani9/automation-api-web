// src/actors/abilities/CallAnApi.ts
import { APIRequestContext } from '@playwright/test';
import { Ability } from './Ability';

export class CallAnApi implements Ability {
  constructor(
    private request: APIRequestContext,
    private baseUrl: string
  ) {}

  static as(request: APIRequestContext, baseUrl: string): CallAnApi {
    return new CallAnApi(request, baseUrl);
  }

  getRequest(): APIRequestContext {
    return this.request;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }
}