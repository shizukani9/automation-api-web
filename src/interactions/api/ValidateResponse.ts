// src/interactions/api/ValidateResponse.ts
import { Actor } from '../../actors/Actor';
import { expect } from '@playwright/test';
import Ajv from 'ajv';

export class ValidateResponse {
  private response: any;
  private expectations: {
    status?: number;
    bodyContains?: Record<string, any>;
    body?: any;
    schema?: any;
  } = {};

  constructor(response: any) {
    this.response = response;
  }

  static of(response: any): ValidateResponse {
    return new ValidateResponse(response);
  }

  withStatusCode(code: number): this {
    this.expectations.status = code;
    return this;
  }

  withBodyContains(partialBody: Record<string, any>): this {
    this.expectations.bodyContains = partialBody;
    return this;
  }

  withBody(body: any): this {
    this.expectations.body = body;
    return this;
  }

  withSchema(schema: any): this {
    this.expectations.schema = schema;
    return this;
  }

  async performAs(actor: Actor): Promise<boolean> {
    const response = this.response;

    // Validar status code
    if (this.expectations.status !== undefined) {
      const actualStatus = response.status();
      expect(actualStatus).toBe(this.expectations.status);
    }

    // Validar body parcial
    if (this.expectations.bodyContains !== undefined) {
      const actualBody = await response.json();
      for (const key in this.expectations.bodyContains) {
        if (this.expectations.bodyContains.hasOwnProperty(key)) {
          expect(String(actualBody[key])).toBe(String(this.expectations.bodyContains[key]));
        }
      }
    }

    // Validar body completo
    if (this.expectations.body !== undefined) {
      const actualBody = await response.json();
      expect(actualBody).toEqual(this.expectations.body);
    }

    // Validar schema
    if (this.expectations.schema !== undefined) {
      const actualBody = await response.json();
      const ajv = new Ajv();
      const validate = ajv.compile(this.expectations.schema);
      const valid = validate(actualBody);
      expect(valid, `Schema validation failed: ${JSON.stringify(validate.errors)}`).toBe(true);
    }

    return true;
  }
}