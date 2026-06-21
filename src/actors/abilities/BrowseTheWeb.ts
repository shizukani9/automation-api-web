// src/actors/abilities/BrowseTheWeb.ts
import { Page } from '@playwright/test';
import { Ability } from './Ability';

export class BrowseTheWeb implements Ability {
  private page: Page;
  private baseUrl: string;

  constructor(page: Page, baseUrl: string = '') {
    this.page = page;
    this.baseUrl = baseUrl;
  }

  static as(page: Page, baseUrl?: string): BrowseTheWeb {
    return new BrowseTheWeb(page, baseUrl);
  }

  getPage(): Page {
    return this.page;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  async navigateTo(url: string): Promise<void> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    await this.page.goto(fullUrl);
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async getUrl(): Promise<string> {
    return this.page.url();
  }
}