// src/tasks/web/NavigateTo.ts
import { Actor } from '../../actors/Actor';
import { BrowseTheWeb } from '../../actors/abilities/BrowseTheWeb';
import { AdManager } from '../../utils/AdManager';

export class NavigateTo {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  static url(url: string): NavigateTo {
    return new NavigateTo(url);
  }

  static homepage(): NavigateTo {
    return new NavigateTo('/');
  }

  static cart(): NavigateTo {
    return new NavigateTo('/view_cart');
  }

  async performAs(actor: Actor): Promise<void> {
    const ability = actor.abilityTo(BrowseTheWeb);
    const page = ability.getPage();

    console.log(`📍 Navegando a: ${this.url}`);

    // ✅ Intentar navegar con reintentos para errores de red
    let lastError: Error | null = null;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await ability.navigateTo(this.url);

        // ✅ Esperar que la página esté cargada
        await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

        // ✅ MANEJAR ANUNCIOS
        await AdManager.ensureNoAds(page, '🔹 ');

        // ✅ Esperar que elementos principales estén visibles
        try {
          await page.waitForSelector('header', { state: 'visible', timeout: 5000 });
          console.log(`✅ Navegación exitosa a: ${this.url}`);
          return; // Salir si todo está bien
        } catch {
          console.log(`⚠️ Header no visible en intento ${attempt}`);
          // Si es el último intento, intentar cerrar anuncios
          if (attempt === maxRetries) {
            await AdManager.closeAds(page, '🔹 ');
          }
        }

      } catch (error) {
        lastError = error as Error;
        console.log(`⚠️ Error en navegación (intento ${attempt}/${maxRetries}):`, error);

        if (attempt < maxRetries) {
          // Esperar antes de reintentar
          await page.waitForTimeout(2000);
          // Recargar la página
          try {
            await page.reload();
          } catch {
            // Si no se puede recargar, continuar
          }
        }
      }
    }

    // Si llegamos aquí, todos los intentos fallaron
    if (lastError) {
      throw new Error(`No se pudo navegar a "${this.url}" después de ${maxRetries} intentos: ${lastError.message}`);
    }
  }
}