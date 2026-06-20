// src/tasks/api/DownloadFile.ts
import { Actor } from '../../actors/Actor';
import { CallAnApi } from '../../actors/abilities/CallAnApi';
import { SendRequest } from '../../interactions/api/SendRequest';

export class DownloadFile {
  private filename: string;

  constructor(filename: string) {
    this.filename = filename;
  }

  static withName(filename: string): DownloadFile {
    return new DownloadFile(filename);
  }

  async performAs(actor: Actor): Promise<any> {
    const ability = actor.abilityTo(CallAnApi);
    const baseUrl = ability.getBaseUrl();
    const url = `${baseUrl}/api/download?name=${this.filename}`;

    console.log(`📥 Descargando archivo: ${this.filename}`);

    const response = await actor.attemptsTo(
      SendRequest.to(url, {
        method: 'GET',
      })
    );

    // Guardar el contenido del archivo
    const buffer = await response.body();
    actor.remember('downloadedFileBuffer', buffer);
    actor.remember('downloadedFilename', this.filename);

    return response;
  }
}