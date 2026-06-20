// src/questions/api/ResponseCode.ts
import { Actor } from '../../actors/Actor';

export class ResponseCode {
  private response: any;

  constructor(response: any) {
    this.response = response;
  }

  static of(response: any): ResponseCode {
    return new ResponseCode(response);
  }

  async answeredBy(actor: Actor): Promise<number> {
    return this.response.status();
  }
}