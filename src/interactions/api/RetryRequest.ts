// src/interactions/api/RetryRequest.ts
import { Actor } from '../../actors/Actor';
import { WaitForApi } from './WaitForApi';

interface RetryOptions {
  maxAttempts?: number;
  waitBetweenAttempts?: number;
  successStatuses?: number[];
}

export class RetryRequest {
  private task: any;
  private options: RetryOptions;

  constructor(task: any, options: RetryOptions = {}) {
    this.task = task;
    this.options = {
      maxAttempts: options.maxAttempts || 5,
      waitBetweenAttempts: options.waitBetweenAttempts || 6000,
      successStatuses: options.successStatuses || [200, 201, 204],
    };
  }

  static of(task: any, options?: RetryOptions): RetryRequest {
    return new RetryRequest(task, options);
  }

  async performAs(actor: Actor): Promise<any> {
    let attempts = 0;
    let lastResponse: any = null;

    while (attempts < this.options.maxAttempts!) {
      attempts++;
      
      // Ejecutar la tarea
      lastResponse = await actor.attemptsTo(this.task);
      
      const status = lastResponse.status();
      
      // ✅ Si el status es el esperado (éxito), devolver
      if (this.options.successStatuses!.includes(status)) {
        return lastResponse;
      }
      
      // ✅ Si es 429 (rate limit), esperar y reintentar
      if (status === 429) {
        console.log(`⏳ Rate limit (429). Esperando ${this.options.waitBetweenAttempts! / 1000}s... (Intento ${attempts}/${this.options.maxAttempts})`);
        await WaitForApi.milliseconds(this.options.waitBetweenAttempts!).performAs(actor);
        continue;
      }
      
      // ✅ Si es otro status (ej: 400, 404), devolverlo sin reintentar
      // porque no es un error de rate limit
      return lastResponse;
    }

    console.log(`❌ Rate limit excedido después de ${this.options.maxAttempts} intentos`);
    return lastResponse;
  }
}