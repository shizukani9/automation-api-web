// src/questions/api/ResponseBody.ts
import { Actor } from '../../actors/Actor';

export class ResponseBody {
  private response: any;

  constructor(response: any) {
    this.response = response;
  }

  static of(response: any): ResponseBody {
    return new ResponseBody(response);
  }

  async answeredBy(actor: Actor): Promise<any> {
    try {
      return await this.response.json();
    } catch {
      return null;
    }
  }
}