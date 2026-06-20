// src/tasks/api/UploadFile.ts
import { Actor } from '../../actors/Actor';
import { CallAnApi } from '../../actors/abilities/CallAnApi';
import * as fs from 'fs';
import * as path from 'path';

interface UploadOptions {
  filePath?: string;
  fileBuffer?: Buffer;
  fileName: string;
  name: string;
  mimeType?: string;
}

export class UploadFile {
  private options: UploadOptions;

  constructor(options: UploadOptions) {
    this.options = options;
  }

  static fromPath(filePath: string, name: string): UploadFile {
    const fileName = path.basename(filePath);
    return new UploadFile({
      filePath,
      fileName,
      name,
    });
  }

  static fromBuffer(fileBuffer: Buffer, fileName: string, name: string): UploadFile {
    return new UploadFile({
      fileBuffer,
      fileName,
      name,
    });
  }

  static withOptions(options: UploadOptions): UploadFile {
    return new UploadFile(options);
  }

  async performAs(actor: Actor): Promise<any> {
    const ability = actor.abilityTo(CallAnApi);
    const request = ability.getRequest();
    const baseUrl = ability.getBaseUrl();
    const url = `${baseUrl}/api/upload`;

    // Leer el archivo si se proporcionó una ruta
    let fileBuffer = this.options.fileBuffer;
    if (!fileBuffer && this.options.filePath) {
      if (!fs.existsSync(this.options.filePath)) {
        throw new Error(`❌ Archivo no encontrado: ${this.options.filePath}`);
      }
      fileBuffer = fs.readFileSync(this.options.filePath);
    }

    if (!fileBuffer) {
      throw new Error('❌ No se proporcionó ningún archivo para subir');
    }

    console.log(`📤 Subiendo archivo: ${this.options.fileName}`);

    // ✅ Usar el método multipart de Playwright (evita problemas con Blob)
    const response = await request.post(url, {
      multipart: {
        file: {
          name: this.options.fileName,
          mimeType: this.options.mimeType || 'image/jpeg',
          buffer: fileBuffer,
        },
        name: this.options.name,
      },
    });

    // Guardar información del archivo subido
    const body = await response.json();
    if (body.url) {
      const filename = body.url.split('/').pop();
      actor.remember('uploadedFilename', filename);
      actor.remember('uploadedFileUrl', body.url);
    }

    return response;
  }
}